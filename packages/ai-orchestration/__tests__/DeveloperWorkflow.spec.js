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

  test("should handle missing issue number gracefully", async () => {
    const ciProvider = new MockCIAdapter(
      { gh_token: "fake-token" },
      { payload: {}, owner: "jorgecasar", repo: "legacys-end-2" },
    );
    const result = await DeveloperWorkflow({
      ciProvider,
      gitProvider: new MockGitHubAdapter(),
      aiProvider: new MockAIAdapter(),
      gitClient: new MockGitCliAdapter(),
      fileExecutor: { execute: async () => 0 },
      model: "mock-model",
      owner: "jorgecasar",
      repo: "legacys-end-2",
      payload: ciProvider.getEventContext().payload,
      maxInputTokens: 200,
      maxOutputTokens: 200,
      simulationMode: true,
      useMock: true,
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Could not determine issue or PR number"));
  });

  test("should skip execution if task readiness returns not ready", async () => {
    const ciProvider = new MockCIAdapter(
      { gh_token: "fake-token" },
      { payload: { issue: { number: 9 } }, owner: "jorgecasar", repo: "legacys-end-2" },
    );

    // Create a mock that returns a blocker in getIssue
    const gitProvider = new MockGitHubAdapter();
    gitProvider.getIssue = async () => ({
      number: 9,
      title: "Blocked Issue",
      body: "- [ ] Blocked by #10",
    });
    // The blocker #10 is open
    const originalGetIssue = gitProvider.getIssue;
    gitProvider.getIssue = async (owner, repo, number) => {
      if (number === 10) return { number: 10, state: "open" };
      return originalGetIssue(owner, repo, number);
    };

    const result = await DeveloperWorkflow({
      ciProvider,
      gitProvider,
      aiProvider: new MockAIAdapter(),
      gitClient: new MockGitCliAdapter(),
      fileExecutor: { execute: async () => 0 },
      model: "mock-model",
      owner: "jorgecasar",
      repo: "legacys-end-2",
      payload: ciProvider.getEventContext().payload,
      maxInputTokens: 200,
      maxOutputTokens: 200,
      simulationMode: true,
      useMock: true,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.skipped, true);
    assert.ok(result.value.reason.includes("Blocked by open issues"));
  });

  test("should create branch, commit, and open PR if changes detected", async () => {
    const ciProvider = new MockCIAdapter(
      { gh_token: "fake-token" },
      { payload: { issue: { number: 11 } }, owner: "jorgecasar", repo: "legacys-end-2" },
    );
    const gitProvider = new MockGitHubAdapter();
    gitProvider.getIssue = async () => ({ number: 11, title: "Feature Title", body: "" });
    gitProvider.listComments = async () => [];
    gitProvider.createComment = async () => ({ id: 123 });

    const gitClient = new MockGitCliAdapter();
    // Force it to take the real git path (useMock = false)
    // Make gitClient think it has changes
    gitClient.hasChanges = () => true;
    gitClient.runVerification = () => ({ success: true, output: "OK" });

    let createdPR = false;
    gitProvider.createPullRequest = async () => {
      createdPR = true;
    };

    const result = await DeveloperWorkflow({
      ciProvider,
      gitProvider,
      gitClient,
      aiProvider: new MockAIAdapter(),
      fileExecutor: { execute: async () => 1 }, // file changed
      model: "mock-model",
      owner: "jorgecasar",
      repo: "legacys-end-2",
      payload: ciProvider.getEventContext().payload,
      maxInputTokens: 20000,
      maxOutputTokens: 20000,
      simulationMode: false,
      useMock: false, // Triggers branch + commit logic
    });

    if (!result.success) console.log("ERROR:", result.error);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.verifySuccess, true);
    assert.strictEqual(createdPR, true);
    assert.ok(ciProvider.logs.info.some((l) => l.includes("Changes detected")));
  });

  test("should loop feeding back errors to AI if verification fails", async () => {
    const ciProvider = new MockCIAdapter(
      { gh_token: "fake-token" },
      { payload: { issue: { number: 12 } }, owner: "jorgecasar", repo: "legacys-end-2" },
    );
    const gitProvider = new MockGitHubAdapter();
    gitProvider.getIssue = async () => ({ number: 12, title: "Loop Issue", body: "" });

    const gitClient = new MockGitCliAdapter();
    gitClient.hasChanges = () => true;

    // Fail verification the first 2 times, succeed on the 3rd
    let verificationCallCount = 0;
    gitClient.runVerification = () => {
      verificationCallCount++;
      if (verificationCallCount < 3) return { success: false, output: "Lint Error" };
      return { success: true, output: "OK" };
    };

    const result = await DeveloperWorkflow({
      ciProvider,
      gitProvider,
      gitClient,
      aiProvider: new MockAIAdapter(),
      fileExecutor: { execute: async () => 0 },
      model: "mock-model",
      owner: "jorgecasar",
      repo: "legacys-end-2",
      payload: ciProvider.getEventContext().payload,
      maxInputTokens: 20000,
      maxOutputTokens: 20000,
      simulationMode: true,
      useMock: false, // Forces loop test logic
    });

    // Log full workflow output to debug verifySuccess state
    if (!result.success || !result.value.verifySuccess) {
      console.log("DeveloperWorkflow loop failed! CallCount:", verificationCallCount);
      console.log("Logs:", ciProvider?.logs);
      console.log("Result:", result);
    }
    if (!result.success) console.log("ERROR:", result.error);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.verifySuccess, true);
    assert.strictEqual(verificationCallCount, 3);
    assert.ok(ciProvider.logs.warning.some((l) => l.includes("Verification failed")));
    assert.ok(ciProvider.logs.info.some((l) => l.includes("Feeding errors back to AI")));
  });
});
