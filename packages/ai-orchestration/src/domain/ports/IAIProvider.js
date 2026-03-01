/**
 * Port interface for AI Providers.
 * This decouples the core domain logic from specific LLM SDKs (Gemini, Anthropic, OpenAI).
 *
 * @typedef {object} IAIProvider
 * @property {function(string, string, string, number=): Promise<{text: string, usage: {prompt_tokens: number, completion_tokens: number, total_tokens: number}}>} generateContent
 */

export {};
