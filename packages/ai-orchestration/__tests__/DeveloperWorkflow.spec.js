import assert from "node:assert";
import { describe, test } from "node:test";
import { MockAIAdapter } from "../src/infrastructure/adapters/MockAIAdapter.js";
import { MockCIAdapter } from "../src/infrastructure/adapters/MockCIAdapter.js";
import { MockGitCliAdapter } from "../src/infrastructure/adapters/MockGitCliAdapter.js";
import { MockGitHubAdapter } from "../src/infrastructure/adapters/MockGitHubAdapter.js";
import { DeveloperWorkflow } from "../src/use-cases/implement-issue/DeveloperWorkflow.js";

describe("Workflow: DeveloperWorkflow", () => {
  test("should fetch full context including review comments and summaries", async () => {
    // 1. Setup Mocks
    const ciProvider = new MockCIAdapter(
      { gh_token: "fake-token" },
      {
        payload: { issue: { number: 7 } },
        owner: "jorgecasar",
        repo: "legacys-end-2",
      },
    );

    const gitProvider = new MockGitHubAdapter();
    // Simulate PR metadata in issue
    gitProvider.getIssue = async () => ({
      number: 7,
      title: "Fix auth",
      body: "Issue description",
      pull_request: {},
    });

    gitProvider.getPullRequestMetadata = async () => ({
      head: { ref: "fix/auth-bug" },
    });

    // Populate comments
    gitProvider.memory.comments = [
      { issueNumber: 7, user: { login: "user1" }, body: "Standard comment" },
    ];
    gitProvider.memory.reviewComments = [
      {
        pullNumber: 7,
        user: { login: "reviewer1" },
        path: "src/auth.js",
        line: 10,
        body: "Change this line",
      },
    ];
    gitProvider.listReviews = async () => [
      {
        state: "CHANGES_REQUESTED",
        user: { login: "reviewer1" },
        body: "Please fix the requested changes",
      },
    ];

    const aiProvider = new MockAIAdapter();
    const gitClient = new MockGitCliAdapter();
    const fileExecutor = { execute: async () => 0 };

    // 2. Execute Workflow
    const result = await DeveloperWorkflow({
      ciProvider,
      gitProvider,
      aiProvider,
      gitClient,
      fileExecutor,
      model: "mock-model",
      owner: "jorgecasar",
      repo: "legacys-end-2",
      payload: ciProvider.getEventContext().payload,
      maxInputTokens: 200000,
      maxOutputTokens: 200000,
      simulationMode: true,
      useMock: true,
    });

    // 3. Assertions
    assert.strictEqual(result.success, true);

    // Check if logs show discovery
    assert.ok(ciProvider.logs.info.some((m) => m.includes("Found 1 standard comments")));
    assert.ok(ciProvider.logs.info.some((m) => m.includes("Found 1 review comments")));
    assert.ok(ciProvider.logs.info.some((m) => m.includes("Found 1 review summaries")));
    assert.ok(ciProvider.logs.info.some((m) => m.includes("Detected PR branch: fix/auth-bug")));
  });

  test("should handle tasks without PR metadata", async () => {
    const ciProvider = new MockCIAdapter(
      { gh_token: "fake-token" },
      {
        payload: { issue: { number: 8 } },
        owner: "jorgecasar",
        repo: "legacys-end-2",
      },
    );

    const gitProvider = new MockGitHubAdapter();
    gitProvider.getIssue = async () => ({
      number: 8,
      title: "New feature",
      body: "Feature description",
      // No pull_request object
    });

    const aiProvider = new MockAIAdapter();
    const gitClient = new MockGitCliAdapter();
    const fileExecutor = { execute: async () => 0 };

    const result = await DeveloperWorkflow({
      ciProvider,
      gitProvider,
      aiProvider,
      gitClient,
      fileExecutor,
      model: "mock-model",
      owner: "jorgecasar",
      repo: "legacys-end-2",
      payload: ciProvider.getEventContext().payload,
      maxInputTokens: 200000,
      maxOutputTokens: 200000,
      simulationMode: true,
      useMock: true,
    });

    assert.strictEqual(result.success, true);
    assert.ok(!ciProvider.logs.info.some((m) => m.includes("Detected PR branch")));
  });
});
