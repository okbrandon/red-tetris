/**
 * @fileoverview Manages player statistics, including loading, saving, and updating game history.
 */

import database from './database.js';

class Statistics {

	/**
	 * Creates a Statistics instance for a player.
	 * @param {*} username - The player's username.
	 */
	constructor(username) {
		this.username = username;
		this.gameHistory = [];
	}

	/**
	 * Loads the player's statistics from the database.
	 */
	async load() {
		const pool = await database.connect();
		const { rows } = await pool.query(
			'SELECT game_history FROM statistics WHERE username = $1',
			[this.username]
		);

		if (rows.length > 0) {
			const history = rows[0].game_history ?? [];
			let parsedHistory = history;
			if (typeof history === 'string') {
				try {
					parsedHistory = JSON.parse(history);
				} catch {
					parsedHistory = [];
				}
			}
			this.gameHistory = Array.isArray(parsedHistory) ? parsedHistory : [];
		} else {
			this.gameHistory = [];
		}
	}

	/**
	 * Saves the player's statistics to the database.
	 */
	async save() {
		const pool = await database.connect();

		console.log('Saving statistics for', this.username, this.gameHistory);

		await pool.query(
			`INSERT INTO statistics (username, game_history, updated_at)
			 VALUES ($1, $2::jsonb, NOW())
			 ON CONFLICT (username)
			 DO UPDATE SET game_history = EXCLUDED.game_history, updated_at = NOW()`,
			[this.username, JSON.stringify(this.gameHistory)]
		);
	}

	/**
	 * Adds a game result to the player's history.
	 *
	 * @param {Object} result - The game result to add.
	 */
	addGameResult(result) {
		this.gameHistory.push({
			...result
		});
	}

	/**
	 * Retrieves the last n game results.
	 *
	 * @param {number} n - The number of recent game results to retrieve.
	 * @return {Array} - An array of the last n game results.
	 */
	getStats(n = 5) {
		return this.gameHistory.slice(-n).reverse();
	}

}

export default Statistics;
