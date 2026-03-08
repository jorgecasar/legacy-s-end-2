import assert from "node:assert";
import child_process from "node:child_process";
import { describe, mock, test } from "node:test";
import { GitCliAdapter } from "../src/infrastructure/adapters/GitCliAdapter.js";

describe("Infrastructure: GitCliAdapter", () => {
  const adapter = new GitCliAdapter();

  test("configAuthor should execute correct git commands", () => {
    const execSyncMock = mock.method(child_process, "execSync", () => Buffer.from(""));
    adapter.configAuthor("Test User", "test@user.com");
    assert.strictEqual(execSyncMock.mock.callCount(), 2);
    assert.ok(execSyncMock.mock.calls[0].arguments[0].includes('user.name "Test User"'));
    assert.ok(execSyncMock.mock.calls[1].arguments[0].includes('user.email "test@user.com"'));
  });

  test("branchExistsRemotely should return true if branch exists", () => {
    mock.method(child_process, "execSync", () => Buffer.from("refs/heads/main"));
    const exists = adapter.branchExistsRemotely("main");
    assert.strictEqual(exists, true);
  });

  test("branchExistsRemotely should return false if branch does not exist", () => {
    mock.method(child_process, "execSync", () => {
      throw new Error("Command failed");
    });
    const exists = adapter.branchExistsRemotely("unknown");
    assert.strictEqual(exists, false);
  });

  test("fetch should call git fetch with defaults", () => {
    const execSyncMock = mock.method(child_process, "execSync", () => Buffer.from(""));
    adapter.fetch();
    assert.ok(execSyncMock.mock.calls[0].arguments[0].includes("git fetch origin"));
  });

  test("fetch should call git fetch with branch", () => {
    const execSyncMock = mock.method(child_process, "execSync", () => Buffer.from(""));
    adapter.fetch("origin", "main");
    assert.ok(execSyncMock.mock.calls[0].arguments[0].includes("git fetch origin main"));
  });

  test("resetHard should construct correct command", () => {
    const execSyncMock = mock.method(child_process, "execSync", () => Buffer.from(""));
    adapter.resetHard("origin/main");
    assert.ok(execSyncMock.mock.calls[0].arguments[0].includes("git reset --hard origin/main"));
  });

  test("checkout should create a branch if create=true", () => {
    const execSyncMock = mock.method(child_process, "execSync", () => Buffer.from(""));
    adapter.checkout("new-branch", true);
    assert.ok(execSyncMock.mock.calls[0].arguments[0].includes('git checkout -b "new-branch"'));
  });

  test("checkout should handle standard checkout if create=false", () => {
    const execSyncMock = mock.method(child_process, "execSync", () => Buffer.from(""));
    adapter.checkout("existing-branch", false);
    assert.ok(execSyncMock.mock.calls[0].arguments[0].includes('git checkout "existing-branch"'));
  });

  test("checkout should recover via stash if checkout fails", () => {
    let callCount = 0;
    const execSyncMock = mock.method(child_process, "execSync", (_cmd) => {
      callCount++;
      if (callCount === 1) {
        throw new Error("Local changes"); // Fails first checkout
      }
      return Buffer.from("");
    });

    adapter.checkout("existing-branch", false);
    // Should have called: checkout (fails), stash, checkout (succeeds), stash pop
    assert.strictEqual(execSyncMock.mock.callCount(), 4);
    assert.ok(execSyncMock.mock.calls[1].arguments[0].includes("git stash"));
    assert.ok(execSyncMock.mock.calls[2].arguments[0].includes('git checkout "existing-branch"'));
    assert.ok(execSyncMock.mock.calls[3].arguments[0].includes("git stash pop"));
  });

  test("checkout should catch stash pop conflicts", () => {
    let callCount = 0;
    const execSyncMock = mock.method(child_process, "execSync", (cmd) => {
      callCount++;
      if (callCount === 1) {
        throw new Error("Local changes"); // Fails first checkout
      }
      if (cmd.includes("stash pop")) {
        throw new Error("Conflict"); // Fails stash pop
      }
      return Buffer.from("");
    });

    // Should not bubble up the error
    assert.doesNotThrow(() => {
      adapter.checkout("existing-branch", false);
    });
    assert.strictEqual(execSyncMock.mock.callCount(), 4);
  });

  test("rebase should return success on clean rebase", () => {
    mock.method(child_process, "execSync", () => Buffer.from(""));
    const result = adapter.rebase("main");
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.hasConflicts, false);
  });

  test("rebase should catch errors and return conflict true", () => {
    mock.method(child_process, "execSync", () => {
      throw new Error("Conflict");
    });
    const result = adapter.rebase("main");
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.hasConflicts, true);
  });

  test("abortRebase should call rebase --abort without crashing if it fails", () => {
    mock.method(child_process, "execSync", () => {
      throw new Error("No rebase in progress");
    });
    assert.doesNotThrow(() => {
      adapter.abortRebase();
    });
  });

  test("getCurrentBranch should return standard branch name", () => {
    mock.method(child_process, "execSync", () => Buffer.from("feature-branch\n"));
    const branch = adapter.getCurrentBranch();
    assert.strictEqual(branch, "feature-branch");
  });

  test("hasChanges should return true if changes exist", () => {
    mock.method(child_process, "execSync", () => Buffer.from(" M src/file.js"));
    const hasChanges = adapter.hasChanges();
    assert.strictEqual(hasChanges, true);
  });

  test("hasChanges should return false if no changes exist", () => {
    mock.method(child_process, "execSync", () => Buffer.from(""));
    const hasChanges = adapter.hasChanges();
    assert.strictEqual(hasChanges, false);
  });

  test("stageAll should call git add .", () => {
    const execSyncMock = mock.method(child_process, "execSync", () => Buffer.from(""));
    adapter.stageAll();
    assert.ok(execSyncMock.mock.calls[0].arguments[0].includes("git add ."));
  });

  test("squashOnto should reset soft to target", () => {
    const execSyncMock = mock.method(child_process, "execSync", () => Buffer.from(""));
    adapter.squashOnto("main");
    assert.ok(execSyncMock.mock.calls[0].arguments[0].includes("git reset --soft main"));
  });

  test("commit should respect skipVerify flag", () => {
    const execSyncMock = mock.method(child_process, "execSync", () => Buffer.from(""));
    adapter.commit("my msg", true);
    assert.ok(execSyncMock.mock.calls[0].arguments[0].includes("--no-verify"));

    adapter.commit("my msg", false);
    assert.ok(!execSyncMock.mock.calls[1].arguments[0].includes("--no-verify"));
  });

  test("pushForce should force push branch", () => {
    const execSyncMock = mock.method(child_process, "execSync", () => Buffer.from(""));
    adapter.pushForce("main");
    assert.ok(execSyncMock.mock.calls[0].arguments[0].includes('git push origin "main" --force'));
  });

  test("runVerification should return output and correct status", () => {
    let calls = 0;
    mock.method(child_process, "execSync", () => {
      calls++;
      if (calls === 1) return Buffer.from("lint success");
      return Buffer.from("");
    });

    const result = adapter.runVerification();
    assert.strictEqual(result.success, true);
    assert.ok(result.output.includes("lint success"));
  });

  test("runVerification should capture errors and set success false", () => {
    mock.method(child_process, "execSync", () => {
      const err = new Error("Command failed");
      err.stdout = "lint failed output";
      err.stderr = "error traces";
      throw err;
    });

    const result = adapter.runVerification();
    assert.strictEqual(result.success, false);
    assert.ok(result.output.includes("lint failed output"));
    assert.ok(result.output.includes("error traces"));
  });
});
