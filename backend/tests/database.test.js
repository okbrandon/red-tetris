import { jest, expect } from '@jest/globals';

const { mockPool, Pool } = await import('../__mocks__/_mockPg.js');

jest.unstable_mockModule('pg', async () => ({
	Pool
}));

const databaseModule = await import('../database.js');
const database = databaseModule.default;

describe('Database singleton wrapper', () => {
	beforeEach(async () => {
		Pool.mockClear();
		mockPool.query.mockReset();
		mockPool.end.mockReset();
		mockPool.query.mockResolvedValue({ rows: [] });
		mockPool.end.mockResolvedValue();

		await database.close();
	});

	test('singleton instance is returned if constructed multiple times', () => {
		const DatabaseClass = database.constructor;
		const db1 = new DatabaseClass();
		const db2 = new DatabaseClass();

		expect(db1).toBe(db2);
	});

	test('connect establishes a connection and ensures schema', async () => {
		const pool = await database.connect();

		expect(Pool).toHaveBeenCalledTimes(1);
		expect(mockPool.query).toHaveBeenNthCalledWith(1, 'SELECT 1');
		expect(mockPool.query.mock.calls[1][0]).toContain('CREATE TABLE IF NOT EXISTS statistics');
		expect(pool).toBe(mockPool);
	});

	test('connect is idempotent and does not recreate the pool', async () => {
		const first = await database.connect();
		const second = await database.connect();

		expect(Pool).toHaveBeenCalledTimes(1);
		expect(first).toBe(second);
	});

	test('getPool throws when not connected', () => {
		expect(() => database.getPool()).toThrow('PostgreSQL not connected. Call connect() first.');
	});

	test('getPool returns the active pool when connected', async () => {
		await database.connect();
		const pool = database.getPool();

		expect(pool).toBe(mockPool);
	});

	test('close shuts down the pool and resets state', async () => {
		await database.connect();
		await database.close();

		expect(mockPool.end).toHaveBeenCalled();
		expect(() => database.getPool()).toThrow('PostgreSQL not connected. Call connect() first.');
	});
});
