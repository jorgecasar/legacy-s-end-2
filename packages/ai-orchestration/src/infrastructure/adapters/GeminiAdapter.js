import cp from "node:child_process";
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
   * @param {boolean} [options.debug]
   * @param {boolean} [options.interactive]
   */
  constructor(apiKey, options = {}) {
    if (!apiKey) throw new Error("GEMINI_API_KEY is required.");
    this.apiKey = apiKey;
    this.simulationMode = options.simulationMode || false;
    this.role = options.role || "";
    this.githubToken = options.githubToken || "";
    this.ghMcpPat = options.ghMcpPat || "";
    this.debug = options.debug || false;
    this.interactive = options.interactive || false;
  }

  /**
   * Parses the raw CLI output to extract the response text and token usage.
   * @param {string} rawOutput - The raw stdout from gemini-cli
   * @param {number} promptLength - Length of the input prompt for fallback estimation
   * @returns {{ text: string, usage: { prompt_tokens: number, completion_tokens: number, total_tokens: number } }}
   */
  parseUsage(rawOutput, promptLength = 0) {
    if (!rawOutput) {
      return {
        text: "",
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
    }
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
      // In debug mode, we might have mixed output, so we don't warn unless it's a real failure
      if (!this.debug) {
        console.warn(`[GeminiAdapter] Failed to parse JSON usage data: ${parseErr.message}`);
      }
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
      let executable = "npx";
      let args = [
        "-y",
        "@google/gemini-cli@0.31.0",
        this.interactive ? "-i" : "-p",
        "",
        "-m",
        modelId,
        "--approval-mode",
        approvalMode,
        "--output-format",
        "json",
      ];

      const possiblePaths = [
        path.join(process.cwd(), "node_modules", ".bin", "gemini"),
        path.join(process.cwd(), "packages", "ai-orchestration", "node_modules", ".bin", "gemini"),
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          executable = p;
          args = [
            this.interactive ? "-i" : "-p",
            "",
            "-m",
            modelId,
            "--approval-mode",
            approvalMode,
            "--output-format",
            "json",
          ];
          break;
        }
      }

      console.log(
        `[GeminiAdapter] Running: ${executable} ${args.join(" ")} (${fullPrompt.length} chars input)`,
      );

      if (this.debug) {
        console.log("[GeminiAdapter] Debug mode enabled. Streaming CLI logs to stderr...");
      }

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

      // In interactive mode, we MUST pass the prompt via file because stdin is used by the TUI
      let promptArgValue = "";
      let tempPromptPath = null;

      if (this.interactive) {
        tempPromptPath = path.join(process.cwd(), `.gemini_prompt_${Date.now()}.txt`);
        fs.writeFileSync(tempPromptPath, fullPrompt);
        promptArgValue = tempPromptPath;
        // Update args to point to the file
        const pIdx = args.indexOf("-i");
        if (pIdx !== -1) args[pIdx + 1] = promptArgValue;
      }

      // If interactive is true, we use inherit for all stdio so the user can see/interact with the TUI
      const stdio = this.interactive
        ? ["inherit", "inherit", "inherit"]
        : ["pipe", "pipe", this.debug ? "inherit" : "pipe"];

      const result = cp.spawnSync(executable, args, {
        input: this.interactive ? undefined : fullPrompt,
        env: {
          ...process.env,
          GEMINI_API_KEY: sanitizedApiKey,
          GITHUB_TOKEN: sanitizedGithubToken,
          GH_TOKEN: sanitizedGithubToken,
          GH_MCP_PAT: sanitizedGhMcpPat,
        },
        maxBuffer: 50 * 1024 * 1024,
        timeout: 900000,
        stdio,
        encoding: "utf-8",
      });

      // Cleanup temp prompt file
      if (tempPromptPath && fs.existsSync(tempPromptPath)) {
        fs.unlinkSync(tempPromptPath);
      }

      if (result.error) {
        throw result.error;
      }

      if (result.status !== 0) {
        throw new Error(
          `gemini-cli exited with code ${result.status}\nSTDOUT: ${result.stdout || "captured in TUI"}\nSTDERR: ${result.stderr || ""}`,
        );
      }

      const duration = (Date.now() - startTime) / 1000;
      console.log(`[GeminiAdapter] Completed in ${duration.toFixed(2)}s.`);

      return this.parseUsage(result.stdout, fullPrompt.length);
    } catch (err) {
      throw new Error(`gemini-cli execution failed: ${err.message}`);
    }
  }
}
