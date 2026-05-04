import { Result } from "@legacys-end/core/domain/Result.js";

/**
 * CompleteQuestInteractor
 *
 * Use case for marking a quest as completed and unlocking the next one if applicable.
 */
export class CompleteQuestInteractor {
  /** @type {import("./ports/QuestRepository.js").QuestRepository} */
  #questRepository;

  /**
   * @param {import("./ports/QuestRepository.js").QuestRepository} questRepository
   */
  constructor(questRepository) {
    this.#questRepository = questRepository;
  }

  /**
   * @param {object} params
   * @param {import("../domain/entities/QuestId.js").QuestId} params.questId
   * @returns {Promise<Result<void>>}
   */
  async execute({ questId }) {
    try {
      const getResult = await this.#questRepository.getById(questId);
      if (!getResult.success) return Result.failure(getResult.error);

      const quest = getResult.value;
      const completedResult = quest.complete();
      if (!completedResult.success) return Result.failure(completedResult.error);

      await this.#questRepository.save(completedResult.value);

      // Simple logic to unlock the next quest (based on ID sequence or order)
      const allResult = await this.#questRepository.getAll();
      if (allResult.success) {
        const allQuests = allResult.value;
        const currentIndex = allQuests.findIndex((q) => q.id.equals(questId));
        const nextQuest = allQuests[currentIndex + 1];

        if (nextQuest && nextQuest.status === "LOCKED") {
          const unlockedResult = nextQuest.unlock();
          if (unlockedResult.success) {
            await this.#questRepository.save(unlockedResult.value);
          }
        }
      }

      return Result.success();
    } catch (error) {
      return Result.failure(`Failed to complete quest: ${error.message}`);
    }
  }
}
