/**
 * @constant {string} CLIENT_UPDATE - Sent when the client updates their information, such as their username.
 */
const CLIENT_UPDATE = 'client-update';

/**
 * @constant {string} ROOM_JOIN - Sent when a player requests to join a room.
 */
const ROOM_JOIN = 'room-join';

/**
 * @constant {string} ROOM_LEAVE - Sent when a player requests to leave a room.
 */
const ROOM_LEAVE = 'room-leave';

/**
 * @constant {string} START_GAME - Sent when the owner starts the game in a room.
 */
const START_GAME = 'start-game';

/**
 * @constant {string} RESTART_GAME - Sent when the owner restarts the game in a room.
 */
const RESTART_GAME = 'restart-game';

/**
 * @constant {string} MOVE_PIECE - Sent when a player moves a piece in the game.
 */
const MOVE_PIECE = 'move-piece';

export {
	CLIENT_UPDATE,
	ROOM_JOIN,
	ROOM_LEAVE,
	START_GAME,
	RESTART_GAME,
	MOVE_PIECE
};
