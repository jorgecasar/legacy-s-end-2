import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { SignalWatcher } from "@lit-labs/signals";
import { consume } from "@lit/context";
import { gameStoreContext } from "./GameStore.context.js";
import { dialogueOverlayStyles } from "./LeDialogueOverlay.styles.js";

/**
 * LeDialogueOverlay
 *
 * Component that displays NPC dialogue and allows progression.
 * It uses SignalWatcher to reactively update when gameStore.currentDialogue changes.
 *
 * @customElement le-dialogue-overlay
 */
export class LeDialogueOverlay extends SignalWatcher(LitElement) {
  static styles = dialogueOverlayStyles;

  /** @type {import("../../infrastructure/GameStore.js").GameStore} */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  @property({ type: Boolean, reflect: true })
  accessor hidden = true;

  render() {
    if (!this.gameStore) return html``;

    const dialogue = this.gameStore.currentDialogue.get();

    this.hidden = !dialogue;

    if (!dialogue) {
      return html`
        <!-- No active dialogue -->
      `;
    }

    return html`
      <div class="speaker">${dialogue.speaker}</div>
      <div class="text">${dialogue.text}</div>
      <div class="actions">
        <button @click=${this._handleNext}>Next</button>
      </div>
    `;
  }

  _handleNext() {
    this.gameStore.advanceDialogue();
  }
}
