import { Result } from "@legacys-end/core/domain/Result.js";

/** @typedef {import("./ports/ListAvailableQuests.js").ListAvailableQuests} ListAvailableQuests */
/** @typedef {import("../domain/entities/Quest.js").Quest} Quest */
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
   * @returns {Promise<Result<Quest[]>>}
   */
  async execute() {
    try {
      const result = await this.#questRepository.getAll();

      if (!result.success) {
        return Result.failure(result.error || "Unknown error");
      }

      return Result.success(result.value || []);
    } catch (error) {
      return Result.failure(`Error listing available quests: ${error.message}`);
    }
  }
}
