import Anthropic from "@anthropic-ai/sdk";

/**
 * @typedef {import('../../domain/ports/IAIProvider.js').IAIProvider} IAIProvider
 */

/**
 * Adapter for Anthropic's Claude models.
 * @implements {IAIProvider}
 */
export class AnthropicAdapter {
  constructor(apiKey) {
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required.");
    this.anthropic = new Anthropic({ apiKey });
  }

  async generateContent(modelId, systemPrompt, userPrompt, maxOutputTokens) {
    const response = await this.anthropic.messages.create({
      model: modelId || "claude-3-5-sonnet-latest",
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: maxOutputTokens || 8192,
    });

    return {
      text: /** @type {any} */ (response.content[0]).text,
      usage: {
        prompt_tokens: response.usage.input_tokens || 0,
        completion_tokens: response.usage.output_tokens || 0,
        total_tokens: (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0),
      },
    };
  }
}
