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
      const firstChapter = quest.chapters[0];

      const startResult = StartQuest.execute({
        initialHp: 100,
        initialMaxHp: 100,
        initialX: firstChapter.startPos.x,
        initialY: firstChapter.startPos.y,
        initialInventory: [],
        obstacles: firstChapter.obstacles,
        chapterId: firstChapter.id,
      });

      if (!startResult.success) {
        return Result.failure(startResult.error);
      }

      return Result.success({
        quest,
        heroState: startResult.value.heroState,
        obstacles: startResult.value.obstacles,
        entities: firstChapter.entities,
        exitZone: firstChapter.exitZone,
      });
    } catch (error) {
      return Result.failure(`Failed to initialize quest: ${error.message}`);
    }
  },
};
