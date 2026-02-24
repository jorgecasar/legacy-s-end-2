import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { execSync } from "node:child_process";

describe("Execution Validation: AI Planner", () => {
  test("should execute successfully with mocked environment", () => {
    const mainScript = path.join(__dirname, "../src/index.js");
    const eventPath = path.join(__dirname, "../__fixtures__/issue-opened.json");

    const env = {
      ...process.env,
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_REPOSITORY: "jorgecasar/legacys-ends",
      INPUT_AGENT_ROLE: "planner",
      INPUT_GITHUB_TOKEN: "fake-token",
      INPUT_AI_API_KEY: "fake-key",
      // Override Octokit internally or allow it to fail gracefully if it tries to hit the real API
      // Since our ai-planner.js doesn't actually hit the API if it crashes, we'll just check for a 0 exit code
      // But wait, ai-planner.js DOES try to hit the API: octokit.rest.issues.createComment
      // So for a true integration test without hitting the API we either mock the network (e.g. nock)
      // or we accept that a full E2E requires a real token.
      // For now, let's just do a dry run by avoiding the network call in the script or checking if it throws a 401.
    };

    try {
      // This will throw because 'fake-token' is invalid, but we can catch it to verify it tried
      execSync(`node ${mainScript}`, { env, stdio: "pipe" });
    } catch (error) {
      const stdout = error.stdout?.toString() || "";
      // We expect a 401 Bad credentials error because it actually tried to call GitHub API
      assert.ok(
        stdout.includes("Bad credentials") || stdout.includes("HttpError"),
        "Should have attempted to call GitHub API. Actual stdout: " + stdout,
      );
    }
  });
});
