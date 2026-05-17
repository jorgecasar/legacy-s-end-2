/**
 * @typedef {Object} TTSOptions
 * @property {string} [lang] - Language code (e.g., 'en-US', 'es-ES')
 * @property {number} [rate] - Speed of speech (0.1 to 10)
 * @property {number} [pitch] - Pitch of speech (0 to 2)
 * @property {number} [volume] - Volume of speech (0 to 1)
 */

/**
 * TextToSpeechPort
 * Interface for NPC text-to-speech capabilities.
 */
export class TextToSpeechPort {
  /**
   * Speaks the provided text aloud.
   * @param {string} _text - The text to speak.
   * @param {TTSOptions} [_options] - Configuration for the speech.
   * @returns {Promise<import("../../domain/Result.js").Result<void>>}
   */
  async speak(_text, _options) {
    throw new Error("Method not implemented");
  }

  /**
   * Stops any ongoing speech.
   */
  stop() {
    throw new Error("Method not implemented");
  }
}
