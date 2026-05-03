import { LitElement, html } from "lit";
import { SignalWatcher } from "@lit-labs/signals";
import { consume } from "@lit/context";
import { gameStoreContext } from "./GameStore.context.js";
import { gameViewportStyles } from "./LeGameViewport.styles.js";
import "./le-hero.js";

/**
 * LeGameViewport
 *
 * Component that renders the game level and the hero position using relative coordinates (0-100%).
 * It uses SignalWatcher to reactively update when the gameStore signals change.
 *
 * @customElement le-game-viewport
 */
export class LeGameViewport extends SignalWatcher(LitElement) {
  static styles = gameViewportStyles;

  /** @type {import("../../infrastructure/GameStore.js").GameStore} */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  render() {
    if (!this.gameStore) {
      return html`
        <div class="loading">Loading store...</div>
      `;
    }

    const pos = this.gameStore.heroPosition.get();
    const outfit = this.gameStore.heroOutfit.get();
    const obstacles = this.gameStore.obstacles.get();

    return html`
      <div class="viewport">
        <!-- Render Map/Background here in the future -->
        
        <!-- Render Obstacles (Debug visualization) -->
        ${obstacles.map(
          (obs) => html`
            <div 
              class="obstacle" 
              style="left: ${obs.x}%; top: ${obs.y}%; width: ${obs.width}%; height: ${obs.height}%;"
            ></div>
          `,
        )}

        <!-- Render Hero -->
        <le-hero 
          .outfit=${outfit}
          style="left: ${pos.x}%; top: ${pos.y}%;"
        ></le-hero>

        <!-- Future: Render NPCs, Rewards, etc. -->
      </div>
    `;
  }
}
