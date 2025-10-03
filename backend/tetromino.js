/**
 * @fileoverview Tetromino manager for Tetris game.
 * This module handles the creation and management of Tetris pieces.
 */

import Piece from './piece.js';
import gameSettings from './constants/game-settings.js';

/**
 * Initializes the Tetromino manager with predefined templates and an empty piece set.
 */
class Tetromino {

	constructor() {
		/**
		 * @type {Array<{shape: number[][], color: string, position: {x: number, y: number}}>}
		 */
		this.templates = [
			{
				shape: [
					[0, 0, 0],
					[0, 1, 0],
					[1, 1, 1]
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
					[0, 0, 1],
					[1, 1, 1]
				],
				color: 'orange'
			},
			{
				shape: [
					[0, 0, 0],
					[1, 0, 0],
					[1, 1, 1]
				],
				color: 'blue'
			},
			{
				shape: [
					[0, 0, 0],
					[1, 1, 0],
					[0, 1, 1]
				],
				color: 'red'
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
					[1, 1, 1, 1],
					[0, 0, 0, 0],
					[0, 0, 0, 0]
				],
				color: 'cyan'
			}
		].map(template => ({
			...template,
			position: this.getDefaultPosition(template.shape[0].length)
		}));

		/** @type {Set<Piece>} */
		this.pieces = new Set;
		/** @type {Set<Piece>} */
		this._bag = null;
	}

	/**
	 * Calculates the default horizontal spawn position (centered).
	 * @param {number} size - Width of the piece.
	 * @returns {{x: number, y: number}} The default spawn coordinates.
	 */
	getDefaultPosition(size) {
		return {
			x: Math.floor((gameSettings.FRAME_COLS - size) / 2),
			y: 0
		}
	}

	/**
	 * Selects a random template and creates a new Piece from it, avoiding immediate repeats.
	 * @returns {Piece|null} A new Piece instance, or null if creation fails.
	 */
	getRandomPiece() {
		if (!this._bag || this._bag.length === 0) {
			this._bag = this.shuffle([...this.templates]);
		}
		const template = this._bag.pop();

		try {
			return Piece.fromTemplate(template);
		} catch (error) {
			console.error('Error creating piece:', error);
			return null;
		}
	}

	/**
	 * Shuffles an array using Fisher-Yates algorithm.
	 * @param {Array} array
	 * @returns {Array}
	 */
	shuffle(array) {
		const arr = [...array];

		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}

	/**
	 * Generates a number of random pieces and stores them in the set.
	 * @param {number} n - Number of pieces to generate.
	 */
	generate(n) {
		for (let i = 0; i < n; i++) {
			const piece = this.getRandomPiece();

			if (!piece)
				return;
			this.pieces.add(piece);
		}
		console.log(`Tetromino generated ${n} pieces`);
	}

	/**
	 * Clears all generated pieces.
	 */
	reset() {
		this.pieces.clear();
	}

}

export default Tetromino;
