import { describe, it } from "node:test";
import assert from "node:assert";
import { Position } from "../src/domain/entities/Position.js";
import { HeroState } from "../src/domain/entities/HeroState.js";

describe("TDD: Entity Serialization", () => {
  it("should serialize and deserialize Position", () => {
    const pos = Position.create(10, 20).value;
    const json = JSON.stringify(pos);
    const parsed = JSON.parse(json);

    // RED: This will fail until toJSON and fromJSON are implemented
    assert.strictEqual(parsed.x, 10);
    assert.strictEqual(parsed.y, 20);

    const restoredResult = Position.fromJSON(parsed);
    assert.ok(restoredResult.success);
    assert.ok(restoredResult.value.equals(pos));
  });

  it("should serialize and deserialize HeroState", () => {
    const pos = Position.create(10, 20).value;
    const hero = HeroState.create(100, 100, pos, ["sword"], "chap-01").value;

    const json = JSON.stringify(hero);
    const parsed = JSON.parse(json);

    // RED: This will fail until toJSON and fromJSON are implemented
    assert.strictEqual(parsed.hp, 100);
    assert.strictEqual(parsed.inventory[0], "sword");
    assert.strictEqual(parsed.chapterId, "chap-01");

    const restoredResult = HeroState.fromJSON(parsed);
    assert.ok(restoredResult.success);
    assert.strictEqual(restoredResult.value.hp, 100);
    assert.strictEqual(restoredResult.value.chapterId, "chap-01");
    assert.ok(restoredResult.value.position.equals(pos));
  });
});
