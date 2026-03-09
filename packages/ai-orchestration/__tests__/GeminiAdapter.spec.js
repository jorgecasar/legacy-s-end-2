import assert from "node:assert";
import cp from "node:child_process";
import fs from "node:fs";
import { describe, mock, test } from "node:test";
import { GeminiAdapter } from "../src/infrastructure/adapters/GeminiAdapter.js";

describe("Infrastructure: GeminiAdapter", () => {
  const apiKey = "test-api-key";

  test("should throw error if API key is missing", () => {
    assert.throws(() => new GeminiAdapter(null), /GEMINI_API_KEY is required/);
  });

  test("should parse usage and aggregate tokens from multiple models", () => {
    const adapter = new GeminiAdapter(apiKey);
    const rawOutput = JSON.stringify({
      response: "Final answer",
      stats: {
        models: {
          "gemini-2.0-flash": {
            tokens: { prompt: 100, candidates: 50, total: 150 },
          },
          "another-model": {
            tokens: { input: 20, candidates: 10, total: 30 },
          },
        },
      },
    });

    const { text, usage } = adapter.parseUsage(rawOutput);
    assert.strictEqual(text, "Final answer");
    assert.strictEqual(usage.prompt_tokens, 120);
    assert.strictEqual(usage.completion_tokens, 60);
    assert.strictEqual(usage.total_tokens, 180);
  });

  test("should fallback to estimation if JSON parsing fails", () => {
    const adapter = new GeminiAdapter(apiKey);
    const rawOutput = "Pure text response without JSON";
    const promptLength = 400; // ~100 tokens

    const { text, usage } = adapter.parseUsage(rawOutput, promptLength);
    assert.strictEqual(text, rawOutput);
    assert.strictEqual(usage.prompt_tokens, 100);
    assert.strictEqual(usage.completion_tokens, 8); // 31 / 4
  });

  test("should execute gemini-cli via npx if local binary not found", async () => {
    const adapter = new GeminiAdapter(apiKey);

    // Mock fs.existsSync to return false for local binaries
    mock.method(fs, "existsSync", () => false);

    // Mock spawnSync
    const spawnMock = mock.method(cp, "spawnSync", () => ({
      status: 0,
      stdout: JSON.stringify({ response: "ok", stats: { models: {} } }),
      stderr: "",
    }));

    await adapter.generateContent("m1", "sys", "user");

    const call = spawnMock.mock.calls[0];
    assert.strictEqual(call.arguments[0], "npx");
    assert.ok(call.arguments[1].includes("@google/gemini-cli@0.31.0"));
    assert.strictEqual(call.arguments[2].env.GEMINI_API_KEY, apiKey);
  });

  test("should execute local binary if found", async () => {
    const adapter = new GeminiAdapter(apiKey);

    // Mock fs.existsSync to return true for the first check
    mock.method(fs, "existsSync", () => true);

    // Mock spawnSync
    const spawnMock = mock.method(cp, "spawnSync", () => ({
      status: 0,
      stdout: JSON.stringify({ response: "local ok" }),
      stderr: "",
    }));

    await adapter.generateContent("m1", "sys", "user");

    const call = spawnMock.mock.calls[0];
    assert.ok(call.arguments[0].includes("node_modules/.bin/gemini"));
    assert.strictEqual(call.arguments[1][0], "-p");
  });

  test("should catch and throw formatted error if execution fails", async () => {
    const adapter = new GeminiAdapter(apiKey);

    mock.method(cp, "spawnSync", () => ({
      status: 1,
      stdout: "some error",
      stderr: "critical failure",
    }));

    try {
      await adapter.generateContent("m1", "sys", "user");
      assert.fail("Should have thrown");
    } catch (err) {
      assert.ok(err.message.includes("gemini-cli exited with code 1"));
      assert.ok(err.message.includes("critical failure"));
    }
  });

  test("should sanitize and pass GITHUB_TOKEN and GH_MCP_PAT in env", async () => {
    const adapter = new GeminiAdapter(apiKey, {
      githubToken: "  gh_token  ",
      ghMcpPat: "  mcp_pat  ",
    });

    const spawnMock = mock.method(cp, "spawnSync", () => ({
      status: 0,
      stdout: JSON.stringify({ response: "ok" }),
    }));

    await adapter.generateContent("m1", "sys", "user");

    const env = spawnMock.mock.calls[0].arguments[2].env;
    assert.strictEqual(env.GITHUB_TOKEN, "gh_token");
    assert.strictEqual(env.GH_MCP_PAT, "mcp_pat");
  });

  test("should inherit stderr if debug mode is enabled", async () => {
    const adapter = new GeminiAdapter(apiKey, { debug: true });

    const spawnMock = mock.method(cp, "spawnSync", () => ({
      status: 0,
      stdout: JSON.stringify({ response: "ok" }),
    }));

    await adapter.generateContent("m1", "sys", "user");

    const stdio = spawnMock.mock.calls[0].arguments[2].stdio;
    assert.strictEqual(stdio[2], "inherit");
  });

  test("should pass prompt via temporary file in interactive mode", async () => {
    const adapter = new GeminiAdapter(apiKey, { interactive: true });

    // Mock fs tools
    const writeMock = mock.method(fs, "writeFileSync", () => {});
    const unlinkMock = mock.method(fs, "unlinkSync", () => {});
    const existsMock = mock.method(fs, "existsSync", () => true);

    const spawnMock = mock.method(cp, "spawnSync", () => ({
      status: 0,
      stdout: "",
    }));

    await adapter.generateContent("m1", "sys", "user");

    // Verify file creation and cleanup
    assert.strictEqual(writeMock.mock.callCount(), 1);
    assert.strictEqual(unlinkMock.mock.callCount(), 1);

    // Verify args point to the file
    const args = spawnMock.mock.calls[0].arguments[1];
    const pIdx = args.indexOf("-i");
    assert.ok(pIdx !== -1);
    assert.ok(args[pIdx + 1].includes(".gemini_prompt_"));
  });
});
