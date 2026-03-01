import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * @typedef {import('../../domain/ports/IAIProvider.js').IAIProvider} IAIProvider
 */

/**
 * Adapter for Google's Gemini models using the native gemini-cli.
 * This runs the CLI in headless mode (-p "") so it can use internal
 * file system capabilities (read/write/list) fully autonomously.
 * @implements {IAIProvider}
 */
export class GeminiAdapter {
  /**
   * @param {string} apiKey
   * @param {object} [options]
   * @param {boolean} [options.simulationMode]
   * @param {string} [options.role]
   * @param {string} [options.githubToken]
   * @param {string} [options.ghMcpPat]
   */
  constructor(apiKey, options = {}) {
    if (!apiKey) throw new Error("GEMINI_API_KEY is required.");
    this.apiKey = apiKey;
    this.simulationMode = options.simulationMode || false;
    this.role = options.role || "";
    this.githubToken = options.githubToken || "";
    this.ghMcpPat = options.ghMcpPat || "";
  }
  /**
   * Parses the raw CLI output to extract the response text and token usage.
   * @param {string} rawOutput - The raw stdout from gemini-cli
   * @param {number} promptLength - Length of the input prompt for fallback estimation
   * @returns {{ text: string, usage: { prompt_tokens: number, completion_tokens: number, total_tokens: number } }}
   */
  parseUsage(rawOutput, promptLength = 0) {
    let text = rawOutput;
    let usage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    try {
      // Try to find the JSON block in the output (it might contain logs before/after)
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        text = data.response || text;

        // Aggregate tokens from all models involved in the run
        if (data.stats?.models) {
          for (const mId in data.stats.models) {
            const mStats = data.stats.models[mId].tokens;
            usage.prompt_tokens += mStats.prompt || mStats.input || 0;
            usage.completion_tokens += mStats.candidates || 0;
            usage.total_tokens += mStats.total || 0;
          }
        }
      }
    } catch (parseErr) {
      console.warn(`[GeminiAdapter] Failed to parse JSON usage data: ${parseErr.message}`);
    }

    // Fallback to estimation if usage is still 0 but we have text
    if (usage.total_tokens === 0 && text.length > 0) {
      const estimatedIn = Math.ceil(promptLength / 4);
      const estimatedOut = Math.ceil(text.length / 4);
      usage = {
        prompt_tokens: estimatedIn,
        completion_tokens: estimatedOut,
        total_tokens: estimatedIn + estimatedOut,
      };
    }

    return { text, usage };
  }

  async generateContent(modelId, systemPrompt, userPrompt, _maxOutputTokens) {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Always use yolo mode for autonomous execution
    const approvalMode = "yolo";

    try {
      // Find local binary, fallback to pinned npx
      let cliPath = "npx -y @google/gemini-cli@0.31.0";
      const possiblePaths = [
        path.join(process.cwd(), "node_modules", ".bin", "gemini"),
        path.join(process.cwd(), "packages", "ai-orchestration", "node_modules", ".bin", "gemini"),
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          cliPath = p;
          break;
        }
      }

      const command = `${cliPath} -p "" -m "${modelId}" --approval-mode ${approvalMode} --output-format json`;
      console.log(`[GeminiAdapter] Running: ${command} (${fullPrompt.length} chars input)`);

      const startTime = Date.now();

      // Sanitize tokens
      const sanitizedApiKey = this.apiKey.trim();
      const sanitizedGithubToken = (this.githubToken || process.env.GITHUB_TOKEN || "").trim();
      const sanitizedGhMcpPat = (this.ghMcpPat || process.env.GH_MCP_PAT || "").trim();

      if (!sanitizedGithubToken && !sanitizedGhMcpPat) {
        console.warn(
          "[GeminiAdapter] Both GITHUB_TOKEN and GH_MCP_PAT are empty. GitHub MCP server will fail.",
        );
      }

      const rawOutput = execSync(command, {
        input: fullPrompt,
        env: {
          ...process.env,
          GEMINI_API_KEY: sanitizedApiKey,
          GITHUB_TOKEN: sanitizedGithubToken,
          GH_TOKEN: sanitizedGithubToken, // Fallback for some MCP servers
          GH_MCP_PAT: sanitizedGhMcpPat, // Required for GitHub MCP server
        },

        encoding: "utf-8",
        maxBuffer: 50 * 1024 * 1024,
        timeout: 900000,
        stdio: ["pipe", "pipe", "pipe"],
      });

      const duration = (Date.now() - startTime) / 1000;
      console.log(`[GeminiAdapter] Completed in ${duration.toFixed(2)}s.`);

      return this.parseUsage(rawOutput, fullPrompt.length);
    } catch (err) {
      throw new Error(
        `gemini-cli execution failed: ${err.message}\nSTDOUT: ${err.stdout}\nSTDERR: ${err.stderr}`,
      );
    }
  }
}
