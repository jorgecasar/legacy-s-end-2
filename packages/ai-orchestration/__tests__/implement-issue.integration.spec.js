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
      NODE_ENV: "test",
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_REPOSITORY: "jorgecasar/legacys-ends",
      INPUT_AGENT_ROLE: "developer",
      INPUT_GITHUB_TOKEN: "fake-token",
    };

    const stdout = execSync(`node ${mainScript}`, { env, stdio: "pipe" }).toString();

    assert.ok(
      stdout.includes("--- AI CALL SIMULATION (DEVELOPER) ---"),
      "Should have triggered developer simulation",
    );
    assert.ok(
      stdout.includes("Detailed implementation simulation"),
      "Should have produced simulated response",
    );
    assert.ok(
      stdout.includes("ESTIMATED API COST: $0 USD"),
      "Should report simulated cost in logs",
    );
    assert.ok(
      stdout.includes("[COST REPORT SIMULATION] Updating table with: | Developer |"),
      "Should simulate cost table update",
    );
  });
});
