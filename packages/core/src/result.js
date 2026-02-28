/**
 * Represents the outcome of an operation.
 * Mandatory for all logic layers in Clean Architecture.
 *
 * @template T
 */
export class Result {
  /** @type {boolean} */
  #success;
  /** @type {T|null} */
  #value;
  /** @type {Error|string|null} */
  #error;

  /**
   * @param {boolean} success
   * @param {T|null} value
   * @param {Error|string|null} error
   */
  constructor(success, value = null, error = null) {
    this.#success = success;
    this.#value = value;
    this.#error = error;
  }

  /** @returns {boolean} */
  get success() {
    return this.#success;
  }

  /** @returns {T|null} */
  get value() {
    return this.#value;
  }

  /** @returns {Error|string|null} */
  get error() {
    return this.#error;
  }

  /**
   * Creates a successful result.
   * @template U
   * @param {U} value
   * @returns {Result<U>}
   */
  static ok(value) {
    return new Result(true, value);
  }

  /**
   * Creates a failed result.
   * @param {Error|string} error
   * @returns {Result<any>}
   */
  static fail(error) {
    return new Result(false, null, error);
  }

  /**
   * Converts the result to a plain object.
   * Used for compatibility with the project's standard pattern: { success, value, error }.
   */
  toJSON() {
    return {
      success: this.#success,
      value: this.#value,
      error: this.#error,
    };
  }
}
