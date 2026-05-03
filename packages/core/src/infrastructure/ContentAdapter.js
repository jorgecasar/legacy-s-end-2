import { Result } from "../domain/Result.js";

/**
 * ContentAdapter
 *
 * Infrastructure service that merges static JSON data with translatable messages.
 */
export class ContentAdapter {
  /**
   * Loads a full quest with its chapters and messages.
   *
   * @param {object} params
   * @param {object} params.questData - Raw JSON quest data
   * @param {object} params.questMessages - Translatable quest strings
   * @param {object} params.chaptersData - Raw JSON chapters data
   * @param {object} params.chaptersMessages - Translatable chapter strings
   * @param {object} params.entityDecks - Translatable NPC dialogues
   * @returns {Promise<Result<object>>}
   */
  async getQuest(params) {
    try {
      const { questData, questMessages, chaptersData, chaptersMessages, entityDecks } = params;

      const mergedQuest = {
        ...questData,
        ...questMessages[questData.id],
        chapters: chaptersData.chapters.map((chapter) => {
          return {
            ...chapter,
            name: chaptersMessages[chapter.id]?.name,
            entities: chapter.entities.map((entity) => {
              return {
                ...entity,
                decks: entityDecks[entity.id],
              };
            }),
          };
        }),
      };

      return Result.success(mergedQuest);
    } catch (error) {
      return Result.failure(`Failed to merge content: ${error.message}`);
    }
  }
}
