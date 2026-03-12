/**
 * AutoSaveService
 *
 * Service that handles automatic saving of game state.
 * Uses a debounce mechanism to prevent saving too frequently.
 */
export default class AutoSaveService {
  /** @typedef {import("../use-cases/SaveProgress.js").default} SaveProgress */

  /** @type {SaveProgress} */
  #saveProgress;
  #timeoutId;
  #delay;

  /**
   * @param {SaveProgress} saveProgress
   * @param {number} delay - Debounce delay in milliseconds (default 5000ms)
   */
  constructor(saveProgress, delay = 5000) {
    this.#saveProgress = saveProgress;
    this.#delay = delay;
    this.#timeoutId = null;
  }

  /**
   * Requests an auto-save. The actual save will happen after the delay
   * if no other requests are made in between.
   *
   * @param {Record<string, unknown>} data - The game state to save.
   */
  requestSave(data) {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
    }

    this.#timeoutId = setTimeout(async () => {
      const result = await this.#saveProgress.execute(data);
      if (!result.success) {
        console.error("AutoSave failed:", result.error);
      } else {
        console.log("AutoSave successful");
      }
      this.#timeoutId = null;
    }, this.#delay);
  }

  /**
   * Force an immediate save and clear pending timeouts.
   * @param {Record<string, unknown>} data
   * @returns {Promise<import("../domain/Result.js").Result<void>>}
   */
  async forceSave(data) {
    this.stop();
    return await this.#saveProgress.execute(data);
  }

  /**
   * Stop any pending auto-saves.
   */
  stop() {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
      this.#timeoutId = null;
    }
  }
}
