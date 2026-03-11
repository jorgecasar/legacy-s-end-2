/** @typedef {import("../../domain/entities/Quest.js").Quest} Quest */
/** @typedef {import("../../domain/Result.js").Result<Quest[]>} QuestsResult */

/**
 * ListAvailableQuests
 *
 * Input Port for the "List Available Quests" use case.
 *
 * @interface
 */
export class ListAvailableQuests {
  /**
   * Retrieves all quests currently available for the user.
   * @returns {Promise<QuestsResult>}
   * @abstract
   */
  async execute() {
    throw new Error("Method not implemented.");
  }
}
