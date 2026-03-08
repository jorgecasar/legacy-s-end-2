import assert from "node:assert";
import { afterEach, beforeEach, describe, test } from "node:test";
import { GitHubActionsAdapter } from "../src/infrastructure/adapters/GitHubActionsAdapter.js";

describe("GitHubActionsAdapter", () => {
  let adapter;
  let originalEnv;
  let originalStdout;
  let capturedStdout;

  beforeEach(() => {
    adapter = new GitHubActionsAdapter();
    originalEnv = { ...process.env };

    capturedStdout = "";
    originalStdout = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk, encoding, callback) => {
      capturedStdout += chunk.toString();
      if (callback) callback();
      return true;
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    process.stdout.write = originalStdout;
  });

  test("should delegate info to core.info", () => {
    adapter.info("test message");
    assert.ok(capturedStdout.includes("test message"));
  });

  test("should delegate warning to core.warning", () => {
    adapter.warning("test warning");
    assert.ok(capturedStdout.includes("test warning") || capturedStdout.includes("warning"));
  });

  test("should delegate error to core.error", () => {
    adapter.error("test error");
    assert.ok(capturedStdout.includes("test error") || capturedStdout.includes("error"));
  });

  test("should delegate setFailed to core.setFailed", () => {
    const originalExitCode = process.exitCode;
    adapter.setFailed("test failure");
    assert.ok(capturedStdout.includes("test failure"));
    // core.setFailed sets process.exitCode = 1
    assert.strictEqual(process.exitCode, 1);
    process.exitCode = originalExitCode;
  });

  test("should retrieve value using core.getInput (INPUT_ mapping)", () => {
    process.env.INPUT_MY_INPUT = "core_value";
    const val = adapter.getInput("my_input");
    assert.strictEqual(val, "core_value");
  });

  test("should fallback to process.env if core.getInput returns empty", () => {
    // Ensure core doesn't find it
    delete process.env.INPUT_MY_INPUT;
    process.env.MY_INPUT = "fallback_value";

    const val = adapter.getInput("my_input");
    assert.strictEqual(val, "fallback_value");
  });

  test("should enforce required check if fallback also empty", () => {
    delete process.env.INPUT_MY_INPUT;
    delete process.env.MY_INPUT;

    assert.throws(() => {
      adapter.getInput("my_input", { required: true });
    });
  });
});
