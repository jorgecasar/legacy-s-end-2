import { InteractionStrategy } from "./InteractionStrategy.js";
import { GenerateNPCDialogue } from "../GenerateNPCDialogue.js";
import { Result } from "../../domain/Result.js";

/**
 * Strategy to handle NPC dialogue interactions (static and AI dialogue).
 * @extends InteractionStrategy
 */
export class NpcInteractionStrategy extends InteractionStrategy {
  /**
   * Determines if this strategy can handle the target entity.
   * @param {object} entity
   * @returns {boolean}
   */
  canHandle(entity) {
    return !!(entity.decks?.talk || entity.persona);
  }

  /**
   * Executes the NPC interaction.
   * @param {object} params
   * @param {object} params.entity - The target NPC entity
   * @param {import("../../domain/entities/HeroState.js").HeroState} params.heroState
   * @param {boolean} params.aiDialogueEnabled
   * @param {object} params.aiGenerationPort
   * @param {string} params.chapterName
   * @returns {Promise<import("../../domain/Result.js").Result<any>>}
   */
  async execute({ entity, heroState, aiDialogueEnabled, aiGenerationPort, chapterName }) {
    const npcId = entity.id.replace("npc-", "");
    const npcObjective = `talk-${npcId}`;
    const rewardEntity = entity.gives;

    const alreadyHasReward = rewardEntity && heroState.inventory.includes(rewardEntity.id);
    const alreadyInteracted = heroState.objectivesMet.includes(npcObjective) || alreadyHasReward;

    // 1. Handle AI Dialogue (if enabled and entity has persona)
    if (aiDialogueEnabled && aiGenerationPort && entity.persona) {
      const staticDialogue = entity.decks?.talk;
      const baseMessage = Array.isArray(staticDialogue)
        ? staticDialogue[0]?.text
        : typeof staticDialogue === "object"
          ? staticDialogue.text
          : "Hello";

      const context = `Location: ${chapterName}. Situation: Player approach. Already talked: ${alreadyInteracted}`;
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
          spawnedEntity: alreadyInteracted ? null : rewardEntity,
        });
      }
      // Fallback to static if AI fails
    }

    // 2. Handle Static Dialogue
    if (entity.decks?.talk) {
      return Result.success({
        type: "STATIC_DIALOGUE",
        value: entity.decks.talk,
        metObjective: npcObjective,
        spawnedEntity: alreadyInteracted ? null : rewardEntity,
      });
    }

    return Result.failure("No interaction available for this entity.");
  }
}
