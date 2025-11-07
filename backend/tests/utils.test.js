import { expect, test } from '@jest/globals';
import utils from '../utils.js';

/**
 * Test randomString utility with numeric and alphabetic types.
 */
test('randomString numeric and alpha types', () => {
	const s1 = utils.randomString(8, 'n');
	const s2 = utils.randomString(8, 'a');

	expect(typeof s1).toBe('string');
	expect(s1.length).toBe(8);

	expect(typeof s2).toBe('string');
	expect(s2.length).toBe(8);
});
