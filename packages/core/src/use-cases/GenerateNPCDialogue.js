import { Result } from "../domain/Result.js";

/**
 * GenerateNPCDialogue Use Case
 *
 * Constructs prompts with NPC persona and context, then generates dialogue via AIGenerationPort.
 */
export class GenerateNPCDialogue {
  /**
   * Executes the use case.
   * @param {Object} params
   * @param {string} params.npcId - The ID of the NPC.
   * @param {string} params.npcPersona - The personality or role of the NPC.
   * @param {string} params.playerContext - What the player just did or where they are.
   * @param {string} params.baseMessage - The original intended message to adapt.
   * @param {import("./ports/AIGenerationPort.js").AIGenerationPort} params.aiPort - The AI port to use.
   * @param {Object} [params.options] - Optional generation settings.
   * @returns {Promise<import("../domain/Result.js").Result<string>>}
   */
  static async execute({ npcId, npcPersona, playerContext, baseMessage, aiPort, options = {} }) {
    try {
      const systemPrompt = `You are ${npcPersona} (ID: ${npcId}) in 'Legacy's End'.
        Context: ${playerContext}.
        
        CRITICAL RULES:
        1. Output ONLY the words you speak.
        2. NO narration, NO descriptions, NO parentheses, NO asterisks.
        3. DO NOT describe your actions or feelings.
        4. MAXIMUM 15 words.
        5. Speak directly to the player.`;

      const prompt = `Convert this to your character's speech: "${baseMessage}"`;

      const result = await aiPort.generate(prompt, {
        ...options,
        systemPrompt,
      });

      if (result.success) {
        return Result.success(this.#cleanup(result.value) || baseMessage);
      }
      return result;
    } catch (e) {
      return Result.failure(`Failed to generate NPC dialogue: ${e.message}`);
    }
  }

  /**
   * Post-process to strip any remaining narrative hints like (smiles) or *sighs*
   * @param {string} text
   */
  static #cleanup(text) {
    return text
      .replace(/\([^)]*\)/g, "") // Remove (...)
      .replace(/\*[^*]*\*/g, "") // Remove *...*
      .replace(/["']/g, "") // Remove quotes
      .trim();
  }
}
