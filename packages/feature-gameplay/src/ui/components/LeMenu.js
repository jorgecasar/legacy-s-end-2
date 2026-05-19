import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import { msg } from "@lit/localize";

/**
 * LeMenu
 *
 * In-game menu for pausing, settings, and quitting.
 *
 * @customElement le-menu
 */
export class LeMenu extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    wa-button {
      width: 100%;
    }
  `;

  @property({ type: Boolean, reflect: true })
  accessor open = false;

  render() {
    return html`
      <wa-dialog ?open=${this.open} @wa-hide=${this.#handleHide} label="${msg("Game Menu")}">
        <div class="wa-stack" style="gap: var(--wa-spacing-medium); text-align: center;">
          <h2 class="wa-heading-xl wa-color-brand-text-normal" style="margin: 0;">${msg("Game Menu")}</h2>
          
          <div class="wa-stack" style="gap: var(--wa-spacing-small);">
            <wa-button variant="brand" @click=${this.#resume}>
              ${msg("Continue Playing")}
            </wa-button>
            
            <wa-button variant="neutral" @click=${this.#quit}>
              ${msg("Quit to Hub")}
            </wa-button>
          </div>

          <div class="wa-body-s wa-color-text-quiet" style="margin-top: var(--wa-spacing-medium);">${msg("Press ESC to resume")}</div>
        </div>
      </wa-dialog>
    `;
  }

  #handleHide(event) {
    if (event.target.tagName === "WA-DIALOG") {
      this.#resume();
    }
  }

  #resume() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("resume-game", { bubbles: true, composed: true }));
  }

  #quit() {
    this.open = false;
    this.dispatchEvent(new CustomEvent("navigate-to-hub", { bubbles: true, composed: true }));
  }
}
