/**
 * PersistenceProvider
 *
 * Port for data persistence.
 * @interface
 */
export class PersistenceProvider {
  /**
   * @param {string} _key
   * @param {unknown} _data
   * @returns {Promise<import("../../domain/Result.js").Result<void>>}
   */
  async save(_key, _data) {
    throw new Error("Method not implemented.");
  }

  /**
   * @param {string} _key
   * @returns {Promise<import("../../domain/Result.js").Result<unknown>>}
   */
  async load(_key) {
    throw new Error("Method not implemented.");
  }
}
