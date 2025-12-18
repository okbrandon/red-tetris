import { DEFAULT_BOT_TIMING, DEFAULT_NAME_MODE, NAME_MODES } from './constants.js';

export function loadDefaultsFromEnv(env = process.env) {
	const parseIntOr = (value, fallback) => {
		const parsed = parseInt(value ?? '', 10);
		return Number.isFinite(parsed) ? parsed : fallback;
	};

	const normalizeNameMode = (value) => {
		const normalized = String(value || DEFAULT_NAME_MODE).toLowerCase();
		return NAME_MODES.has(normalized) ? normalized : DEFAULT_NAME_MODE;
	};

	const nameMode = normalizeNameMode(env.BOT_NAME_MODE);
	const defaultUsername = nameMode === 'list'
		? undefined
		: `Bot_${Math.random().toString(36).slice(2, 8)}`;

	return {
		serverUrl: env.BOT_SERVER_URL || 'http://localhost:3000',
		roomName: env.BOT_ROOM || 'practice-room',
		username: env.BOT_USERNAME || defaultUsername,
		autoStart: env.BOT_AUTO_START === 'true',
		logLevel: env.BOT_LOG_LEVEL || 'info',
		thinkDelayMs: Math.max(0, parseIntOr(env.BOT_THINK_DELAY, DEFAULT_BOT_TIMING.thinkDelayMs)),
		botCount: Math.max(1, parseIntOr(env.BOT_COUNT, 1)),
		nameMode
	};
}

export function parseArgs(argv) {
	const config = {};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		switch (arg) {
			case '--help':
			case '-h':
				config.help = true;
				break;
			case '--server':
			case '-s':
				config.serverUrl = argv[++i];
				break;
			case '--room':
			case '-r':
				config.roomName = argv[++i];
				break;
			case '--username':
			case '-u':
				config.username = argv[++i];
				break;
			case '--name-mode':
			case '-n':
				config.nameMode = (argv[++i] || '').toLowerCase();
				break;
			case '--bots':
			case '-b':
				config.botCount = parseInt(argv[++i], 10);
				break;
			case '--auto-start':
				config.autoStart = true;
				break;
			case '--log-level':
				config.logLevel = argv[++i];
				break;
			case '--think-delay':
				config.thinkDelayMs = parseInt(argv[++i], 10);
				break;
			default:
				if (!arg.startsWith('-') && !config.roomName)
					config.roomName = arg;
				break;
		}
	}

	return config;
}

export function printHelp(defaults) {
	console.log(`Usage: npm start -- [options]\n\nOptions:\n  -s, --server <url>     Socket.IO server URL (default: ${defaults.serverUrl})\n  -r, --room <name>      Room name to join (default: ${defaults.roomName})\n  -u, --username <name>  Bot username (default: random)\n  -n, --name-mode <m>    generated|list (default: ${defaults.nameMode})\n  -b, --bots <count>     Number of bot instances to launch (default: ${defaults.botCount})\n      --auto-start       Start the game automatically when owning the room\n      --log-level <lvl>  trace|debug|info|warn|error|silent\n      --think-delay <ms> Delay before deciding on a move (default: ${defaults.thinkDelayMs}ms)\n  -h, --help             Show this help\n`);
}

export function resolveOptions(cliConfig, defaults) {
	const parsePositiveInt = (value, fallback) => {
		if (!Number.isFinite(value))
			return fallback;
		return Math.max(1, value);
	};

	const desiredMode = (cliConfig.nameMode || defaults.nameMode || DEFAULT_NAME_MODE).toLowerCase();
	const nameMode = NAME_MODES.has(desiredMode) ? desiredMode : DEFAULT_NAME_MODE;

	return {
		serverUrl: cliConfig.serverUrl || defaults.serverUrl,
		roomName: cliConfig.roomName || defaults.roomName,
		username: cliConfig.username || defaults.username,
		autoStart: typeof cliConfig.autoStart === 'boolean' ? cliConfig.autoStart : defaults.autoStart,
		logLevel: cliConfig.logLevel || defaults.logLevel,
		thinkDelayMs: Number.isFinite(cliConfig.thinkDelayMs)
			? Math.max(0, cliConfig.thinkDelayMs)
			: defaults.thinkDelayMs,
		botCount: parsePositiveInt(cliConfig.botCount, defaults.botCount),
		nameMode
	};
}
