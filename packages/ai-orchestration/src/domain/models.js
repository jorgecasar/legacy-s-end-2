/**
 * Unified AI Model Registry.
 * Single source of truth for model names, providers, pricing and lifecycle.
 *
 * When a model is deprecated, set `deprecated` to the sunset date (ISO string).
 * The model selector will automatically skip deprecated models.
 *
 * Pricing values are in USD per 1,000,000 tokens.
 *
 * Official Pricing References:
 * - Google Gemini: https://ai.google.dev/pricing
 * - Anthropic Claude: https://www.anthropic.com/pricing
 * - OpenAI GPT: https://openai.com/api/pricing/
 */

export const MODEL_REGISTRY = {
  // --- Gemini 3.x ---
  "gemini-3.1-pro-preview": {
    provider: "gemini",
    pricing: { input: 2.0, output: 12.0 },
    deprecated: false,
  },
  "gemini-3-flash": {
    provider: "gemini",
    pricing: { input: 0.5, output: 3.0 },
    deprecated: false,
  },

  // --- Gemini 2.x ---
  "gemini-2.5-pro": {
    provider: "gemini",
    pricing: { input: 1.25, output: 10.0 },
    deprecated: false,
  },
  "gemini-2.5-flash": {
    provider: "gemini",
    pricing: { input: 0.3, output: 2.5 },
    deprecated: false,
  },
  "gemini-2.0-flash-exp": {
    provider: "gemini",
    pricing: { input: 0.1, output: 0.4 },
    deprecated: false,
  },

  // --- Anthropic Claude ---
  "claude-3-5-sonnet": {
    provider: "anthropic",
    pricing: { input: 3.0, output: 15.0 },
    deprecated: false,
  },
  "claude-3-haiku": {
    provider: "anthropic",
    pricing: { input: 0.25, output: 1.25 },
    deprecated: false,
  },

  // --- OpenAI GPT ---
  "gpt-4o": {
    provider: "openai",
    pricing: { input: 5.0, output: 15.0 },
    deprecated: false,
  },
  "gpt-4o-mini": {
    provider: "openai",
    pricing: { input: 0.15, output: 0.6 },
    deprecated: false,
  },
};

/** Fallback pricing when no specific model match is found. */
export const PROVIDER_FALLBACK_PRICING = {
  gemini: { input: 0.1, output: 0.4 },
  anthropic: { input: 3.0, output: 15.0 },
  openai: { input: 5.0, output: 15.0 },
  mock: { input: 0, output: 0 },
};

/** Default model preferences per agent role (highest priority first). */
export const DEFAULT_PREFERENCES = {
  planner: ["gemini-3.1-pro-preview", "claude-3-5-sonnet", "gpt-4o"],
  developer: ["gemini-3.1-pro-preview", "claude-3-5-sonnet", "gpt-4o"],
  reviewer: ["gemini-3-flash", "claude-3-haiku", "gpt-4o-mini"],
};

/**
 * Check if a model is deprecated (past its sunset date).
 * @param {string} modelName
 * @returns {boolean}
 */
export function isModelDeprecated(modelName) {
  const entry = MODEL_REGISTRY[modelName];
  if (!entry || !entry.deprecated) return false;
  return new Date(entry.deprecated) <= new Date();
}

/**
 * Get the pricing for a specific model, falling back to provider defaults.
 * @param {string} model
 * @param {string} provider
 * @returns {{ input: number, output: number }}
 */
export function getModelPricing(model, provider) {
  const entry = MODEL_REGISTRY[model];
  if (entry) return entry.pricing;
  return PROVIDER_FALLBACK_PRICING[provider] || PROVIDER_FALLBACK_PRICING.mock;
}

/**
 * Get the provider for a model from the registry.
 * @param {string} modelName
 * @returns {string|null}
 */
export function getProviderForModel(modelName) {
  const entry = MODEL_REGISTRY[modelName];
  if (entry) return entry.provider;
  // Heuristic fallback for unknown models
  if (modelName.startsWith("gemini")) return "gemini";
  if (modelName.startsWith("claude")) return "anthropic";
  if (modelName.startsWith("gpt")) return "openai";
  return null;
}
