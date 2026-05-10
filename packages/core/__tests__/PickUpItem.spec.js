import assert from "node:assert";
import { describe, it } from "node:test";
import { HeroState } from "../src/domain/entities/HeroState.js";
import { Position } from "../src/domain/entities/Position.js";
import { PickUpItem } from "../src/use-cases/PickUpItem.js";

describe("Use Case: PickUpItem", () => {
  it("should add an item to the hero's inventory", () => {
    const pos = Position.create(10, 10).value;
    const hero = HeroState.create(100, 100, pos, [], "chapter-1").value;
    const item = "ancient-key";

    const result = PickUpItem.execute({ hero, item });

    assert.strictEqual(result.success, true);
    assert.ok(result.value.inventory.includes("ancient-key"));
    assert.strictEqual(result.value.inventory.length, 1);
  });

  it("should fail if the item is already in the inventory", () => {
    const pos = Position.create(10, 10).value;
    const hero = HeroState.create(100, 100, pos, ["ancient-key"], "chapter-1").value;
    const item = "ancient-key";

    const result = PickUpItem.execute({ hero, item });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Item already in inventory.");
  });
});
