import { describe, it } from "node:test";
import assert from "node:assert";
import { StartQuest } from "../src/use-cases/StartQuest.js";

describe("Use Case: StartQuest", () => {
  const obstacles = [{ x: 0, y: 0, width: 10, height: 10 }];

  it("should initialize the hero state and return the level map", () => {
    const result = StartQuest.execute({
      initialHp: 100,
      initialMaxHp: 100,
      initialX: 5,
      initialY: 5,
      initialInventory: ["map"],
      obstacles,
      chapterId: "chap-01",
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.heroState.hp, 100);
    assert.strictEqual(result.value.heroState.position.x, 5);
    assert.deepStrictEqual(result.value.obstacles, obstacles);
  });

  it("should fail if starting position is invalid", () => {
    const result = StartQuest.execute({
      initialHp: 100,
      initialMaxHp: 100,
      // @ts-ignore
      initialX: "invalid",
      initialY: 0,
      initialInventory: [],
      obstacles,
    });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Coordinates must be numbers.");
  });

  it("should fail if hero state is invalid", () => {
    const result = StartQuest.execute({
      initialHp: 0,
      initialMaxHp: 100,
      initialX: 0,
      initialY: 0,
      initialInventory: [],
      obstacles,
    });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Hero is dead.");
  });

  it("should catch unexpected errors", () => {
    const result = StartQuest.execute({
      get initialHp() {
        throw new Error("Unexpected");
      },
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.startsWith("Failed to start quest:"));
  });
});
