import "@awesome.me/webawesome/dist/components/icon/icon.js";
import { LitElement, html } from "lit";
import { SignalWatcher } from "@lit-labs/signals";
import { consume } from "@lit/context";
import { gameStoreContext } from "./GameStore.context.js";
import { inventoryStyles } from "./LeInventory.styles.js";

/**
 * LeInventory
 *
 * Component that displays the hero's current inventory.
 *
 * @customElement le-inventory
 */
export class LeInventory extends SignalWatcher(LitElement) {
  static styles = inventoryStyles;

  /** @type {import("../../infrastructure/GameStore.js").GameStore} */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  render() {
    const inventory = this.gameStore?.heroState?.get()?.inventory || [];
    const MAX_SLOTS = 5;
    const slots = Array.from({ length: MAX_SLOTS });

    return html`
      <div class="inventory-bar">
        ${slots.map((_, i) => {
          const item = inventory[i];
          return html`
            <div class="slot ${item ? "occupied" : ""}">
              ${
                item
                  ? html`
                      <wa-icon name="gift"></wa-icon>
                    `
                  : ""
              }
              ${item ? html`<div class="item-name">${item}</div>` : ""}
            </div>
          `;
        })}
      </div>
    `;
  }
}
