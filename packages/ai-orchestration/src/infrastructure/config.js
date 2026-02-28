/**
 * Model Configuration & Discovery.
 * Preferences and provider detection sourced from the unified Model Registry.
 */
import { DEFAULT_PREFERENCES, getProviderForModel, isModelDeprecated } from "../domain/models.js";

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
 * @returns {{ model: string, provider: string }}
 */
export function selectBestModel(role, customPreferences = null, keys = {}) {
  const preferences = customPreferences || DEFAULT_PREFERENCES[role] || [];
  const availableProviders = getAvailableModelProviders(keys);

  console.log(
    `[Config] Finding best model for ${role}. Available providers: ${availableProviders.join(", ")}`,
  );

  for (const model of preferences) {
    if (isModelDeprecated(model)) {
      console.log(`[Config] Skipping deprecated model: ${model}`);
      continue;
    }
    const provider = getProviderForModel(model);
    if (availableProviders.includes(provider)) {
      console.log(`[Config] Selected: ${model} (Provider: ${provider})`);
      return { model, provider };
    }
  }

  // Fallback to simulation if no keys found
  console.log(
    `[Config] No matching keys found for preferred models. Falling back to Simulation Mode.`,
  );
  return { model: "simulation", provider: "mock" };
}
