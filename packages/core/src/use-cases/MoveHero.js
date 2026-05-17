import { Result } from "../domain/Result.js";
import { CollisionService } from "../domain/services/CollisionService.js";
import { MovementService } from "../domain/services/MovementService.js";
import { HeroState } from "../domain/entities/HeroState.js";

/**
 * MoveHero
 *
 * Use case for moving the hero based on a direction and step size.
 */
export const MoveHero = {
  /**
   * @param {object} params
   * @param {HeroState} params.heroState
   * @param {'UP' | 'DOWN' | 'LEFT' | 'RIGHT'} params.direction
   * @param {number} params.step
   * @param {Array<{x: number, y: number, width: number, height: number}>} params.obstacles
   * @returns {Result<HeroState>}
   */
  execute: (params) => {
    try {
      const { heroState, direction, step, obstacles = [] } = params || {};

      const movementResult = MovementService.move(heroState.position, direction, step);
      if (!movementResult.success) {
        return Result.failure(movementResult.error);
      }

      const newPosition = movementResult.value;

      // Hero size is 5% width, 5% height. Use half as buffer.
      if (
        CollisionService.checkCollision(newPosition, obstacles, {
          widthBuffer: 2.5,
          heightBuffer: 2.5,
        })
      ) {
        return Result.failure("Move blocked by collision");
      }

      return HeroState.create(
        heroState.hp,
        heroState.maxHp,
        newPosition,
        heroState.inventory,
        heroState.chapterId,
      );
    } catch (error) {
      return Result.failure(`Failed to move hero: ${error.message}`);
    }
  },
};
