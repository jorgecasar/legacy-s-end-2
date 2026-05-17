import assert from "node:assert";
import { describe, it } from "node:test";
import { HeroState } from "../src/domain/entities/HeroState.js";
import { Position } from "../src/domain/entities/Position.js";

describe("Domain: HeroState Entity", () => {
  it("should create a valid HeroState using factory", () => {
    const pos = new Position(0, 0);
    const result = HeroState.create(100, 100, pos, ["sword"], "chap-01");

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.hp, 100);
    assert.deepStrictEqual(result.value.position, pos);
    assert.strictEqual(result.value.chapterId, "chap-01");
  });

  it("should fail if hp is 0 or less", () => {
    const pos = new Position(0, 0);
    const result = HeroState.create(0, 100, pos, [], "chap-01");
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Hero is dead.");
  });

  it("should fail if hp exceeds maxHp", () => {
    const pos = new Position(0, 0);
    const result = HeroState.create(120, 100, pos, [], "chap-01");
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "HP cannot exceed Max HP.");
  });

  it("should fail if position is missing", () => {
    // @ts-expect-error
    const result = HeroState.create(100, 100, null, [], "chap-01");
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Position is required.");
  });

  it("should fail if chapterId is missing", () => {
    const pos = new Position(0, 0);
    // @ts-expect-error
    const result = HeroState.create(100, 100, pos, []);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Chapter ID is required.");
  });

  it("should use default empty inventory if not provided", () => {
    const pos = new Position(0, 0);
    const result = HeroState.create(100, 100, pos, null, "chap-01");
    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.value.inventory, []);
  });

  it("should correctly initialize with fields", () => {
    const pos = new Position(0, 0);
    const hero = new HeroState(100, 100, pos, ["sword"], "chap-01");

    assert.strictEqual(hero.hp, 100);
    assert.strictEqual(hero.maxHp, 100);
    assert.deepStrictEqual(hero.position, pos);
    assert.deepStrictEqual(hero.inventory, ["sword"]);
    assert.strictEqual(hero.chapterId, "chap-01");
  });

  it("should add an item to the inventory via addItem", () => {
    const pos = new Position(10, 10);
    const hero = HeroState.create(100, 100, pos, [], "chap-01").value;
    const result = hero.addItem("potion");

    assert.ok(result.success);
    assert.ok(result.value.inventory.includes("potion"));
    assert.notStrictEqual(result.value, hero); // Immutable
  });

  it("should fail to add a duplicate item via addItem", () => {
    const pos = new Position(10, 10);
    const hero = HeroState.create(100, 100, pos, ["potion"], "chap-01").value;
    const result = hero.addItem("potion");

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Item already in inventory.");
  });

  it("should handle fromJSON correctly", () => {
    const validJson = {
      hp: 100,
      maxHp: 100,
      position: { x: 5, y: 5 },
      inventory: [],
      chapterId: "c1",
    };
    const valid = HeroState.fromJSON(validJson);
    assert.strictEqual(valid.hp, 100);
    assert.strictEqual(valid.position.x, 5);

    assert.strictEqual(HeroState.fromJSON(null), null);
    assert.strictEqual(HeroState.fromJSON({}), null);
    assert.strictEqual(HeroState.fromJSON({ hp: 100 }), null);
    assert.strictEqual(HeroState.fromJSON({ hp: 100, position: { x: 1 } }), null); // Invalid position
  });
});
