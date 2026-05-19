import { InteractionStrategy } from "./InteractionStrategy.js";
import { PickUpItem } from "../PickUpItem.js";
import { Result } from "../../domain/Result.js";

/**
 * Strategy to handle item interaction/pickup.
 * @extends InteractionStrategy
 */
export class ItemInteractionStrategy extends InteractionStrategy {
  /**
   * Determines if this strategy can handle the target entity.
   * @param {object} entity
   * @returns {boolean}
   */
  canHandle(entity) {
    return entity.type === "item";
  }

  /**
   * Executes the item pickup interaction.
   * @param {object} params
   * @param {object} params.entity - The target item entity
   * @param {import("../../domain/entities/HeroState.js").HeroState} params.heroState
   * @returns {Promise<import("../../domain/Result.js").Result<any>>}
   */
  async execute({ entity, heroState }) {
    const result = PickUpItem.execute({ hero: heroState, item: entity.id });
    if (result.success) {
      return Result.success({
        type: "ITEM_PICKUP",
        value: entity.id,
        updatedHero: result.value,
        metObjective: entity.id,
      });
    }
    return Result.failure(result.error);
  }
}
