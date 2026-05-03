import { Result } from "../domain/Result.js";
import HeroState from "../domain/entities/HeroState.js";

/**
 * SaveProgress
 *
 * Use case to persist the current game state.
 */
export const SaveProgress = {
  /**
   * @param {object} params
   * @param {HeroState} params.heroState
   * @param {object} params.storageAdapter
   * @returns {Result<boolean>}
   */
  execute: (params) => {
    const { heroState, storageAdapter } = params;
    return storageAdapter.save(heroState.toJSON());
  },
};
