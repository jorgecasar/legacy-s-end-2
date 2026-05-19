import { Result } from "../domain/Result.js";
import { StoragePort } from "../use-cases/ports/StoragePort.js";

/**
 * LocalStorageAdapter
 *
 * Infrastructure service that persists game state to browser LocalStorage.
 * @extends StoragePort
 */
export class LocalStorageAdapter extends StoragePort {
  #key = "legacys_end_save";

  /**
   * Saves state to storage.
   * @param {object} data
   * @returns {Result<boolean>}
   */
  save(data) {
    try {
      console.log(`[LocalStorageAdapter] Saving to "${this.#key}":`, data);
      localStorage.setItem(this.#key, JSON.stringify(data));
      return Result.success(true);
    } catch (e) {
      console.error(`[LocalStorageAdapter] Save failed:`, e);
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
      console.log(
        `[LocalStorageAdapter] Loaded from "${this.#key}":`,
        data ? JSON.parse(data) : null,
      );
      return Result.success(data ? JSON.parse(data) : null);
    } catch (e) {
      console.error(`[LocalStorageAdapter] Load failed:`, e);
      return Result.failure(`Failed to load: ${e.message}`);
    }
  }
}
