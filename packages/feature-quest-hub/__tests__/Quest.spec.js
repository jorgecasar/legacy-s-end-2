import assert from "node:assert";
import { describe, it } from "node:test";
import { Quest } from "../src/domain/entities/Quest.js";
import { QuestStatus } from "../src/domain/entities/QuestStatus.js";

describe("Domain: Quest Entity", () => {
  const validParams = {
    id: "q1",
    title: "Test Quest",
    description: "This is a test quest",
    status: QuestStatus.AVAILABLE,
  };

  it("should create a valid Quest using factory", () => {
    const result = Quest.create(validParams);

    assert.strictEqual(result.success, true);
    assert.ok(result.value instanceof Quest);
    assert.strictEqual(result.value.id.value, "q1");
    assert.strictEqual(result.value.title, "Test Quest");
    assert.strictEqual(result.value.status, QuestStatus.AVAILABLE);
  });

  it("should fail if title is missing", () => {
    const result = Quest.create({ ...validParams, title: "" });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Quest must have a valid string title.");
  });

  it("should fail if id is invalid", () => {
    const result = Quest.create({ ...validParams, id: "" });
    assert.strictEqual(result.success, false);
    assert.match(result.error, /QuestId must be a non-empty string/);
  });

  it("should initialize with optional fields", () => {
    const result = Quest.create({
      ...validParams,
      image: "test.png",
      level: 5,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.image, "test.png");
    assert.strictEqual(result.value.level, 5);
  });

  describe("State Transitions", () => {
    it("should unlock a locked quest", () => {
      const quest = Quest.create({ ...validParams, status: QuestStatus.LOCKED }).value;
      const result = quest.unlock();

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.value.status, QuestStatus.AVAILABLE);
      assert.strictEqual(quest.status, QuestStatus.LOCKED); // Original remains unchanged
    });

    it("should complete an available quest", () => {
      const quest = Quest.create({ ...validParams, status: QuestStatus.AVAILABLE }).value;
      const result = quest.complete();

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.value.status, QuestStatus.COMPLETED);
      assert.strictEqual(quest.status, QuestStatus.AVAILABLE); // Original remains unchanged
    });

    it("should restart a completed quest", () => {
      const quest = Quest.create({ ...validParams, status: QuestStatus.COMPLETED }).value;
      const result = quest.restart();

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.value.status, QuestStatus.AVAILABLE);
      assert.strictEqual(quest.status, QuestStatus.COMPLETED); // Original remains unchanged
    });

    it("should fail to unlock if already available", () => {
      const quest = Quest.create({ ...validParams, status: QuestStatus.AVAILABLE }).value;
      const result = quest.unlock();

      assert.strictEqual(result.success, false);
      assert.match(result.error, /Cannot unlock a quest that is AVAILABLE/);
    });

    it("should fail to complete if not available", () => {
      const quest = Quest.create({ ...validParams, status: QuestStatus.LOCKED }).value;
      const result = quest.complete();

      assert.strictEqual(result.success, false);
      assert.match(result.error, /Only Available quests can be completed/);
    });

    it("should fail to restart if not completed", () => {
      const quest = Quest.create({ ...validParams, status: QuestStatus.AVAILABLE }).value;
      const result = quest.restart();

      assert.strictEqual(result.success, false);
      assert.match(result.error, /Only Completed quests can be restarted/);
    });
  });
});
