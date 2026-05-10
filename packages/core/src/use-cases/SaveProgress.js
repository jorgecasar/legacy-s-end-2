/**
 * SaveProgress
 *
 * Use case to persist the current game state.
 */
export const SaveProgress = {
  /**
   * @param {object} params
   * @param {import("../domain/entities/HeroState.js").HeroState} params.heroState
   * @param {object} params.storageAdapter
   * @returns {import("../domain/Result.js").Result<boolean>}
   */
  execute: (params) => {
    const { heroState, storageAdapter } = params;
    return storageAdapter.save(heroState.toJSON());
  },
};
