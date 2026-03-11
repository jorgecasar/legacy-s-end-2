import { describe, it } from "node:test";
import assert from "node:assert";
import Position from "../src/domain/entities/Position.js";

describe("Domain: Position Value Object", () => {
  it("should create a valid Position using factory", () => {
    const result = Position.create(10, 20);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.x, 10);
    assert.strictEqual(result.value.y, 20);
  });

  it("should fail if coordinates are not numbers", () => {
    // @ts-ignore
    const result = Position.create("10", 20);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Coordinates must be numbers.");
  });

  it("should check equality with other Position", () => {
    const pos1 = new Position(5, 5);
    const pos2 = new Position(5, 5);
    const pos3 = new Position(5, 6);

    assert.strictEqual(pos1.equals(pos2), true);
    assert.strictEqual(pos1.equals(pos3), false);
  });
});
