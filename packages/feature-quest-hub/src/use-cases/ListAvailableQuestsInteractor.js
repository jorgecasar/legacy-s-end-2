/** @typedef {import("./ports/ListAvailableQuests.js").ListAvailableQuests} ListAvailableQuests */
/** @typedef {import("../domain/entities/Quest.js").Quest} Quest */
/** @typedef {import("../domain/Result.js").Result<Quest[]>} QuestsResult */
/** @typedef {import("./ports/QuestRepository.js").QuestRepository} QuestRepository */

/**
 * ListAvailableQuestsInteractor
 *
 * Use Case implementation for retrieving all available quests.
 *
 * @implements {ListAvailableQuests}
 */
export class ListAvailableQuestsInteractor {
  /** @type {QuestRepository} */
  #questRepository;

  /**
   * @param {QuestRepository} questRepository - The repository port.
   */
  constructor(questRepository) {
    this.#questRepository = questRepository;
  }

  /**
   * Executes the use case logic.
   * @returns {Promise<QuestsResult>}
   */
  async execute() {
    try {
      const result = await this.#questRepository.getAll();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true, value: result.value || [] };
    } catch (error) {
      return {
        success: false,
        error: `Error listing available quests: ${error.message}`,
      };
    }
  }
}
