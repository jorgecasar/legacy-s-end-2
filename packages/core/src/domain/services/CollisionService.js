/** @typedef {import("../entities/Position.js").default} Position */

/**
 * CollisionService
 *
 * Domain service for handling proximity and map collisions.
 */
export const CollisionService = {
  /**
   * Calculates Euclidean distance between two points.
   * @param {Position} p1
   * @param {Position} p2
   * @returns {number}
   */
  calculateDistance: (p1, p2) => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Checks if two positions are within a certain threshold.
   * @param {Position} p1
   * @param {Position} p2
   * @param {number} threshold
   * @returns {boolean}
   */
  isNearby: (p1, p2, threshold) => {
    return CollisionService.calculateDistance(p1, p2) <= threshold;
  },

  /**
   * Checks if a position collides with any solid obstacles.
   * @param {Position} position
   * @param {Array<{x: number, y: number, width: number, height: number}>} obstacles
   * @returns {boolean}
   */
  checkCollision: (position, obstacles = []) => {
    return obstacles.some((obs) => {
      return (
        position.x >= obs.x &&
        position.x <= obs.x + obs.width &&
        position.y >= obs.y &&
        position.y <= obs.y + obs.height
      );
    });
  },
};
