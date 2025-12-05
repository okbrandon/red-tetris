/**
 * @fileoverview MongoDB connection and management.
 * Singleton pattern to ensure one connection instance.
 */
import { MongoClient } from 'mongodb';

const MONGO_ADMIN = process.env.MONGO_INITDB_ROOT_USERNAME || 'mongoadmin';
const MONGO_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || 'adminpass';
const MONGO_HOST = process.env.MONGO_HOST || 'mongodb';
const MONGO_PORT = process.env.MONGO_PORT || '27017';
const MONGO_URI = process.env.MONGO_URI || `mongodb://${MONGO_ADMIN}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/?authSource=admin`;
const DB_NAME = process.env.MONGO_INITDB_DATABASE || 'red-tetris';

class Mongo {

	/**
	 * Singleton instance of Mongo class.
	 */
	constructor() {
		if (Mongo.instance)
			return Mongo.instance;

		this.client = null;
		this.db = null;

		Mongo.instance = this;
	}

	/**
	 * Connects to MongoDB if not already connected.
	 * @returns {Promise<Db>} - The connected database instance.
	 */
	async connect() {
		if (this.db)
			return this.db;

		console.log(`[MongoDB] Connecting to ${MONGO_URI}/${DB_NAME}...`);

		this.client = new MongoClient(MONGO_URI);
		await this.client.connect();

		this.db = this.client.db(DB_NAME);
		console.log(`[MongoDB] Connected to ${MONGO_URI}/${DB_NAME}`);
		return this.db;
	}

	/**
	 * Gets the connected database instance.
	 * @returns {Db} - The connected database instance.
	 */
	getDb() {
		if (!this.db)
			throw new Error('MongoDB not connected. Call connect() first.');
		return this.db;
	}

	/**
	 * Closes the MongoDB connection.
	 */
	async close() {
		if (this.client)
			await this.client.close();
		this.db = null;
		this.client = null;
	}

}

const mongo = new Mongo();
export default mongo;
