#!/usr/bin/env node
import BotManager from './botManager.js';
import { loadDefaultsFromEnv, parseArgs, printHelp, resolveOptions } from './cli.js';

const envDefaults = loadDefaultsFromEnv();
const cliConfig = parseArgs(process.argv.slice(2));

if (cliConfig.help) {
	printHelp(envDefaults);
	process.exit(0);
}

const resolvedOptions = resolveOptions(cliConfig, envDefaults);
const manager = new BotManager(resolvedOptions);

manager.startAll().catch((error) => {
	console.error('[bot] Failed to start bots:', error);
	process.exit(1);
});

function shutdown(code = 0) {
	manager.stopAll();
	setTimeout(() => process.exit(code), 10);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('uncaughtException', (err) => {
	console.error('[bot] Uncaught exception:', err);
	shutdown(1);
});
process.on('unhandledRejection', (reason) => {
	console.error('[bot] Unhandled rejection:', reason);
	shutdown(1);
});
