import { Result } from "../domain/Result.js";
import { SpeechRecognitionPort } from "../use-cases/ports/SpeechRecognitionPort.js";

/**
 * WebSpeechAdapter
 * Implementation of SpeechRecognitionPort using the browser's SpeechRecognition API.
 */
export class WebSpeechAdapter extends SpeechRecognitionPort {
  #recognition = null;

  /**
   * Starts listening for a single voice command.
   * @param {Object} [options]
   * @param {string} [options.lang] - Language code (e.g., 'en-US', 'es-ES')
   * @returns {Promise<import("../domain/Result.js").Result<string>>}
   */
  async listen(options = {}) {
    const SpeechRecognition =
      /** @type {any} */ (window).SpeechRecognition ||
      /** @type {any} */ (window).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return Result.failure("Speech Recognition API not available in this browser");
    }

    this.stop();

    return new Promise((resolve) => {
      try {
        const recognition = new SpeechRecognition();
        this.#recognition = recognition;

        recognition.lang = options.lang || navigator.language || "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          resolve(Result.success(transcript));
        };

        recognition.onerror = (event) => {
          resolve(Result.failure(`Speech recognition error: ${event.error}`));
        };

        recognition.onnomatch = () => {
          resolve(Result.failure("No voice match found"));
        };

        recognition.start();
      } catch (e) {
        resolve(Result.failure(`Failed to start speech recognition: ${e.message}`));
      }
    });
  }

  /**
   * Stops listening.
   */
  stop() {
    if (this.#recognition) {
      try {
        this.#recognition.stop();
      } catch {
        // Ignore if already stopped
      }
      this.#recognition = null;
    }
  }
}
