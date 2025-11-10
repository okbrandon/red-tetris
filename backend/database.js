/**
 * @fileoverview PostgreSQL connection manager.
 * Provides a singleton Pool instance and ensures required tables exist.
 */
import { Pool } from 'pg';

const DEFAULT_USER = process.env.POSTGRES_USER || 'postgres';
const DEFAULT_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';
const DEFAULT_HOST = process.env.POSTGRES_HOST || 'postgres';
const DEFAULT_PORT = process.env.POSTGRES_PORT || '5432';
const DEFAULT_DB = process.env.POSTGRES_DB || 'red_tetris';

const connectionString = process.env.POSTGRES_URI ||
	`postgresql://${encodeURIComponent(DEFAULT_USER)}:${encodeURIComponent(DEFAULT_PASSWORD)}@${DEFAULT_HOST}:${DEFAULT_PORT}/${DEFAULT_DB}`;

class Database {
	constructor() {
		if (Database.instance)
			return Database.instance;

		this.pool = null;
		Database.instance = this;
	}

	/**
	 * Connects to PostgreSQL if not already connected.
	 * Ensures the statistics table exists.
	 * Will retry up to 10 times with exponential backoff, and exit the process if all attempts fail.
	 * @returns {Promise<Pool>} - Active connection pool.
	 */
	async connect() {
		if (this.pool) return this.pool;

		const MAX_ATTEMPTS = 10;
		const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

		const sanitizeConnectionString = (conn) => {
			try {
				const url = new URL(conn);

				if (url.password)
					url.password = '***';

				return url.toString();
			} catch {
				return conn.replace(/:(.*)@/, ':***@');
			}
		};

		const createAndVerifyPool = async () => {
			this.pool = new Pool({ connectionString });

			await this.pool.query('SELECT 1');
			await this.pool.query(`
				CREATE TABLE IF NOT EXISTS statistics (
					username VARCHAR(32) PRIMARY KEY,
					game_history JSONB NOT NULL DEFAULT '[]'::jsonb,
					updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
				)
			`);
		};

		const closePoolIfExists = async () => {
			if (!this.pool) return;
			try {
				await this.pool.end();
			} catch {
				// ignore
			} finally {
				this.pool = null;
			}
		};

		for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
			try {
				await createAndVerifyPool();
				console.log(`[PostgreSQL] Connected to ${sanitizeConnectionString(connectionString)}`);
				return this.pool;
			} catch (err) {
				const msg = err && err.message ? err.message : String(err);
				console.error(`[PostgreSQL] Connection attempt ${attempt} failed: ${msg}`);

				await closePoolIfExists();

				if (attempt === MAX_ATTEMPTS) {
					console.error('[PostgreSQL] Max connection attempts reached, shutting down.');
					process.exit(1);
				}

				const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 30000); // backoff
				await sleep(backoff);
			}
		}

		throw new Error('Failed to connect to PostgreSQL after retries');
	}

	/**
	 * Retrieves the active connection pool.
	 * @returns {Pool} - Active connection pool.
	 */
	getPool() {
		if (!this.pool)
			throw new Error('PostgreSQL not connected. Call connect() first.');
		return this.pool;
	}

	/**
	 * Closes the PostgreSQL connection pool.
	 */
	async close() {
		if (this.pool) {
			await this.pool.end();
		}
		this.pool = null;
	}
}

const database = new Database();
export default database;
