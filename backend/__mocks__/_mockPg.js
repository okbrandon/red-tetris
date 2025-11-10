import { jest } from '@jest/globals';

export const mockPool = {
	query: jest.fn(),
	end: jest.fn(),
};

export const Pool = jest.fn(() => mockPool);

export default { Pool, mockPool };
