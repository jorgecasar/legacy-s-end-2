import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/tooltip/tooltip.js";
import { LitElement, html } from "lit";
import { SignalWatcher } from "@lit-labs/signals";
import { msg, updateWhenLocaleChanges } from "@lit/localize";
import { consume } from "@lit/context";
import { gameStoreContext } from "./GameStore.context.js";
import { inventoryStyles } from "./LeInventory.styles.js";
import { ItemViewRegistry } from "./EntityViewRegistry.js";

/**
 * LeInventory
 *
 * Component that displays the hero's current inventory.
 *
 * @customElement le-inventory
 */
export class LeInventory extends SignalWatcher(LitElement) {
  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

  static styles = inventoryStyles;

  /** @type {import("../../infrastructure/GameStore.js").GameStore} */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  render() {
    const heroState = this.gameStore?.heroState?.get();
    if (!heroState) {
      return html``;
    }

    const inventory = heroState.inventory || [];
    console.log("[LeInventory] Rendering slots. Inventory data:", JSON.stringify(inventory));

    const MAX_SLOTS = 5;
    const slots = Array.from({ length: MAX_SLOTS });

    return html`
      <div class="inventory-bar" role="region" aria-label="Inventory">
        ${slots.map((_, i) => {
          const item = inventory[i];
          const hasItem = typeof item === "string" && item.length > 0;
          const itemView = hasItem ? ItemViewRegistry.getItemView(item) : null;

          if (hasItem) {
            console.log(`[LeInventory] Slot ${i} has item: "${item}". View:`, itemView);
          }

          return html`
            <div 
              class="slot ${hasItem ? "occupied" : "empty"}" 
              data-slot-index=${i}
              title=${hasItem ? itemView.label : msg("Empty Slot")}
            >
              ${
                hasItem
                  ? html`
                      <wa-icon 
                        name=${itemView.icon || "star"} 
                        label=${itemView.label}
                      ></wa-icon>
                    `
                  : ""
              }
            </div>
          `;
        })}
      </div>
    `;
  }
}
