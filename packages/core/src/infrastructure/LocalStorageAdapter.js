import { Result } from "../domain/Result.js";

/** @typedef {import("../use-cases/ports/PersistenceProvider.js").PersistenceProvider} PersistenceProvider */

export default class LocalStorageAdapter {
  /**
   * @param {string} key
   * @param {unknown} data
   * @returns {Promise<import("../domain/Result.js").Result<void>>}
   */
  async save(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return Result.success();
    } catch (error) {
      return Result.failure(`LocalStorage save failed: ${error.message}`);
    }
  }

  /**
   * @param {string} key
   * @returns {Promise<import("../domain/Result.js").Result<unknown>>}
   */
  async load(key) {
    try {
      const data = localStorage.getItem(key);
      if (data === null) {
        return Result.success(undefined);
      }
      return Result.success(JSON.parse(data));
    } catch (error) {
      return Result.failure(`LocalStorage load failed: ${error.message}`);
    }
  }
}
