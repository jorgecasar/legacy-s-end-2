import { Result } from "../domain/Result.js";

/**
 * GenerateSyntheticLocale Use Case
 *
 * Uses a TranslatorPort to translate all strings in a base locale to a target locale,
 * creating a synthetic locale module.
 */
export class GenerateSyntheticLocale {
  /**
   * Executes the use case.
   * @param {Object} params
   * @param {Object} params.sourceTemplates - Key-value map of source strings (e.g. English).
   * @param {string} params.targetLocale - The target language code (e.g. 'fr').
   * @param {import("./ports/TranslatorPort.js").TranslatorPort} params.translatorPort - The translator to use.
   * @returns {Promise<import("../domain/Result.js").Result<Object>>} The translated templates object.
   */
  static async execute({ sourceTemplates, targetLocale, translatorPort }) {
    try {
      const translatedTemplates = {};
      const sourceLanguage = "en";

      const entries = Object.entries(sourceTemplates);
      for (const [key, value] of entries) {
        // Only translate strings (templates can be functions in lit-localize but here they are strings)
        if (typeof value === "string") {
          const result = await translatorPort.translate(value, {
            sourceLanguage,
            targetLanguage: targetLocale,
          });

          if (result.success) {
            translatedTemplates[key] = result.value;
          } else {
            // Fallback to source if translation fails
            translatedTemplates[key] = value;
          }
        } else {
          translatedTemplates[key] = value;
        }
      }

      return Result.success(translatedTemplates);
    } catch (e) {
      return Result.failure(`Failed to generate synthetic locale: ${e.message}`);
    }
  }
}
