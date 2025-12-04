import { LOG_LEVELS } from '../constants.js';

export function safeParse(payload, allowObject = false, logger = null) {
	if (payload == null)
		return null;
	if (allowObject && typeof payload === 'object')
		return payload;
	if (typeof payload === 'object' && !allowObject)
		return payload;
	if (typeof payload !== 'string')
		return null;
	try {
		return JSON.parse(payload);
	} catch (error) {
		if (logger)
			logger('debug', 'Failed to parse payload', error);
		return null;
	}
}

export function computeQueueSignature(queue) {
	return (queue || [])
		.map(piece => {
			const color = piece?.color || 'null';
			const shape = Array.isArray(piece?.shape)
				? piece.shape.map(row => Array.isArray(row) ? row.join('') : '').join('|')
				: 'null';
			return `${color}:${shape}`;
		})
		.join(';');
}

export function createLogger(levelName = 'info') {
	const configured = LOG_LEVELS[levelName] ?? LOG_LEVELS.info;
	return (level, ...args) => {
		const numeric = LOG_LEVELS[level];
		if (numeric === undefined || numeric < configured)
			return;
		console.log(`[bot][${level.toUpperCase()}]`, ...args);
	};
}
