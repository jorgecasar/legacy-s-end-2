import { Result } from "../domain/Result.js";
import { ItemInteractionStrategy } from "./strategies/ItemInteractionStrategy.js";
import { NpcInteractionStrategy } from "./strategies/NpcInteractionStrategy.js";

/** @type {import("./strategies/InteractionStrategy.js").InteractionStrategy[]} */
const strategies = [new ItemInteractionStrategy(), new NpcInteractionStrategy()];

/**
 * Use Case: PerformInteraction
 *
 * Decides and executes the appropriate interaction based on entity type.
 */
export const PerformInteraction = {
  /**
   * Register a custom strategy to extend interactions (Open/Closed Principle).
   * @param {import("./strategies/InteractionStrategy.js").InteractionStrategy} strategy
   */
  registerStrategy(strategy) {
    strategies.unshift(strategy);
  },

  /**
   * Executes the interaction by matching it to the correct strategy.
   * @param {object} params
   * @param {object} params.entity - The target entity
   * @param {import("../domain/entities/HeroState.js").HeroState} params.heroState
   * @param {boolean} params.aiDialogueEnabled
   * @param {object} params.aiGenerationPort
   * @param {string} params.chapterName
   * @returns {Promise<Result<{type: string, value: any, updatedHero?: any, metObjective?: string, spawnedEntity?: any}>>}
   */
  execute: async ({ entity, heroState, aiDialogueEnabled, aiGenerationPort, chapterName }) => {
    try {
      const strategy = strategies.find((s) => s.canHandle(entity));
      if (!strategy) {
        return Result.failure("No interaction available for this entity.");
      }

      return await strategy.execute({
        entity,
        heroState,
        aiDialogueEnabled,
        aiGenerationPort,
        chapterName,
      });
    } catch (error) {
      return Result.failure(`Interaction failed: ${error.message}`);
    }
  },
};
