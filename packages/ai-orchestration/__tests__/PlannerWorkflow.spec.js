import assert from "node:assert";
import { describe, test } from "node:test";
import { MockAIAdapter } from "../src/infrastructure/adapters/MockAIAdapter.js";
import { MockCIAdapter } from "../src/infrastructure/adapters/MockCIAdapter.js";
import { MockGitHubAdapter } from "../src/infrastructure/adapters/MockGitHubAdapter.js";
import { PlannerWorkflow } from "../src/use-cases/plan-issue/PlannerWorkflow.js";

describe("Workflow: PlannerWorkflow", () => {
  test("should skip if not triggered by label or manual dispatch", async () => {
    const ciProvider = new MockCIAdapter({}, { eventName: "push", payload: {} });
    const result = await PlannerWorkflow({
      ciProvider,
      gitProvider: new MockGitHubAdapter(),
      aiProvider: new MockAIAdapter(),
      owner: "o",
      repo: "r",
      payload: {},
      eventName: "push",
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.skipped, true);
  });

  test("should return error if issue number cannot be determined", async () => {
    const ciProvider = new MockCIAdapter({}, { eventName: "workflow_dispatch", payload: {} });
    const result = await PlannerWorkflow({
      ciProvider,
      gitProvider: new MockGitHubAdapter(),
      aiProvider: new MockAIAdapter(),
      owner: "o",
      repo: "r",
      payload: {},
      eventName: "workflow_dispatch",
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Could not determine issue number"));
  });

  test("should fetch issue details if isManual and title is missing", async () => {
    const ciProvider = new MockCIAdapter(
      { issue_number: "123" },
      { eventName: "workflow_dispatch", payload: {} },
    );
    const gitProvider = new MockGitHubAdapter();
    let fetchCalled = false;
    gitProvider.getIssue = async () => {
      fetchCalled = true;
      return { number: 123, title: "Fetched Title", body: "Fetched Body" };
    };

    const result = await PlannerWorkflow({
      ciProvider,
      gitProvider,
      aiProvider: new MockAIAdapter(),
      owner: "o",
      repo: "r",
      payload: {},
      eventName: "workflow_dispatch",
      availableProviders: ["gemini"],
      model: "simulation",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(fetchCalled, true);
  });

  test("should return failure if planIssue fails", async () => {
    const ciProvider = new MockCIAdapter(
      { issue_number: "123" },
      { eventName: "workflow_dispatch" },
    );
    const aiProvider = new MockAIAdapter();
    aiProvider.generateContent = async () => {
      throw new Error("AI Down");
    };

    const result = await PlannerWorkflow({
      ciProvider,
      gitProvider: new MockGitHubAdapter(),
      aiProvider,
      owner: "o",
      repo: "r",
      payload: {},
      eventName: "workflow_dispatch",
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "AI Down");
  });
});
