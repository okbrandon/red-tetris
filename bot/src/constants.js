export const MOVE_DIRECTIONS = new Set(['left', 'right', 'down', 'up', 'space']);

export const LOG_LEVELS = { trace: 0, debug: 1, info: 2, warn: 3, error: 4, silent: 5 };

export const DEFAULT_WEIGHTS = {
	linesCleared: 1.1,
	aggregateHeight: 0.45,
	holes: 0.36,
	bumpiness: 0.18,
	maxHeight: 0.2,
	landingHeight: 0.015,
	multiClearBonus: 0.5
};

export const DEFAULT_BOT_TIMING = {
	commandIntervalMs: 25,
	maxQueuedCommands: 6,
	thinkDelayMs: 120,
	lookaheadWeight: 0.65,
	connectTimeoutMs: 5000
};

export const NAME_MODES = new Set(['generated', 'list']);

export const DEFAULT_NAME_MODE = 'generated';

export const USERNAME_POOL = [
	'VortexEdge',
	'FrostHex',
	'BlazeDrift',
	'NovaRyn',
	'PhantomAce',
	'RiftPulse',
	'ArcticNova',
	'DreadWisp',
	'IonRogue',
	'ShadowSync',
	'PyroDraft',
	'Zyntrax',
	'VenomChord',
	'GlitchRay',
	'RustEcho',
	'EmberByte',
	'TorqueOne',
	'NullSpectre',
	'DriftPhase',
	'Kinetic09',
	'FluxSnare',
	'RiftZone',
	'DeltaHowl',
	'ZenCrux',
	'PulseTalon'
];
