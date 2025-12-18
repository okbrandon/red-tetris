import { jest, expect } from '@jest/globals';

jest.unstable_mockModule('mongodb', async () => {
	return await import('../__mocks__/_mockMongo.js');
});

const { mockClient, mockDb } = await import('../__mocks__/_mockMongo.js');

const mongoModule = await import('../database.js');
const mongo = mongoModule.default;

describe('Mongo singleton wrapper', () => {

	/**
	 * Reset mocks and mongo state before each test.
	 */
	beforeEach(() => {
		mockClient.connect.mockClear();
		mockClient.db.mockClear();
		mockClient.close.mockClear();

		if (mongo.client) mongo.client = null;
		if (mongo.db) mongo.db = null;
	});

	/**
	 * Test that singleton instance is returned.
	 */
	test('singleton instance is returned if constructed multiple times', () => {
		const MongoClass = mongoModule.default.constructor;
		const mongo1 = new MongoClass();
		const mongo2 = new MongoClass();

		expect(mongo1).toBe(mongo2);
	});

	/**
	 * Test connecting to the database.
	 */
	test('connect establishes a connection and returns db', async () => {
		const db = await mongo.connect();

		expect(mockClient.connect).toHaveBeenCalled();
		expect(mockClient.db).toHaveBeenCalled();
		expect(db).toBe(mockDb);
	});

	/**
	 * Test that connect is idempotent.
	 */
	test('connect is idempotent and does not reconnect when already connected', async () => {
		const first = await mongo.connect();
		const second = await mongo.connect();

		expect(mockClient.connect).toHaveBeenCalledTimes(1);
		expect(first).toBe(second);
	});

	/**
	 * Test getDb behavior.
	 */
	test('getDb throws when not connected', () => {
		mongo.db = null;

		expect(() => mongo.getDb()).toThrow('MongoDB not connected. Call connect() first.');
	});

	/**
	 * Test getDb returns the connected db.
	 */
	test('getDb returns the connected db', async () => {
		await mongo.connect();
		const db = mongo.getDb();

		expect(db).toBe(mockDb);
	});

	/**
	 * Test closing the connection.
	 */
	test('close closes the client and resets state', async () => {
		await mongo.connect();
		await mongo.close();

		expect(mockClient.close).toHaveBeenCalled();
		expect(mongo.client).toBeNull();
		expect(mongo.db).toBeNull();
	});

	/**
	 * Test closing the connection checks if client exists before closing.
	 */
	test('closing the connection checks if client exists before closing', async () => {
		mongo.client = null;
		mongo.db = null;

		await expect(mongo.close()).resolves.toBeUndefined();

		await mongo.connect();
		expect(mongo.client).not.toBeNull();
		expect(mongo.db).not.toBeNull();

		await mongo.close();
		expect(mockClient.close).toHaveBeenCalled();
		expect(mongo.client).toBeNull();
		expect(mongo.db).toBeNull();
	});

});
