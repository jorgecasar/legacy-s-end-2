import Anthropic from "@anthropic-ai/sdk";

/**
 * @typedef {import('../../domain/ports/IAIProvider.js').IAIProvider} IAIProvider
 */

/**
 * Adapter for Anthropic's Claude models.
 * @implements {IAIProvider}
 */
export class AnthropicAdapter {
  /**
   * @param {string} apiKey
   * @param {object} [options]
   * @param {object} [options.client] - Optional injected client for testing
   */
  constructor(apiKey, options = {}) {
    if (!apiKey && !options.client) throw new Error("ANTHROPIC_API_KEY is required.");
    this.client = options.client || new Anthropic({ apiKey });
  }

  async generateContent(modelId, systemPrompt, userPrompt, maxOutputTokens) {
    const response = await this.client.messages.create({
      model: modelId,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: maxOutputTokens || 4096,
    });

    const text = response.content[0].text;

    return {
      text,
      usage: {
        prompt_tokens: response.usage.input_tokens || 0,
        completion_tokens: response.usage.output_tokens || 0,
        total_tokens: (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0),
      },
    };
  }
}
