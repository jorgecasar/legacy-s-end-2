import { describe, it } from "node:test";
import assert from "node:assert";
import Position from "../src/domain/entities/Position.js";
import HeroState from "../src/domain/entities/HeroState.js";

describe("TDD: Entity Serialization", () => {
  it("should serialize and deserialize Position", () => {
    const pos = Position.create(10, 20).value;
    const json = JSON.stringify(pos);
    const parsed = JSON.parse(json);

    // RED: This will fail until toJSON and fromJSON are implemented
    assert.strictEqual(parsed.x, 10);
    assert.strictEqual(parsed.y, 20);

    const restored = Position.fromJSON(parsed);
    assert.ok(restored.equals(pos));
  });

  it("should serialize and deserialize HeroState", () => {
    const pos = Position.create(10, 20).value;
    const hero = HeroState.create(100, 100, pos, ["sword"]).value;

    const json = JSON.stringify(hero);
    const parsed = JSON.parse(json);

    // RED: This will fail until toJSON and fromJSON are implemented
    assert.strictEqual(parsed.hp, 100);
    assert.strictEqual(parsed.inventory[0], "sword");

    const restored = HeroState.fromJSON(parsed);
    assert.strictEqual(restored.hp, 100);
    assert.ok(restored.position.equals(pos));
  });
});
