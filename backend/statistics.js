import mongo from './mongo.js';

class Statistics {

	constructor(username) {
		this.username = username;
		this.gameHistory = [];
	}

	async load() {
		const db = await mongo.connect();
		const collection = db.collection('statistics');
		const data = await collection.findOne({ username: this.username });

		if (data) {
			this.gameHistory = data.gameHistory || [];
		}
	}

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

		console.log('Statistics saved for', this.username);
	}

	addGameResult(result) {
		this.gameHistory.push({
			result
		});
	}

}

export default Statistics;
