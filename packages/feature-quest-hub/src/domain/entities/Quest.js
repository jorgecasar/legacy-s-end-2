import { Result } from "@legacys-end/core/domain/Result.js";
import { QuestId } from "./QuestId.js";
import { QuestStatus } from "./QuestStatus.js";

/** @typedef {import("./QuestStatus.js").QuestStatusValues} QuestStatusValues */

/**
 * Entity: Quest
 *
 * Represents a quest in the game.
 */
export class Quest {
  /** @type {QuestId} */
  #id;
  /** @type {string} */
  #title;
  /** @type {string} */
  #description;
  /** @type {QuestStatusValues} */
  #status;
  /** @type {string | undefined} */
  #image;
  /** @type {number | undefined} */
  #level;
  /** @type {string | undefined} */
  #objective;

  /**
   * @param {QuestId} id
   * @param {string} title
   * @param {string} description
   * @param {QuestStatusValues} status
   * @param {string} [image]
   * @param {number} [level]
   * @param {string} [objective]
   */
  constructor(id, title, description, status, image, level, objective) {
    this.#id = id;
    this.#title = title;
    this.#description = description;
    this.#status = status;
    this.#image = image;
    this.#level = level;
    this.#objective = objective;
  }

  /**
   * Factory method to create a Quest.
   * @param {object} params
   * @param {string | QuestId} params.id
   * @param {string} params.title
   * @param {string} params.description
   * @param {QuestStatusValues} [params.status]
   * @param {string} [params.image]
   * @param {number} [params.level]
   * @param {string} [params.objective]
   * @returns {Result<Quest>}
   */
  static create({ id, title, description, status = QuestStatus.LOCKED, image, level, objective }) {
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return Result.failure("Quest must have a valid string title.");
    }

    if (!Object.values(QuestStatus).includes(status)) {
      return Result.failure(`Invalid QuestStatus: ${status}`);
    }

    const idResult = id instanceof QuestId ? Result.success(id) : QuestId.create(id);
    if (!idResult.success) {
      return Result.failure(idResult.error);
    }

    return Result.success(
      new Quest(idResult.value, title, description, status, image, level, objective),
    );
  }

  /** @returns {QuestId} */
  get id() {
    return this.#id;
  }

  /** @returns {string} */
  get title() {
    return this.#title;
  }

  /** @returns {string} */
  get description() {
    return this.#description;
  }

  /** @returns {QuestStatusValues} */
  get status() {
    return this.#status;
  }

  /** @returns {string | undefined} */
  get image() {
    return this.#image;
  }

  /** @returns {number | undefined} */
  get level() {
    return this.#level;
  }

  /** @returns {string | undefined} */
  get objective() {
    return this.#objective;
  }

  /**
   * Unlock the quest, making it available.
   * Only a locked quest can be unlocked.
   * @returns {Result<Quest>}
   */
  unlock() {
    if (this.#status !== QuestStatus.LOCKED) {
      return Result.failure(`Cannot unlock a quest that is ${this.#status}.`);
    }
    return Result.success(
      new Quest(
        this.#id,
        this.#title,
        this.#description,
        QuestStatus.AVAILABLE,
        this.#image,
        this.#level,
        this.#objective,
      ),
    );
  }

  /**
   * Complete the quest.
   * Only an available quest can be completed.
   * @returns {Result<Quest>}
   */
  complete() {
    if (this.#status !== QuestStatus.AVAILABLE) {
      return Result.failure(
        `Only Available quests can be completed. Current status: ${this.#status}.`,
      );
    }
    return Result.success(
      new Quest(
        this.#id,
        this.#title,
        this.#description,
        QuestStatus.COMPLETED,
        this.#image,
        this.#level,
        this.#objective,
      ),
    );
  }

  /**
   * Restart the quest, making it available again.
   * Only a completed quest can be restarted.
   * @returns {Result<Quest>}
   */
  restart() {
    if (this.#status !== QuestStatus.COMPLETED) {
      return Result.failure(
        `Only Completed quests can be restarted. Current status: ${this.#status}.`,
      );
    }
    return Result.success(
      new Quest(
        this.#id,
        this.#title,
        this.#description,
        QuestStatus.AVAILABLE,
        this.#image,
        this.#level,
        this.#objective,
      ),
    );
  }
}
