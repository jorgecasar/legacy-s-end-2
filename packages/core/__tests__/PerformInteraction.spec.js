import assert from "node:assert";
import { describe, it } from "node:test";
import { HeroState } from "../src/domain/entities/HeroState.js";
import { Position } from "../src/domain/entities/Position.js";
import { PerformInteraction } from "../src/use-cases/PerformInteraction.js";
import { InteractionStrategy } from "../src/use-cases/strategies/InteractionStrategy.js";
import { Result } from "../src/domain/Result.js";

describe("Use Case: PerformInteraction", () => {
  const createHero = () => {
    const pos = Position.create(0, 0).value;
    return HeroState.create(100, 100, pos, [], "chapter-1").value;
  };

  it("should handle item pickup interaction", async () => {
    const heroState = createHero();
    const entity = { id: "item-potion", type: "item" };

    const result = await PerformInteraction.execute({
      entity,
      heroState,
      aiDialogueEnabled: false,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.type, "ITEM_PICKUP");
    assert.strictEqual(result.value.value, "item-potion");
    assert.ok(result.value.updatedHero.inventory.includes("item-potion"));
  });

  it("should handle static NPC dialogue interaction", async () => {
    const heroState = createHero();
    const entity = {
      id: "npc-elder",
      decks: {
        talk: [{ id: "d1", speaker: "Elder", text: "Welcome traveler!" }],
      },
    };

    const result = await PerformInteraction.execute({
      entity,
      heroState,
      aiDialogueEnabled: false,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.type, "STATIC_DIALOGUE");
    assert.deepStrictEqual(result.value.value, [
      { id: "d1", speaker: "Elder", text: "Welcome traveler!" },
    ]);
  });

  it("should return error if no strategy handles the entity", async () => {
    const heroState = createHero();
    const entity = { id: "unknown-entity", type: "decoration" };

    const result = await PerformInteraction.execute({
      entity,
      heroState,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "No interaction available for this entity.");
  });

  it("should allow registering a custom strategy (Open/Closed Principle)", async () => {
    const heroState = createHero();
    const entity = { id: "portal-01", type: "portal" };

    // Register a new custom strategy for teleportation
    class TeleportStrategy extends InteractionStrategy {
      canHandle(ent) {
        return ent.type === "portal";
      }
      async execute({ entity }) {
        return Result.success({
          type: "PORTAL_TELEPORT",
          value: entity.id,
        });
      }
    }

    PerformInteraction.registerStrategy(new TeleportStrategy());

    const result = await PerformInteraction.execute({
      entity,
      heroState,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.type, "PORTAL_TELEPORT");
    assert.strictEqual(result.value.value, "portal-01");
  });
});
