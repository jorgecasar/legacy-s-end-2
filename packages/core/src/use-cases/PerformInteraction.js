import { Result } from "../domain/Result.js";
import { PickUpItem } from "./PickUpItem.js";
import { GenerateNPCDialogue } from "./GenerateNPCDialogue.js";

/**
 * Use Case: PerformInteraction
 *
 * Decides and executes the appropriate interaction based on entity type.
 */
export const PerformInteraction = {
  /**
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
      // 1. Handle Items
      if (entity.type === "item") {
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

      // Prepare common NPC result data
      const npcObjective = `talk-${entity.id.replace("npc-", "")}`;
      const spawnedEntity = entity.gives;

      // 2. Handle AI Dialogue (if enabled and entity has persona)
      if (aiDialogueEnabled && aiGenerationPort && entity.persona) {
        const staticDialogue = entity.decks?.talk;
        const baseMessage = Array.isArray(staticDialogue)
          ? staticDialogue[0]?.text
          : typeof staticDialogue === "object"
            ? staticDialogue.text
            : "Hello";

        const context = `Location: ${chapterName}. Situation: Player approach.`;
        const result = await GenerateNPCDialogue.execute({
          npcId: entity.id,
          npcPersona: entity.persona,
          playerContext: context,
          baseMessage: baseMessage || "Hello",
          aiPort: aiGenerationPort,
        });

        if (result.success) {
          return Result.success({
            type: "AI_DIALOGUE",
            value: result.value,
            metObjective: npcObjective,
            spawnedEntity,
          });
        }
        // Fallback to static if AI fails
      }

      // 3. Handle Static Dialogue
      if (entity.decks?.talk) {
        return Result.success({
          type: "STATIC_DIALOGUE",
          value: entity.decks.talk,
          metObjective: npcObjective,
          spawnedEntity,
        });
      }

      return Result.failure("No interaction available for this entity.");
    } catch (error) {
      return Result.failure(`Interaction failed: ${error.message}`);
    }
  },
};
