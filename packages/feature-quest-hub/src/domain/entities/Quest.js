import { QuestStatus } from "./QuestStatus.js";

/**
 * Quest
 * Aggregate Root for the Quest Hub domain.
 * Enforces business rules and state invariants.
 */
export class Quest {
  /** @type {string} */
  #id;
  /** @type {string} */
  #title;
  /** @type {string} */
  #status;
  /** @type {string} */
  #description;

  constructor({ id, title, status = QuestStatus.LOCKED, description = "" }) {
    this.#id = id;
    this.#title = title;
    this.#status = status;
    this.#description = description;
  }

  /**
   * Static factory method to create a Quest entity.
   * Enforces business rules and returns a Result object.
   * @param {object} params
   * @returns {{ success: boolean, value?: Quest, error?: string }}
   */
  static create({ id, title, status = QuestStatus.LOCKED, description = "" }) {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Quest must have a valid string ID." };
    }
    if (!title || typeof title !== "string") {
      return { success: false, error: "Quest must have a valid string title." };
    }
    if (!Object.values(QuestStatus).includes(status)) {
      return { success: false, error: `Invalid QuestStatus: ${status}` };
    }

    try {
      const quest = new Quest({ id, title, status, description });
      return { success: true, value: quest };
    } catch (error) {
      return { success: false, error: `Unexpected error creating Quest: ${error.message}` };
    }
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#title;
  }

  get status() {
    return this.#status;
  }

  get description() {
    return this.#description;
  }

  /**
   * Unlock the quest, making it available.
   * Only a locked quest can be unlocked.
   */
  unlock() {
    if (this.#status !== QuestStatus.LOCKED) {
      return { success: false, error: `Cannot unlock a quest that is ${this.#status}.` };
    }
    this.#status = QuestStatus.AVAILABLE;
    return { success: true, value: this.#status };
  }

  /**
   * Complete the quest.
   * Only an available quest can be completed.
   */
  complete() {
    if (this.#status !== QuestStatus.AVAILABLE) {
      return {
        success: false,
        error: `Only Available quests can be completed. Current status: ${this.#status}.`,
      };
    }
    this.#status = QuestStatus.COMPLETED;
    return { success: true, value: this.#status };
  }

  /**
   * Restart the quest, making it available again.
   * Only a completed quest can be restarted.
   */
  restart() {
    if (this.#status !== QuestStatus.COMPLETED) {
      return {
        success: false,
        error: `Only Completed quests can be restarted. Current status: ${this.#status}.`,
      };
    }
    this.#status = QuestStatus.AVAILABLE;
    return { success: true, value: this.#status };
  }
}
