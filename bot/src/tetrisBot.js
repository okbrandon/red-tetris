import { io } from 'socket.io-client';
import incomingEvents from '../../backend/constants/incoming-events.js';
import outgoingEvents from '../../backend/constants/outgoing-events.js';
import gameStatus from '../../backend/constants/game-status.js';
import { MOVE_DIRECTIONS, LOG_LEVELS, DEFAULT_WEIGHTS, DEFAULT_BOT_TIMING } from './constants.js';
import { computeBestPlacement } from './heuristics.js';
import { safeParse, computeQueueSignature, createLogger } from './utils/parsing.js';

export class TetrisBot {
	constructor(options = {}) {
		const {
			serverUrl,
			roomName,
			username,
			autoStart = false,
			logLevel = 'info',
			commandIntervalMs = DEFAULT_BOT_TIMING.commandIntervalMs,
			maxQueuedCommands = DEFAULT_BOT_TIMING.maxQueuedCommands,
			thinkDelayMs = DEFAULT_BOT_TIMING.thinkDelayMs,
			heuristicWeights = DEFAULT_WEIGHTS,
			lookaheadWeight = DEFAULT_BOT_TIMING.lookaheadWeight,
			connectTimeoutMs = DEFAULT_BOT_TIMING.connectTimeoutMs
		} = options;

		this.options = {
			serverUrl,
			roomName,
			username,
			autoStart,
			logLevel: LOG_LEVELS[logLevel] !== undefined ? logLevel : 'info',
			commandIntervalMs,
			maxQueuedCommands,
			thinkDelayMs,
			heuristicWeights: { ...DEFAULT_WEIGHTS, ...heuristicWeights },
			lookaheadWeight,
			connectTimeoutMs
		};

		this.socket = null;
		this.commandQueue = [];
		this.commandTimer = null;
		this.lastCommandAt = 0;
		this.connectionPromise = null;
		this.resolveConnectionDeferred = null;
		this.rejectConnectionDeferred = null;
		this.connectionTimeoutId = null;

		this.roomState = null;
		this.hasJoinedRoom = false;
		this.startRequested = false;

		this.currentTarget = null;
		this.rotationAttempts = 0;
		this.decisionReadyAt = 0;
		this.awaitingNewPiece = false;
		this.hardDropIssued = false;
		this.hasActivePiece = false;
		this.lastPieceY = null;
		this.lastQueueSignature = null;

		this.log = createLogger(this.options.logLevel);
	}

	async start() {
		if (this.socket)
			return this.connectionPromise ?? Promise.resolve();

		const connectionPromise = this.createConnectionDeferred();

		this.log('info', `Connecting to ${this.options.serverUrl} as ${this.options.username}, room ${this.options.roomName}`);
		this.socket = io(this.options.serverUrl, {
			reconnection: true,
			reconnectionAttempts: Infinity,
			reconnectionDelayMax: 2000,
			transports: ['websocket']
		});

		const cleanupConnectionListeners = () => {
			if (!this.socket)
				return;
			this.socket.off('connect', handleConnect);
			this.socket.off('connect_error', handleError);
			this.socket.off('connect_timeout', handleTimeout);
		};

		const handleConnect = () => {
			cleanupConnectionListeners();
			this.resolveConnectionDeferred?.();
		};

		const handleError = (error) => {
			if (!this.connectionPromise)
				return;
			cleanupConnectionListeners();
			const reason = error instanceof Error
				? error
				: new Error(typeof error?.message === 'string' ? error.message : 'Failed to connect');
			this.rejectConnectionDeferred?.(reason);
			this.stop();
		};

		const handleTimeout = () => {
			if (!this.connectionPromise)
				return;
			cleanupConnectionListeners();
			this.rejectConnectionDeferred?.(new Error('Connection timed out'));
			this.stop();
		};

		this.socket.once('connect', handleConnect);
		this.socket.once('connect_error', handleError);
		this.socket.once('connect_timeout', handleTimeout);

		if (this.options.connectTimeoutMs > 0) {
			this.connectionTimeoutId = setTimeout(handleTimeout, this.options.connectTimeoutMs);
			if (typeof this.connectionTimeoutId?.unref === 'function')
				this.connectionTimeoutId.unref();
		}

		this.registerHandlers();
		this.commandTimer = setInterval(() => this.flushCommandQueue(), this.options.commandIntervalMs);

		return connectionPromise;
	}

	stop() {
		if (this.connectionPromise && this.rejectConnectionDeferred)
			this.rejectConnectionDeferred(new Error('Bot connection aborted'));

		if (this.commandTimer) {
			clearInterval(this.commandTimer);
			this.commandTimer = null;
		}

		if (this.socket) {
			this.socket.removeAllListeners();
			this.socket.disconnect();
			this.socket = null;
		}

		this.cleanupConnectionDeferred();

		this.resetMovementState();
		this.commandQueue = [];
		this.log('info', 'Stopped bot');
	}

