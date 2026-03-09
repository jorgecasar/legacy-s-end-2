import assert from "node:assert";
import { describe, mock, test } from "node:test";
import { Project } from "../src/domain/entities/Project.js";
import { ProjectTask } from "../src/domain/entities/ProjectTask.js";
import { selectNextTask } from "../src/use-cases/select-next-task/main.js";

describe("Entity: ProjectTask", () => {
  test("should correctly initialize with fields", () => {
    const task = new ProjectTask({
      id: "1",
      fields: { Status: "Ready", Phase: "Phase 1", Priority: "P0" },
    });
    assert.strictEqual(task.status, "Ready");
    assert.strictEqual(task.phase, "Phase 1");
    assert.strictEqual(task.priority, "P0");
  });

  test("isActive should return true for In progress and In review", () => {
    const t1 = new ProjectTask({ status: "In progress" });
    const t2 = new ProjectTask({ status: "In review" });
    const t3 = new ProjectTask({ status: "Todo" });
    assert.strictEqual(t1.isActive(), true);
    assert.strictEqual(t2.isActive(), true);
    assert.strictEqual(t3.isActive(), false);
  });

  test("getPriorityScore should correctly weight phase and priority", () => {
    const t1 = new ProjectTask({ phase: "Phase 1", priority: "P0" }); // 1000
    const t2 = new ProjectTask({ phase: "Phase 1", priority: "P1" }); // 1001
    const t3 = new ProjectTask({ phase: "Phase 2", priority: "P0" }); // 2000
    assert.ok(t1.getPriorityScore() < t2.getPriorityScore());
    assert.ok(t2.getPriorityScore() < t3.getPriorityScore());
  });
});

describe("Entity: Project", () => {
  test("selectNextTask should prioritize 'In review' tasks", () => {
    const project = new Project({
      tasks: [
        { id: "1", status: "Ready", phase: "Phase 1", priority: "P0" },
        { id: "2", status: "In review", phase: "Phase 2", priority: "P1" },
      ],
    });
    const selected = project.selectNextTask();
    assert.strictEqual(selected.id, "2");
  });

  test("selectNextTask should respect WIP limits for 'In progress'", () => {
    const project = new Project({
      wipLimit: 1,
      tasks: [
        { id: "1", status: "In progress" },
        { id: "2", status: "Ready" },
      ],
    });
    const selected = project.selectNextTask();
    assert.strictEqual(selected, null);
  });
});

describe("UseCase: selectNextTask", () => {
  test("should successfully select a task", async () => {
    const mockProjectManager = {
      getProjectItems: mock.fn(async () => [
        { id: "1", number: 1, fields: { Status: "Ready", Phase: "Phase 1" } },
      ]),
      updateItemStatus: mock.fn(async () => {}),
    };
    const mockGitProvider = {
      listSubIssues: mock.fn(async () => []),
    };

    const result = await selectNextTask({
      projectManager: mockProjectManager,
      gitProvider: mockGitProvider,
      owner: "owner",
      repo: "repo",
      projectId: "proj1",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.selected, true);
    assert.strictEqual(result.value.task.id, "1");
  });

  test("should automatically unblock tasks with closed sub-issues", async () => {
    const mockProjectManager = {
      getProjectItems: mock.fn(async () => [{ id: "1", number: 1, fields: { Status: "Blocked" } }]),
      updateItemStatus: mock.fn(async () => {}),
    };
    const mockGitProvider = {
      listSubIssues: mock.fn(async () => [{ state: "closed" }]),
    };

    const result = await selectNextTask({
      projectManager: mockProjectManager,
      gitProvider: mockGitProvider,
      owner: "owner",
      repo: "repo",
      projectId: "proj1",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.selected, true, "Should have been unblocked and selected");
    assert.strictEqual(result.value.task.status, "Ready");
    assert.strictEqual(mockProjectManager.updateItemStatus.mock.callCount(), 1);
  });

  test("should return not selected when WIP limit is reached for In progress", async () => {
    const mockProjectManager = {
      getProjectItems: mock.fn(async () => [
        { id: "1", fields: { Status: "In progress" } },
        { id: "2", fields: { Status: "Ready" } },
      ]),
    };
    const mockGitProvider = {};

    const result = await selectNextTask({
      projectManager: mockProjectManager,
      gitProvider: mockGitProvider,
      owner: "owner",
      repo: "repo",
      projectId: "proj1",
      wipLimit: 1,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.selected, false);
    assert.ok(result.value.reason.includes("WIP Limit reached for 'In progress'"));
  });

  test("should return failure if dependencies are missing", async () => {
    const result = await selectNextTask({ owner: null });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Missing required dependencies"));
  });

  test("should handle projectManager errors gracefully", async () => {
    const mockProjectManager = {
      getProjectItems: mock.fn(async () => {
        throw new Error("API Failure");
      }),
    };
    const result = await selectNextTask({
      projectManager: mockProjectManager,
      owner: "o",
      repo: "r",
      projectId: "p1",
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("API Failure"));
  });
});
