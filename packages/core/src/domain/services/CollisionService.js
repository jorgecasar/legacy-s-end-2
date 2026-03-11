/** @typedef {import("../entities/Position.js").default} Position */

/**
 * Checks if a position collides with any obstacles in the level map.
 *
 * @param {Position} position
 * @param {number[][]} levelMap
 * @returns {boolean}
 */
export const checkCollision = (position, levelMap) => {
  const x = position.x;
  const y = position.y;

  // Check map boundaries
  if (y < 0 || y >= levelMap.length || x < 0 || x >= levelMap[0].length) {
    return true;
  }

  // Check for obstacle (assuming 1 is an obstacle)
  return levelMap[y][x] === 1;
};
