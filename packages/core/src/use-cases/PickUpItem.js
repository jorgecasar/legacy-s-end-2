/**
 * Use Case: PickUpItem
 *
 * Adds an item to the hero's inventory.
 */
export const PickUpItem = {
  /**
   * @param {object} params
   * @param {import("../domain/entities/HeroState.js").HeroState} params.hero
   * @param {string} params.item
   * @returns {import("../domain/Result.js").Result<import("../domain/entities/HeroState.js").HeroState>}
   */
  execute: ({ hero, item }) => {
    return hero.addItem(item);
  },
};
