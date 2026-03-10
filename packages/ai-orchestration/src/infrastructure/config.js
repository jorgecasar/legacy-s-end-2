/**
 * Model Configuration & Discovery.
 * Preferences and provider detection sourced from the unified Model Registry.
 */
import {
  COMPLEXITY_PREFERENCES,
  DEFAULT_PREFERENCES,
  getProviderForModel,
  isModelDeprecated,
} from "../domain/models.js";

/**
 * Detect available model providers based on supplied API keys.
 * @param {{ gemini?: string, anthropic?: string, openai?: string }} keys
 * @returns {string[]}
 */
export function getAvailableModelProviders(keys = {}) {
  const providers = [];
  if (keys.gemini) providers.push("gemini");
  if (keys.anthropic) providers.push("anthropic");
  if (keys.openai) providers.push("openai");
  return providers;
}

/**
 * Select the best available model for a given agent role.
 * Skips models marked as deprecated in the Model Registry.
 * @param {string} role - 'planner', 'developer', or 'reviewer'
 * @param {string[]|null} customPreferences - Optional override of model order
 * @param {{ gemini?: string, anthropic?: string, openai?: string }} keys
 * @param {string|null} complexity - Optional task complexity ('low', 'medium', 'high')
 * @returns {{ model: string, provider: string }}
 */
export function selectBestModel(role, customPreferences = null, keys = {}, complexity = null) {
  let preferences = customPreferences;

  // Complexity-based preferences for developer
  if (!preferences && role === "developer" && complexity) {
    preferences = COMPLEXITY_PREFERENCES[complexity.toLowerCase()];
  }

  // Fallback to role-based defaults
  if (!preferences) {
    preferences = DEFAULT_PREFERENCES[role] || [];
  }

  const availableProviders = getAvailableModelProviders(keys);

  for (const model of preferences) {
    if (isModelDeprecated(model)) {
      continue;
    }
    const provider = getProviderForModel(model);
    if (availableProviders.includes(provider)) {
      console.log(
        `[Config] Selected: ${model} (Provider: ${provider})${complexity ? ` for Complexity: ${complexity}` : ""}`,
      );
      return { model, provider };
    }
  }

  // No keys found for any preferred models
  return { model: null, provider: null };
}

/**
 * Extracts a recommended model from a text (e.g. issue body or comments).
 * Looks for: - **Recommended Model**: `model-name`
 * @param {string} text
 * @returns {string|null}
 */
export function extractRecommendedModel(text) {
  if (!text) return null;
  const match = text.match(/-\s\*\*Recommended\sModel\*\*:\s`([^`]+)`/i);
  return match ? match[1] : null;
}

/**
 * Extracts task complexity from a text (e.g. issue report).
 * Looks for: - **Complexity**: `low|medium|high`
 * @param {string} text
 * @returns {string|null}
 */
export function extractTaskComplexity(text) {
  if (!text) return null;
  const match = text.match(/-\s\*\*Complexity\*\*:\s`?(low|medium|high)`?/i);
  return match ? match[1].toLowerCase() : null;
}
