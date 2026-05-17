import { Result } from "../domain/Result.js";

/**
 * ReadDialogueAloud Use Case
 *
 * Coordinates reading NPC dialogue aloud via a TextToSpeechPort.
 */
export class ReadDialogueAloud {
  /**
   * Executes the use case.
   * @param {Object} params
   * @param {string} params.text - The text to read.
   * @param {import("./ports/TextToSpeechPort.js").TextToSpeechPort} params.ttsPort - The port to use for speech.
   * @param {import("./ports/TextToSpeechPort.js").TTSOptions} [params.options] - Configuration for the speech.
   * @returns {Promise<import("../domain/Result.js").Result<void>>}
   */
  static async execute({ text, ttsPort, options }) {
    try {
      if (!text) {
        return Result.failure("No text provided for speech");
      }
      return await ttsPort.speak(text, options);
    } catch (e) {
      return Result.failure(`Failed to read dialogue: ${e.message}`);
    }
  }
}
