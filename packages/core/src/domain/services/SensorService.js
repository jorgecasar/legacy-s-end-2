import { CollisionService } from "./CollisionService.js";

/**
 * SensorService
 *
 * Domain service for detecting relationships between entities in the world.
 */
export const SensorService = {
  /**
   * Finds the nearest entity to a given position within a threshold.
   * @param {import("../entities/Position.js").Position} position
   * @param {any[]} entities
   * @param {number} threshold
   * @returns {any | null}
   */
  getNearbyEntity: (position, entities, threshold = 5) => {
    if (!position || !entities.length) return null;

    return entities.find((ent) => CollisionService.isNearby(position, ent.position, threshold));
  },

  /**
   * Checks if all required objectives are present in the met objectives set.
   * @param {string[]} required
   * @param {Set<string>} met
   * @returns {string[]} List of missing objectives
   */
  getMissingObjectives: (required = [], met = new Set()) => {
    return required.filter((obj) => !met.has(obj));
  },
};
