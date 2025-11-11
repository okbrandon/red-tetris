import { jest, expect } from '@jest/globals';

const mockPool = {
    query: jest.fn()
};

const connectMock = jest.fn(async () => mockPool);

jest.unstable_mockModule('../database.js', async () => ({
    default: {
        connect: connectMock
    }
}));

const StatisticsModule = await import('../statistics.js');
const Statistics = StatisticsModule.default;

describe('Statistics', () => {

    beforeEach(() => {
        connectMock.mockClear();
        mockPool.query.mockReset();
        mockPool.query.mockResolvedValue({ rows: [] });
    });

    test('load sets gameHistory when row exists', async () => {
        const fakeHistory = [{ score: 10 }];
        mockPool.query.mockResolvedValueOnce({
            rows: [{ game_history: fakeHistory }]
        });

        const stats = new Statistics('bob');
        await stats.load();

        expect(connectMock).toHaveBeenCalled();
        expect(mockPool.query).toHaveBeenCalledWith(
            'SELECT game_history FROM statistics WHERE username = $1',
            ['bob']
        );
        expect(stats.gameHistory).toEqual(fakeHistory);
    });

    test('load leaves gameHistory empty when no record found', async () => {
        mockPool.query.mockResolvedValueOnce({ rows: [] });

        const stats = new Statistics('alice');
        await stats.load();

        expect(stats.gameHistory).toEqual([]);
    });

    test('save performs upsert with JSON payload', async () => {
        const stats = new Statistics('carol');
        stats.gameHistory = [{ winner: 'carol' }];

        await stats.save();

        expect(connectMock).toHaveBeenCalled();
        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO statistics'),
            ['carol', JSON.stringify(stats.gameHistory)]
        );
    });

    test('load handles row without game_history field', async () => {
        mockPool.query.mockResolvedValueOnce({ rows: [{ username: 'frank' }] });

        const stats = new Statistics('frank');
        await stats.load();

        expect(mockPool.query).toHaveBeenCalledWith(
            'SELECT game_history FROM statistics WHERE username = $1',
            ['frank']
        );
        expect(stats.gameHistory).toEqual([]);
    });

    test('save propagates query errors', async () => {
        const error = new Error('update failed');
        mockPool.query.mockRejectedValueOnce(error);

        const stats = new Statistics('grace');
        stats.gameHistory = [{ winner: 'grace' }];

        await expect(stats.save()).rejects.toThrow('update failed');
    });

    test('addGameResult and getStats behave correctly', () => {
        const stats = new Statistics('dan');

        stats.addGameResult({ score: 1 });
        stats.addGameResult({ score: 2 });
        stats.addGameResult({ score: 3 });

        const lastTwo = stats.getStats(2);

        expect(lastTwo).toEqual([{ score: 3 }, { score: 2 }]);
    });

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
