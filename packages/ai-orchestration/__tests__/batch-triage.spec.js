import assert from "node:assert";
import { describe, mock, test } from "node:test";
import { batchTriage } from "../src/use-cases/batch-triage/main.js";

describe("UseCase: batchTriage", () => {
  test("should triage issues correctly", async () => {
    const gitProvider = {
      listIssues: mock.fn(async () => [
        { number: 1, title: "Issue 1", node_id: "node1", body: "" },
      ]),
      listComments: mock.fn(async () => []),
    };
    const projectManager = {
      getProjectItems: mock.fn(async () => [
        { number: 0, fields: { Phase: "", Priority: "" } }, // Dummy item to define fields
      ]),
      addItemToProject: mock.fn(async () => "item1"),
      updateCustomField: mock.fn(async () => {}),
      updateItemStatus: mock.fn(async () => {}),
    };
    const aiProvider = {
      generateContent: mock.fn(async () => ({
        text: '{ "phase": "Phase 1", "priority": "P0" }',
      })),
    };

    const result = await batchTriage({
      gitProvider,
      projectManager,
      aiProvider,
      model: "test-model",
      owner: "o",
      repo: "r",
      projectId: "p1",
      onStatus: () => {},
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.count, 1);
    assert.strictEqual(projectManager.addItemToProject.mock.callCount(), 1);
    assert.strictEqual(projectManager.updateCustomField.mock.callCount(), 2);
  });

  test("should skip already triaged issues", async () => {
    const gitProvider = {
      listIssues: mock.fn(async () => [{ number: 1 }]),
      listComments: mock.fn(async () => []),
    };
    const projectManager = {
      getProjectItems: mock.fn(async () => [
        { number: 1, fields: { Status: "Backlog", Phase: "Phase 1", Priority: "P1" } },
      ]),
    };

    const result = await batchTriage({
      gitProvider,
      projectManager,
      aiProvider: {},
      model: "test-model",
      owner: "o",
      repo: "r",
      projectId: "p1",
      onStatus: () => {},
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.count, 0);
  });
});
