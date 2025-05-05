/**
 * @constant {string} ERROR - Represents an error event sent to the client.
 */
const ERROR = 'error';

/**
 * @constant {string} CLIENT_UPDATED - Sent when the client updates their username.
 */
const CLIENT_UPDATED = 'client-updated';

/**
 * @constant {string} ROOM_CREATED - Sent when a new room is created.
 */
const ROOM_CREATED = 'room-created';

/**
 * @constant {string} ROOM_JOINED - Sent when a player successfully joins a room.
 */
const ROOM_JOINED = 'room-joined';

/**
 * @constant {string} ROOM_LEFT - Sent when a player leaves the room.
 */
const ROOM_LEFT = 'room-left';

/**
 * @constant {string} ROOM_BROADCAST - Sent to broadcast the current state of the room to all players.
 */
const ROOM_BROADCAST = 'room-broadcast';

/**
 * @constant {string} GAME_STARTED - Sent when a game has started in the room.
 */
const GAME_STARTED = 'game-started';

/**
 * @constant {string} GAME_STATE - Sent to update the client with the current game state.
 */
const GAME_STATE = 'game-state';

/**
 * @constant {string} GAME_OVER - Sent when the game is over.
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
