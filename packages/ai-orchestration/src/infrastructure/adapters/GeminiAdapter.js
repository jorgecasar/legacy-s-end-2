import { execSync } from "node:child_process";

/**
 * @typedef {import('../../domain/ports/IAIProvider.js').IAIProvider} IAIProvider
 */

/**
 * Adapter for Google's Gemini models using the native gemini-cli.
 * This runs the CLI in headless yolo mode (-y) so it can use internal
 * file system capabilities (read/write/list) fully autonomously.
 * @implements {IAIProvider}
 */
export class GeminiAdapter {
  /**
   * @param {string} apiKey
   */
  constructor(apiKey) {
    if (!apiKey) throw new Error("GEMINI_API_KEY is required.");
    this.apiKey = apiKey;
  }

  async generateContent(modelId, systemPrompt, userPrompt, maxOutputTokens) {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const model = modelId || "gemini-2.5-flash";

    try {
      // Execute the native gemini-cli CLI pointing to the local directory.
      // -y enables "YOLO" mode which auto-approves all filesystem read/write tools.
      // We pass the prompt via stdin to avoid shell argument length limits.
      const output = execSync(`npx --yes @google/gemini-cli prompt -m "${model}" -y`, {
        input: fullPrompt,
        env: { ...process.env, GEMINI_API_KEY: this.apiKey },
        encoding: "utf-8",
        maxBuffer: 20 * 1024 * 1024,
      });

      return {
        text: output,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      };
    } catch (err) {
      throw new Error(
        `gemini-cli execution failed: ${err.message}\nSTDOUT: ${err.stdout}\nSTDERR: ${err.stderr}`,
      );
    }
  }
}
