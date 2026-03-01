import OpenAI from "openai";

/**
 * @typedef {import('../../domain/ports/IAIProvider.js').IAIProvider} IAIProvider
 */

/**
 * Adapter for OpenAI GPT models.
 * @implements {IAIProvider}
 */
export class OpenAIAdapter {
  /**
   * @param {string} apiKey
   * @param {object} [options]
   * @param {object} [options.client] - Optional injected client for testing
   */
  constructor(apiKey, options = {}) {
    if (!apiKey && !options.client) throw new Error("OPENAI_API_KEY is required.");
    this.client = options.client || new OpenAI({ apiKey });
  }

  async generateContent(modelId, systemPrompt, userPrompt, maxOutputTokens) {
    const response = await this.client.chat.completions.create({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxOutputTokens || 4096,
    });

    const usage = response.usage;

    return {
      text: response.choices[0].message.content,
      usage: {
        prompt_tokens: usage?.prompt_tokens || 0,
        completion_tokens: usage?.completion_tokens || 0,
        total_tokens: usage?.total_tokens || 0,
      },
    };
  }
}
