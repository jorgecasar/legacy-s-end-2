/**
 * @typedef {Object} AICapabilities
 * @property {boolean} speechRecognition - Availability of Web Speech Recognition API
 * @property {boolean} speechSynthesis - Availability of Web Speech Synthesis API
 * @property {'readily'|'after-download'|'unavailable'} promptAPI - Status of the Prompt API (Gemini Nano)
 * @property {boolean} translatorAPI - Availability of the Translator API
 */

/**
 * AICapabilityPort
 * Interface for detecting Built-in AI capabilities in the browser.
 */
export class AICapabilityPort {
  /**
   * Detects all relevant AI capabilities in the current environment.
   * @returns {Promise<AICapabilities>}
   */
  async getCapabilities() {
    throw new Error("Method not implemented");
  }
}
