import assert from "node:assert";
import { execSync } from "node:child_process";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Execution Validation: AI Reviewer (review-pr)", () => {
  test("should execute successfully with mocked environment", () => {
    const mainScript = path.join(__dirname, "../src/index.js");
    const eventPath = path.join(__dirname, "../__fixtures__/pr-opened.json");

    const env = {
      ...process.env,
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_REPOSITORY: "jorgecasar/legacys-ends",
      INPUT_AGENT_ROLE: "reviewer",
      INPUT_GITHUB_TOKEN: "fake-token",
      INPUT_AI_API_KEY: "fake-key",
    };

    try {
      execSync(`node ${mainScript}`, { env, stdio: "pipe" });
    } catch (error) {
      const stdout = error.stdout?.toString() || "";
      // It attempts to fetch a diff with octokit.rest.pulls.get
      assert.ok(
        stdout.includes("Bad credentials") ||
          stdout.includes("HttpError") ||
          stdout.includes("Not Found"),
        "Should have attempted to call GitHub API. Actual stdout: " + stdout,
      );
    }
  });
});
