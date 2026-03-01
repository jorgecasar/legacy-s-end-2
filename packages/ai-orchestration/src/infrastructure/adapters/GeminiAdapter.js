import { GoogleGenAI } from "@google/genai";

/**
 * @typedef {import('../../domain/ports/IAIProvider.js').IAIProvider} IAIProvider
 */

/**
 * Adapter for Google's Gemini models.
 * @implements {IAIProvider}
 */
export class GeminiAdapter {
  /**
   * @param {string} apiKey
   */
  constructor(apiKey) {
    if (!apiKey) throw new Error("GEMINI_API_KEY is required.");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateContent(modelId, systemPrompt, userPrompt, maxOutputTokens) {
    const response = await this.ai.models.generateContent({
      model: modelId || "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: maxOutputTokens || undefined,
      },
    });

    const metadata = response.usageMetadata || {};
    return {
      text: response.text,
      usage: {
        prompt_tokens: metadata.promptTokenCount || 0,
        completion_tokens: metadata.candidatesTokenCount || 0,
        total_tokens: metadata.totalTokenCount || 0,
      },
    };
  }
}
