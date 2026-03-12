import { Result } from "../domain/Result.js";

/**
 * SaveProgress
 *
 * Use case for saving game progress.
 */
export default class SaveProgress {
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
   * @param {Record<string, unknown>} data
   * @returns {Promise<import("../domain/Result.js").Result<void>>}
   */
  async execute(data) {
    try {
      const result = await this.#provider.save(this.#key, data);
      if (!result.success) {
        return Result.failure(result.error || "Unknown error");
      }
      return Result.success();
    } catch (error) {
      return Result.failure(`Failed to save progress: ${error.message}`);
    }
  }
}
