const Piece = require('./piece.js');
const gameSettings = require('./constants/game-settings.js');

class Tetromino {

	constructor() {
		this.templates = [
			{
				shape: [
					[0, 0, 0],
					[1, 1, 1],
					[0, 1, 0]
				],
				color: 'purple'
			},
			{
				shape: [
					[0, 1, 1, 0],
					[0, 1, 1, 0],
					[0, 0, 0, 0]
				],
				color: 'yellow'
			},
			{
				shape: [
					[0, 0, 0],
					[1, 1, 1],
					[1, 0, 0]
				],
				color: 'orange'
			},
			{
				shape: [
					[0, 0, 0],
					[1, 1, 1],
					[0, 0, 1]
				],
				color: 'orange'
			},
			{
				shape: [
					[0, 0, 0],
					[1, 1, 0],
					[0, 1, 1]
				],
				color: 'green'
			},
			{
				shape: [
					[0, 0, 0],
					[0, 1, 1],
					[1, 1, 0]
				],
				color: 'green'
			},
			{
				shape: [
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[1, 1, 1, 1],
					[0, 0, 0, 0]
				],
				color: 'cyan'
			}
		].map(template => ({
			...template,
			position: this.getDefaultPosition(template.shape[0].length)
		}));
		this.pieces = new Set;
	}

	getDefaultPosition(size) {
		return {
			x: Math.floor((gameSettings.FRAME_COLS - size) / 2),
			y: 0
		}
	}

	getRandomPiece() {
		const random = Math.floor(Math.random() * this.templates.length);
		const template = this.templates[random];

		try {
			return Piece.fromTemplate(template);
		} catch (error) {
			console.error('Error creating piece:', error);
			return null;
		}
	}

	generate(n) {
		for (let i = 0; i < n; i++) {
			try {
				const piece = this.getRandomPiece();

				if (!piece)
					return;
				this.pieces.add(piece);
			} catch (error) {
				console.error('Error generating piece:', error);
			}
		}
		console.log(`Tetromino generated ${n} pieces`);
	}

	reset() {
		this.pieces.clear();
	}

}

module.exports = Tetromino;
