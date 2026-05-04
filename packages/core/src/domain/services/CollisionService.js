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
   * @param {object} [options]
   * @param {number} [options.widthBuffer]
   * @param {number} [options.heightBuffer]
   * @returns {boolean}
   */
  checkCollision: (position, obstacles = [], options = {}) => {
    const { widthBuffer = 0, heightBuffer = 0 } = options;
    return obstacles.some((obs) => {
      return (
        position.x + widthBuffer >= obs.x &&
        position.x - widthBuffer <= obs.x + obs.width &&
        position.y + heightBuffer >= obs.y &&
        position.y - heightBuffer <= obs.y + obs.height
      );
    });
  },
};
