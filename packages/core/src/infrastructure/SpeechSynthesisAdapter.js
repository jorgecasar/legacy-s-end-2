import { Result } from "../domain/Result.js";
import { TextToSpeechPort } from "../use-cases/ports/TextToSpeechPort.js";

/**
 * SpeechSynthesisAdapter
 * Implementation of TextToSpeechPort using the browser's SpeechSynthesis API.
 */
export class SpeechSynthesisAdapter extends TextToSpeechPort {
  /**
   * Speaks the provided text aloud.
   * @param {string} text - The text to speak.
   * @param {import("../use-cases/ports/TextToSpeechPort.js").TTSOptions} [options] - Configuration for the speech.
   * @returns {Promise<import("../domain/Result.js").Result<void>>}
   */
  async speak(text, options = {}) {
    if (!("speechSynthesis" in window)) {
      return Result.failure("SpeechSynthesis API not available in this browser");
    }

    this.stop();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);

      if (options.lang) utterance.lang = options.lang;
      if (options.rate) utterance.rate = options.rate;
      if (options.pitch) utterance.pitch = options.pitch;
      if (options.volume !== undefined) utterance.volume = options.volume;

      utterance.onend = () => resolve(Result.success(undefined));
      utterance.onerror = (event) =>
        resolve(Result.failure(`SpeechSynthesis error: ${event.error}`));

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stops any ongoing speech.
   */
  stop() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }
}
