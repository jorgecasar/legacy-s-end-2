import { Result } from "../Result.js";
import { Position } from "../entities/Position.js";

/**
 * MovementService
 *
 * Domain service for calculating movement in a 0-100% relative grid.
 */
export const MovementService = {
  /**
   * Calculates a new position based on direction and step size.
   *
   * @param {Position} currentPosition
   * @param {'UP' | 'DOWN' | 'LEFT' | 'RIGHT'} direction
   * @param {number} step - Step size in %
   * @returns {Result<Position>}
   */
  move: (currentPosition, direction, step) => {
    if (!currentPosition) {
      return Result.failure("Current position is required.");
    }

    if (typeof step !== "number" || step <= 0 || Number.isNaN(step)) {
      return Result.failure("Step must be a positive number.");
    }

    let newX = currentPosition.x;
    let newY = currentPosition.y;

    switch (direction) {
      case "UP":
        newY -= step;
        break;
      case "DOWN":
        newY += step;
        break;
      case "LEFT":
        newX -= step;
        break;
      case "RIGHT":
        newX += step;
        break;
      default:
        return Result.failure(`Invalid direction: ${direction}`);
    }

    // Boundary check
    if (newX < 0 || newX > 100 || newY < 0 || newY > 100) {
      return Result.failure("Movement out of bounds.");
    }

    return Position.create(newX, newY);
  },
};
