import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017';
const DB_NAME = process.env.MONGO_INITDB_DATABASE || 'red-tetris';

class Mongo {

	constructor() {
		if (Mongo.instance)
			return Mongo.instance;

		this.client = null;
		this.db = null;

		Mongo.instance = this;
	}

	async connect() {
		if (this.db)
			return this.db;

		this.client = new MongoClient(MONGO_URI, { useUnifiedTopology: true });
		await this.client.connect();

		this.db = this.client.db(DB_NAME);
		console.log(`[MongoDB] Connected to ${MONGO_URI}/${DB_NAME}`);
		return this.db;
	}

	getDb() {
		if (!this.db)
			throw new Error('MongoDB not connected. Call connect() first.');
		return this.db;
	}

	async close() {
		if (this.client)
			await this.client.close();
		this.db = null;
		this.client = null;
	}

}

const mongo = new Mongo();
export default mongo;
