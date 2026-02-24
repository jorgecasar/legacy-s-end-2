import assert from "node:assert";
import { describe, test } from "node:test";
import { planIssue } from "../src/ai-planner/main.js";

describe("CI Script: AI Planner", () => {
  test("should generate a plan using configured prompts", async () => {
    const MockOctokit = class {
      constructor() {
        this.rest = {
          issues: {
            createComment: async () => {
              return { status: 201 };
            },
          },
        };
      }
    };

    const options = {
      token: "fake-token",
      owner: "jorgecasar",
      repo: "legacys-ends",
      issueNumber: 123,
      issueTitle: "Add New Quest",
      issueBody: "Please implement a new quest for Global Scope.",
    };

    const result = await planIssue(options, { Octokit: MockOctokit });

    assert.strictEqual(result.success, true);
    assert.ok(result.systemPrompt.includes("Senior Product Manager"));
    assert.ok(result.userPrompt.includes("Add New Quest"));
    assert.ok(result.userPrompt.includes("Global Scope"));
    assert.ok(result.plan.includes("AI Planner Proposal"));
  });
});
