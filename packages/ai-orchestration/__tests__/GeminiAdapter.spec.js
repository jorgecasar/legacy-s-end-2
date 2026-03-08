import assert from "node:assert";
import child_process from "node:child_process";
import fs from "node:fs";
import { afterEach, beforeEach, describe, mock, test } from "node:test";
import { GeminiAdapter } from "../src/infrastructure/adapters/GeminiAdapter.js";

describe("Infrastructure: GeminiAdapter", () => {
  const apiKey = "fake-api-key";
  const adapter = new GeminiAdapter(apiKey);

  describe("parseUsage", () => {
    test("should parse valid JSON output with single model stats", () => {
      const rawOutput = `
Some random log line
{
  "response": "Hello world",
  "stats": {
    "models": {
      "gemini-2.0-flash": {
        "tokens": {
          "prompt": 100,
          "candidates": 50,
          "total": 150
        }
      }
    }
  }
}
      `;
      const result = adapter.parseUsage(rawOutput, 400);
      assert.strictEqual(result.text, "Hello world");
      assert.strictEqual(result.usage.prompt_tokens, 100);
      assert.strictEqual(result.usage.completion_tokens, 50);
      assert.strictEqual(result.usage.total_tokens, 150);
    });

    test("should aggregate tokens from multiple models", () => {
      const rawOutput = JSON.stringify({
        response: "Aggregated response",
        stats: {
          models: {
            "model-1": { tokens: { prompt: 10, candidates: 5, total: 15 } },
            "model-2": { tokens: { input: 20, candidates: 10, total: 30 } },
          },
        },
      });
      const result = adapter.parseUsage(rawOutput, 0);
      assert.strictEqual(result.usage.prompt_tokens, 30);
      assert.strictEqual(result.usage.completion_tokens, 15);
      assert.strictEqual(result.usage.total_tokens, 45);
    });

    test("should fallback to estimation if JSON is malformed", () => {
      const rawOutput = "This is not JSON but it is a valid response";
      const promptLength = 100; // ~25 tokens
      const result = adapter.parseUsage(rawOutput, promptLength);

      assert.strictEqual(result.text, rawOutput);
      assert.strictEqual(result.usage.prompt_tokens, 25);
      assert.strictEqual(result.usage.completion_tokens, 11); // "This is not JSON..." is 44 chars / 4 = 11
      assert.strictEqual(result.usage.total_tokens, 36);
    });

    test("should fallback to estimation if usage data is missing in JSON", () => {
      const rawOutput = JSON.stringify({ response: "Only text" });
      const promptLength = 40; // 10 tokens
      const result = adapter.parseUsage(rawOutput, promptLength);

      assert.strictEqual(result.text, "Only text");
      assert.strictEqual(result.usage.prompt_tokens, 10);
      assert.strictEqual(result.usage.completion_tokens, 3); // "Only text" is 9 chars / 4 = 3
    });
  });

  describe("generateContent", () => {
    let existsSyncMock;
    let execSyncMock;

    beforeEach(() => {
      existsSyncMock = mock.method(fs, "existsSync");
      execSyncMock = mock.method(child_process, "execSync");
    });

    afterEach(() => {
      mock.restoreAll();
    });

    test("should execute gemini-cli via npx if local binary not found", async () => {
      existsSyncMock.mock.mockImplementation(() => false);
      execSyncMock.mock.mockImplementation(() => '{"response": "OK", "stats": {}}');

      const result = await adapter.generateContent(
        "gemini-2.0-flash",
        "SysPrompt",
        "UserPrompt",
        100,
      );

      assert.strictEqual(execSyncMock.mock.calls.length, 1);
      const command = execSyncMock.mock.calls[0].arguments[0];
      assert.ok(command.startsWith("npx -y @google/gemini-cli@0.31.0"));
      assert.ok(command.includes('-m "gemini-2.0-flash"'));

      const options = execSyncMock.mock.calls[0].arguments[1];
      assert.strictEqual(options.input, "SysPrompt\n\nUserPrompt");
      assert.strictEqual(options.env.GEMINI_API_KEY, "fake-api-key");

      assert.strictEqual(result.text, "OK");
    });

    test("should execute local binary if found", async () => {
      existsSyncMock.mock.mockImplementation(() => true);
      execSyncMock.mock.mockImplementation(() => '{"response": "Local OK"}');

      const result = await adapter.generateContent("gemini-1.5-pro", "Sys", "User");

      assert.strictEqual(execSyncMock.mock.calls.length, 1);
      const command = execSyncMock.mock.calls[0].arguments[0];
      assert.ok(!command.startsWith("npx"));
      assert.ok(command.includes(".bin/gemini"));

      assert.strictEqual(result.text, "Local OK");
    });

    test("should catch and throw formatted error if execution fails", async () => {
      existsSyncMock.mock.mockImplementation(() => false);

      const mockError = new Error("Command failed");
      mockError.stdout = "Standard Out Error";
      mockError.stderr = "Standard Err Error";

      execSyncMock.mock.mockImplementation(() => {
        throw mockError;
      });

      try {
        await adapter.generateContent("gemini-1.5-pro", "Sys", "User");
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.ok(err.message.includes("gemini-cli execution failed: Command failed"));
        assert.ok(err.message.includes("STDOUT: Standard Out Error"));
        assert.ok(err.message.includes("STDERR: Standard Err Error"));
      }
    });

    test("should sanitize and pass GITHUB_TOKEN and GH_MCP_PAT in env", async () => {
      const adapterWithTokens = new GeminiAdapter("api-key", {
        githubToken: " token123 ",
        ghMcpPat: " mcp456 ",
      });

      existsSyncMock.mock.mockImplementation(() => false);
      execSyncMock.mock.mockImplementation(() => '{"response": "Tokens OK"}');

      await adapterWithTokens.generateContent("model", "sys", "usr");

      assert.strictEqual(execSyncMock.mock.calls.length, 1);
      const env = execSyncMock.mock.calls[0].arguments[1].env;

      assert.strictEqual(env.GITHUB_TOKEN, "token123");
      assert.strictEqual(env.GH_TOKEN, "token123");
      assert.strictEqual(env.GH_MCP_PAT, "mcp456");
    });
  });
});
