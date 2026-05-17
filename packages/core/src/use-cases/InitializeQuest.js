import { Result } from "../domain/Result.js";
import { StartQuest } from "./StartQuest.js";

/**
 * InitializeQuest
 *
 * High-level Use Case that coordinates loading quest content
 * and initializing the hero state.
 */
export const InitializeQuest = {
  /**
   * @param {object} params
   * @param {object} params.contentAdapter
   * @param {object} params.questData
   * @param {object} params.questMessages
   * @param {object} params.chaptersData
   * @param {object} params.chaptersMessages
   * @param {object} params.entityDecks
   * @param {number} [params.chapterIndex] - The chapter to initialize (default 0)
   * @returns {Promise<Result<object>>}
   */
  execute: async (params) => {
    try {
      const {
        contentAdapter,
        questData,
        questMessages,
        chaptersData,
        chaptersMessages,
        entityDecks,
        chapterIndex = 0,
      } = params;

      const loadResult = await contentAdapter.getQuest({
        questData,
        questMessages,
        chaptersData,
        chaptersMessages,
        entityDecks,
      });

      if (!loadResult.success) {
        return Result.failure(loadResult.error);
      }

      const quest = loadResult.value;
      if (!quest.chapters || quest.chapters.length === 0) {
        return Result.failure("Quest has no chapters.");
      }

      const chapter = quest.chapters[chapterIndex];
      if (!chapter) {
        return Result.failure(`Chapter with index ${chapterIndex} not found.`);
      }

      const startResult = StartQuest.execute({
        initialHp: 100,
        initialMaxHp: 100,
        initialX: chapter.startPos.x,
        initialY: chapter.startPos.y,
        initialInventory: [],
        obstacles: chapter.obstacles,
        chapterId: chapter.id,
      });

      if (!startResult.success) {
        return Result.failure(startResult.error);
      }

      return Result.success({
        quest,
        heroState: startResult.value.heroState,
        obstacles: startResult.value.obstacles,
        entities: chapter.entities,
        exitZone: chapter.exitZone,
      });
    } catch (error) {
      return Result.failure(`Failed to initialize quest: ${error.message}`);
    }
  },
};
