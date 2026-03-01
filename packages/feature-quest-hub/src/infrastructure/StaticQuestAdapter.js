import { Quest } from "../domain/entities/Quest.js";
import { QuestStatus } from "../domain/entities/QuestStatus.js";
import { QuestRepository } from "../use-cases/ports/QuestRepository.js";

/**
 * StaticQuestAdapter
 * In-memory adapter for the QuestRepository port.
 * Uses hardcoded JSON data to return Quest entities.
 * @implements {QuestRepository}
 */
export class StaticQuestAdapter extends QuestRepository {
  #quests;

  constructor(initialData) {
    super();
    this.#quests = initialData || [
      {
        id: "q1",
        title: "The Alarion's Awakening",
        status: QuestStatus.AVAILABLE,
        description: "Learn the basics of variables and constants.",
      },
      {
        id: "q2",
        title: "The Syntax of the Ancients",
        status: QuestStatus.LOCKED,
        description: "Explore control flow and logical operators.",
      },
      {
        id: "q3",
        title: "Mastering the Void",
        status: QuestStatus.COMPLETED,
        description: "Deep dive into functions and asynchronous programming.",
      },
    ];
  }

  async getById(id) {
    const questData = this.#quests.find((q) => q.id === id);

    if (!questData) {
      return { success: false, error: `Quest with ID "${id}" not found.` };
    }

    const result = Quest.create(questData);
    if (!result.success) {
      return { success: false, error: `Failed to map quest data: ${result.error}` };
    }
    return { success: true, value: result.value };
  }

  /**
   * Get all quests from the repository.
   * @returns {Promise<{ success: boolean, value?: import("../domain/entities/Quest.js").Quest[], error?: string }>}
   */
  async getAll() {
    const quests = [];
    for (const data of this.#quests) {
      const result = Quest.create(data);
      if (!result.success) {
        return { success: false, error: `Failed to map quest: ${result.error}` };
      }
      quests.push(result.value);
    }
    return { success: true, value: quests };
  }
}
