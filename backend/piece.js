/**
 * @fileoverview Piece class for Tetris game.
 * This class represents a Tetris piece with its shape, color, and position.
 */

class Piece {

	/**
	 * Creates a new Tetris piece.
	 * @param {number[][]} shape - 2D array representing the piece layout.
	 * @param {string} color - Color name of the piece.
	 * @param {{x: number, y: number}} [position={x: 0, y: 0}] - Starting position of the piece.
	 */
	constructor(shape, color, position) {
		this.shape = this.assertValidShape(shape);
		this.color = color;
		this.position = position || { x: 0, y: 0 };
	}

	/**
	 * Validates that the provided shape is a non-empty array.
	 * @param {any} shape - The shape to validate.
	 * @returns {number[][]} The validated shape.
	 * @throws {Error} If the shape is invalid.
	 */
	assertValidShape(shape) {
		if (!shape || !Array.isArray(shape))
			throw new Error('Invalid shape: must be a non-empty array');
		return shape;
	}

	/**
	 * Rotates the piece 90 degrees.
	 * @param {boolean} [clockwise=true] - If true, rotate clockwise; otherwise, counter-clockwise.
	 * @returns {number[][]} The rotated shape.
	 */
	rotate(clockwise = true) {
		const size = this.shape.length;
		const result = Array.from({ length: size }, () => Array(size).fill(0));

		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				if (clockwise) {
					result[x][size - 1 - y] = this.shape[y][x];
				} else {
					result[size - 1 - x][y] = this.shape[y][x];
				}
			}
		}
		return result;
	}

	/**
	 * Gets the number of fully empty rows at the top of the shape.
	 * @returns {number} Number of leading empty rows.
	 */
	getLeadingEmptyRows() {
		let count = 0;
		for (let row of this.shape) {
			if (row.every(cell => cell === 0)) {
				count++;
			} else {
				break;
			}
		}
		return count;
	}

	/**
	 * Creates a deep clone of this piece.
	 * @returns {Piece} A new Piece instance with the same data.
	 */
	clone() {
		const clonedShape = this.shape.map(row => [...row]);
		return new Piece(clonedShape, this.color, { ...this.position });
	}

	/**
	 * Creates a Piece instance from a template.
	 * @param {{shape: number[][], color: string, position: {x: number, y: number}}} template - The piece template.
	 * @returns {Piece} A new Piece created from the template.
	 */
	static fromTemplate(template) {
		return new Piece(template.shape, template.color, template.position);
	}

}

module.exports = Piece;
