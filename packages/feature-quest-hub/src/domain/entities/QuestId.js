/** @typedef {import("../Result.js").Result<QuestId>} QuestIdResult */

/**
 * Value Object: QuestId
 *
 * Represents a unique identifier for a Quest.
 * Enforces format validation and provides semantic typing.
 */
export class QuestId {
  /** @type {string} */
  #value;

  /**
   * @param {string} value
   * @private
   */
  constructor(value) {
    this.#value = value;
  }

  /**
   * Factory method to create a QuestId.
   * @param {string} value
   * @returns {QuestIdResult}
   */
  static create(value) {
    if (!value || typeof value !== "string" || value.trim().length === 0) {
      return { success: false, error: "QuestId must be a non-empty string." };
    }
    // Add additional validation here if needed (regex, uuid, etc.)
    return { success: true, value: new QuestId(value) };
  }

  /**
   * Returns the raw string value.
   * @returns {string}
   */
  get value() {
    return this.#value;
  }

  /**
   * Checks equality with another QuestId.
   * @param {QuestId} other
   * @returns {boolean}
   */
  equals(other) {
    return other instanceof QuestId && this.#value === other.value;
  }

  toString() {
    return this.#value;
  }
}
