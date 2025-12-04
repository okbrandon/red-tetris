import TetrisBot from './tetrisBot.js';
import { DEFAULT_NAME_MODE, USERNAME_POOL } from './constants.js';

function shuffle(source) {
	const array = source.slice();
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export class BotManager {
	constructor(options) {
		const { botCount = 1, username, nameMode = DEFAULT_NAME_MODE } = options;
		this.botCount = Math.max(1, botCount);
		this.baseUsername = username;
		this.nameMode = USERNAME_POOL.length ? nameMode : DEFAULT_NAME_MODE;
		const { botCount: _unused, username: _unusedName, ...baseOptions } = options;
		this.baseOptions = baseOptions;
		this.bots = [];
		this.namePool = [];
		this.onEmptyCallback = null;
	}

	createBots() {
		if (this.bots.length)
			return this.bots;

		this.bots = Array.from({ length: this.botCount }, (_, index) => {
			const username = this.pickUsername(index);
			const bot = new TetrisBot({ ...this.baseOptions, username });
			bot.setRetireHandler(() => {
				this.handleBotRetired(bot);
			});
			return bot;
		});
		return this.bots;
	}

	pickUsername(index) {
		if (this.nameMode === 'list' && USERNAME_POOL.length) {
			const pool = this.ensureNamePool();
			const poolLength = pool.length;
			if (!poolLength)
				return this.generateIndexedName(index);
			const base = pool[index % poolLength];
			const tier = Math.floor(index / poolLength);
			return tier === 0 ? base : `${base}-${tier + 1}`;
		}
		return this.generateIndexedName(index);
	}

	ensureNamePool() {
		if (!this.namePool.length)
			this.namePool = shuffle(USERNAME_POOL);
		return this.namePool;
	}

	generateIndexedName(index) {
		if (!this.baseUsername)
			this.baseUsername = `Bot_${Math.random().toString(36).slice(2, 8)}`;
		return this.botCount === 1
			? this.baseUsername
			: `${this.baseUsername}-${index + 1}`;
	}

	async startAll() {
		const bots = this.createBots();
		const results = await Promise.all(bots.map(async (bot) => {
			try {
				await bot.start();
				return { bot, error: null };
			} catch (error) {
				return { bot, error };
			}
		}));

		const failures = results.filter(result => result.error);
		if (failures.length === results.length) {
			const aggregate = new Error('All bot instances failed to start');
			aggregate.failures = failures.map(({ error }) => error);
			if (failures[0]?.error instanceof Error && aggregate.cause === undefined)
				aggregate.cause = failures[0].error;
			throw aggregate;
		}

		failures.forEach(({ bot, error }) => {
			console.error(`[bot] Failed to start instance ${bot.options.username}:`, error);
		});

		return results;
	}

	stopAll() {
		const stopped = this.bots.length;
		this.bots.forEach(bot => bot.stop());
		this.bots = [];
		return stopped;
	}

	setOnEmpty(callback) {
		this.onEmptyCallback = typeof callback === 'function' ? callback : null;
	}

	handleBotRetired(bot) {
		const index = this.bots.indexOf(bot);
		if (index === -1)
			return;
		this.bots.splice(index, 1);
		if (!this.bots.length && this.onEmptyCallback)
			this.onEmptyCallback();
	}
}

export default BotManager;
