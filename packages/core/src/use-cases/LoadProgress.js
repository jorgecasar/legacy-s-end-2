import { Result } from "../domain/Result.js";
import { HeroState } from "../domain/entities/HeroState.js";

/**
 * LoadProgress
 *
 * Use case to retrieve saved game state.
 */
export const LoadProgress = {
  /**
   * @param {object} params
   * @param {object} params.storageAdapter
   * @returns {Result<HeroState>}
   */
  execute: (params) => {
    const { storageAdapter } = params;
    const loadResult = storageAdapter.load();
    if (!loadResult.success) return Result.failure(loadResult.error);
    if (!loadResult.value) return Result.failure("No save data found");

    // Try new structure first
    if (loadResult.value.heroState) {
      const hero = HeroState.fromJSON(loadResult.value.heroState);
      if (hero) return Result.success(hero);
    }

    // Fallback to old flat structure if it looks valid
    const hero = HeroState.fromJSON(loadResult.value);
    if (hero) return Result.success(hero);

    return Result.failure("Invalid or missing hero state in save data");
  },
};
