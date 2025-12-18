import { jest, expect } from '@jest/globals';

jest.unstable_mockModule('mongodb', async () => {
    return await import('../__mocks__/_mockMongo.js');
});

const { mockClient, mockDb } = await import('../__mocks__/_mockMongo.js');

const mongoModule = await import('../database.js');
const mongo = mongoModule.default;

const StatisticsModule = await import('../statistics.js');
const Statistics = StatisticsModule.default;

describe('Statistics', () => {

    /**
	 * Reset mocks and mongo state before each test.
	 */
    beforeEach(() => {
        mockClient.connect.mockClear();

        if (mongo.client) mongo.client = null;
        if (mongo.db) mongo.db = null;

        mockDb.collection = jest.fn(() => ({
            findOne: jest.fn(async () => null),
            updateOne: jest.fn(async () => ({ upsertedId: null }))
        }));
    });

	/**
	 * Test loading statistics from the database.
	 */
    test('load sets gameHistory when document exists', async () => {
        const fakeHistory = [{ score: 10 }];
        const collection = {
            findOne: jest.fn(async () => ({ username: 'bob', gameHistory: fakeHistory }))
        };

        mockDb.collection = jest.fn(() => collection);

        const stats = new Statistics('bob');
        await stats.load();

        expect(mockClient.connect).toHaveBeenCalled();
        expect(collection.findOne).toHaveBeenCalledWith({ username: 'bob' });
        expect(stats.gameHistory).toBe(fakeHistory);
    });

	/**
	 * Test loading statistics when no document is found.
	 */
    test('load leaves gameHistory empty when no document found', async () => {
        const collection = { findOne: jest.fn(async () => null) };

        mockDb.collection = jest.fn(() => collection);

        const stats = new Statistics('alice');
        await stats.load();

        expect(stats.gameHistory).toEqual([]);
    });

	/**
	 * Test saving statistics to the database.
	 */
    test('save calls updateOne with upsert', async () => {
        const updateMock = jest.fn(async () => ({}));
        const collection = { updateOne: updateMock };

        mockDb.collection = jest.fn(() => collection);

        const stats = new Statistics('carol');

        stats.gameHistory = [{ winner: 'carol' }];

        await stats.save();

        expect(updateMock).toHaveBeenCalledWith(
            { username: 'carol' },
            { $set: { gameHistory: stats.gameHistory } },
            { upsert: true }
        );
    });

	/**
	 * Test loading document without gameHistory field.
	 */
    test('load handles document without gameHistory (falls back to empty array)', async () => {
        const collection = { findOne: jest.fn(async () => ({ username: 'frank' })) };

        mockDb.collection = jest.fn(() => collection);

        const stats = new Statistics('frank');
        await stats.load();

        expect(collection.findOne).toHaveBeenCalledWith({ username: 'frank' });
        expect(stats.gameHistory).toEqual([]);
    });


	/**
	 * Test saving statistics propagates errors from updateOne.
	 */
    test('save propagates errors from updateOne (rejects)', async () => {
        const error = new Error('update failed');
        const collection = { updateOne: jest.fn(async () => { throw error; }) };

        mockDb.collection = jest.fn(() => collection);

        const stats = new Statistics('grace');
        stats.gameHistory = [{ winner: 'grace' }];

        await expect(stats.save()).rejects.toThrow('update failed');
    });

    /**
	 * Test addGameResult and getStats behavior.
	 */
    test('addGameResult and getStats behave correctly', () => {
        const stats = new Statistics('dan');

        stats.addGameResult({ score: 1 });
        stats.addGameResult({ score: 2 });
        stats.addGameResult({ score: 3 });

        const lastTwo = stats.getStats(2);

        expect(lastTwo).toEqual([{ score: 3 }, { score: 2 }]);
    });

    /**
	 * Test getStats without argument uses default (last 5 reversed).
	 */
    test('getStats without argument uses default (last 5 reversed)', () => {
        const stats = new Statistics('hank');

        [1, 2, 3, 4, 5, 6].forEach(n => stats.addGameResult({ score: n }));

        const lastFive = stats.getStats();

        expect(lastFive).toEqual([
            { score: 6 },
            { score: 5 },
            { score: 4 },
            { score: 3 },
            { score: 2 }
        ]);
    });

});
