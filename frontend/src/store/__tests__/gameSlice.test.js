import { describe, it, expect, vi } from 'vitest';
import reducer, {
  setGameMode,
  setGameState,
  setGameStatus,
  setPlayerOutcome,
  setLobbySettings,
  setRoomName,
  setSpectatorActive,
  setIsResultModalOpen,
  addLineClearLogEntry,
  resetGameState,
  setAvailableRooms,
} from '../slices/gameSlice.js';

const createState = () => reducer(undefined, { type: '@@INIT' });

describe('gameSlice reducers', () => {
  it('throws when attempting to set game state without any payload', () => {
    expect(() => reducer(createState(), setGameState())).toThrow(TypeError);
  });

  it('sets the game mode and resets solo-specific fields', () => {
    const base = {
      ...createState(),
      players: [{ id: 'p1' }],
      score: 42,
      spectator: { eligible: true, active: true },
      hideCurrentPiece: true,
    };

    const next = reducer(base, setGameMode('solo'));

    expect(next.mode).toBe('solo');
    expect(next.players).toEqual([]);
    expect(next.score).toBe(0);
    expect(next.spectator).toEqual({ eligible: false, active: false });
    expect(next.hideCurrentPiece).toBe(false);
  });

  it('sets the game state from a server payload', () => {
    const base = createState();
    const payload = {
      room: {
        id: 'room-1',
        owner: { id: 'owner' },
        mode: 'classic',
        soloJourney: false,
      },
      you: { id: 'self', score: 512 },
      grid: [[{ filled: true }]],
      currentPiece: { shape: [[1]] },
      nextPieces: [{ id: 'piece' }],
      clients: [{ id: 'self' }],
    };

    const next = reducer(base, setGameState(payload));

    expect(next.roomName).toBe('room-1');
    expect(next.owner).toEqual({ id: 'owner' });
    expect(next.roomMode).toBe('classic');
    expect(next.you).toEqual({ id: 'self', score: 512 });
    expect(next.grid).toEqual([[{ filled: true }]]);
    expect(next.nextPieces).toEqual([{ id: 'piece' }]);
    expect(next.score).toBe(512);
    expect(next.players).toEqual([{ id: 'self' }]);
    expect(next.hideCurrentPiece).toBe(false);
  });

  it('flags the current piece as hidden when playing invisible falling pieces mode', () => {
    const base = createState();
    const payload = {
      room: {
        mode: 'invisible-falling-pieces',
        soloJourney: false,
      },
      currentPiece: { id: 'active', shape: [[1]] },
      you: {},
    };

    const next = reducer(base, setGameState(payload));

    expect(next.roomMode).toBe('invisible-falling-pieces');
    expect(next.hideCurrentPiece).toBe(true);
    expect(next.currentPiece).toEqual({ id: 'active', shape: [[1]] });
  });

  it('updates status-specific fields when setting the game status', () => {
    const base = { ...createState(), you: { id: 'me' } };

    const inGame = reducer(base, setGameStatus({ status: 'in-game' }));
    expect(inGame.gameStatus).toBe('in-game');
    expect(inGame.playerOutcome).toEqual({ outcome: '', message: '' });
    expect(inGame.lineClearLog).toEqual([]);

    const waiting = reducer(inGame, setGameStatus({ status: 'waiting' }));
    expect(waiting.lineClearLog).toEqual([]);

    const winnerPayload = {
      status: 'game-over',
      winner: { id: 'me', username: 'Winner' },
    };
    const final = reducer(waiting, setGameStatus(winnerPayload));
    expect(final.spectator).toEqual({ eligible: false, active: false });
    expect(final.playerOutcome).toEqual({
      outcome: 'win',
      message: 'You are the last player standing!',
    });

    const defeated = reducer(
      waiting,
      setGameStatus({
        status: 'game-over',
        winner: { id: 'opponent', username: 'Rival' },
      })
    );
    expect(defeated.playerOutcome).toEqual({
      outcome: 'lose',
      message: 'Rival has won the game.',
    });

    const noWinner = reducer(waiting, setGameStatus({ status: 'game-over' }));
    expect(noWinner.spectator).toEqual({ eligible: false, active: false });
    expect(noWinner.playerOutcome).toEqual(waiting.playerOutcome);
  });

  it('marks outcomes, lobby settings, and toggles flags correctly', () => {
    const base = createState();
    const outcome = { outcome: 'lose', message: 'Oops', canSpectate: true };
    const withOutcome = reducer(base, setPlayerOutcome(outcome));
    expect(withOutcome.playerOutcome).toEqual(outcome);
    expect(withOutcome.spectator.eligible).toBe(true);

    const withPlayers = {
      ...withOutcome,
      gameStatus: 'in-game',
      players: [
        { id: 'owner', score: 10 },
        { id: 'guest', score: 5 },
      ],
    };

    const lobbyState = reducer(
      withPlayers,
      setLobbySettings({
        room: { id: 'room-2', owner: { id: 'owner' }, mode: 'classic' },
        you: { id: 'owner' },
        clients: [
          { id: 'owner', username: 'Owner', score: 20 },
          { id: 'guest', username: 'Guest', score: 15 },
          { id: 'new', username: 'Newcomer' },
        ],
      })
    );

    expect(lobbyState.roomName).toBe('room-2');
    expect(lobbyState.isOwner).toBe(true);
    expect(lobbyState.players).toEqual([
      { id: 'owner', username: 'Owner', score: 20 },
      { id: 'guest', username: 'Guest', score: 15 },
    ]);
    expect(lobbyState.hideCurrentPiece).toBe(false);

    const notOwner = reducer(
      lobbyState,
      setLobbySettings({
        room: { id: 'room-2', owner: { id: 'owner' }, mode: undefined },
        you: { id: 'guest' },
        clients: [],
      })
    );
    expect(notOwner.isOwner).toBe(false);
    expect(notOwner.roomMode).toBe('classic');
    expect(notOwner.players).toEqual(lobbyState.players);
  expect(notOwner.hideCurrentPiece).toBe(false);

    const noPayload = reducer(lobbyState, setLobbySettings());
    expect(noPayload.roomName).toBe('room-2');
    expect(noPayload.owner).toEqual({ id: 'owner' });

    const toggled = reducer(lobbyState, setSpectatorActive(true));
    expect(toggled.spectator.active).toBe(true);

    const modalState = reducer(toggled, setIsResultModalOpen(true));
    expect(modalState.isResultModalOpen).toBe(true);

    const named = reducer(modalState, setRoomName({ roomName: 'new-room' }));
    expect(named.roomName).toBe('new-room');

    const clearedName = reducer(named, setRoomName({}));
    expect(clearedName.roomName).toBe('');
  });

  it('handles lobby settings provided as string identifiers', () => {
    const base = { ...createState(), roomMode: 'classic' };

    const updated = reducer(
      base,
      setLobbySettings({
        room: 'string-room',
        you: { id: 'player' },
        clients: [{ id: 'player', username: 'Player' }],
      })
    );

    expect(updated.roomName).toBe('string-room');
    expect(updated.roomMode).toBe('classic');
    expect(updated.players).toEqual([{ id: 'player', username: 'Player' }]);
  });

  it('defaults lobby information when server payload omits fields', () => {
    const base = createState();

    const result = reducer(
      base,
      setLobbySettings({
        room: {},
        clients: [],
      })
    );

    expect(result.roomName).toBe('');
    expect(result.roomMode).toBe('');
    expect(result.owner).toBeNull();
    expect(result.isOwner).toBe(false);
  });

  it('adds capped line clear log entries and ignores invalid ones', () => {
    const base = createState();

    const noPayload = reducer(base, addLineClearLogEntry());
    expect(noPayload.lineClearLog).toEqual([]);

    const skipped = reducer(noPayload, addLineClearLogEntry({}));
    expect(skipped.lineClearLog).toEqual([]);

    const dateSpy = vi.spyOn(Date, 'now').mockReturnValueOnce(5000);
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValueOnce(0.123456);
    let state = reducer(
      { ...skipped, lineClearLog: null },
      addLineClearLogEntry({ message: 'Generated entry' })
    );
    expect(state.lineClearLog[0].id).toMatch(/^5000-/);
    dateSpy.mockRestore();
    randomSpy.mockRestore();

    state = reducer(
      state,
      addLineClearLogEntry({
        message: 'With timestamp',
        timestamp: 42,
      })
    );
    expect(state.lineClearLog[0].timestamp).toBe(42);

    for (let i = 0; i < 10; i += 1) {
      state = reducer(
        state,
        addLineClearLogEntry({
          message: `Entry ${i}`,
          id: `custom-${i}`,
        })
      );
    }

    expect(state.lineClearLog).toHaveLength(6);
    expect(state.lineClearLog[0].message).toBe('Entry 9');
    expect(state.lineClearLog.at(-1).message).toBe('Entry 4');
  });

  it('resets to the initial state when requested', () => {
    const mutated = reducer(createState(), setGameMode('solo'));
    const reset = reducer(mutated, resetGameState());
    expect(reset).toEqual(createState());
  });

  it('stores and sanitises available rooms from the server', () => {
    const base = createState();
    const rooms = [
      { id: 'alpha', owner: { username: 'alice' } },
      null,
      { id: 42 },
      { id: 'beta' },
    ];

    const populated = reducer(base, setAvailableRooms(rooms));
    expect(populated.availableRooms).toEqual([
      { id: 'alpha', owner: { username: 'alice' } },
      { id: 'beta' },
    ]);

    const nested = reducer(base, setAvailableRooms({ rooms }));
    expect(nested.availableRooms).toEqual(populated.availableRooms);

    const cleared = reducer(populated, setAvailableRooms('not-array'));
    expect(cleared.availableRooms).toEqual([]);
  });

  it('gracefully handles partial game state updates', () => {
    const base = {
      ...createState(),
      roomName: 'existing',
      roomMode: 'classic',
      owner: { id: 'owner' },
    };

    const withoutRoom = reducer(base, setGameState({ you: {} }));
    expect(withoutRoom.roomName).toBe('existing');
    expect(withoutRoom.grid).toEqual([[]]);
    expect(withoutRoom.nextPieces).toEqual([]);
    expect(withoutRoom.players).toEqual([]);

    const partial = reducer(
      base,
      setGameState({
        room: {},
        you: { id: 'me', score: 'not-number' },
        nextPieces: null,
        clients: undefined,
      })
    );

    expect(partial.roomMode).toBe('classic');
    expect(partial.owner).toEqual({ id: 'owner' });
    expect(partial.score).toBe(0);
    expect(partial.nextPieces).toEqual([]);
    expect(partial.players).toEqual([]);

    const minimal = reducer(
      createState(),
      setGameState({
        room: { soloJourney: true },
        you: {},
      })
    );
    expect(minimal.roomName).toBe('');
    expect(minimal.roomMode).toBe('');
    expect(minimal.owner).toBeNull();
    expect(minimal.mode).toBe('solo');

    const missingYou = reducer(
      { ...createState(), score: 99 },
      setGameState({ you: '' })
    );
    expect(missingYou.you).toBeNull();
    expect(missingYou.score).toBe(99);
  });
});
