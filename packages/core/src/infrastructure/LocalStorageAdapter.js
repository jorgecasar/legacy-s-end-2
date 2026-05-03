import { Result } from "../domain/Result.js";

/**
 * LocalStorageAdapter
 *
 * Infrastructure service that persists game state to browser LocalStorage.
 */
export class LocalStorageAdapter {
  #key = "legacys_end_save";

  /**
   * Saves state to storage.
   * @param {object} data
   * @returns {Result<boolean>}
   */
  save(data) {
    try {
      localStorage.setItem(this.#key, JSON.stringify(data));
      return Result.success(true);
    } catch (e) {
      return Result.failure(`Failed to save: ${e.message}`);
    }
  }

  /**
   * Loads state from storage.
   * @returns {Result<object | null>}
   */
  load() {
    try {
      const data = localStorage.getItem(this.#key);
      return Result.success(data ? JSON.parse(data) : null);
    } catch (e) {
      return Result.failure(`Failed to load: ${e.message}`);
    }
  }
}
