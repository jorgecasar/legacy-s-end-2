import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { MockGitCliAdapter } from "../src/infrastructure/adapters/MockGitCliAdapter.js";

describe("MockGitCliAdapter", () => {
  let adapter;

  beforeEach(() => {
    adapter = new MockGitCliAdapter();
  });

  it("should initialize with correct default values", () => {
    assert.deepStrictEqual(adapter.commandsExecuted, []);
    assert.strictEqual(adapter.getCurrentBranch(), "main");
    assert.strictEqual(adapter.hasChangesMock, false);
    assert.strictEqual(adapter.rebaseSuccessMock, true);
    assert.strictEqual(adapter.branchExistsMock, false);
  });

  it("should simulate configAuthor", () => {
    adapter.configAuthor("Test Name", "test@test.com");
    assert.strictEqual(adapter.commandsExecuted.length, 2);
    assert.ok(adapter.commandsExecuted[0].includes('user.name "Test Name"'));
    assert.ok(adapter.commandsExecuted[1].includes('user.email "test@test.com"'));
  });

  it("should simulate branchExistsRemotely using branchExistsMock", () => {
    adapter.branchExistsMock = true;
    const exists = adapter.branchExistsRemotely("feature");
    assert.strictEqual(exists, true);
    assert.ok(adapter.commandsExecuted[0].includes('ls-remote --heads origin "feature"'));
  });

  it("should simulate fetch", () => {
    adapter.fetch("origin");
    assert.ok(adapter.commandsExecuted[0] === "git fetch origin");

    adapter.fetch("origin", "main");
    assert.ok(adapter.commandsExecuted[1] === "git fetch origin main");
  });

  it("should simulate resetHard", () => {
    adapter.resetHard("origin/main");
    assert.ok(adapter.commandsExecuted[0] === "git reset --hard origin/main");
  });

  it("should simulate checkout and update current branch", () => {
    adapter.checkout("new-branch", true, true);
    assert.strictEqual(adapter.getCurrentBranch(), "new-branch");
    assert.ok(adapter.commandsExecuted[0] === 'git checkout --force -b "new-branch"');

    adapter.checkout("other", false, false);
    assert.ok(adapter.commandsExecuted[1] === 'git checkout "other"');
  });

  it("should simulate rebase using rebaseSuccessMock", () => {
    let result = adapter.rebase("main");
    assert.ok(adapter.commandsExecuted[0] === "git rebase main");
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.hasConflicts, false);

    adapter.rebaseSuccessMock = false;
    result = adapter.rebase("dev");
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.hasConflicts, true);
  });

  it("should simulate abortRebase", () => {
    adapter.abortRebase();
    assert.ok(adapter.commandsExecuted[0] === "git rebase --abort");
  });

  it("should simulate hasChanges using hasChangesMock", () => {
    adapter.hasChangesMock = true;
    const hasChanges = adapter.hasChanges();
    assert.strictEqual(hasChanges, true);
    assert.ok(adapter.commandsExecuted[0] === "git status --porcelain");
  });

  it("should simulate stageAll", () => {
    adapter.stageAll();
    assert.ok(adapter.commandsExecuted[0] === "git add .");
  });

  it("should simulate squashOnto", () => {
    adapter.squashOnto("main");
    assert.ok(adapter.commandsExecuted[0] === "git reset --soft main");
  });

  it("should simulate commit", () => {
    adapter.commit("Fix bug");
    assert.ok(adapter.commandsExecuted[0] === 'git commit --no-verify -m "Fix bug"');

    adapter.commit("Fix bug config", false);
    assert.ok(adapter.commandsExecuted[1] === 'git commit  -m "Fix bug config"');
  });

  it("should simulate pushForce", () => {
    adapter.pushForce("main");
    assert.ok(adapter.commandsExecuted[0] === 'git push origin "main" --force --no-verify');
  });

  it("should simulate runVerification", () => {
    const result = adapter.runVerification();
    assert.strictEqual(result.success, true);
    assert.ok(adapter.commandsExecuted.includes("npm run test"));
  });
});
