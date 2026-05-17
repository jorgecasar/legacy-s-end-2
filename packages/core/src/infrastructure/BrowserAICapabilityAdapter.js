import { AICapabilityPort } from "../use-cases/ports/AICapabilityPort.js";
import { AIUtils } from "./AIUtils.js";

/**
 * BrowserAICapabilityAdapter
 * Implementation of AICapabilityPort using standard and experimental Browser APIs.
 */
export class BrowserAICapabilityAdapter extends AICapabilityPort {
  /**
   * Detects all relevant AI capabilities in the current environment.
   * @returns {Promise<import("../use-cases/ports/AICapabilityPort.js").AICapabilities>}
   */
  async getCapabilities() {
    return {
      speechRecognition: this.#checkSpeechRecognition(),
      speechSynthesis: this.#checkSpeechSynthesis(),
      promptAPI: /** @type {any} */ (await this.#checkPromptAPI()),
      translatorAPI: await this.#checkTranslatorAPI(),
    };
  }

  #checkSpeechRecognition() {
    if (typeof window === "undefined") return false;
    const win = /** @type {any} */ (window);
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  #checkSpeechSynthesis() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  async #checkPromptAPI() {
    try {
      const modelApi = AIUtils.getPromptApi();
      if (!modelApi) {
        return "unavailable";
      }

      const locale = AIUtils.getLocale();
      const status = await AIUtils.withTimeout(
        modelApi.availability({ languages: [locale] }),
        3000,
        "unavailable",
      );

      console.log(`[AI Diagnostic] Prompt API availability: ${status}`);
      return status;
    } catch (e) {
      console.error("[AI Diagnostic] Error checking availability:", e.message);
      return "unavailable";
    }
  }

  async #checkTranslatorAPI() {
    try {
      const global = /** @type {any} */ (self);
      if (!("ai" in global) || !("translator" in global.ai)) {
        return false;
      }
      const status = await AIUtils.withTimeout(
        global.ai.translator.availability(),
        2000,
        "unavailable",
      );
      return status !== "unavailable";
    } catch {
      return false;
    }
  }
}
