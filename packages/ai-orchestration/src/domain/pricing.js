/**
 * Cost calculation for AI interactions.
 * Pricing data is sourced from the unified Model Registry.
 */
import { getModelPricing } from "./models.js";

/**
 * Calculates the cost of an AI interaction.
 * @param {string} model - Specific model name from the registry
 * @param {object} usage - { prompt_tokens, completion_tokens }
 * @returns {{ input_cost: number, output_cost: number, total_cost: number, currency: string }}
 */
export function calculateCost(model, usage) {
  const prices = getModelPricing(model);
  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;

  const inputCost = (promptTokens / 1000000) * prices.input;
  const outputCost = (completionTokens / 1000000) * prices.output;

  return {
    input_cost: Number(inputCost.toFixed(6)),
    output_cost: Number(outputCost.toFixed(6)),
    total_cost: Number((inputCost + outputCost).toFixed(6)),
    currency: "USD",
  };
}
