import { Result } from "../domain/Result.js";

/**
 * LoadProgress
 *
 * Use case for loading game progress.
 */
export default class LoadProgress {
  /** @typedef {import("./ports/PersistenceProvider.js").PersistenceProvider} PersistenceProvider */

  /** @type {PersistenceProvider} */
  #provider;
  #key;

  /**
   * @param {PersistenceProvider} provider
   * @param {string} key
   */
  constructor(provider, key = "legacy-s-end-progress") {
    this.#provider = provider;
    this.#key = key;
  }

  /**
   * @returns {Promise<import("../domain/Result.js").Result<unknown>>}
   */
  async execute() {
    try {
      const result = await this.#provider.load(this.#key);
      if (!result.success) {
        return Result.failure(result.error || "Unknown error");
      }
      return Result.success(result.value);
    } catch (error) {
      return Result.failure(`Failed to load progress: ${error.message}`);
    }
  }
}
