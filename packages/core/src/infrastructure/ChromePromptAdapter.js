import { Result } from "../domain/Result.js";
import { AIGenerationPort } from "../use-cases/ports/AIGenerationPort.js";
import { AIUtils } from "./AIUtils.js";

/**
 * ChromePromptAdapter
 * Implementation of AIGenerationPort using Chrome's Built-in AI (Prompt API).
 */
export class ChromePromptAdapter extends AIGenerationPort {
  /** @type {any} */
  #model = null;

  /**
   * Generates a response based on a prompt.
   * @param {string} prompt - The user prompt.
   * @param {import("../use-cases/ports/AIGenerationPort.js").GenerationOptions} [options] - Configuration and context.
   * @returns {Promise<import("../domain/Result.js").Result<string>>}
   */
  async generate(prompt, options = {}) {
    try {
      if (!this.#model) {
        const availability = await this.getAvailability();
        if (availability === "unavailable") {
          return Result.failure("Prompt API not available");
        }

        const locale = AIUtils.getLocale();
        const modelOptions = {
          targetLanguage: locale,
          expectedOutputLanguages: [locale],
          systemPrompt: options.systemPrompt,
          monitor: (m) => this.#attachMonitor(m, options.onDownloadProgress),
        };

        console.log(`[ChromePromptAdapter] Creating model with locale: ${locale}`);

        const api = AIUtils.getPromptApi();
        this.#model = await api.create(modelOptions);
      }

      const response = await this.#model.prompt(prompt);
      return Result.success(response);
    } catch (e) {
      return Result.failure(`AI Generation error: ${e.message}`);
    }
  }

  #attachMonitor(monitor, callback) {
    if (!callback) return;
    monitor.addEventListener("downloadprogress", (e) => {
      callback(e.loaded, e.total);
    });
  }

  /**
   * Checks if the model is ready or needs download.
   * @returns {Promise<'readily'|'after-download'|'unavailable'>}
   */
  async getAvailability() {
    try {
      const api = AIUtils.getPromptApi();
      if (!api) return "unavailable";

      const locale = AIUtils.getLocale();
      return await AIUtils.withTimeout(
        api.availability({ languages: [locale] }),
        3000,
        "unavailable",
      );
    } catch {
      return "unavailable";
    }
  }

  /**
   * Starts downloading the model if needed.
   * @param {Object} [options]
   * @param {Function} [options.onDownloadProgress]
   * @returns {Promise<import("../domain/Result.js").Result<void>>}
   */
  async downloadModel(options = {}) {
    try {
      const availability = await this.getAvailability();
      if (availability === "unavailable") {
        return Result.failure("Prompt API not available");
      }

      if (availability === "readily" && this.#model) {
        return Result.success(undefined);
      }

      const api = AIUtils.getPromptApi();
      this.#model = await api.create({
        monitor: (m) => this.#attachMonitor(m, options.onDownloadProgress),
      });
      return Result.success(undefined);
    } catch (e) {
      return Result.failure(`Download error: ${e.message}`);
    }
  }

  /**
   * Destroys the model instance to free resources.
   */
  destroy() {
    if (this.#model) {
      this.#model.destroy();
      this.#model = null;
    }
  }
}
