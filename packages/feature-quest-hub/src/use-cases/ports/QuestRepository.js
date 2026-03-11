/** @typedef {import("../../domain/entities/Quest.js").Quest} Quest */
/** @typedef {import("../../domain/entities/QuestId.js").QuestId} QuestId */
/** @typedef {import("../../domain/Result.js").Result<Quest>} QuestResult */
/** @typedef {import("../../domain/Result.js").Result<Quest[]>} QuestsResult */

/**
 * QuestRepository
 *
 * Interface (Port) for quest data operations.
 * Must be implemented by infrastructure adapters.
 *
 * @interface
 */
export class QuestRepository {
  /**
   * Get a quest by its unique ID.
   * @param {QuestId} _id - The unique quest identifier.
   * @returns {Promise<QuestResult>}
   * @abstract
   */
  async getById(_id) {
    throw new Error("Method not implemented.");
  }

  /**
   * Get all quests from the underlying storage.
   * @returns {Promise<QuestsResult>}
   * @abstract
   */
  async getAll() {
    throw new Error("Method not implemented.");
  }
}
