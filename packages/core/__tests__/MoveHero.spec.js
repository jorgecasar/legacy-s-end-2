import assert from "node:assert";
import { describe, it } from "node:test";
import HeroState from "../src/domain/entities/HeroState.js";
import Position from "../src/domain/entities/Position.js";
import { MoveHero } from "../src/use-cases/MoveHero.js";

describe("Use Case: MoveHero", () => {
  const levelMap = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ];

  it("should move the hero to a valid position", () => {
    const initialPos = new Position(0, 0);
    const heroState = new HeroState(100, 100, initialPos, []);

    const result = MoveHero.execute({
      heroState,
      newX: 1,
      newY: 0,
      levelMap,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.position.x, 1);
    assert.strictEqual(result.value.position.y, 0);
  });

  it("should return an error if the move fails due to collision", () => {
    const initialPos = new Position(0, 0);
    const heroState = new HeroState(100, 100, initialPos, []);

    const result = MoveHero.execute({
      heroState,
      newX: 1,
      newY: 1,
      levelMap,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Move blocked by collision");
  });

  it("should return an error if position is invalid", () => {
    const initialPos = new Position(0, 0);
    const heroState = new HeroState(100, 100, initialPos, []);

    const result = MoveHero.execute({
      heroState,
      newX: "invalid",
      newY: 0,
      levelMap,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Coordinates must be numbers.");
  });

  it("should catch unexpected errors", () => {
    const result = MoveHero.execute({
      get newX() {
        throw new Error("Unexpected");
      },
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.startsWith("Failed to move hero:"));
  });
});
