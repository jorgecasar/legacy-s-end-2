import { describe, it } from "node:test";
import assert from "node:assert";
import { MovementService } from "../src/domain/services/MovementService.js";
import Position from "../src/domain/entities/Position.js";

describe("Domain Service: MovementService", () => {
  it("should calculate new position correctly for UP direction", () => {
    const current = new Position(50, 50);
    const result = MovementService.move(current, "UP", 5);
    assert.strictEqual(result.value.x, 50);
    assert.strictEqual(result.value.y, 45);
  });

  it("should calculate new position correctly for DOWN direction", () => {
    const current = new Position(50, 50);
    const result = MovementService.move(current, "DOWN", 5);
    assert.strictEqual(result.value.x, 50);
    assert.strictEqual(result.value.y, 55);
  });

  it("should block movement out of top bounds (0%)", () => {
    const current = new Position(50, 2);
    const result = MovementService.move(current, "UP", 5);
    assert.strictEqual(result.success, false);
    assert.match(result.error, /out of bounds/i);
  });

  it("should block movement out of bottom bounds (100%)", () => {
    const current = new Position(50, 98);
    const result = MovementService.move(current, "DOWN", 5);
    assert.strictEqual(result.success, false);
    assert.match(result.error, /out of bounds/i);
  });

  it("should block movement out of left bounds (0%)", () => {
    const current = new Position(2, 50);
    const result = MovementService.move(current, "LEFT", 5);
    assert.strictEqual(result.success, false);
    assert.match(result.error, /out of bounds/i);
  });

  it("should block movement out of right bounds (100%)", () => {
    const current = new Position(98, 50);
    const result = MovementService.move(current, "RIGHT", 5);
    assert.strictEqual(result.success, false);
    assert.match(result.error, /out of bounds/i);
  });
});
