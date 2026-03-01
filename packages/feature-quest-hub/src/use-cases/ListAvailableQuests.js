/**
 * ListAvailableQuests
 * Use Case: Retrieves all available quests from the repository.
 * This is the primary orchestrator for the Quest Hub.
 */
export class ListAvailableQuests {
  #questRepository;

  constructor(questRepository) {
    this.#questRepository = questRepository;
  }

  /**
   * Executes the use case.
   * @returns {Promise<{ success: boolean, value?: import("../domain/entities/Quest.js").Quest[], error?: string }>}
   */
  async execute() {
    try {
      const result = await this.#questRepository.getAll();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true, value: result.value };
    } catch (error) {
      return { success: false, error: `Error listing available quests: ${error.message}` };
    }
  }
}
