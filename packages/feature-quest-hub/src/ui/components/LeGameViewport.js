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

    return html`
      <div class="viewport">
        ${this.#renderObstacles()}
        ${this.#renderNPCs()}
        <le-hero .outfit=${outfit} style="left: ${pos.x}%; top: ${pos.y}%;"></le-hero>
      </div>
    `;
  }

  #renderObstacles() {
    return this.gameStore.obstacles.get().map(
      (obs) => html`
        <div 
          class="obstacle" 
          style="left: ${obs.x}%; top: ${obs.y}%; width: ${obs.width}%; height: ${obs.height}%;"
        ></div>
      `,
    );
  }

  #renderNPCs() {
    const nearbyId = this.gameStore.nearbyEntityId.get();
    return this.gameStore.entities.get().map(
      (ent) => html`
        <div class="npc" style="left: ${ent.position.x}%; top: ${ent.position.y}%;">
          <wa-icon name="person"></wa-icon>
          ${
            nearbyId === ent.id
              ? html`
                  <div class="interaction-prompt">Press E</div>
                `
              : ""
          }
        </div>
      `,
    );
  }
}
