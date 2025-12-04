import http from 'node:http';
import { BotManager } from './botManager.js';
import { loadDefaultsFromEnv } from './cli.js';

const defaults = loadDefaultsFromEnv();
const activeManagers = new Map();
const MAX_BODY_SIZE = 1 * 1024 * 1024;

const parsePort = (value, fallback) => {
	const parsed = Number.parseInt(value, 10);
	return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535 ? parsed : fallback;
};

const serviceHost = process.env.BOT_SERVICE_HOST || '0.0.0.0';
const servicePort = parsePort(process.env.BOT_SERVICE_PORT, 4000);

const sendJson = (res, statusCode, payload) => {
	if (!res.headersSent)
		res.writeHead(statusCode, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify(payload));
};

const parsePositiveInt = (value) => {
	if (value === undefined || value === null)
		return null;
	if (typeof value === 'number' && Number.isInteger(value) && value >= 1)
		return value;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (/^[1-9]\d*$/.test(trimmed))
			return Number.parseInt(trimmed, 10);
	}
	return null;
};

const registerManager = (roomName, manager) => {
	const managers = activeManagers.get(roomName) ?? new Set();
	managers.add(manager);
	activeManagers.set(roomName, managers);
};

const deregisterManager = (roomName, manager) => {
	const managers = activeManagers.get(roomName);
	if (!managers)
		return;
	managers.delete(manager);
	if (!managers.size)
		activeManagers.delete(roomName);
};

const disconnectRoomBots = (roomName) => {
	const managers = activeManagers.get(roomName);
	if (!managers || !managers.size)
		return { stoppedBots: 0, managerCount: 0 };

	let stoppedBots = 0;
	let managerCount = 0;
	managers.forEach((manager) => {
		stoppedBots += manager.stopAll() || 0;
		managerCount += 1;
	});
	activeManagers.delete(roomName);
	return { stoppedBots, managerCount };
};

const createManagerOptions = (roomName, botCount) => {
	const baseUsername = defaults.nameMode === 'list'
		? undefined
		: `Bot_${Math.random().toString(36).slice(2, 8)}`;

	const options = {
		serverUrl: defaults.serverUrl,
		roomName,
		autoStart: defaults.autoStart,
		logLevel: defaults.logLevel,
		thinkDelayMs: defaults.thinkDelayMs,
		botCount,
		nameMode: defaults.nameMode
	};

	if (baseUsername)
		options.username = baseUsername;

	return options;
};

const spawnBots = async (roomName, botCount) => {
	const manager = new BotManager(createManagerOptions(roomName, botCount));
	manager.setOnEmpty(() => {
		deregisterManager(roomName, manager);
	});
	registerManager(roomName, manager);

	try {
		const results = await manager.startAll();
		const started = results.filter(({ error }) => !error).length;
		const failed = results.length - started;
		return { started, failed };
	} catch (error) {
		deregisterManager(roomName, manager);
		manager.stopAll();
		throw error;
	}
};

const handleSpawnRequest = async (res, rawBody) => {
	let payload;

	try {
		payload = rawBody ? JSON.parse(rawBody) : null;
	} catch {
		sendJson(res, 400, { error: 'Invalid JSON payload' });
		return;
	}

	if (!payload || typeof payload !== 'object') {
		sendJson(res, 400, { error: 'Payload must be a JSON object' });
		return;
	}

	const roomName = typeof payload.room === 'string' ? payload.room.trim() : '';
	if (!roomName) {
		sendJson(res, 400, { error: 'room is required' });
		return;
	}

	const parsedBotCount = parsePositiveInt(payload.botCount);
	if (parsedBotCount === null) {
		sendJson(res, 400, { error: 'botCount must be a positive integer' });
		return;
	}

	try {
		const { started, failed } = await spawnBots(roomName, parsedBotCount);
		const statusCode = failed > 0 ? 200 : 201;
		console.log(`[service] Spawn request for ${roomName}: started ${started}, failed ${failed}`);
		sendJson(res, statusCode, {
			room: roomName,
			requestedBots: parsedBotCount,
			startedBots: started,
			failedBots: failed
		});
	} catch (error) {
		console.error(`[service] Failed to start bots for room ${roomName}:`, error);
		const failureMessages = Array.isArray(error?.failures)
			? error.failures
				.map((item) => item instanceof Error ? item.message : undefined)
				.filter((message) => typeof message === 'string' && message.length)
			: [];
		const statusCode = failureMessages.length ? 503 : 500;
		sendJson(res, statusCode, {
			error: failureMessages.length ? 'Unable to connect bots to backend' : 'Failed to start bots',
			details: failureMessages.length ? failureMessages : undefined
		});
	}
};

