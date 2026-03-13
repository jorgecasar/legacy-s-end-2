import { describe, it } from "node:test";
import assert from "node:assert";
import { gameStore } from "../src/infrastructure/GameStore.js";
import HeroState from "@legacys-end/core/domain/entities/HeroState.js";
import Position from "@legacys-end/core/domain/entities/Position.js";

describe("Infrastructure: GameStore", () => {
  const pos = Position.create(0, 0).value;
  const hero = HeroState.create(100, 100, pos, []).value;
  const levelMap = [
    [0, 0],
    [0, 0],
  ];

  it("should initialize state", () => {
    gameStore.initialize(hero, levelMap);
    assert.strictEqual(gameStore.heroState.get().hp, 100);
    assert.deepStrictEqual(gameStore.levelMap.get(), levelMap);
  });

  it("should move hero", () => {
    gameStore.initialize(hero, levelMap);
    gameStore.moveHero(1, 1);
    const newHero = gameStore.heroState.get();
    assert.strictEqual(newHero.position.x, 1);
    assert.strictEqual(newHero.position.y, 1);
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
