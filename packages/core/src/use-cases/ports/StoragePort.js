/**
 * @interface StoragePort
 */
export class StoragePort {
  /**
   * Saves state to storage.
   * @param {object} _data
   * @returns {import("../../domain/Result.js").Result<boolean>}
   */
  save(_data) {
    throw new Error("Method not implemented.");
  }

  /**
   * Loads state from storage.
   * @returns {import("../../domain/Result.js").Result<object | null>}
   */
  load() {
    throw new Error("Method not implemented.");
  }
}
