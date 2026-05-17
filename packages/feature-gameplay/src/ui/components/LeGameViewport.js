import { LitElement, html } from "lit";
import { SignalWatcher } from "@lit-labs/signals";
import { consume } from "@lit/context";
import { gameStoreContext } from "./GameStore.context.js";
import { gameViewportStyles } from "./LeGameViewport.styles.js";
import { EntityViewRegistry } from "./EntityViewRegistry.js";
import "./le-hero.js";
import "./le-inventory.js";

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
    const background = this.gameStore.background.get();

    return html`
      <div class="viewport" data-background=${background}>
        ${this.#renderObstacles()}
        ${this.#renderEntities()}
        ${this.#renderExitZone()}
        <le-hero .outfit=${outfit} style="left: ${pos.x}%; top: ${pos.y}%;"></le-hero>
        <le-inventory></le-inventory>
      </div>
    `;
  }

  #renderExitZone() {
    const zone = this.gameStore.exitZone.get();
    if (!zone) return "";

    return html`
      <div 
        class="exit-zone" 
        style="left: ${zone.x}%; top: ${zone.y}%; width: ${zone.radius * 2}%; height: ${zone.radius * 2 * 1.77}%;"
      >
        NEXT
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

  #renderEntities() {
    const nearbyId = this.gameStore.nearbyEntityId.get();
    return this.gameStore.entities.get().map((ent) => {
      const { icon, className } = EntityViewRegistry.getView(ent.type);

      return html`
        <div class=${className} style="left: ${ent.position.x}%; top: ${ent.position.y}%;">
          <wa-icon name=${icon}></wa-icon>
          ${
            nearbyId === ent.id
              ? html`
                  <div class="interaction-prompt">Press E</div>
                `
              : ""
          }
        </div>
      `;
    });
  }
}