	registerHandlers() {
		if (!this.socket)
			return;

		this.socket.on('connect', () => {
			this.log('info', 'Connected to server');
			this.sendClientUpdate();
		});

		this.socket.on('disconnect', (reason) => {
			this.log('warn', `Disconnected: ${reason}`);
			this.resetMovementState();
			this.hasJoinedRoom = false;
			this.startRequested = false;
		});

		this.socket.on(outgoingEvents.ERROR, (payload) => this.handleError(payload));
		this.socket.on(outgoingEvents.CLIENT_UPDATED, (payload) => this.handleClientUpdated(payload));
		this.socket.on(outgoingEvents.ROOM_CREATED, (payload) => this.handleRoomJoined(payload));
		this.socket.on(outgoingEvents.ROOM_JOINED, (payload) => this.handleRoomJoined(payload));
		this.socket.on(outgoingEvents.ROOM_BROADCAST, (payload) => this.handleRoomBroadcast(payload));
		this.socket.on(outgoingEvents.GAME_STARTED, (payload) => this.handleGameStarted(payload));
		this.socket.on(outgoingEvents.GAME_STATE, (payload) => this.handleGameState(payload));
		this.socket.on(outgoingEvents.GAME_LOST, (payload) => this.handleGameLost(payload));
		this.socket.on(outgoingEvents.GAME_OVER, (payload) => this.handleGameOver(payload));
		this.socket.on(outgoingEvents.LINES_CLEARED, () => {});
		this.socket.on(outgoingEvents.PLAYER_STATS_BOARD, () => {});
		this.socket.on(outgoingEvents.AVAILABLE_ROOMS, () => {});
	}

	sendClientUpdate() {
		if (!this.socket)
			return;
		this.socket.emit(incomingEvents.CLIENT_UPDATE, { username: this.options.username });
	}

	createConnectionDeferred() {
		if (this.connectionPromise)
			return this.connectionPromise;

		let settled = false;
		this.connectionPromise = new Promise((resolve, reject) => {
			this.resolveConnectionDeferred = () => {
				if (settled)
					return;
				settled = true;
				this.cleanupConnectionDeferred();
				resolve();
			};

			this.rejectConnectionDeferred = (error) => {
				if (settled)
					return;
				settled = true;
				const normalized = error instanceof Error
					? error
					: new Error(typeof error?.message === 'string' ? error.message : String(error));
				this.cleanupConnectionDeferred();
				reject(normalized);
			};
		});

		return this.connectionPromise;
	}

	cleanupConnectionDeferred() {
		if (this.connectionTimeoutId) {
			clearTimeout(this.connectionTimeoutId);
			this.connectionTimeoutId = null;
		}
		this.resolveConnectionDeferred = null;
		this.rejectConnectionDeferred = null;
		this.connectionPromise = null;
	}

	handleClientUpdated(payload) {
		const data = safeParse(payload, false, this.log);
		if (!data)
			return;
		this.log('info', `Username acknowledged as ${data.username || data.id}`);
		this.joinRoom();
	}

	joinRoom() {
		if (!this.socket || this.hasJoinedRoom)
			return;
		this.log('info', `Joining room ${this.options.roomName}`);
		this.socket.emit(incomingEvents.ROOM_JOIN, {
			roomName: this.options.roomName,
			soloJourney: false
		});
	}

	handleRoomJoined(payload) {
		const data = safeParse(payload, false, this.log);
		if (!data)
			return;
		this.hasJoinedRoom = true;
		this.log('info', `Joined room ${data.roomName}`);
	}

	handleRoomBroadcast(payload) {
		const data = safeParse(payload, true, this.log);
		if (!data)
			return;

		this.roomState = data;
		const isOwner = data.room?.owner?.id === data.you?.id;
		if (isOwner)
			this.log('debug', `Owning room with ${data.clients?.length || 1} players`);

		if (
			this.options.autoStart &&
			isOwner &&
			data.room?.status === gameStatus.WAITING &&
			(data.clients?.length || 1) > 1 &&
			!this.startRequested
		) {
			this.log('info', 'Auto-starting game');
			this.socket?.emit(incomingEvents.START_GAME);
			this.startRequested = true;
		}
	}

	handleGameStarted(payload) {
		const data = safeParse(payload, true, this.log);
		if (data?.room?.status)
			this.log('info', `Game started in room ${data.room.id}`);
		this.resetMovementState();
	}

