import { afterEach, beforeEach, jest } from '@jest/globals';
import Tetromino from '../tetromino.js';
import Piece from '../piece.js';
import gameSettings from '../constants/game-settings.js';

describe('Tetromino', () => {

	beforeEach(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		console.error.mockRestore();
	});

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

	test('getDefaultPosition centers piece horizontally', () => {
		const tetro = new Tetromino();
		const size = 4;
		const pos = tetro.getDefaultPosition(size);

		expect(pos.x).toBe(Math.floor((gameSettings.FRAME_COLS - size) / 2));
		expect(pos.y).toBe(0);
	});

	test('getRandomPiece returns a Piece', () => {
		const tetro = new Tetromino();
		const piece = tetro.getRandomPiece();

		expect(piece).toBeInstanceOf(Piece);
	});

	test('getRandomPiece returns null if Piece.fromTemplate throws', () => {
		const tetro = new Tetromino();
		tetro.templates.splice(0, tetro.templates.length);

		const piece = tetro.getRandomPiece();
		expect(piece).toBeNull();
	});

	test('generate adds n pieces to the set', () => {
		const tetro = new Tetromino();

		tetro.generate(5);

		expect(tetro.pieces.size).toBe(5);
		tetro.pieces.forEach(piece => {
			expect(piece).toBeInstanceOf(Piece);
		});
	});

	test('generate returns early if getRandomPiece returns null', () => {
		const tetro = new Tetromino();

		for (let i = 0; i < tetro.templates.length - 1; i++) {
			tetro.templates[i].shape = null;
		}
		tetro.generate(2);

		expect(tetro.pieces.size).toBeLessThanOrEqual(1);
	});

	test('reset clears all pieces', () => {
		const tetro = new Tetromino();

		tetro.generate(3);
		expect(tetro.pieces.size).toBe(3);

		tetro.reset();
		expect(tetro.pieces.size).toBe(0);
	});

});
