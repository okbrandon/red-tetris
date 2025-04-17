class Piece {

	constructor(shape, color, position) {
		this.shape = this.assertValidShape(shape);
		this.color = color;
		this.position = position || { x: 0, y: 0 };
	}

	assertValidShape(shape) {
		if (!shape || !Array.isArray(shape))
			throw new Error('Invalid shape: must be a non-empty array');
		return shape;
	}

	rotate(clockwise = true) {
		console.log(this.shape);

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

	clone() {
		const clonedShape = this.shape.map(row => [...row]);
		return new Piece(clonedShape, this.color, { ...this.position });
	}

	static fromTemplate(template) {
		return new Piece(template.shape, template.color, template.position);
	}

}

module.exports = Piece;
