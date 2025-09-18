/**
 * @constant {string} ERROR - Represents an error event sent to the client.
 *
 * @description This event is sent by the server to the client when an error occurs during any operation, such as joining a room, starting a game, or moving a piece.
 * The event contains a message detailing the nature of the error.
 *
 * @example
 * // Server-side example of emitting the ERROR event
 * socket.emit('error', { message: 'Room does not exist' });
 */
const ERROR = 'error';

/**
 * @constant {string} CLIENT_UPDATED - Sent when the client updates their username.
 *
 * @description This event is sent by the server to the client to confirm that the client's information, such as their username, has been successfully updated.
 * The event contains the updated client information.
 *
 * @example
 * // Server-side example of emitting the CLIENT_UPDATED event
 * socket.emit('client-updated', { id: client.id, username: client.username });
 */
const CLIENT_UPDATED = 'client-updated';

/**
 * @constant {string} ROOM_CREATED - Sent when a new room is created.
 *
 * @description This event is sent by the server to the client to confirm that a new game room has been successfully created.
 * The event contains the name of the newly created room.
 *
 * @example
 * // Server-side example of emitting the ROOM_CREATED event
 * socket.emit('room-created', { roomName: 'amazingTestRoom' });
 */
const ROOM_CREATED = 'room-created';

/**
 * @constant {string} ROOM_JOINED - Sent when a player successfully joins a room.
 *
 * @description This event is sent by the server to the client to confirm that the player has successfully joined a specific game room.
 * The event contains the name of the room that the player has joined.
 *
 * @example
 * // Server-side example of emitting the ROOM_JOINED event
 * socket.emit('room-joined', { roomName: 'amazingTestRoom' });
 */
const ROOM_JOINED = 'room-joined';

/**
 * @constant {string} ROOM_LEFT - Sent when a player leaves the room.
 *
 * @description This event is sent by the server to the client to confirm that the player has successfully left their current game room.
 * The event contains the name of the room that the player has left.
 *
 * @example
 * // Server-side example of emitting the ROOM_LEFT event
 * socket.emit('room-left', { roomName: 'amazingTestRoom' });
 */
const ROOM_LEFT = 'room-left';

/**
 * @constant {string} ROOM_BROADCAST - Sent to broadcast the current state of the room to all players.
 *
 * @description This event is sent by the server to all clients in a room to provide an updated overview of the room's state.
 * The event contains information about the room, including the room ID, owner details, and a list of all connected clients.
 * This helps ensure that all players have the latest information about the room and its participants.
 *
 * @example
 * // Server-side example of emitting the ROOM_BROADCAST event
 * io.to(room.id).emit('room-broadcast', {
 *   room: room.id,
 *   owner: { id: owner.id, username: owner.username },
 *   you: { id: client.id, username: client.username },
 *   clients: clients.map(c => ({ id: c.id, username: c.username }))
 * });
 */
const ROOM_BROADCAST = 'room-broadcast';

/**
 * @constant {string} GAME_STARTED - Sent when a game has started in the room.
 *
 * @description This event is sent by the server to all clients in a room to notify them that the game has started.
 * The event indicates that the game status has changed to "playing" and that players can begin interacting with the game.
 * It contains data such as the room ID and any relevant game settings.
 *
 * @example
 * // Server-side example of emitting the GAME_STARTED event
 * io.to(room.id).emit('game-started', {
 *   room: room.id,
 *   you: { id: client.id, username: client.username },
 *   clients: clients.map(c => ({ id: c.id, username: c.username })),
 *   pieces: pieces.map(p => ({ shape: p.shape, color: p.color, position: p.position }))
 * });
 */
const GAME_STARTED = 'game-started';

/**
 * @constant {string} GAME_STATE - Sent to update the client with the current game state.
 *
 * @description This event is sent by the server to all clients in a room to provide an updated overview of the current game state.
 * The event contains information about the game, including the room ID, player details, and the state of each player's pieces.
 * This helps ensure that all players have the latest information about the game and can see the current positions of all pieces on the grid.
 *
 * @example
 * // Server-side example of emitting the GAME_STATE event
 * io.to(room.id).emit('game-state', {
 *  room: {
 *    id: room.id,
 *    owner: { id: owner.id, username: owner.username },
 *    status: room.status,
 *    soloJourney: room.soloJourney
 *  },
 *  grid: [][],
 *  currentPiece: { shape, color, position },
 *  nextPiece: { shape, color, position } | null,
 *  you: {
 *     id: client.id,
 *     username: client.username,
 *     hasLost: client.hasLost,
 *     specter: client.specter
 *  },
 *  clients: clients.map(c => ({
 *     id: c.id,
 *     username: c.username,
 *     hasLost: c.hasLost,
 *     specter: c.specter
 *  }))
 * });
 */
const GAME_STATE = 'game-state';

/**
 * @constant {string} GAME_OVER - Sent when the game is over.
 *
 * @description This event is sent by the server to all clients in a room to notify them that the game has ended.
 * The event indicates that the game status has changed to "ended" and provides information about the final state of the game.
 * It contains data such as the room ID and details about the players, including who has lost.
 *
 * @example
 * // Server-side example of emitting the GAME_OVER event
 * io.to(room.id).emit('game-over', {
 *   room: {
 *     id: room.id,
 *     owner: { id: owner.id, username: owner.username },
 *     status: room.status,
 *     soloJourney: room.soloJourney
 *   },
 *   message: 'Game Over'
 * });
 */
const GAME_OVER = 'game-over';

export {
	ERROR,
	CLIENT_UPDATED,
	ROOM_CREATED,
	ROOM_JOINED,
	ROOM_LEFT,
	ROOM_BROADCAST,
	GAME_STARTED,
	GAME_STATE,
	GAME_OVER,
};
