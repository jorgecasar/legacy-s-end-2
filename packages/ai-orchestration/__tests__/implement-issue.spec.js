import assert from "node:assert";
import { describe, test } from "node:test";
import { implementIssue } from "../src/implement-issue/main.js";

describe("CI Script: AI Developer", () => {
  test("should initialize implementation using configured prompts", async () => {
    const MockOctokit = class {
      constructor() {
        this.rest = {};
      }
    };

    const options = {
      token: "fake-token",
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
});
