import { Result } from "../domain/Result.js";
import { TranslatorPort } from "../use-cases/ports/TranslatorPort.js";
import { AIUtils } from "./AIUtils.js";

/**
 * TranslatorAdapter
 * Implementation of TranslatorPort using Chrome's Built-in Translator API.
 */
export class TranslatorAdapter extends TranslatorPort {
  #translators = new Map();

  /**
   * Translates text from one language to another.
   * @param {string} text - The text to translate.
   * @param {Object} options
   * @param {string} options.sourceLanguage - Source language code (e.g., 'en')
   * @param {string} options.targetLanguage - Target language code (e.g., 'es')
   * @returns {Promise<import("../domain/Result.js").Result<string>>}
   */
  async translate(text, options) {
    try {
      const key = `${options.sourceLanguage}-${options.targetLanguage}`;
      let translator = this.#translators.get(key);

      if (!translator) {
        const availability = await this.getAvailability(
          options.sourceLanguage,
          options.targetLanguage,
        );
        if (availability === "unavailable") {
          return Result.failure(
            `Translation unavailable from ${options.sourceLanguage} to ${options.targetLanguage}`,
          );
        }

        // @ts-ignore
        translator = await self.ai.translator.create({
          sourceLanguage: options.sourceLanguage,
          targetLanguage: options.targetLanguage,
        });
        this.#translators.set(key, translator);
      }

      const response = await translator.translate(text);
      return Result.success(response);
    } catch (e) {
      return Result.failure(`Translation error: ${e.message}`);
    }
  }

  /**
   * Checks if translation is available for a pair.
   * @param {string} sourceLanguage
   * @param {string} targetLanguage
   * @returns {Promise<'readily'|'after-download'|'unavailable'>}
   */
  async getAvailability(_sourceLanguage, _targetLanguage) {
    try {
      const api = /** @type {any} */ (self).ai?.translator;
      if (!api) {
        return "unavailable";
      }

      return await AIUtils.withTimeout(
        api.availability({
          sourceLanguage: _sourceLanguage,
          targetLanguage: _targetLanguage,
        }),
        2000,
        "unavailable",
      );
    } catch {
      return "unavailable";
    }
  }

  /**
   * Clears all translator instances.
   */
  destroy() {
    for (const translator of this.#translators.values()) {
      translator.destroy();
    }
    this.#translators.clear();
  }
}
