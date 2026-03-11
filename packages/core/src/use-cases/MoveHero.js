import { Result } from "../domain/Result.js";
import { checkCollision } from "../domain/services/CollisionService.js";
import HeroState from "../domain/entities/HeroState.js";
import Position from "../domain/entities/Position.js";

/**
 * MoveHero
 *
 * Use case for moving the hero to a new position.
 */
export const MoveHero = {
  /**
   * @param {object} params
   * @param {HeroState} params.heroState
   * @param {number} params.newX
   * @param {number} params.newY
   * @param {number[][]} params.levelMap
   * @returns {Result<HeroState>}
   */
  execute: (params) => {
    try {
      const { heroState, newX, newY, levelMap } = params || {};
      const positionResult = Position.create(newX, newY);
      if (!positionResult.success) {
        return Result.failure(positionResult.error);
      }

      const newPosition = positionResult.value;

      if (checkCollision(newPosition, levelMap)) {
        return Result.failure("Move blocked by collision");
      }

      const heroResult = HeroState.create(
        heroState.hp,
        heroState.maxHp,
        newPosition,
        heroState.inventory,
      );

      return heroResult;
    } catch (error) {
      return Result.failure(`Failed to move hero: ${error.message}`);
    }
  },
};
