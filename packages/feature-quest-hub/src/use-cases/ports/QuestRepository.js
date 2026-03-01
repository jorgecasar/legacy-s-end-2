/**
 * QuestRepository
 * Interface/Port for quest data operations.
 */
export class QuestRepository {
  /**
   * Get a quest by its unique ID.
   * @param {string} _id
   * @returns {Promise<{ success: boolean, value?: import("../../domain/entities/Quest.js").Quest, error?: string }>}
   */
  async getById(_id) {
    throw new Error("Method not implemented.");
  }

  /**
   * Get all quests.
   * @returns {Promise<{ success: boolean, value?: import("../../domain/entities/Quest.js").Quest[], error?: string }>}
   */
  async getAll() {
    throw new Error("Method not implemented.");
  }
}