const handleDisconnectRequest = async (res, rawBody) => {
	let payload;

	try {
		payload = rawBody ? JSON.parse(rawBody) : null;
	} catch {
		sendJson(res, 400, { error: 'Invalid JSON payload' });
		return;
	}

	if (!payload || typeof payload !== 'object') {
		sendJson(res, 400, { error: 'Payload must be a JSON object' });
		return;
	}

	const roomName = typeof payload.room === 'string' ? payload.room.trim() : '';
	if (!roomName) {
		sendJson(res, 400, { error: 'room is required' });
		return;
	}

	const { stoppedBots, managerCount } = disconnectRoomBots(roomName);
	if (stoppedBots === 0 && managerCount === 0) {
		sendJson(res, 200, {
			room: roomName,
			stoppedBots: 0,
			managerCount: 0,
			message: 'No active bots for the specified room'
		});
		return;
	}

	console.log(`[service] Disconnect request for ${roomName}: stopped ${stoppedBots} bots across ${managerCount} managers`);
	sendJson(res, 200, {
		room: roomName,
		stoppedBots,
		managerCount
	});
};

const collectRequestBody = (req, res, handler) => {
	let rawBody = '';
	let received = 0;
	let aborted = false;

	req.setEncoding('utf8');
	req.on('data', (chunk) => {
		if (aborted)
			return;

		received += Buffer.byteLength(chunk);
		if (received > MAX_BODY_SIZE) {
			aborted = true;
			sendJson(res, 413, { error: 'Payload too large' });
			req.destroy();
			return;
		}

		rawBody += chunk;
	});

	req.on('end', () => {
		if (aborted)
			return;

		Promise.resolve(handler(rawBody)).catch((error) => {
			console.error('[service] Handler error:', error);
			if (!res.writableEnded)
				sendJson(res, 500, { error: 'Internal server error' });
		});
	});

	req.on('error', (error) => {
		console.error('[service] Request error:', error);
		if (!res.writableEnded)
			sendJson(res, 500, { error: 'Request handling failed' });
	});
};

const server = http.createServer((req, res) => {
	if (!req.url) {
		sendJson(res, 400, { error: 'Invalid request' });
		return;
	}

	if (req.method === 'GET' && req.url === '/health') {
		sendJson(res, 200, { status: 'ok' });
		return;
	}

	if (req.method === 'POST' && (req.url === '/connect' || req.url === '/bots/connect')) {
		collectRequestBody(req, res, (body) => handleSpawnRequest(res, body));
		return;
	}

	if (req.method === 'POST' && (req.url === '/disconnect' || req.url === '/bots/disconnect')) {
		collectRequestBody(req, res, (body) => handleDisconnectRequest(res, body));
		return;
	}

	sendJson(res, 404, { error: 'Not found' });
});

let shuttingDown = false;

const shutdown = (code = 0) => {
	if (shuttingDown)
		return;
	shuttingDown = true;
	console.log('[service] Shutting down bot service');
	activeManagers.forEach((managers) => {
		managers.forEach((manager) => manager.stopAll());
	});
	activeManagers.clear();
	server.close(() => process.exit(code));
	setTimeout(() => process.exit(code), 2000).unref();
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('uncaughtException', (error) => {
	console.error('[service] Uncaught exception:', error);
	shutdown(1);
});
process.on('unhandledRejection', (reason) => {
	console.error('[service] Unhandled rejection:', reason);
	shutdown(1);
});

server.listen(servicePort, serviceHost, () => {
	console.log(`[service] Listening on http://${serviceHost}:${servicePort}`);
	console.log(`[service] Target backend: ${defaults.serverUrl}`);
});
