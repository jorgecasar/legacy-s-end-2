import assert from "node:assert";
import { describe, it } from "node:test";
import HeroState from "../src/domain/entities/HeroState.js";
import Position from "../src/domain/entities/Position.js";
import { MoveHero } from "../src/use-cases/MoveHero.js";

describe("Use Case: MoveHero", () => {
  const obstacles = [{ x: 10, y: 10, width: 5, height: 5 }];

  it("should move the hero to a valid position", () => {
    const initialPos = new Position(0, 0);
    const heroState = new HeroState(100, 100, initialPos, [], "chap-01");

    const result = MoveHero.execute({
      heroState,
      direction: "RIGHT",
      step: 5,
      obstacles,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.position.x, 5);
    assert.strictEqual(result.value.position.y, 0);
  });

  it("should return an error if the move fails due to collision", () => {
    const initialPos = new Position(9, 10);
    const heroState = new HeroState(100, 100, initialPos, [], "chap-01");

    const result = MoveHero.execute({
      heroState,
      direction: "RIGHT",
      step: 2, // Would end at 11,10 (Inside obstacle)
      obstacles,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Move blocked by collision");
  });

  it("should return an error if movement is out of bounds", () => {
    const initialPos = new Position(0, 0);
    const heroState = new HeroState(100, 100, initialPos, [], "chap-01");

    const result = MoveHero.execute({
      heroState,
      direction: "LEFT",
      step: 1,
      obstacles,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Movement out of bounds.");
  });

  it("should catch unexpected errors", () => {
    const result = MoveHero.execute(null);
    assert.strictEqual(result.success, false);
    assert.ok(result.error.startsWith("Failed to move hero:"));
  });
});
