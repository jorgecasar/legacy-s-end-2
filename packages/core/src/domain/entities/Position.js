import { Result } from "../Result.js";

/**
 * Position
 *
 * Value Object representing a 2D coordinate in the game.
 */
export default class Position {
  #x;
  #y;

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  /**
   * Factory method to create a Position.
   * @param {number} x
   * @param {number} y
   * @returns {Result<Position>}
   */
  static create(x, y) {
    if (typeof x !== "number" || typeof y !== "number") {
      return Result.failure("Coordinates must be numbers.");
    }
    return Result.success(new Position(x, y));
  }

  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }

  /**
   * @param {Position} other
   * @returns {boolean}
   */
  equals(other) {
    return this.#x === other.x && this.#y === other.y;
  }
}
