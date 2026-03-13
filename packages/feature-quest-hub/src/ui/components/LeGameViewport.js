import { LitElement, html } from "lit";
import { SignalWatcher } from "@lit-labs/signals";
import { consume } from "@lit/context";
import { gameStoreContext } from "./GameStore.context.js";
import { gameViewportStyles } from "./LeGameViewport.styles.js";
import "./le-hero.js";

/**
 * LeGameViewport
 *
 * Component that renders the game level and the hero position.
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
    if (!this.gameStore)
      return html`
        <div>Loading store...</div>
      `;

    const heroState = this.gameStore.heroState.get();
    const levelMap = this.gameStore.levelMap.get();

    if (!levelMap || levelMap.length === 0) {
      return html`
        <div>Loading level...</div>
      `;
    }

    const rows = levelMap.length;
    const cols = levelMap[0].length;

    return html`
      <div class="grid" style="grid-template-rows: repeat(${rows}, 1fr); grid-template-columns: repeat(${cols}, 1fr);">
        ${levelMap.map((row, y) =>
          row.map(
            (tileType, x) => html`
          <div class="tile" data-type="${tileType}" data-x="${x}" data-y="${y}"></div>
        `,
          ),
        )}
        
        ${
          heroState
            ? html`
          <le-hero 
            style="grid-row: ${heroState.position.y + 1}; grid-column: ${heroState.position.x + 1};"
          ></le-hero>
        `
            : ""
        }
      </div>
    `;
  }
}
