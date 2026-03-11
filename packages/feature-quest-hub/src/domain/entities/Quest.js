import { QuestId } from "./QuestId.js";
import { QuestStatus } from "./QuestStatus.js";

/** @typedef {import("../Result.js").Result<Quest>} QuestResult */
/** @typedef {import("../Result.js").Result<QuestStatusValues>} QuestStatusResult */
/** @typedef {import("./QuestStatus.js").QuestStatusValues} QuestStatusValues */
/** @typedef {import("../Result.js").Result<QuestId>} QuestIdResult */

/**
 * Quest
 *
 * Aggregate Root for the Quest Hub domain.
 * Enforces business rules and state invariants for a single mission.
 */
export class Quest {
  /** @type {QuestId} */
  #id;
  /** @type {string} */
  #title;
  /** @type {QuestStatusValues} */
  #status;
  /** @type {string} */
  #description;
  /** @type {string} */
  #image;
  /** @type {number} */
  #level;

  /**
   * Internal constructor. Use Quest.create() instead.
   * @param {object} params
   * @param {QuestId} params.id
   * @param {string} params.title
   * @param {QuestStatusValues} [params.status]
   * @param {string} [params.description]
   * @param {string} [params.image]
   * @param {number} [params.level]
   */
  constructor({ id, title, status = QuestStatus.LOCKED, description = "", image = "", level = 1 }) {
    this.#id = id;
    this.#title = title;
    this.#status = status;
    this.#description = description;
    this.#image = image;
    this.#level = level;
  }

  /**
   * Static factory method to create a Quest entity.
   * Enforces business rules and returns a Result object.
   *
   * @param {object} params
   * @param {string | QuestId} params.id - Unique identifier for the quest.
   * @param {string} params.title - Human readable title.
   * @param {QuestStatusValues} [params.status] - Initial status (Locked by default).
   * @param {string} [params.description] - Short description of the mission.
   * @param {string} [params.image] - Optional URL for the quest image.
   * @param {number} [params.level] - Required level to attempt.
   * @returns {QuestResult}
   */
  static create({
    id,
    title,
    status = QuestStatus.LOCKED,
    description = "",
    image = "",
    level = 1,
  }) {
    // Validate ID through Value Object
    const idResult =
      id instanceof QuestId
        ? /** @type {QuestIdResult} */ ({ success: true, value: id })
        : QuestId.create(id);
    if (!idResult.success) {
      return { success: false, error: idResult.error };
    }

    if (!title || typeof title !== "string") {
      return { success: false, error: "Quest must have a valid string title." };
    }
    if (!Object.values(QuestStatus).includes(/** @type {any} */ (status))) {
      return { success: false, error: `Invalid QuestStatus: ${status}` };
    }

    try {
      const quest = new Quest({
        id: idResult.value,
        title,
        status,
        description,
        image,
        level,
      });
      return { success: true, value: quest };
    } catch (error) {
      return { success: false, error: `Unexpected error creating Quest: ${error.message}` };
    }
  }

  /** @returns {QuestId} */
  get id() {
    return this.#id;
  }

  /** @returns {string} */
  get title() {
    return this.#title;
  }

  /** @returns {QuestStatusValues} */
  get status() {
    return this.#status;
  }

  /** @returns {string} */
  get description() {
    return this.#description;
  }

  /** @returns {string} */
  get image() {
    return this.#image;
  }

  /** @returns {number} */
  get level() {
    return this.#level;
  }

  /**
   * Unlock the quest, making it available.
   * Only a locked quest can be unlocked.
   * @returns {QuestStatusResult}
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
   * @returns {QuestStatusResult}
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
   * @returns {QuestStatusResult}
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
