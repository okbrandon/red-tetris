/**
 * @fileoverview Manages player statistics, including loading, saving, and updating game history.
 */

import mongo from './mongo.js';

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
		const db = await mongo.connect();
		const collection = db.collection('statistics');
		const data = await collection.findOne({ username: this.username });

		if (data) {
			this.gameHistory = data.gameHistory || [];
		}
	}

	/**
	 * Saves the player's statistics to the database.
	 */
	async save() {
		const db = await mongo.connect();
		const collection = db.collection('statistics');

		console.log('Saving statistics for', this.username, this.gameHistory);

		await collection.updateOne(
			{ username: this.username },
			{
				$set: {
					gameHistory: this.gameHistory
				}
			},
			{ upsert: true }
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
