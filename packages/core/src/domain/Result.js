/**
 * Result Pattern
 * Standardizes the response structure for Domain and Use Case layers.
 *
 * @template T
 */
export class Result {
  /** @type {boolean} */
  success;
  /** @type {T | undefined} */
  value;
  /** @type {string | undefined} */
  error;

  /**
   * @param {boolean} success
   * @param {T} [value]
   * @param {string} [error]
   */
  constructor(success, value, error) {
    this.success = success;
    this.value = value;
    this.error = error;
  }

  /**
   * Creates a successful result.
   * @template U
   * @param {U} [value]
   * @returns {Result<U>}
   */
  static success(value) {
    // @ts-ignore
    return new Result(true, value);
  }

  /**
   * Creates a failure result.
   * @param {string} message
   * @returns {Result<any>}
   */
  static failure(message) {
    return new Result(false, undefined, message);
  }
}
