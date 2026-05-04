import assert from "node:assert";
import { describe, it } from "node:test";
import HeroState from "@legacys-end/core/domain/entities/HeroState.js";
import Position from "@legacys-end/core/domain/entities/Position.js";
import { GameStore } from "../src/infrastructure/GameStore.js";

describe("Infrastructure: GameStore", () => {
  const setup = () => {
    const store = new GameStore();
    const pos = Position.create(10, 10).value;
    const hero = HeroState.create(100, 100, pos, [], "chapter-1").value;
    const obstacles = [{ x: 50, y: 50, width: 10, height: 10 }];
    const entities = [
      {
        id: "npc-1",
        position: { x: 12, y: 12 },
        decks: { talk: [{ id: "d1", speaker: "S", text: "Hello" }] },
      },
    ];
    store.initialize(hero, obstacles, entities);
    return { store, hero, obstacles, entities };
  };

  it("should initialize state with obstacles and entities", () => {
    const { store, obstacles, entities } = setup();
    assert.strictEqual(store.heroState.get().hp, 100);
    assert.deepStrictEqual(store.obstacles.get(), obstacles);
    assert.deepStrictEqual(store.entities.get(), entities);
  });

  it("should move hero in a direction", () => {
    const { store } = setup();
    store.moveHero("RIGHT", 5);
    const newHero = store.heroState.get();
    assert.strictEqual(newHero.position.x, 15);
    assert.strictEqual(newHero.position.y, 10);
  });

  it("should handle custom step size (sprint)", () => {
    const { store } = setup();
    store.moveHero("DOWN", 10);
    const newHero = store.heroState.get();
    assert.strictEqual(newHero.position.y, 20);
  });

  it("should identify a nearby entity ID", () => {
    const { store } = setup();
    assert.strictEqual(store.nearbyEntityId.get(), "npc-1");
  });

  it("should trigger interaction with the nearby entity", () => {
    const { store } = setup();
    store.interact();
    assert.strictEqual(store.currentDialogue.get().id, "d1");
  });

  it("should handle dialogue progression", () => {
    const { store } = setup();
    const dialogues = [
      { id: "1", speaker: "A", text: "T1", nextId: "2" },
      { id: "2", speaker: "B", text: "T2", nextId: null },
    ];
    store.setDialogue(dialogues);
    assert.strictEqual(store.currentDialogue.get().id, "1");

    store.advanceDialogue();
    assert.strictEqual(store.currentDialogue.get().id, "2");

    store.advanceDialogue();
    assert.strictEqual(store.currentDialogue.get(), null);
  });

  it("should prevent movement during dialogue", () => {
    const { store } = setup();
    const dialogues = [{ id: "1", speaker: "A", text: "T1", nextId: null }];
    store.setDialogue(dialogues);

    const initialX = store.heroState.get().position.x;
    store.moveHero("RIGHT", 5);
    const finalX = store.heroState.get().position.x;

    assert.strictEqual(finalX, initialX, "Hero should not move during dialogue");
  });

  it("should fail to set dialogue if nodes are invalid (Prove-It: Missing IDs)", () => {
    const { store } = setup();
    const invalidDialogues = [
      { speaker: "A", text: "T1" }, // Missing ID
    ];
    store.setDialogue(invalidDialogues);
    assert.strictEqual(store.currentDialogue.get(), null);
  });
});
