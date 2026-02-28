import assert from "node:assert";
import { describe, test } from "node:test";
import { MockAIAdapter } from "../src/infrastructure/adapters/MockAIAdapter.js";
import { implementIssue } from "../src/use-cases/implement-issue/main.js";

describe("CI Script: AI Developer", () => {
  test("should initialize implementation using configured prompts", async () => {
    const MockOctokit = class {
      constructor() {
        this.rest = {};
      }
    };

    const options = {
      token: "fake-token",
      aiProvider: new MockAIAdapter(),
      model: "mock-model",
      owner: "jorgecasar",
      repo: "legacys-ends",
      issueNumber: 456,
      context: "Build a new engine feature.",
    };

    const result = await implementIssue(options, { Octokit: MockOctokit });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.branch, "feat/issue-456");
    assert.ok(result.systemPrompt.includes("Autonomous Developer"));
    assert.ok(result.userPrompt.includes("Build a new engine feature."));
  });

  test("should throw error if input tokens exceed maxInputTokens", async () => {
    const options = {
      token: "fake-token",
      aiProvider: new MockAIAdapter(),
      model: "mock-model",
      owner: "jorgemmock",
      repo: "demo",
      issueNumber: 1,
      context: "A".repeat(1000), // ~250 tokens
      maxInputTokens: 100,
    };

    await assert.rejects(async () => implementIssue(options, { Octokit: class {} }), {
      message: /Input context too large/,
    });
  });

  test("should respect maxOutputTokens in simulated usage", async () => {
    const options = {
      token: "fake-token",
      aiProvider: new MockAIAdapter(),
      model: "mock-model",
      owner: "jorgemmock",
      repo: "demo",
      issueNumber: 1,
      context: "Context",
      maxOutputTokens: 50,
    };

    const result = await implementIssue(options, { Octokit: class {} });
    assert.ok(result.usage.completion_tokens <= 50);
  });
});
