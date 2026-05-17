/**
 * TranslatorPort
 * Interface for dynamic text translation.
 */
export class TranslatorPort {
  /**
   * Translates text from one language to another.
   * @param {string} _text - The text to translate.
   * @param {Object} _options
   * @param {string} _options.sourceLanguage - Source language code (e.g., 'en')
   * @param {string} _options.targetLanguage - Target language code (e.g., 'es')
   * @returns {Promise<import("../../domain/Result.js").Result<string>>}
   */
  async translate(_text, _options) {
    throw new Error("Method not implemented");
  }

  /**
   * Checks if translation is available for a pair.
   * @param {string} _sourceLanguage
   * @param {string} _targetLanguage
   * @returns {Promise<'readily'|'after-download'|'unavailable'>}
   */
  async getAvailability(_sourceLanguage, _targetLanguage) {
    throw new Error("Method not implemented");
  }
}
