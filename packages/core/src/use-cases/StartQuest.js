import { Result } from "../domain/Result.js";
import HeroState from "../domain/entities/HeroState.js";
import Position from "../domain/entities/Position.js";

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
   * @param {number[][]} params.levelMap
   * @returns {Result<{ heroState: HeroState, levelMap: number[][] }>}
   */
  execute: (params) => {
    try {
      const { initialHp, initialMaxHp, initialX, initialY, initialInventory, levelMap } =
        params || {};
      const positionResult = Position.create(initialX, initialY);
      if (!positionResult.success) {
        return Result.failure(positionResult.error);
      }

      const heroResult = HeroState.create(
        initialHp,
        initialMaxHp,
        positionResult.value,
        initialInventory,
      );

      if (!heroResult.success) {
        return Result.failure(heroResult.error);
      }

      return Result.success({ heroState: heroResult.value, levelMap });
    } catch (error) {
      return Result.failure(`Failed to start quest: ${error.message}`);
    }
  },
};