	handleGameState(payload) {
		const data = safeParse(payload, true, this.log);
		if (!data || !data.currentPiece || !Array.isArray(data.grid))
			return;

		if (data.you?.hasLost) {
			this.log('warn', 'Marked as lost, waiting for next round');
			this.resetMovementState();
			return;
		}

		if (data.room?.status !== gameStatus.IN_GAME) {
			this.resetMovementState();
			return;
		}

		const queueSignature = computeQueueSignature(data.nextPieces || []);
		const positionY = data.currentPiece.position?.y ?? 0;
		let newPiece = false;

		if (!this.hasActivePiece)
			newPiece = true;
		else if (this.awaitingNewPiece && positionY <= 2)
			newPiece = true;
		else if (this.lastPieceY !== null && positionY < this.lastPieceY - 3)
			newPiece = true;
		else if (this.lastQueueSignature && this.lastQueueSignature !== queueSignature)
			newPiece = true;

		if (newPiece) {
			this.awaitingNewPiece = false;
			this.hasActivePiece = true;
			this.rotationAttempts = 0;
			this.hardDropIssued = false;
			this.currentTarget = null;
			this.decisionReadyAt = Date.now() + this.options.thinkDelayMs;
		}

		this.lastQueueSignature = queueSignature;

		if (this.awaitingNewPiece) {
			this.lastPieceY = positionY;
			return;
		}

		if (Date.now() < this.decisionReadyAt) {
			this.lastPieceY = positionY;
			return;
		}

		const placement = computeBestPlacement(data, {
			heuristicWeights: this.options.heuristicWeights,
			lookaheadWeight: this.options.lookaheadWeight
		});

		if (!placement) {
			this.currentTarget = null;
			this.enqueueMove('down');
			this.lastPieceY = positionY;
			return;
		}

		this.currentTarget = placement;
		this.executeMovementStep(data, placement);
		this.lastPieceY = positionY;
	}

	handleGameLost(payload) {
		const data = safeParse(payload, false, this.log);
		if (data?.message)
			this.log('warn', `Game lost: ${data.message}`);
		this.resetMovementState();
	}

	handleGameOver(payload) {
		const data = safeParse(payload, false, this.log);
		if (data?.message)
			this.log('info', `Game over: ${data.message}`);
		this.resetMovementState();
		this.startRequested = false;
		this.hasActivePiece = false;
		this.awaitingNewPiece = false;
	}

	handleError(payload) {
		const data = safeParse(payload, false, this.log);
		if (data?.message)
			this.log('error', `Server error: ${data.message}`);
	}

	resetMovementState() {
		this.commandQueue = [];
		this.currentTarget = null;
		this.rotationAttempts = 0;
		this.awaitingNewPiece = false;
		this.hardDropIssued = false;
		this.hasActivePiece = false;
		this.lastPieceY = null;
		this.lastQueueSignature = null;
		this.decisionReadyAt = 0;
	}

	enqueueMove(direction) {
		if (!MOVE_DIRECTIONS.has(direction))
			return;
		if (!this.socket || this.socket.disconnected)
			return;
		if (this.commandQueue.length >= this.options.maxQueuedCommands)
			return;

		this.commandQueue.push(direction);
	}

	flushCommandQueue() {
		if (!this.socket || this.socket.disconnected)
			return;
		if (!this.commandQueue.length)
			return;

		const direction = this.commandQueue.shift();
		this.socket.emit(incomingEvents.MOVE_PIECE, { direction });
		this.lastCommandAt = Date.now();
	}

	executeMovementStep(data, target) {
		if (this.awaitingNewPiece)
			return;
		if (!target || !data.currentPiece)
			return;

		const piece = data.currentPiece;
		const pieceX = piece.position?.x ?? 0;
		const rotations = target.rotations;
		const rotationIndex = this.findRotationIndex(piece.shape, rotations);

		if (rotationIndex === -1) {
			this.rotationAttempts = 0;
			return;
		}

		const rotationSteps = (target.rotationIndex - rotationIndex + rotations.length) % rotations.length;
		const deltaX = target.x - pieceX;

		if (rotationSteps !== 0) {
			if (this.rotationAttempts > rotations.length * 2) {
				const fallbackDirection = deltaX !== 0
					? (deltaX > 0 ? 'right' : 'left')
					: (pieceX >= target.x ? 'left' : 'right');
				this.enqueueMove(fallbackDirection);
				this.rotationAttempts = 0;
				return;
			}
			this.enqueueMove('up');
			this.rotationAttempts++;
			return;
		}

		this.rotationAttempts = 0;

		if (deltaX !== 0) {
			this.enqueueMove(deltaX > 0 ? 'right' : 'left');
			return;
		}

		if (!this.hardDropIssued) {
			this.enqueueMove('space');
			this.hardDropIssued = true;
			this.awaitingNewPiece = true;
		}
	}

	findRotationIndex(shape, rotations) {
		const key = this.shapeKey(shape);
		for (let i = 0; i < rotations.length; i++) {
			if (this.shapeKey(rotations[i]) === key)
				return i;
		}
		return -1;
	}

	shapeKey(shape) {
		return shape.map(row => row.join('')).join('|');
	}
}

export default TetrisBot;
