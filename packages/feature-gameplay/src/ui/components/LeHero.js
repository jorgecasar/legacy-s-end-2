import "@awesome.me/webawesome/dist/components/icon/icon.js";
import { LitElement, html } from "lit";
import { SignalWatcher } from "@lit-labs/signals";
import { consume } from "@lit/context";
import { property } from "lit/decorators.js";
import { gameStoreContext } from "./GameStore.context.js";
import { heroStyles } from "./LeHero.styles.js";

/**
 * LeHero
 *
 * Component representing the hero on the game viewport.
 *
 * @customElement le-hero
 */
export class LeHero extends SignalWatcher(LitElement) {
  static styles = heroStyles;

  @property({ type: String })
  accessor outfit = "base";

  /** @type {import("../../infrastructure/GameStore.js").GameStore} */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  render() {
    const lastCollision = this.gameStore?.lastCollision.get();
    const isColliding = lastCollision && Date.now() - lastCollision.time < 200;

    if (isColliding) {
      this.classList.add("colliding");
    } else {
      this.classList.remove("colliding");
    }

    return html`
      <wa-icon name="user-ninja"></wa-icon>
    `;
  }
}
