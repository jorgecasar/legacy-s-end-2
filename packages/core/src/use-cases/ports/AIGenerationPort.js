/**
 * @typedef {Object} GenerationOptions
 * @property {string} [systemPrompt] - Initial system instructions.
 * @property {string[]} [context] - Previous messages or context strings.
 * @property {Function} [onDownloadProgress] - Callback for download progress: (loaded, total) => void
 */

/**
 * AIGenerationPort
 * Interface for generating text using on-device or remote AI.
 */
export class AIGenerationPort {
  /**
   * Generates a response based on a prompt.
   * @param {string} _prompt - The user prompt.
   * @param {GenerationOptions} [_options] - Configuration and context.
   * @returns {Promise<import("../../domain/Result.js").Result<string>>}
   */
  async generate(_prompt, _options) {
    throw new Error("Method not implemented");
  }

  /**
   * Checks if the model is ready or needs download.
   * @returns {Promise<'readily'|'after-download'|'unavailable'>}
   */
  async getAvailability() {
    throw new Error("Method not implemented");
  }

  /**
   * Starts downloading the model if needed.
   * @param {Object} [_options]
   * @param {Function} [_options.onDownloadProgress]
   * @returns {Promise<import("../../domain/Result.js").Result<void>>}
   */
  async downloadModel(_options) {
    throw new Error("Method not implemented");
  }
}
