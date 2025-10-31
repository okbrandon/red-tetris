import { jest } from '@jest/globals';

export const mockDb = { collection: jest.fn(() => ({})), isMockDb: true };

export const mockClient = {
	connect: jest.fn(async () => true),
	db: jest.fn(() => mockDb),
	close: jest.fn(async () => true),
};

export const MongoClient = jest.fn(() => mockClient);

export default { MongoClient, mockClient, mockDb };
