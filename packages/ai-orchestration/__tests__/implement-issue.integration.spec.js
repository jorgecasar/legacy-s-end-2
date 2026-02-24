import assert from "node:assert";
import { execSync } from "node:child_process";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Execution Validation: AI Developer (implement-issue)", () => {
  test("should execute successfully with mocked environment", () => {
    const mainScript = path.join(__dirname, "../src/index.js");
    const eventPath = path.join(__dirname, "../__fixtures__/issue-labeled.json");

    const env = {
      ...process.env,
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_REPOSITORY: "jorgecasar/legacys-ends",
      INPUT_AGENT_ROLE: "developer",
      INPUT_GITHUB_TOKEN: "fake-token",
      INPUT_AI_API_KEY: "fake-key",
    };

    try {
      execSync(`node ${mainScript}`, { env, stdio: "pipe" });
    } catch (error) {
      const stdout = error.stdout?.toString() || "";
      // Expect an authentication/network error rather than a syntax or module error
      // meaning the logic executed up to the API call
      assert.ok(
        stdout.includes("Bad credentials") || stdout.includes("HttpError"),
        "Should have attempted to call GitHub API. Actual stdout: " + stdout,
      );
    }
  });
});
