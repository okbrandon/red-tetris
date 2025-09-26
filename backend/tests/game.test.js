import { afterEach, jest } from '@jest/globals';
import Game from '../game.js';
import Tetromino from '../tetromino.js';
import gameSettings from '../constants/game-settings.js';
import gameStatus from '../constants/game-status.js';
import outgoingEvents from '../constants/outgoing-events.js';
import { createMockPlayer } from '../__mocks__/_mockPlayer.js';

describe('Game', () => {

	let game;

	beforeEach(() => {
		jest.useFakeTimers();
		game = new Game('room1', { id: 'owner', username: 'Owner' });
	});

	afterEach(() => {
		game.stop();
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	test('constructor sets properties', () => {
		expect(game.id).toBe('room1');
		expect(game.owner).toEqual({ id: 'owner', username: 'Owner' });
		expect(game.status).toBe(gameStatus.WAITING);
		expect(game.clients).toBeInstanceOf(Set);
		expect(game.grids).toBeInstanceOf(Map);
		expect(game.cols).toBe(gameSettings.FRAME_COLS);
		expect(game.rows).toBe(gameSettings.FRAME_ROWS);
		expect(game.tetromino).toBeInstanceOf(Tetromino);
		expect(game.soloJourney).toBe(false);
		expect(game.updateInterval).toBeNull();
		expect(game.maxPlayers).toBe(gameSettings.MAX_PLAYERS_PER_ROOM);
	});

	test('assignOwner sets owner if not set', () => {
		const g = new Game('r');

		g.owner = null;
		g.assignOwner({ id: 'x' });

		expect(g.owner).toEqual({ id: 'x' });
	});

	test('assignOwner throws if already set', () => {
		expect(() => game.assignOwner({ id: 'x' })).toThrow('Game already has an owner');
	});

	test('playerJoin adds player and resets', () => {
		const player = createMockPlayer();

		player.room = null;
		game.status = gameStatus.WAITING;
		game.clients.clear();
		game.playerJoin(player);

		expect(player.reset).toHaveBeenCalled();
		expect(player.room).toBe(game);
		expect(game.clients.has(player)).toBe(true);
	});

	test('playerJoin throws if already in room', () => {
		const player = createMockPlayer({ room: {} });
		expect(() => game.playerJoin(player)).toThrow('Client already in a room');
	});

	test('playerJoin throws if game started', () => {
		const player = createMockPlayer();

		game.status = gameStatus.PLAYING;

		expect(() => game.playerJoin(player)).toThrow('Game has already started');
	});

	test('playerJoin throws if soloJourney and not owner', () => {
		const player = createMockPlayer();

		game.soloJourney = true;
		game.owner = { id: 'owner' };

		expect(() => game.playerJoin(player)).toThrow('Solo journey mode: only the owner can join');
	});

	test('playerJoin throws if room is full', () => {
		game.maxPlayers = 1;

		const player1 = createMockPlayer();
		const player2 = createMockPlayer();

		game.clients.add(player1);

		expect(() => game.playerJoin(player2)).toThrow('Room is full');
	});

	test('playerLeave removes player and resets', () => {
		const player = createMockPlayer({ id: 'owner' });

		player.room = game;
		game.clients.add(player);
		game.playerLeave(player);

		expect(player.reset).toHaveBeenCalled();
		expect(player.room).toBeNull();
		expect(game.clients.has(player)).toBe(false);
	});

	test('playerLeave throws if not in room', () => {
		const player = createMockPlayer({ room: null });

		expect(() => game.playerLeave(player)).toThrow('Client not in a room');
	});

	test('playerLeave stops game if shouldEndGame returns true', () => {
		const player = createMockPlayer({ id: 'owner' });

		player.room = game;
		game.clients.add(player);
		game.status = gameStatus.PLAYING;
		jest.spyOn(game, 'shouldEndGame').mockReturnValue(true);

		const stopSpy = jest.spyOn(game, 'stop').mockImplementation(() => {});

		game.playerLeave(player);

		expect(stopSpy).toHaveBeenCalled();
	});

	test('playerLeave transfers ownership if owner leaves', () => {
		const player1 = createMockPlayer({ id: 'owner' });
		const player2 = createMockPlayer({ id: 'p2' });

		player1.room = game;
		player2.room = game;
		game.clients.add(player1);
		game.clients.add(player2);
		game.owner = player1;
		game.playerLeave(player1);

		expect(game.owner).toBe(player2);
	});

	test('broadcastRoom emits ROOM_BROADCAST to all clients', () => {
		const player1 = createMockPlayer({ id: 'p1' });
		const player2 = createMockPlayer({ id: 'p2' });

		game.clients.add(player1);
		game.clients.add(player2);
		game.owner = player1;
		game.broadcastRoom();

		expect(player1.emit).toHaveBeenCalledWith(outgoingEvents.ROOM_BROADCAST, expect.any(String));
		expect(player2.emit).toHaveBeenCalledWith(outgoingEvents.ROOM_BROADCAST, expect.any(String));
	});

	test('shouldEndGame returns true if status is FINISHED', () => {
		game.status = gameStatus.FINISHED;

		expect(game.shouldEndGame()).toBe(true);
	});

	test('shouldEndGame returns true if clients.length is 0', () => {
		game.status = gameStatus.PLAYING;
		game.clients.clear();

		expect(game.shouldEndGame()).toBe(true);
	});

	test('shouldEndGame returns true if soloJourney and client hasLost', () => {
		game.soloJourney = true;
		game.status = gameStatus.PLAYING;

		const player = createMockPlayer({ hasLost: true });

		game.clients.add(player);
		expect(game.shouldEndGame()).toBe(true);
	});

	test('shouldEndGame returns true if all but one lost', () => {
		const winner = createMockPlayer({ id: 'winner', hasLost: false });
		const loser1 = createMockPlayer({ id: 'loser1', hasLost: true });
		const loser2 = createMockPlayer({ id: 'loser2', hasLost: true });

		game.clients.add(winner);
		game.clients.add(loser1);
		game.clients.add(loser2);
		game.soloJourney = false;
		game.status = gameStatus.PLAYING;

		expect(game.shouldEndGame()).toBe(true);
		expect(winner.sendGameOver).toHaveBeenCalledWith('You win!');
		expect(loser1.sendGameOver).toHaveBeenCalledWith('You lose!');
		expect(loser2.sendGameOver).toHaveBeenCalledWith('You lose!');
	});

	test('shouldEndGame returns false if not finished', () => {
		const player1 = createMockPlayer({ hasLost: false });
		const player2 = createMockPlayer({ hasLost: false });

		game.status = gameStatus.PLAYING;
		game.clients.add(player1);
		game.clients.add(player2);

		expect(game.shouldEndGame()).toBe(false);
	});

	test('startInterval sets updateInterval and calls tickInterval', () => {
		const player = createMockPlayer();

		game.clients.add(player);
		jest.spyOn(game, 'shouldEndGame').mockReturnValue(false);
		jest.useFakeTimers();
		game.startInterval();

		expect(game.updateInterval).not.toBeNull();

		jest.advanceTimersByTime(1000);

		expect(player.tickInterval).toHaveBeenCalled();

		jest.useRealTimers();
		clearInterval(game.updateInterval);
	});

	test('startInterval does nothing if updateInterval is set', () => {
		game.updateInterval = setInterval(() => {}, 1000);
		game.startInterval();

		expect(game.updateInterval).not.toBeNull();
		clearInterval(game.updateInterval);
	});

	test('startInterval stops game if shouldEndGame returns true', () => {
		const player = createMockPlayer();

		game.clients.add(player);
		jest.spyOn(game, 'shouldEndGame').mockReturnValueOnce(true);

		const stopSpy = jest.spyOn(game, 'stop').mockImplementation(() => {});

		jest.useFakeTimers();
		game.startInterval();
		jest.advanceTimersByTime(1000);

		expect(stopSpy).toHaveBeenCalled();

		jest.useRealTimers();
		clearInterval(game.updateInterval);
	});

	test('start throws if already started', () => {
		game.status = gameStatus.PLAYING;

		expect(() => game.start()).toThrow('Game has already started');
	});

	test('start sets up game and calls client methods', () => {
		const player = createMockPlayer();

		game.clients.add(player);
		game.tetromino.pieces.add({ clone: jest.fn(() => ({ position: { y: 0 }, getLeadingEmptyRows: jest.fn(() => 0) })) });
		game.tetromino.generate = jest.fn();
		player.nextPiece = jest.fn(() => ({ position: { y: 0 }, getLeadingEmptyRows: jest.fn(() => 0) }));
		player.generateEmptyGrid = jest.fn();
		player.mergePieceIntoGrid = jest.fn((piece, grid) => grid);
		player.emit = jest.fn();
		player.sendGrid = jest.fn();
		game.start();

		expect(game.status).toBe(gameStatus.PLAYING);
		expect(game.tetromino.generate).toHaveBeenCalled();
		expect(player.generateEmptyGrid).toHaveBeenCalled();
		expect(player.emit).toHaveBeenCalledWith(outgoingEvents.GAME_STARTED, expect.any(String));
		expect(player.sendGrid).toHaveBeenCalled();
	});

	test('restart throws if not finished', () => {
		game.status = gameStatus.PLAYING;

		expect(() => game.restart()).toThrow('Game is not finished');
	});

	test('restart resets clients and restarts game', () => {
		const player = createMockPlayer();

		game.clients.add(player);
		game.status = gameStatus.FINISHED;
		game.tetromino.reset = jest.fn();
		game.start = jest.fn();
		game.restart();

		expect(player.reset).toHaveBeenCalled();
		expect(game.status).toBe(gameStatus.WAITING);
		expect(game.tetromino.reset).toHaveBeenCalled();
		expect(game.start).toHaveBeenCalled();
	});

	test('stop clears updateInterval and calls sendGameOver', () => {
		const player = createMockPlayer();

		game.clients.add(player);
		game.updateInterval = setInterval(() => {}, 1000);
		game.stop();

		expect(game.updateInterval).toBeNull();
		expect(player.sendGameOver).toHaveBeenCalled();
	});

	test('handlePieceMove throws if not playing', () => {
		const player = createMockPlayer();

		game.status = gameStatus.WAITING;

		expect(() => game.handlePieceMove(player, 'left')).toThrow('Game is not in progress');
	});

	test('handlePieceMove throws if no currentPiece', () => {
		const player = createMockPlayer();

		game.status = gameStatus.PLAYING;
		player.currentPiece = null;

		expect(() => game.handlePieceMove(player, 'left')).toThrow('Client has no current piece');
	});

	test('handlePieceMove calls movePiece', () => {
		const player = createMockPlayer();

		game.status = gameStatus.PLAYING;
		player.movePiece = jest.fn();
		game.handlePieceMove(player, 'left');

		expect(player.movePiece).toHaveBeenCalledWith('left');
	});

	test('handlePenalties returns if soloJourney', () => {
		const player = createMockPlayer();

		game.soloJourney = true;

		expect(game.handlePenalties(player, 2)).toBeUndefined();
	});

	test('handlePenalties throws if not playing', () => {
		const player = createMockPlayer();

		game.status = gameStatus.WAITING;
		game.soloJourney = false;

		expect(() => game.handlePenalties(player, 2)).toThrow('Game is not in progress');
	});

	test('handlePenalties calls penalize and sendGrid on other clients', () => {
		const author = createMockPlayer({ id: 'author' });
		const other = createMockPlayer({ id: 'other' });

		game.clients.add(author);
		game.clients.add(other);
		game.status = gameStatus.PLAYING;
		game.soloJourney = false;
		game.handlePenalties(author, 2);

		expect(other.penalize).toHaveBeenCalledWith(2);
		expect(other.sendGrid).toHaveBeenCalled();
	});

});
