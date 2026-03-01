import assert from "node:assert";
import { describe, test } from "node:test";
import { MockAIAdapter } from "../src/infrastructure/adapters/MockAIAdapter.js";
import { reviewPR } from "../src/use-cases/review-pr/main.js";

describe("CI Script: AI Reviewer", () => {
  test("should initialize review using configured prompts", async () => {
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
      pullNumber: 789,
      diff: "some code changes",
    };

    const result = await reviewPR(options, { Octokit: MockOctokit });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.approved, true);
    assert.ok(result.value.systemPrompt.includes("Senior Architect"));
    assert.ok(result.value.userPrompt.includes("some code changes"));
  });

  test("should throw error if input tokens exceed maxInputTokens", async () => {
    const options = {
      token: "fake-token",
      aiProvider: new MockAIAdapter(),
      model: "mock-model",
      owner: "jorgemmock",
      repo: "demo",
      pullNumber: 1,
      diff: "A".repeat(1000), // ~250 tokens
      maxInputTokens: 100,
    };

    const result = await reviewPR(options, { Octokit: class {} });
    assert.strictEqual(result.success, false);
    assert.match(result.error, /Input context too large/);
  });

  test("should respect maxOutputTokens in simulated usage", async () => {
    const options = {
      token: "fake-token",
      aiProvider: new MockAIAdapter(),
      model: "mock-model",
      owner: "jorgemmock",
      repo: "demo",
      pullNumber: 1,
      diff: "Diff",
      maxOutputTokens: 50,
    };

    const result = await reviewPR(options, { Octokit: class {} });
    assert.strictEqual(result.success, true);
    assert.ok(result.value.usage.completion_tokens <= 50);
  });
});
