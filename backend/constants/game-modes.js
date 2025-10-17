/**
 * @constant {string} CLASSIC - Classic game mode.
 *
 * @description The CLASSIC game mode follows traditional Tetris rules with standard piece drop speeds and scoring.
 */
const CLASSIC = 'classic';

/**
 * @constant {string} FAST_PACED - Fast-paced game mode.
 *
 * @description The FAST_PACED game mode increases the speed of piece drops, challenging players to think and react more quickly.
 */
const FAST_PACED = 'fast-paced';

/**
 * @constant {string} INVISIBLE_FALLING_PIECES - Invisible falling pieces game mode.
 *
 * @description The INVISIBLE_FALLING_PIECES game mode makes the falling pieces invisible, requiring players to rely on memory and spatial awareness.
 */
const INVISIBLE_FALLING_PIECES = 'invisible-falling-pieces';

export default {
	CLASSIC,
	FAST_PACED,
	INVISIBLE_FALLING_PIECES
};
