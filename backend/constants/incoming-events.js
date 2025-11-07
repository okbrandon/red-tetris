/**
 * @constant {string} CLIENT_UPDATE - Sent when the client updates their information, such as their username.
 *
 * @description This event is sent by the client to the server when they want to update their information, such as changing their username.
 * The server processes this event and updates the client's information accordingly.
 * The server responds with a @property {string} CLIENT_UPDATED event to confirm the update.
 *
 * @example
 * // Client-side example of emitting the CLIENT_UPDATE event
 * socket.emit('client-update', { username: 'Samaritan' });
 */
const CLIENT_UPDATE = 'client-update';

/**
 * @constant {string} ROOM_JOIN - Sent when a player requests to join a room.
 *
 * @description This event is sent by the client to the server when they want to join a specific game room.
 * The server processes this event and adds the player to the requested room if possible.
 * The server responds with a @property {string} ROOM_JOINED event to confirm the player has joined the room.
 * If an error occurs (e.g., room does not exist, game already started), the server responds with an @property {string} ERROR event.
 *
 * @example
 * // Client-side example of emitting the ROOM_JOIN event
 * socket.emit('room-join', { roomName: 'amazingTestRoom', soloJourney: true }); // soloJourney is optional
 */
const ROOM_JOIN = 'room-join';

/**
 * @constant {string} ROOM_LEAVE - Sent when a player requests to leave a room.
 *
 * @description This event is sent by the client to the server when they want to leave their current game room.
 * The server processes this event and removes the player from the room.
 * The server responds with a @property {string} ROOM_LEFT event to confirm the player has left the room.
 * If an error occurs (e.g., player not in a room), the server responds with an @property {string} ERROR event.
 *
 * @example
 * // Client-side example of emitting the ROOM_LEAVE event
 * socket.emit('room-leave');
 */
const ROOM_LEAVE = 'room-leave';

/**
 * @constant {string} START_GAME - Sent when the owner starts the game in a room.
 *
 * @description This event is sent by the client to the server when the room owner starts the game.
 * The server processes this event and changes the game status to playing if possible.
 * The server responds with a @property {string} GAME_STARTED event to confirm the game has started.
 * If an error occurs (e.g., game already started, client not owner), the server responds with an @property {string} ERROR event.
 *
 * @example
 * // Client-side example of emitting the START_GAME event
 * socket.emit('start-game');
 */
const START_GAME = 'start-game';

/**
 * @constant {string} RESET_GAME - Sent when the owner resets the game in a room.
*
* @description This event is sent by the client to the server when the room owner wants to reset the game to its initial state.
* The server processes this event and resets the game state if possible.
*
* @example
* // Client-side example of emitting the RESET_GAME event
* socket.emit('reset-game');
*/
const RESET_GAME = 'reset-game';

/**
 * @constant {string} MOVE_PIECE - Sent when a player moves a piece in the game.
 *
 * @description This event is sent by the client to the server when a player wants to move their current piece in a specific direction (left, right, up, down, space).
 * The server processes this event and updates the game state accordingly.
 * The server responds with a @property {string} GAME_STATE event to update all players with the new game state.
 * If an error occurs (e.g., game not in progress, player has no active piece), the server responds with an @property {string} ERROR event.
 *
 * @example
 * // Client-side example of emitting the MOVE_PIECE event
 * socket.emit('move-piece', { direction: 'left' });
 */
const MOVE_PIECE = 'move-piece';

/**
 * @constant {string} PIECE_SPAWN - Local event for piece spawning.
 *
 * @description This event is used internally to handle the spawning of new pieces for players.
 * It is not intended to be emitted by clients directly.
 */
const PIECE_SPAWN = 'piece-spawn';

/**
 * @constant {string} ROOM_MODE - Sent when a player changes the room mode.
 *
 * @description This event is sent by the client to the server when they want to change the game mode of the room.
 */
const ROOM_MODE = 'room-mode';

export default {
	CLIENT_UPDATE,
	ROOM_JOIN,
	ROOM_LEAVE,
	START_GAME,
	RESET_GAME,
	MOVE_PIECE,
	PIECE_SPAWN,
	ROOM_MODE
};
