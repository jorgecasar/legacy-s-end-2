/**
 * Unified AI Model Registry.
 * Single source of truth for model names, providers, pricing and lifecycle.
 *
 * When a model is deprecated, set `deprecated` to the sunset date (ISO string).
 * The model selector will automatically skip deprecated models.
 *
 * Pricing values are in USD per 1,000,000 tokens (Pay-as-you-go Tier).
 *
 * Official Pricing References:
 * - Google Gemini: https://ai.google.dev/pricing
 * - Anthropic Claude: https://www.anthropic.com/pricing
 * - OpenAI GPT: https://openai.com/api/pricing/
 */

export const MODEL_REGISTRY = {
  // --- Gemini 2.0 Series (Latest) ---
  "gemini-2.0-flash": {
    provider: "gemini",
    pricing: { input: 0.1, output: 0.4 },
    description:
      "Nuestro modelo multimodal más equilibrado. Ideal para la era de los agentes y codificación diaria.",
    deprecated: false,
  },
  "gemini-2.0-flash-lite": {
    provider: "gemini",
    pricing: { input: 0.075, output: 0.3 },
    description: "El modelo más rentable para uso a gran escala y tareas sencillas.",
    deprecated: false,
  },

  // --- Gemini 1.5 Series ---
  "gemini-1.5-pro": {
    provider: "gemini",
    pricing: { input: 1.25, output: 10 },
    description:
      "Modelo de alto rendimiento para razonamiento complejo y ventanas de contexto de hasta 2M.",
    deprecated: false,
  },
  "gemini-1.5-flash": {
    provider: "gemini",
    pricing: { input: 0.3, output: 1.2 },
    description: "Rápido y versátil, optimizado para velocidad y eficiencia.",
    deprecated: false,
  },
  "gemini-1.5-flash-8b": {
    provider: "gemini",
    pricing: { input: 0.0375, output: 0.15 },
    description: "Modelo extremadamente ligero para tareas de baja complejidad.",
    deprecated: false,
  },

  // --- Anthropic Claude ---
  "claude-3-5-sonnet-latest": {
    provider: "anthropic",
    pricing: { input: 3, output: 15 },
    description: "Excelente en codificación y seguimiento de instrucciones complejas.",
    deprecated: false,
  },
  "claude-3-haiku-20240307": {
    provider: "anthropic",
    pricing: { input: 0.25, output: 1.25 },
    description: "Extremadamente rápido y ligero para tareas sencillas.",
    deprecated: false,
  },

  // --- OpenAI GPT ---
  "gpt-4o": {
    provider: "openai",
    pricing: { input: 2.5, output: 10 },
    description: "Modelo insignia versátil con fuertes capacidades de razonamiento.",
    deprecated: false,
  },
  "gpt-4o-mini": {
    provider: "openai",
    pricing: { input: 0.15, output: 0.6 },
    description: "Rápido y económico para tareas que no requieren razonamiento avanzado.",
    deprecated: false,
  },

  // --- Internal/Simulation ---
  simulation: {
    provider: "mock",
    pricing: { input: 0, output: 0 },
    description: "Modelo de simulación para pruebas internas sin coste.",
    deprecated: false,
  },
  "mock-model": {
    provider: "mock",
    pricing: { input: 0, output: 0 },
    description: "Modelo mock para tests unitarios.",
    deprecated: false,
  },
};

/** Default model preferences per agent role (highest priority first). */
export const DEFAULT_PREFERENCES = {
  planner: ["gemini-2.0-flash", "gemini-1.5-pro", "claude-3-5-sonnet-latest"],
  developer: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"],
  reviewer: ["gemini-2.0-flash", "gemini-1.5-pro", "gpt-4o-mini"],
};

/** Model preferences based on task complexity for the developer role. */
export const COMPLEXITY_PREFERENCES = {
  low: ["gemini-2.0-flash-lite", "gemini-1.5-flash-8b", "gpt-4o-mini", "gemini-2.0-flash"],
  medium: ["gemini-2.0-flash", "gemini-1.5-flash", "claude-3-5-sonnet-latest"],
  high: ["gemini-1.5-pro", "claude-3-5-sonnet-latest", "gemini-2.0-flash"],
};

/**
 * Check if a model is deprecated (past its sunset date).
 */
export function isModelDeprecated(modelName) {
  const entry = MODEL_REGISTRY[modelName];
  if (!entry || !entry.deprecated) return false;
  return new Date(entry.deprecated) <= new Date();
}

/**
 * Get the pricing for a specific model.
 */
export function getModelPricing(modelName) {
  const entry = MODEL_REGISTRY[modelName];
  if (!entry) {
    throw new Error(
      `Model '${modelName}' not found in registry. Please add it to MODEL_REGISTRY in domain/models.js to track costs accurately.`,
    );
  }
  return entry.pricing;
}

/**
 * Get the provider for a model from the registry.
 */
export function getProviderForModel(modelName) {
  const entry = MODEL_REGISTRY[modelName];
  if (entry) return entry.provider;
  if (modelName.startsWith("gemini")) return "gemini";
  if (modelName.startsWith("claude")) return "anthropic";
  if (modelName.startsWith("gpt")) return "openai";
  return null;
}
