export function rotateShape(shape) {
	const size = shape.length;
	const result = Array.from({ length: size }, () => Array(size).fill(0));

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			result[x][size - 1 - y] = shape[y][x];
		}
	}

	return result;
}

export function cloneShape(shape) {
	return shape.map(row => row.slice());
}

export function shapeKey(shape) {
	return shape.map(row => row.join('')).join('|');
}

export function getFilledCells(shape) {
	const cells = [];
	for (let y = 0; y < shape.length; y++) {
		for (let x = 0; x < shape[y].length; x++) {
			if (shape[y][x])
				cells.push({ x, y });
		}
	}
	return cells;
}

export function getShapeBounds(cells) {
	const xs = cells.map(cell => cell.x);
	const ys = cells.map(cell => cell.y);
	return {
		minX: Math.min(...xs, 0),
		maxX: Math.max(...xs, 0),
		minY: Math.min(...ys, 0),
		maxY: Math.max(...ys, 0)
	};
}
