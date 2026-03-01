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
   */
  constructor(apiKey) {
    if (!apiKey) throw new Error("OPENAI_API_KEY is required.");
    this.openai = new OpenAI({ apiKey });
  }

  async generateContent(modelId, systemPrompt, userPrompt, maxOutputTokens) {
    const response = await this.openai.chat.completions.create({
      model: modelId || "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: maxOutputTokens || undefined,
    });

    const usage = response.usage || /** @type {any} */ ({});
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
