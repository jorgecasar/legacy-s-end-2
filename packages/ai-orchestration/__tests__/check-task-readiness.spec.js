import assert from "node:assert";
import { describe, test } from "node:test";
import { MockGitHubAdapter } from "../src/infrastructure/adapters/MockGitHubAdapter.js";
import { checkTaskReadiness } from "../src/use-cases/check-task-readiness/main.js";

describe("UseCase: checkTaskReadiness", () => {
  test("should return ready if no blockers found", async () => {
    const gitProvider = new MockGitHubAdapter();
    const result = await checkTaskReadiness(gitProvider, { owner: "o", repo: "r", issueNumber: 1 });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.ready, true);
  });

  test("should return not ready if open blockers are found", async () => {
    const gitProvider = new MockGitHubAdapter();
    gitProvider.getIssue = async (owner, repo, num) => {
      if (num === 1) return { number: 1, body: "blocked by #2", state: "open" };
      if (num === 2) return { number: 2, state: "open" };
    };

    const result = await checkTaskReadiness(gitProvider, { owner: "o", repo: "r", issueNumber: 1 });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.ready, false);
    assert.ok(result.value.reason.includes("#2"));
  });

  test("should return ready if all blockers are closed", async () => {
    const gitProvider = new MockGitHubAdapter();
    gitProvider.getIssue = async (owner, repo, num) => {
      if (num === 1) return { number: 1, body: "depends on #2", state: "open" };
      if (num === 2) return { number: 2, state: "closed" };
    };

    const result = await checkTaskReadiness(gitProvider, { owner: "o", repo: "r", issueNumber: 1 });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.ready, true);
  });

  test("should handle failed blocker fetch with a warning", async () => {
    const gitProvider = new MockGitHubAdapter();
    gitProvider.getIssue = async (owner, repo, num) => {
      if (num === 1) return { number: 1, body: "blocked by #2", state: "open" };
      if (num === 2) throw new Error("API Limit");
    };

    let warningLogged = false;
    const result = await checkTaskReadiness(
      gitProvider,
      { owner: "o", repo: "r", issueNumber: 1 },
      undefined,
      (status) => {
        if (status.type === "warning") warningLogged = true;
      },
    );

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.ready, true);
    assert.ok(warningLogged);
  });

  test("should return ready with warning if main issue is 404", async () => {
    const gitProvider = new MockGitHubAdapter();
    gitProvider.getIssue = async () => {
      const err = new Error("Not found");
      err.status = 404;
      throw err;
    };

    const result = await checkTaskReadiness(gitProvider, { owner: "o", repo: "r", issueNumber: 1 });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.ready, true);
    assert.ok(result.value.warning.includes("caution"));
  });

  test("should return failure for generic errors", async () => {
    const gitProvider = new MockGitHubAdapter();
    gitProvider.getIssue = async () => {
      throw new Error("Generic Error");
    };

    const result = await checkTaskReadiness(gitProvider, { owner: "o", repo: "r", issueNumber: 1 });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Generic Error"));
  });
});
