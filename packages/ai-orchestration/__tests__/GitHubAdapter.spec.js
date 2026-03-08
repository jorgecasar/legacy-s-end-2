import assert from "node:assert";
import { beforeEach, describe, mock, test } from "node:test";
import { GitHubAdapter } from "../src/infrastructure/adapters/GitHubAdapter.js";

describe("Infrastructure: GitHubAdapter", () => {
  let adapter;

  beforeEach(() => {
    adapter = new GitHubAdapter("fake-token");
    adapter.octokit = {
      rest: {
        issues: {
          get: mock.fn(async () => ({ data: { id: 1 } })),
          createComment: mock.fn(async () => ({ data: {} })),
          addLabels: mock.fn(async () => ({ data: {} })),
          update: mock.fn(async () => ({ data: {} })),
          listComments: mock.fn(async () => ({ data: [{ id: 10 }] })),
          updateComment: mock.fn(async () => ({ data: {} })),
          create: mock.fn(async () => ({ data: { number: 2 } })),
          listForRepo: mock.fn(async () => ({ data: [{ number: 1 }] })),
        },
        pulls: {
          get: mock.fn(async () => ({ data: { id: 1 } })),
          listReviewComments: mock.fn(async () => ({ data: [] })),
          listReviews: mock.fn(async () => ({ data: [] })),
          create: mock.fn(async () => ({ data: { number: 3 } })),
          list: mock.fn(async () => ({ data: [] })),
        },
      },
      request: mock.fn(async () => ({ data: [] })),
    };
  });

  test("getIssue should return issue data", async () => {
    const result = await adapter.getIssue("owner", "repo", 1);
    assert.strictEqual(result.id, 1);
    assert.strictEqual(adapter.octokit.rest.issues.get.mock.callCount(), 1);
  });

  test("getPullRequestMetadata should return PR metadata", async () => {
    const result = await adapter.getPullRequestMetadata("owner", "repo", 1);
    assert.strictEqual(result.id, 1);
    assert.strictEqual(adapter.octokit.rest.pulls.get.mock.callCount(), 1);
  });

  test("getPullRequest should return PR diff string", async () => {
    adapter.octokit.rest.pulls.get.mock.mockImplementation(async () => ({
      data: "diff contents",
    }));
    const result = await adapter.getPullRequest("owner", "repo", 1);
    assert.strictEqual(result, "diff contents");
  });

  test("createComment should post comment", async () => {
    await adapter.createComment("owner", "repo", 1, "body");
    assert.strictEqual(adapter.octokit.rest.issues.createComment.mock.callCount(), 1);
  });

  test("addLabels should apply labels", async () => {
    await adapter.addLabels("owner", "repo", 1, ["bug"]);
    assert.strictEqual(adapter.octokit.rest.issues.addLabels.mock.callCount(), 1);
  });

  test("updateMilestone should update parameter", async () => {
    await adapter.updateMilestone("owner", "repo", 1, 2);
    assert.strictEqual(adapter.octokit.rest.issues.update.mock.callCount(), 1);
  });

  test("listComments should return array", async () => {
    const result = await adapter.listComments("owner", "repo", 1);
    assert.strictEqual(result[0].id, 10);
  });

  test("listReviewComments should return array", async () => {
    const result = await adapter.listReviewComments("owner", "repo", 1);
    assert.ok(Array.isArray(result));
  });

  test("listReviews should return array", async () => {
    const result = await adapter.listReviews("owner", "repo", 1);
    assert.ok(Array.isArray(result));
  });

  test("updateComment should update body", async () => {
    await adapter.updateComment("owner", "repo", 123, "new body");
    assert.strictEqual(adapter.octokit.rest.issues.updateComment.mock.callCount(), 1);
  });

  test("createPullRequest should return created PR", async () => {
    const result = await adapter.createPullRequest(
      "owner",
      "repo",
      "title",
      "head",
      "base",
      "body",
    );
    assert.strictEqual(result.number, 3);
  });

  test("createIssue should return created issue", async () => {
    const result = await adapter.createIssue("owner", "repo", {
      title: "title",
    });
    assert.strictEqual(result.number, 2);
  });

  test("addSubIssue should send direct request", async () => {
    await adapter.addSubIssue("owner", "repo", 1, 2);
    assert.strictEqual(adapter.octokit.request.mock.callCount(), 1);
  });

  test("listSubIssues should fetch sub issues via request", async () => {
    const result = await adapter.listSubIssues("owner", "repo", 1);
    assert.ok(Array.isArray(result));
  });

  test("listPullRequests should fetch list", async () => {
    const result = await adapter.listPullRequests("owner", "repo", {});
    assert.ok(Array.isArray(result));
  });

  test("listIssues should fetch issues via listForRepo", async () => {
    const result = await adapter.listIssues("owner", "repo", {});
    assert.strictEqual(result[0].number, 1);
  });
});
