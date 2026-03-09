import assert from "node:assert";
import { describe, it, test } from "node:test";
import { MockGitHubAdapter } from "../src/infrastructure/adapters/MockGitHubAdapter.js";
import {
  REPORT_SIGNATURE,
  removeCostReport,
  trackCostReport,
} from "../src/use-cases/track-cost-report/main.js";

describe("removeCostReport", () => {
  it("should remove the cost report block with markers", () => {
    const input =
      "Original text\n<!-- ai-cost-report-start -->\n## 💰 AI Usage & Cost Report\n| Row |\n_Updated automatically by AI Orchestration_\n<!-- ai-cost-report-end -->\nFollowing text";
    const expected = "Original text\nFollowing text";
    assert.strictEqual(removeCostReport(input).value, expected);
  });

  it("should remove multiple report blocks", () => {
    const input =
      "A\n<!-- ai-cost-report-start -->...<!-- ai-cost-report-end -->\nB\n<!-- ai-cost-report-start -->...<!-- ai-cost-report-end -->\nC";
    const expected = "A\nB\nC";
    assert.strictEqual(removeCostReport(input).value, expected);
  });

  it("should remove report content based on header and signature if markers are missing", () => {
    const input =
      "A\n## 💰 AI Usage & Cost Report\nSomething\n_Updated automatically by AI Orchestration_\nB";
    const expected = "A\nB";
    assert.strictEqual(removeCostReport(input).value, expected);
  });

  it("should remove rogue markers", () => {
    const input = "A<!-- ai-usage-report -->B<!-- ai-triage-end -->C";
    const expected = "ABC";
    assert.strictEqual(removeCostReport(input).value, expected);
  });

  it("should handle empty or null input", () => {
    assert.strictEqual(removeCostReport("").value, "");
    assert.strictEqual(removeCostReport(null).value, "");
  });
});

describe("trackCostReport", () => {
  let mockGitProvider;
  const mockContext = {
    owner: "test-owner",
    repo: "test-repo",
    issueNumber: 1,
    agent: "TestBot",
    provider: "gemini",
    model: "gemini-2.0-flash",
    usage: { prompt_tokens: 100, completion_tokens: 50 },
  };

  test("should create a new cost report comment if none exists", async () => {
    mockGitProvider = new MockGitHubAdapter();
    const result = await trackCostReport(mockGitProvider, mockContext);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.isUpdate, false);
    assert.strictEqual(mockGitProvider.memory.comments.length, 1);
    assert.ok(mockGitProvider.memory.comments[0].body.includes(REPORT_SIGNATURE));
    assert.ok(mockGitProvider.memory.comments[0].body.includes("TestBot"));
    assert.ok(mockGitProvider.memory.comments[0].body.includes("gemini-2.0-flash"));
  });

  test("should update an existing cost report comment by appending a new row", async () => {
    mockGitProvider = new MockGitHubAdapter();

    // Create initial comment
    await trackCostReport(mockGitProvider, mockContext);
    const initialComment = mockGitProvider.memory.comments[0];
    // Mock the id assignment usually done by GitHub
    initialComment.id = 123;

    // Actually mutate the memory on update
    mockGitProvider.updateComment = async (owner, repo, id, body) => {
      const idx = mockGitProvider.memory.comments.findIndex((c) => c.id === id);
      if (idx !== -1) mockGitProvider.memory.comments[idx].body = body;
    };

    // Add a new row via second call
    const context2 = { ...mockContext, model: "gemini-1.5-pro" };
    const result = await trackCostReport(mockGitProvider, context2);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.isUpdate, true);
    assert.strictEqual(result.value.commentId, 123);
    assert.strictEqual(mockGitProvider.memory.comments.length, 1);

    const updatedBody = mockGitProvider.memory.comments[0].body;
    if (!updatedBody.includes("gemini-2.0-flash")) {
      console.log("== UPDATED BODY IS MISSING FIRST ROW! ==");
      console.log(updatedBody);
    }
    assert.ok(updatedBody.includes("gemini-2.0-flash")); // First row kept
    assert.ok(updatedBody.includes("gemini-1.5-pro")); // Second row added
  });

  test("should catch 403 API permission errors and gracefully skip tracking", async () => {
    mockGitProvider = new MockGitHubAdapter();

    mockGitProvider.listComments = async () => {
      const err = new Error("Resource not accessible by integration");
      err.status = 403;
      throw err;
    };

    const result = await trackCostReport(mockGitProvider, mockContext);

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("GITHUB_TOKEN lacks 'issues:write' permissions"));
  });

  test("should catch standard errors and gracefully return an error object", async () => {
    mockGitProvider = new MockGitHubAdapter();

    mockGitProvider.listComments = async () => {
      throw new Error("Standard timeout error");
    };

    const result = await trackCostReport(mockGitProvider, mockContext);

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Failed to update cost tracking comment"));
  });

  test("fallback to creating duplicate comment if updating fails mid-flight", async () => {
    mockGitProvider = new MockGitHubAdapter();
    // Pre-populate with a comment
    mockGitProvider.memory.comments.push({
      id: 999,
      issueNumber: 1,
      body: REPORT_SIGNATURE + "\n| Some | Data |",
    });

    // Hardcode update to explicitly throw
    mockGitProvider.updateComment = async () => {
      throw new Error("Lock timeout");
    };

    const result = await trackCostReport(mockGitProvider, mockContext);

    // It should have caught the mock error, then fallen back to createComment
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.isUpdate, false);
    // 1 original un-updateable comment + 1 newly created comment
    assert.strictEqual(mockGitProvider.memory.comments.length, 2);
  });
});
