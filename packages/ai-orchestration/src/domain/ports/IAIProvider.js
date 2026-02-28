/**
 * Port interface for AI Providers.
 * This decouples the core domain logic from specific LLM SDKs (Gemini, Anthropic, OpenAI).
 *
 * @interface
 */
export class IAIProvider {
  /**
   * Generates content from the provided system and user prompts.
   *
   * @param {string} _model - The model identifier to use (e.g., 'gemini-2.5-flash', 'gpt-4o').
   * @param {string} _systemPrompt - The instructions for the system/agent behavior.
   * @param {string} _userPrompt - The actual user request/input.
   * @param {number} [_maxOutputTokens] - Optional cap on the generated output tokens.
   * @returns {Promise<{text: string, usage: {prompt_tokens: number, completion_tokens: number, total_tokens: number}}>}
   */
  async generateContent(_model, _systemPrompt, _userPrompt, _maxOutputTokens) {
    throw new Error("Not implemented");
  }
}
