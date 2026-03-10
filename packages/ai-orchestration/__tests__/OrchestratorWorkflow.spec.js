import assert from "node:assert";
import { describe, mock, test } from "node:test";
import { OrchestratorWorkflow } from "../src/use-cases/orchestrate/OrchestratorWorkflow.js";

describe("Workflow: OrchestratorWorkflow", () => {
  test("should run triage and selection successfully", async () => {
    const ciProvider = {
      info: mock.fn(),
      warning: mock.fn(),
      setOutput: mock.fn(),
    };
    const gitProvider = {
      listIssues: mock.fn(async () => []),
      listSubIssues: mock.fn(async () => []),
    };
    const projectManager = {
      getProjectItems: mock.fn(async () => [
        { id: "1", number: 1, fields: { Status: "Ready", Phase: "Phase 1" } },
      ]),
      addItemToProject: mock.fn(),
      updateCustomField: mock.fn(),
      updateItemStatus: mock.fn(),
    };
    const aiProvider = {
      generateContent: mock.fn(),
    };

    const result = await OrchestratorWorkflow({
      ciProvider,
      gitProvider,
      projectManager,
      aiProvider,
      model: "test-model",
      owner: "o",
      repo: "r",
      projectId: "p1",
      wipLimit: 5,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.selected, true);
    assert.strictEqual(result.value.task.id, "1");
    // Verify sequence: triage called, then select
    assert.ok(projectManager.getProjectItems.mock.callCount() >= 2);
    assert.strictEqual(ciProvider.setOutput.mock.callCount(), 2); // task_number and task_id
  });

  test("should handle missing projectId", async () => {
    const ciProvider = {
      info: mock.fn(),
      warning: mock.fn(),
      setOutput: mock.fn(),
    };
    const result = await OrchestratorWorkflow({ ciProvider, projectId: null });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Missing projectId"));
  });
});
