import "@awesome.me/webawesome/dist/components/button/button.js";
import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { menuStyles } from "./LeMenu.styles.js";

/**
 * LeMenu
 *
 * In-game menu for pausing, settings, and quitting.
 *
 * @customElement le-menu
 */
export class LeMenu extends LitElement {
  static styles = menuStyles;

  @property({ type: Boolean, reflect: true })
  accessor open = false;

  render() {
    return html`
      <div class="menu-container">
        <h2>${msg("Game Menu")}</h2>
        
        <div class="menu-options">
          <wa-button variant="brand" @click=${this.#resume}>
            ${msg("Continue Playing")}
          </wa-button>
          
          <wa-button variant="neutral" @click=${this.#quit}>
            ${msg("Quit to Hub")}
          </wa-button>
        </div>

        <div class="hint">${msg("Press ESC to resume")}</div>
      </div>
    `;
  }

  #resume() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("resume-game", { bubbles: true, composed: true }));
  }

  #quit() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("quit-to-hub", { bubbles: true, composed: true }));
  }
}
