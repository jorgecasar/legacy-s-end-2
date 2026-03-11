import { describe, it } from "node:test";
import assert from "node:assert";
import { checkCollision } from "../src/domain/services/CollisionService.js";
import Position from "../src/domain/entities/Position.js";

describe("Domain Service: CollisionService", () => {
  const map = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ];

  it("should return true if there is a collision", () => {
    const position = new Position(1, 1);
    assert.strictEqual(checkCollision(position, map), true);
  });

  it("should return false if there is no collision", () => {
    const position = new Position(0, 0);
    assert.strictEqual(checkCollision(position, map), false);
  });

  it("should return true if the position is out of bounds", () => {
    const position = new Position(3, 3);
    assert.strictEqual(checkCollision(position, map), true);
  });
});
