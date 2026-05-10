import { Result } from "../domain/Result.js";
import { HeroState } from "../domain/entities/HeroState.js";
import { Position } from "../domain/entities/Position.js";

/**
 * StartQuest
 *
 * Use case for starting a mission and initializing the hero state.
 */
export const StartQuest = {
  /**
   * @param {object} params
   * @param {number} params.initialHp
   * @param {number} params.initialMaxHp
   * @param {number} params.initialX
   * @param {number} params.initialY
   * @param {string[]} params.initialInventory
   * @param {any[]} params.obstacles
   * @param {string} params.chapterId
   * @returns {Result<{ heroState: HeroState, obstacles: any[] }>}
   */
  execute: (params) => {
    try {
      const {
        initialHp,
        initialMaxHp,
        initialX,
        initialY,
        initialInventory,
        obstacles,
        chapterId,
      } = params || {};
      const positionResult = Position.create(initialX, initialY);
      if (!positionResult.success) {
        return Result.failure(positionResult.error);
      }

      const heroResult = HeroState.create(
        initialHp,
        initialMaxHp,
        positionResult.value,
        initialInventory,
        chapterId,
      );

      if (!heroResult.success) {
        return Result.failure(heroResult.error);
      }

      return Result.success({ heroState: heroResult.value, obstacles });
    } catch (error) {
      return Result.failure(`Failed to start quest: ${error.message}`);
    }
  },
};
