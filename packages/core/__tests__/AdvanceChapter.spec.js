import { describe, it } from "node:test";
import assert from "node:assert";
import { AdvanceChapter } from "../src/use-cases/AdvanceChapter.js";
import { HeroState } from "../src/domain/entities/HeroState.js";
import { Position } from "../src/domain/entities/Position.js";

describe("Use Case: AdvanceChapter", () => {
  const quest = {
    id: "q1",
    chapters: [
      { id: "c1" },
      {
        id: "c2",
        name: "Chapter 2",
        background: "bg-2",
        startPos: { x: 10, y: 10 },
        exitZone: { x: 90, y: 10, radius: 5 },
        obstacles: [{ x: 1 }],
        entities: [{ id: "e1" }],
      },
    ],
  };

  it("should transition to the next chapter and reset hero position", () => {
    const heroState = HeroState.create(
      100,
      100,
      Position.create(90, 90).value,
      [],
      "chap-01",
    ).value;

    const result = AdvanceChapter.execute({
      quest,
      nextChapterIndex: 1,
      heroState,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.heroState.position.x, 10);
    assert.strictEqual(result.value.heroState.position.y, 10);
    assert.strictEqual(result.value.obstacles.length, 1);
    assert.strictEqual(result.value.entities.length, 1);
    assert.strictEqual(result.value.exitZone.radius, 5);
  });

  it("should fail if the chapter does not exist", () => {
    const heroState = HeroState.create(
      100,
      100,
      Position.create(90, 90).value,
      [],
      "chap-01",
    ).value;

    const result = AdvanceChapter.execute({
      quest,
      nextChapterIndex: 5,
      heroState,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Next chapter not found.");
  });

  it("should fail if quest is missing", () => {
    const result = AdvanceChapter.execute({ quest: null, nextChapterIndex: 0, heroState: {} });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Next chapter not found.");
  });

  it("should fail if quest chapters are missing", () => {
    const result = AdvanceChapter.execute({ quest: {}, nextChapterIndex: 0, heroState: {} });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Next chapter not found.");
  });

  it("should fail if position creation fails", () => {
    const invalidQuest = {
      chapters: [{ startPos: { x: "invalid", y: 10 } }],
    };
    const heroState = HeroState.create(100, 100, Position.create(0, 0).value, [], "c1").value;

    const result = AdvanceChapter.execute({
      quest: invalidQuest,
      nextChapterIndex: 0,
      heroState,
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("number"));
  });

  it("should fail if hero state creation fails", () => {
    const nextQuest = {
      chapters: [{ id: "c2", startPos: { x: 10, y: 10 } }],
    };
    // Make hero state invalid by passing 0 HP
    const heroState = { hp: 0, maxHp: 100, inventory: [] };

    const result = AdvanceChapter.execute({
      quest: nextQuest,
      nextChapterIndex: 0,
      heroState,
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("dead"));
  });

  it("should catch unexpected errors", () => {
    // Pass something that will throw inside the try block but after params || {}
    // e.g. nextChapterIndex that is not a number but would be accessed
    const result = AdvanceChapter.execute({
      quest: { chapters: [] },
      get nextChapterIndex() {
        throw new Error("Trigger Catch");
      },
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Trigger Catch"));
  });
});
