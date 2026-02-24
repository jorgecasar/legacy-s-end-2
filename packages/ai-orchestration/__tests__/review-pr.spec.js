import assert from "node:assert";
import { describe, test } from "node:test";
import { reviewPR } from "../src/review-pr/main.js";

describe("CI Script: AI Reviewer", () => {
	test("should initialize review using configured prompts", async () => {
		const MockOctokit = class {
			constructor() {
				this.rest = {};
			}
		};

		const options = {
			token: "fake-token",
			owner: "jorgecasar",
			repo: "legacys-ends",
			pullNumber: 789,
			diff: "some code changes",
		};

		const result = await reviewPR(options, { Octokit: MockOctokit });

		assert.strictEqual(result.success, true);
		assert.strictEqual(result.approved, true);
		assert.ok(result.systemPrompt.includes("Senior Architect"));
		assert.ok(result.userPrompt.includes("some code changes"));
	});
});
