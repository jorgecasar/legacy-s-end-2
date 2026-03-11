import assert from "node:assert";
import { describe, it } from "node:test";
import HeroState from "../src/domain/entities/HeroState.js";
import Position from "../src/domain/entities/Position.js";

describe("Domain: HeroState Entity", () => {
  it("should create a valid HeroState using factory", () => {
    const pos = new Position(0, 0);
    const result = HeroState.create(100, 100, pos, ["sword"]);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.hp, 100);
    assert.deepStrictEqual(result.value.position, pos);
  });

  it("should fail if hp is 0 or less", () => {
    const pos = new Position(0, 0);
    const result = HeroState.create(0, 100, pos, []);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Hero is dead.");
  });

  it("should fail if hp exceeds maxHp", () => {
    const pos = new Position(0, 0);
    const result = HeroState.create(120, 100, pos, []);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "HP cannot exceed Max HP.");
  });

  it("should fail if position is missing", () => {
    // @ts-expect-error
    const result = HeroState.create(100, 100, null, []);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Position is required.");
  });

  it("should use default empty inventory if not provided", () => {
    const pos = new Position(0, 0);
    const result = HeroState.create(100, 100, pos, null);
    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.value.inventory, []);
  });

  it("should correctly initialize with fields", () => {
    const pos = new Position(0, 0);
    const hero = new HeroState(100, 100, pos, ["sword"]);

    assert.strictEqual(hero.hp, 100);
    assert.strictEqual(hero.maxHp, 100);
    assert.deepStrictEqual(hero.position, pos);
    assert.deepStrictEqual(hero.inventory, ["sword"]);
  });
});
