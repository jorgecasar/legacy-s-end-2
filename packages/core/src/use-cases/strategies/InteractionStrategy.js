/**
 * Abstract class representing an interaction strategy.
 * This decouples specific interaction types from the PerformInteraction use case (enforcing OCP).
 */
export class InteractionStrategy {
  /**
   * Determines if this strategy can handle the target entity.
   * @param {object} _entity
   * @returns {boolean}
   */
  canHandle(_entity) {
    throw new Error("Method 'canHandle' must be implemented.");
  }

  /**
   * Executes the interaction strategy.
   * @param {object} params
   * @param {object} params.entity - The target entity
   * @param {import("../../domain/entities/HeroState.js").HeroState} params.heroState
   * @param {boolean} params.aiDialogueEnabled
   * @param {object} params.aiGenerationPort
   * @param {string} params.chapterName
   * @returns {Promise<import("../../domain/Result.js").Result<any>>}
   */
  async execute(_params) {
    throw new Error("Method 'execute' must be implemented.");
  }
}
