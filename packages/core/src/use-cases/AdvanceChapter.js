import { Result } from "../domain/Result.js";
import { HeroState } from "../domain/entities/HeroState.js";
import { Position } from "../domain/entities/Position.js";

/**
 * AdvanceChapter
 *
 * Use Case to handle transitioning from one chapter to another.
 */
export const AdvanceChapter = {
  /**
   * @param {object} params
   * @param {object} params.quest - The full quest object
   * @param {number} params.nextChapterIndex - The index of the chapter to load
   * @param {HeroState} params.heroState - Current hero state
   * @returns {Result<object>}
   */
  execute: ({ quest, nextChapterIndex, heroState }) => {
    try {
      if (!quest.chapters || !quest.chapters[nextChapterIndex]) {
        return Result.failure("Next chapter not found.");
      }

      const nextChapter = quest.chapters[nextChapterIndex];

      // Update hero position to the new chapter's start position
      const nextPosResult = Position.create(nextChapter.startPos.x, nextChapter.startPos.y);

      if (!nextPosResult.success) {
        return Result.failure(nextPosResult.error);
      }

      const nextHeroStateResult = HeroState.create(
        heroState.hp,
        heroState.maxHp,
        nextPosResult.value,
        heroState.inventory,
        nextChapter.id,
      );

      if (!nextHeroStateResult.success) {
        return Result.failure(nextHeroStateResult.error);
      }

      return Result.success({
        heroState: nextHeroStateResult.value,
        obstacles: nextChapter.obstacles,
        entities: nextChapter.entities,
        exitZone: nextChapter.exitZone,
      });
    } catch (error) {
      return Result.failure(`Failed to advance chapter: ${error.message}`);
    }
  },
};
