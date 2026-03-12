import assert from "node:assert";
import { describe, test } from "node:test";
import { MockAIAdapter } from "../src/infrastructure/adapters/MockAIAdapter.js";
import { MockCIAdapter } from "../src/infrastructure/adapters/MockCIAdapter.js";
import { MockGitHubAdapter } from "../src/infrastructure/adapters/MockGitHubAdapter.js";
import { ReviewerWorkflow } from "../src/use-cases/review-pr/ReviewerWorkflow.js";

describe("Workflow: ReviewerWorkflow", () => {
  test("should return error if PR number cannot be determined", async () => {
    const ciProvider = new MockCIAdapter({}, { payload: {} });
    const result = await ReviewerWorkflow({
      ciProvider,
      gitProvider: new MockGitHubAdapter(),
      aiProvider: new MockAIAdapter(),
      owner: "o",
      repo: "r",
      payload: {},
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Could not determine Pull Request number"));
  });

  test("should identify task number from branch name", async () => {
    const ciProvider = new MockCIAdapter({ pull_number: "7" }, { payload: {} });
    const gitProvider = new MockGitHubAdapter();
    gitProvider.getPullRequestMetadata = async () => ({
      head: { ref: "feat/issue-123" },
    });

    const result = await ReviewerWorkflow({
      ciProvider,
      gitProvider,
      aiProvider: new MockAIAdapter(),
      owner: "o",
      repo: "r",
      payload: {},
      model: "simulation",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.taskNumber, 123);
  });

  test("should identify task number from PR body (closes #456)", async () => {
    const ciProvider = new MockCIAdapter({ pull_number: "7" }, { payload: {} });
    const gitProvider = new MockGitHubAdapter();
    gitProvider.getPullRequestMetadata = async () => ({
      body: "This PR closes #456",
      head: { ref: "some-branch" },
    });

    const result = await ReviewerWorkflow({
      ciProvider,
      gitProvider,
      aiProvider: new MockAIAdapter(),
      owner: "o",
      repo: "r",
      payload: {},
      model: "simulation",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.taskNumber, 456);
  });

  test("should handle conversation context with bot comments", async () => {
    const ciProvider = new MockCIAdapter({ pull_number: "7" }, { payload: {} });
    const gitProvider = new MockGitHubAdapter();
    gitProvider.memory.comments = [
      { user: { login: "github-actions[bot]", type: "Bot" }, body: "Old bot report" },
    ];
    gitProvider.memory.reviewComments = [
      { user: { login: "user1" }, path: "main.js", line: 1, body: "Good" },
    ];

    const result = await ReviewerWorkflow({
      ciProvider,
      gitProvider,
      aiProvider: new MockAIAdapter(),
      owner: "o",
      repo: "r",
      payload: {},
      model: "simulation",
    });

    assert.strictEqual(result.success, true);
    // Logic internal check: it should have called gitProvider.listComments and listReviewComments
  });

  test("should return failure if reviewPR fails", async () => {
    const ciProvider = new MockCIAdapter({ pull_number: "7" });
    const aiProvider = new MockAIAdapter();
    aiProvider.generateContent = async () => {
      throw new Error("AI Failure");
    };

    const result = await ReviewerWorkflow({
      ciProvider,
      gitProvider: new MockGitHubAdapter(),
      aiProvider,
      owner: "o",
      repo: "r",
      payload: {},
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "AI Failure");
  });

  test("should automatically approve if CI verification passed", async () => {
    const ciProvider = new MockCIAdapter(
      { pull_number: "7", verification_result: "success" },
      { payload: {} },
    );
    const gitProvider = new MockGitHubAdapter();
    const aiProvider = new MockAIAdapter();

    const result = await ReviewerWorkflow({
      ciProvider,
      gitProvider,
      aiProvider,
      owner: "o",
      repo: "r",
      payload: {},
      model: "simulation",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.reviewEvent, "APPROVE");
    assert.ok(gitProvider.memory.reviews[0].body.includes("CI Verification Passed"));
    // Verify AI was NOT called
    assert.strictEqual(aiProvider.calls.length, 0);
  });

  test("should report failure if CI verification failed", async () => {
    const ciProvider = new MockCIAdapter(
      {
        pull_number: "7",
        verification_result: "failure",
        verification_output: "Linter failed at line 10",
      },
      { payload: {} },
    );
    const gitProvider = new MockGitHubAdapter();
    const aiProvider = new MockAIAdapter();

    const result = await ReviewerWorkflow({
      ciProvider,
      gitProvider,
      aiProvider,
      owner: "o",
      repo: "r",
      payload: {},
      model: "simulation",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.reviewEvent, "COMMENT");
    assert.ok(gitProvider.memory.reviews[0].body.includes("CI Verification Failed"));
    assert.ok(gitProvider.memory.reviews[0].body.includes("Linter failed at line 10"));
    // Verify AI was NOT called
    assert.strictEqual(aiProvider.calls.length, 0);
  });
});
