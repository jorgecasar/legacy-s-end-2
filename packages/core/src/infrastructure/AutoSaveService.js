import { SaveProgress } from "../use-cases/SaveProgress.js";

/**
 * AutoSaveService
 *
 * Debounced auto-save that persists HeroState via a storage adapter.
 */
export default class AutoSaveService {
  #storageAdapter;
  #timeoutId;
  #delay;

  /**
   * @param {object} storageAdapter
   * @param {number} delay - Debounce delay in milliseconds (default 5000ms)
   */
  constructor(storageAdapter, delay = 5000) {
    this.#storageAdapter = storageAdapter;
    this.#delay = delay;
    this.#timeoutId = null;
  }

  /**
   * Requests an auto-save. The actual save will happen after the delay
   * if no other requests are made in between.
   *
   * @param {import("../domain/entities/HeroState.js").default} heroState
   */
  requestSave(heroState) {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
    }

    this.#timeoutId = setTimeout(() => {
      const result = SaveProgress.execute({
        heroState,
        storageAdapter: this.#storageAdapter,
      });
      if (!result.success) {
        console.error("AutoSave failed:", result.error);
      }
      this.#timeoutId = null;
    }, this.#delay);
  }

  /**
   * Force an immediate save and clear pending timeouts.
   * @param {import("../domain/entities/HeroState.js").default} heroState
   * @returns {import("../domain/Result.js").Result<boolean>}
   */
  forceSave(heroState) {
    this.stop();
    return SaveProgress.execute({
      heroState,
      storageAdapter: this.#storageAdapter,
    });
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
