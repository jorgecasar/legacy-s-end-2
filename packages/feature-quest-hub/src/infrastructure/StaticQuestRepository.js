import { Quest } from "../domain/entities/Quest.js";
import { QuestRepository } from "../use-cases/ports/QuestRepository.js";

/** @typedef {import("../domain/entities/QuestId.js").QuestId} QuestId */
/** @typedef {import("../domain/entities/QuestStatus.js").QuestStatusValues} QuestStatusValues */
/** @typedef {import("../domain/Result.js").Result<Quest>} QuestResult */
/** @typedef {import("../domain/Result.js").Result<Quest[]>} QuestsResult */

/**
 * @typedef {Object} QuestRawData
 * @property {string} id
 * @property {string} title
 * @property {QuestStatusValues} [status]
 * @property {string} [description]
 * @property {string} [image]
 * @property {number} [level]
 */

/**
 * StaticQuestRepository
 *
 * In-memory implementation of the QuestRepository port.
 * Returns Quest entities from a provided data array.
 *
 * @implements {QuestRepository}
 */
export class StaticQuestRepository extends QuestRepository {
  /** @type {QuestRawData[]} */
  #quests;

  /**
   * @param {QuestRawData[]} [initialData=[]] - Initial raw data to be mapped to entities.
   */
  constructor(initialData = []) {
    super();
    this.#quests = initialData;
  }

  /**
   * Retrieves a quest by its ID.
   * @param {QuestId} id - Quest ID.
   * @returns {Promise<QuestResult>}
   */
  async getById(id) {
    const questData = this.#quests.find((q) => q.id === id.value);
    if (!questData) {
      return { success: false, error: `Quest with ID "${id}" not found.` };
    }

    return Quest.create(questData);
  }

  /**
   * Get all quests from the provided list.
   * @returns {Promise<QuestsResult>}
   */
  async getAll() {
    const quests = [];
    for (const data of this.#quests) {
      const result = Quest.create(data);
      if (!result.success) {
        return { success: false, error: `Failed to map quest: ${result.error}` };
      }
      if (result.value) {
        quests.push(result.value);
      }
    }
    return { success: true, value: quests };
  }
}
