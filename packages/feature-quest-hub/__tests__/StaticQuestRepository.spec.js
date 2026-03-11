import assert from "node:assert";
import { describe, it } from "node:test";
import { Quest } from "../src/domain/entities/Quest.js";
import { QuestId } from "../src/domain/entities/QuestId.js";
import { QuestStatus } from "../src/domain/entities/QuestStatus.js";
import { StaticQuestRepository } from "../src/infrastructure/StaticQuestRepository.js";

describe("Infrastructure: StaticQuestRepository", () => {
  const mockData = [
    { id: "q1", title: "Quest 1", status: QuestStatus.AVAILABLE, description: "Desc 1" },
    { id: "q2", title: "Quest 2", status: QuestStatus.LOCKED, description: "Desc 2" },
  ];

  it("should return a Quest entity for a valid ID", async () => {
    const repository = new StaticQuestRepository(mockData);
    const id = QuestId.create("q1").value;
    const result = await repository.getById(id);

    assert.strictEqual(result.success, true);
    assert.ok(result.value instanceof Quest);
    assert.strictEqual(result.value.id.value, "q1");
    assert.strictEqual(result.value.status, QuestStatus.AVAILABLE);
  });

  it("should return error for an invalid ID", async () => {
    const repository = new StaticQuestRepository(mockData);
    const id = QuestId.create("non-existent").value;
    const result = await repository.getById(id);

    assert.strictEqual(result.success, false);
    assert.match(result.error, /not found/);
  });

  it("should return all quests mapped to entities", async () => {
    const repository = new StaticQuestRepository(mockData);
    const result = await repository.getAll();

    assert.strictEqual(result.success, true);
    assert.ok(Array.isArray(result.value));
    assert.strictEqual(result.value.length, 2);
    assert.ok(result.value.every((q) => q instanceof Quest));
  });

  it("should return error if quest mapping fails", async () => {
    // Provide invalid quest data (missing title) to trigger error in factory
    const repository = new StaticQuestRepository([/** @type {any} */ ({ id: "q1" })]);
    const id = QuestId.create("q1").value;
    const result = await repository.getById(id);

    assert.strictEqual(result.success, false);
    assert.match(result.error, /Quest must have a valid string title/);
  });

  it("should return error if mapping all quests fails", async () => {
    // Provide invalid quest data (missing title) to trigger error in factory
    const repository = new StaticQuestRepository([/** @type {any} */ ({ id: "q1" })]);
    const result = await repository.getAll();

    assert.strictEqual(result.success, false);
    assert.match(result.error, /Failed to map quest/);
  });
});
