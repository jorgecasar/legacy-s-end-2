import assert from "node:assert";
import { describe, test } from "node:test";
import { MockAIAdapter } from "../src/infrastructure/adapters/MockAIAdapter.js";
import { MockGitHubAdapter } from "../src/infrastructure/adapters/MockGitHubAdapter.js";
import { planIssue } from "../src/use-cases/plan-issue/main.js";

describe("CI Script: AI Planner", () => {
  test("should generate a plan using configured prompts", async () => {
    const options = {
      gitProvider: new MockGitHubAdapter(),
      aiProvider: new MockAIAdapter(),
      model: "mock-model",
      owner: "jorgecasar",
      repo: "legacys-ends",
      issueNumber: 123,
      issueTitle: "Add New Quest",
      issueBody: "Please implement a new quest for Global Scope.",
    };

    const result = await planIssue(options);

    assert.strictEqual(result.success, true);
    assert.ok(result.value.systemPrompt.includes("Senior Product Manager"));
    assert.ok(result.value.userPrompt.includes("Add New Quest"));
    assert.ok(result.value.userPrompt.includes("Global Scope"));
    assert.ok(result.value.plan.includes("AI Triage & Planning Report"));
  });

  test("should inject model registry into system prompt", async () => {
    const options = {
      gitProvider: new MockGitHubAdapter(),
      aiProvider: new MockAIAdapter(),
      model: "mock-model",
      owner: "jorgecasar",
      repo: "legacys-ends",
      issueNumber: 123,
      issueTitle: "Add New Quest",
      issueBody: "Body",
    };

    const result = await planIssue({ ...options, availableProviders: ["gemini"] });

    assert.strictEqual(result.success, true);
    assert.ok(result.value.systemPrompt.includes("AVAILABLE MODELS:"));
    assert.ok(result.value.systemPrompt.includes("gemini-2.0-flash"));
  });

  test("should throw error if input tokens exceed maxInputTokens", async () => {
    const options = {
      gitProvider: new MockGitHubAdapter(),
      aiProvider: new MockAIAdapter(),
      model: "mock-model",
      owner: "jorgemmock",
      repo: "demo",
      issueNumber: 1,
      issueTitle: "Large Issue",
      issueBody: "A".repeat(1000), // ~250 tokens
      maxInputTokens: 100,
    };

    const result = await planIssue(options);
    assert.strictEqual(result.success, false);
    assert.match(result.error, /Input context too large/);
  });

  test("should respect maxOutputTokens in simulated usage", async () => {
    const options = {
      gitProvider: new MockGitHubAdapter(),
      aiProvider: new MockAIAdapter(),
      model: "mock-model",
      owner: "jorgemmock",
      repo: "demo",
      issueNumber: 1,
      issueTitle: "Title",
      issueBody: "Body",
      maxOutputTokens: 50,
    };

    const result = await planIssue(options);
    assert.strictEqual(result.success, true);
    assert.ok(result.value.usage.completion_tokens <= 50);
  });
});
