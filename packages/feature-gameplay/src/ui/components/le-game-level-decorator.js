import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { provide } from "@lit/context";
import { gameStoreContext } from "./GameStore.context.js";

// Simple decorator component to provide context in stories
export class LeGameLevelDecorator extends LitElement {
  @provide({ context: gameStoreContext })
  @property({ type: Object })
  accessor store;

  render() {
    return html`
      <slot></slot>
    `;
  }
}

if (!customElements.get("le-game-level-decorator")) {
  customElements.define("le-game-level-decorator", LeGameLevelDecorator);
}
