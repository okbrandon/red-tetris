import { afterEach, beforeEach, jest } from '@jest/globals';
import Tetromino from '../tetromino.js';
import Piece from '../piece.js';
import gameSettings from '../constants/game-settings.js';

describe('Tetromino', () => {

	/**
	 * Mocks console.error to suppress expected error logs during tests.
	 */
	beforeEach(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	/**
	 * Restores console.error after each test.
	 */
	afterEach(() => {
		console.error.mockRestore();
	});

	/**
	 * Confirms that the constructor initializes templates and pieces set.
	 */
	test('constructor initializes templates and pieces', () => {
		const tetro = new Tetromino();

		expect(Array.isArray(tetro.templates)).toBe(true);
		expect(tetro.templates.length).toBeGreaterThan(0);
		expect(tetro.pieces).toBeInstanceOf(Set);
		tetro.templates.forEach(template => {
			expect(typeof template.position).toBe('object');
			expect(typeof template.color).toBe('string');
			expect(Array.isArray(template.shape)).toBe(true);
		});
	});

	/**
	 * Confirms that getDefaultPosition centers piece horizontally.
	 */
	test('getDefaultPosition centers piece horizontally', () => {
		const tetro = new Tetromino();
		const size = 4;
		const pos = tetro.getDefaultPosition(size);

		expect(pos.x).toBe(Math.floor((gameSettings.FRAME_COLS - size) / 2));
		expect(pos.y).toBe(0);
	});

	/**
	 * Confirms that getRandomPiece returns a Piece instance.
	 */
	test('getRandomPiece returns a Piece', () => {
		const tetro = new Tetromino();
		const piece = tetro.getRandomPiece();

		expect(piece).toBeInstanceOf(Piece);
	});

	/**
	 * Confirms that getRandomPiece returns null if Piece.fromTemplate throws.
	 */
	test('getRandomPiece returns null if Piece.fromTemplate throws', () => {
		const tetro = new Tetromino();
		tetro.templates.splice(0, tetro.templates.length);

		const piece = tetro.getRandomPiece();
		expect(piece).toBeNull();
	});

	/**
	 * Confirms that generate adds n pieces to the set.
	 */
	test('generate adds n pieces to the set', () => {
		const tetro = new Tetromino();

		tetro.generate(5);

		expect(tetro.pieces.size).toBe(5);
		tetro.pieces.forEach(piece => {
			expect(piece).toBeInstanceOf(Piece);
		});
	});

	/**
	 * Confirms that generate returns early if getRandomPiece returns null.
	 */
	test('generate returns early if getRandomPiece returns null', () => {
		const tetro = new Tetromino();

		for (let i = 0; i < tetro.templates.length - 1; i++) {
			tetro.templates[i].shape = null;
		}
		tetro.generate(2);

		expect(tetro.pieces.size).toBeLessThanOrEqual(1);
	});

	/**
	 * Confirms that reset clears all pieces.
	 */
	test('reset clears all pieces', () => {
		const tetro = new Tetromino();

		tetro.generate(3);
		expect(tetro.pieces.size).toBe(3);

		tetro.reset();
		expect(tetro.pieces.size).toBe(0);
	});

});
