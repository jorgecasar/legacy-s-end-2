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

  it("should return error if fromRawData receives invalid data", async () => {
    const result = await StaticQuestRepository.fromRawData([
      /** @type {any} */ ({ id: "q1" }), // Missing title
    ]);

    assert.strictEqual(result.success, false);
    assert.match(result.error, /Failed to map quest: Quest must have a valid string title/);
  });

  it("should throw an error if the constructor receives invalid data", () => {
    assert.throws(() => {
      new StaticQuestRepository([/** @type {any} */ ({ id: "q1" })]);
    }, /Failed to map quest: Quest must have a valid string title/);
  });
});
