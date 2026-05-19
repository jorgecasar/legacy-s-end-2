/**
 * EntityViewRegistry
 *
 * Strategy for mapping entity types to their visual representation.
 * Follows Open/Closed Principle.
 */

import { msg } from "@lit/localize";

const registry = {
  npc: { icon: "person", className: "npc" },
  item: { icon: "gift", className: "item" },
  default: { icon: "question", className: "unknown" },
};

export const EntityViewRegistry = {
  /**
   * Returns the view metadata for an entity type.
   * @param {string} type
   */
  getView: (type) => {
    return registry[type] || registry.default;
  },

  /**
   * Register a new entity type view.
   * @param {string} type
   * @param {{icon: string, className: string}} config
   */
  register: (type, config) => {
    registry[type] = config;
  },
};

const itemRegistry = {
  "item-relic": {
    icon: "gift",
    get label() {
      return msg("Relic");
    },
  },
  default: {
    icon: "box",
    get label() {
      return msg("Item");
    },
  },
};

export const ItemViewRegistry = {
  /**
   * Returns the view metadata for a specific item ID.
   * @param {string} itemId
   */
  getItemView: (itemId) => {
    return itemRegistry[itemId] || itemRegistry.default;
  },
};
