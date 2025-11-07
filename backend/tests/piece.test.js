import Piece from '../piece.js';

describe('Piece', () => {

	/**
	 * Confirms that the constructor sets properties correctly.
	 */
	test('constructor sets properties', () => {
		const shape = [[1, 0], [0, 1]];
		const color = 'red';
		const position = { x: 2, y: 3 };
		const piece = new Piece(shape, color, position);

		expect(piece.shape).toEqual(shape);
		expect(piece.color).toBe(color);
		expect(piece.position).toEqual(position);
	});

	/**
	 * Confirms that the constructor sets default position if not provided.
	 */
	test('constructor sets default position if not provided', () => {
		const shape = [[1]];
		const color = 'blue';
		const piece = new Piece(shape, color);

		expect(piece.position).toEqual({ x: 0, y: 0 });
	});

	/**
	 * Confirms that assertValidShape throws for invalid shapes.
	 */
	test('assertValidShape throws for invalid shape', () => {
		expect(() => new Piece(null, 'red')).toThrow('Invalid shape: must be a non-empty array');
		expect(() => new Piece('not-an-array', 'red')).toThrow('Invalid shape: must be a non-empty array');
	});

	/**
	 * Confirms that assertValidShape returns valid shape.
	 */
	test('assertValidShape returns valid shape', () => {
		const shape = [[1]];
		const piece = new Piece(shape, 'red');

		expect(piece.shape).toBe(shape);
	});

	/**
	 * Confirms that rotate works correctly.
	 */
	test('rotate clockwise', () => {
		const shape = [
			[1, 2],
			[3, 4]
		];
		const piece = new Piece(shape, 'red');
		const rotated = piece.rotate();

		expect(rotated).toEqual([
			[3, 1],
			[4, 2]
		]);
	});

	/**
	 * Confirms that rotate works correctly counter-clockwise.
	 */
	test('rotate counter-clockwise', () => {
		const shape = [
			[1, 2],
			[3, 4]
		];
		const piece = new Piece(shape, 'red');
		const rotated = piece.rotate(false);

		expect(rotated).toEqual([
			[2, 4],
			[1, 3]
		]);
	});

	/**
	 * Confirms that getLeadingEmptyRows works correctly.
	 */
	test('getLeadingEmptyRows returns correct count', () => {
		const shape = [
			[0, 0],
			[0, 0],
			[1, 0],
			[0, 1]
		];
		const piece = new Piece(shape, 'red');

		expect(piece.getLeadingEmptyRows()).toBe(2);
	});

	/**
	 * Confirms that getLeadingEmptyRows returns 0 if no empty rows.
	 */
	test('getLeadingEmptyRows returns 0 if no empty rows', () => {
		const shape = [
			[1, 0],
			[0, 1]
		];
		const piece = new Piece(shape, 'red');

		expect(piece.getLeadingEmptyRows()).toBe(0);
	});

	/**
	 * Confirms that clone returns a deep copy.
	 */
	test('clone returns a deep copy', () => {
		const shape = [[1, 0], [0, 1]];
		const color = 'red';
		const position = { x: 2, y: 3 };
		const piece = new Piece(shape, color, position);
		const clone = piece.clone();

		expect(clone).not.toBe(piece);
		expect(clone.shape).not.toBe(piece.shape);
		expect(clone.shape).toEqual(piece.shape);
		expect(clone.color).toBe(piece.color);
		expect(clone.position).not.toBe(piece.position);
		expect(clone.position).toEqual(piece.position);
	});

	/**
	 * Confirms that static fromTemplate creates a Piece.
	 */
	test('static fromTemplate creates a Piece', () => {
		const template = {
			shape: [[1, 0], [0, 1]],
			color: 'green',
			position: { x: 5, y: 6 }
		};
		const piece = Piece.fromTemplate(template);

		expect(piece).toBeInstanceOf(Piece);
		expect(piece.shape).toEqual(template.shape);
		expect(piece.color).toBe(template.color);
		expect(piece.position).toEqual(template.position);
	});

});
