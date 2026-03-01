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
      NODE_ENV: "test",
      GITHUB_ACTIONS: "true",
      GITHUB_EVENT_PATH: eventPath,
      GITHUB_REPOSITORY: "jorgecasar/legacys-ends",
      INPUT_AGENT_ROLE: "planner",
      INPUT_GH_TOKEN: "fake-token",
      INPUT_ISSUE_NUMBER: "123",
    };

    const stdout = execSync(`node ${mainScript}`, { env, stdio: "pipe" }).toString();

    assert.ok(
      stdout.includes("--- AI SIMULATION (PLANNER)") ||
        stdout.includes("--- AI EXECUTION (PLANNER)"),
      "Should have triggered planner execution",
    );
    assert.ok(stdout.includes("AI Triage & Planning Report"), "Should have produced triage report");
    assert.ok(
      stdout.includes("ESTIMATED API COST: $0 USD"),
      "Should report simulated cost in logs",
    );
    assert.ok(
      stdout.includes("[COST REPORT SIMULATION] Updating table with plan details."),
      "Should simulate cost table update",
    );
  });
});
