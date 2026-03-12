import { Quest } from "../domain/entities/Quest.js";
import { Result } from "@legacys-end/core/domain/Result.js";
import { QuestRepository } from "../use-cases/ports/QuestRepository.js";

/** @typedef {import("../domain/entities/QuestId.js").QuestId} QuestId */

/**
 * StaticQuestRepository
 *
 * In-memory repository for quests.
 * @implements {QuestRepository}
 */
export class StaticQuestRepository extends QuestRepository {
  /** @type {Quest[]} */
  #quests;

  /**
   * @param {any[]} questsData
   */
  constructor(questsData = []) {
    super();
    const results = questsData.map((data) => Quest.create(data));
    const failures = results.filter((res) => !res.success);

    if (failures.length > 0) {
      throw new Error(`Failed to map quest: ${failures[0].error}`);
    }

    this.#quests = results.filter((res) => res.success).map((res) => res.value);
  }

  /**
   * @param {QuestId} questId
   * @returns {Promise<Result<Quest>>}
   */
  async getById(questId) {
    const quest = this.#quests.find((q) => q.id.equals(questId));
    if (!quest) {
      return Result.failure(`Quest with ID ${questId.value} not found.`);
    }
    return Result.success(quest);
  }

  /**
   * @returns {Promise<Result<Quest[]>>}
   */
  async getAll() {
    return Result.success([...this.#quests]);
  }

  /**
   * Mocks a database lookup from raw data.
   * @param {any[]} data
   * @returns {Promise<Result<Quest[]>>}
   */
  static async fromRawData(data) {
    const results = data.map((d) => Quest.create(d));
    const failures = results.filter((r) => !r.success);

    if (failures.length > 0) {
      return Result.failure(`Failed to map quest: ${failures[0].error}`);
    }

    return Result.success(results.map((r) => r.value));
  }
}
