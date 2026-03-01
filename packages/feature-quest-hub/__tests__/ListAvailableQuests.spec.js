import assert from "node:assert";
import { describe, it } from "node:test";
import { QuestStatus } from "../src/domain/entities/QuestStatus.js";
import { ListAvailableQuests } from "../src/use-cases/ListAvailableQuests.js";

describe("Use Case: ListAvailableQuests", () => {
  const mockQuests = [
    { id: "q1", title: "Q1", status: QuestStatus.AVAILABLE },
    { id: "q2", title: "Q2", status: QuestStatus.LOCKED },
  ];

  it("should return all quests from repository", async () => {
    const mockRepo = {
      getAll: async () => ({ success: true, value: mockQuests }),
    };

    const useCase = new ListAvailableQuests(mockRepo);
    const result = await useCase.execute();

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.length, 2);
    assert.strictEqual(result.value[0].id, "q1");
  });

  it("should return error if repository fails", async () => {
    const mockRepo = {
      getAll: async () => ({ success: false, error: "Repository Error" }),
    };

    const useCase = new ListAvailableQuests(mockRepo);
    const result = await useCase.execute();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Repository Error");
  });

  it("should handle unexpected repository exceptions", async () => {
    const mockRepo = {
      getAll: async () => {
        throw new Error("Unexpected crash");
      },
    };

    const useCase = new ListAvailableQuests(mockRepo);
    const result = await useCase.execute();

    assert.strictEqual(result.success, false);
    assert.match(result.error, /Error listing available quests: Unexpected crash/);
  });
});
