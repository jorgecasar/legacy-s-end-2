/**
 * SpeechRecognitionPort
 * Interface for capturing voice commands from the user.
 */
export class SpeechRecognitionPort {
  /**
   * Starts listening for a single voice command.
   * @param {Object} [_options]
   * @param {string} [_options.lang] - Language code (e.g., 'en-US', 'es-ES')
   * @returns {Promise<import("../../domain/Result.js").Result<string>>}
   */
  async listen(_options) {
    throw new Error("Method not implemented");
  }

  /**
   * Stops listening.
   */
  stop() {
    throw new Error("Method not implemented");
  }
}
