/**
 * AIUtils
 * Shared utilities for experimental Browser AI APIs.
 */
export const AIUtils = {
  /**
   * Finds the Prompt API entry point under various experimental namespaces.
   * @returns {any} The API object or null.
   */
  getPromptApi() {
    const global = /** @type {any} */ (self);
    return global.ai?.languageModel || global.ai?.assistant || global.model || global.LanguageModel;
  },

  /**
   * Gets the current browser locale in 2-letter format.
   * @returns {string}
   */
  getLocale() {
    return (navigator.language || "en").split("-")[0].toLowerCase();
  },

  /**
   * Races a promise against a timeout.
   * @template T
   * @param {Promise<T>} promise - The promise to race.
   * @param {number} ms - Timeout in milliseconds.
   * @param {T} fallback - Fallback value if timeout occurs.
   * @returns {Promise<T>}
   */
  async withTimeout(promise, ms, fallback) {
    let timeoutId;
    const timeoutPromise = new Promise((resolve) => {
      timeoutId = setTimeout(() => resolve(fallback), ms);
    });

    // We catch the error on the original promise to prevent "Unhandled Rejection"
    // if it fails AFTER the timeout has already triggered the fallback.
    const safePromise = promise.catch((err) => {
      console.warn("[AIUtils] Promise rejected after timeout or during race:", err.message);
      return fallback;
    });

    try {
      return await Promise.race([safePromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
