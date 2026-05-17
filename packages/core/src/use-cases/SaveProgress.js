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
    const currentData = storageAdapter.load().value || {};
    return storageAdapter.save({ ...currentData, heroState: heroState.toJSON() });
  },
};
