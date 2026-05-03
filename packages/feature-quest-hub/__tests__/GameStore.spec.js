import { describe, it } from "node:test";
import assert from "node:assert";
import { gameStore } from "../src/infrastructure/GameStore.js";
import HeroState from "@legacys-end/core/domain/entities/HeroState.js";
import Position from "@legacys-end/core/domain/entities/Position.js";

describe("Infrastructure: GameStore", () => {
  const pos = Position.create(0, 0).value;
  const hero = HeroState.create(100, 100, pos, []).value;
  const obstacles = [{ x: 50, y: 50, width: 10, height: 10 }];

  it("should initialize state", () => {
    gameStore.initialize(hero, obstacles);
    assert.strictEqual(gameStore.heroState.get().hp, 100);
    assert.deepStrictEqual(gameStore.obstacles.get(), obstacles);
  });

  it("should move hero", () => {
    gameStore.initialize(hero, []);
    gameStore.moveHero("RIGHT", 5);
    const newHero = gameStore.heroState.get();
    assert.strictEqual(newHero.position.x, 5);
    assert.strictEqual(newHero.position.y, 0);
  });

  it("should handle dialogue", () => {
    const dialogues = [
      { id: "1", speaker: "A", text: "T1", nextId: "2" },
      { id: "2", speaker: "B", text: "T2", nextId: null },
    ];
    gameStore.setDialogue(dialogues);
    assert.strictEqual(gameStore.currentDialogue.get().id, "1");

    gameStore.advanceDialogue();
    assert.strictEqual(gameStore.currentDialogue.get().id, "2");

    gameStore.advanceDialogue();
    assert.strictEqual(gameStore.currentDialogue.get(), null);
  });
});
