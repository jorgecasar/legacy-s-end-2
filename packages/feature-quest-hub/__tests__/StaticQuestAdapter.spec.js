import assert from "node:assert";
import { describe, it } from "node:test";
import { Quest } from "../src/domain/entities/Quest.js";
import { QuestStatus } from "../src/domain/entities/QuestStatus.js";
import { StaticQuestAdapter } from "../src/infrastructure/StaticQuestAdapter.js";

describe("Infrastructure: StaticQuestAdapter", () => {
  it("should return a Quest entity for a valid ID", async () => {
    const adapter = new StaticQuestAdapter();
    const result = await adapter.getById("q1");

    assert.strictEqual(result.success, true);
    assert.ok(result.value instanceof Quest);
    assert.strictEqual(result.value.id, "q1");
    assert.strictEqual(result.value.status, QuestStatus.AVAILABLE);
  });

  it("should return error for an invalid ID", async () => {
    const adapter = new StaticQuestAdapter();
    const result = await adapter.getById("non-existent");

    assert.strictEqual(result.success, false);
    assert.match(result.error, /not found/);
  });

  it("should return all quests mapped to entities", async () => {
    const adapter = new StaticQuestAdapter();
    const result = await adapter.getAll();

    assert.strictEqual(result.success, true);
    assert.ok(Array.isArray(result.value));
    assert.strictEqual(result.value.length, 3);
    assert.ok(result.value.every((q) => q instanceof Quest));
  });

  it("should return error if quest mapping fails", async () => {
    // Provide invalid quest data (missing title) to trigger error in factory
    const adapter = new StaticQuestAdapter([{ id: "q1" }]);
    const result = await adapter.getById("q1");

    assert.strictEqual(result.success, false);
    assert.match(result.error, /Failed to map quest data/);
  });

  it("should return error if mapping all quests fails", async () => {
    // Provide invalid quest data (missing title) to trigger error in factory
    const adapter = new StaticQuestAdapter([{ id: "q1" }]);
    const result = await adapter.getAll();

    assert.strictEqual(result.success, false);
    assert.match(result.error, /Failed to map quest/);
  });
});
