import assert from "node:assert";
import { describe, it } from "node:test";
import { Quest } from "../src/domain/entities/Quest.js";
import { QuestStatus } from "../src/domain/entities/QuestStatus.js";

describe("Domain: Quest Entity", () => {
  it("should create a quest with valid properties", () => {
    const result = Quest.create({
      id: "quest-1",
      title: "Hero's Journey",
      status: QuestStatus.LOCKED,
    });

    assert.strictEqual(result.success, true);
    const quest = result.value;
    assert.strictEqual(quest.id, "quest-1");
    assert.strictEqual(quest.title, "Hero's Journey");
    assert.strictEqual(quest.status, QuestStatus.LOCKED);
  });

  it("should have a description property", () => {
    const result = Quest.create({
      id: "q1",
      title: "Title",
      description: "My description",
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.description, "My description");
  });

  it("should return error if ID or title is missing", () => {
    const result1 = Quest.create({ title: "Title" });
    const result2 = Quest.create({ id: "ID" });

    assert.strictEqual(result1.success, false);
    assert.match(result1.error, /Quest must have a valid string ID./);
    assert.strictEqual(result2.success, false);
    assert.match(result2.error, /Quest must have a valid string title./);
  });

  it("should return error if status is invalid", () => {
    const result = Quest.create({ id: "ID", title: "Title", status: "INVALID" });
    assert.strictEqual(result.success, false);
    assert.match(result.error, /Invalid QuestStatus: INVALID/);
  });

  it("should allow unlocking a locked quest", () => {
    const result = Quest.create({ id: "1", title: "T", status: QuestStatus.LOCKED });
    const quest = result.value;
    const unlockResult = quest.unlock();

    assert.strictEqual(unlockResult.success, true);
    assert.strictEqual(quest.status, QuestStatus.AVAILABLE);
  });

  it("should NOT allow unlocking an already available or completed quest", () => {
    const q1 = Quest.create({ id: "1", title: "T", status: QuestStatus.AVAILABLE }).value;
    const q2 = Quest.create({ id: "2", title: "T", status: QuestStatus.COMPLETED }).value;

    assert.strictEqual(q1.unlock().success, false);
    assert.strictEqual(q2.unlock().success, false);
  });

  it("should allow completing an available quest", () => {
    const quest = Quest.create({ id: "1", title: "T", status: QuestStatus.AVAILABLE }).value;
    const result = quest.complete();

    assert.strictEqual(result.success, true);
    assert.strictEqual(quest.status, QuestStatus.COMPLETED);
  });

  it("should NOT allow completing a locked or completed quest", () => {
    const q1 = Quest.create({ id: "1", title: "T", status: QuestStatus.LOCKED }).value;
    const q2 = Quest.create({ id: "2", title: "T", status: QuestStatus.COMPLETED }).value;

    assert.strictEqual(q1.complete().success, false);
    assert.strictEqual(q2.complete().success, false);
  });

  it("should allow restarting a completed quest", () => {
    const quest = Quest.create({ id: "1", title: "T", status: QuestStatus.COMPLETED }).value;
    const result = quest.restart();

    assert.strictEqual(result.success, true);
    assert.strictEqual(quest.status, QuestStatus.AVAILABLE);
  });

  it("should NOT allow restarting a locked or available quest", () => {
    const q1 = Quest.create({ id: "1", title: "T", status: QuestStatus.LOCKED }).value;
    const q2 = Quest.create({ id: "2", title: "T", status: QuestStatus.AVAILABLE }).value;

    assert.strictEqual(q1.restart().success, false);
    assert.strictEqual(q2.restart().success, false);
  });
});
