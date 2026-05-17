import "@awesome.me/webawesome/dist/components/button/button.js";
import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { ReadDialogueAloud } from "@legacys-end/core/use-cases/ReadDialogueAloud.js";
import { ttsPortContext } from "@legacys-end/core/infrastructure/TextToSpeechPort.context.js";
import { gameStoreContext } from "./GameStore.context.js";
import { dialogueOverlayStyles } from "./LeDialogueOverlay.styles.js";

/** @typedef {import("../../infrastructure/GameStore.js").GameStore} GameStore */
/** @typedef {import("@legacys-end/core/use-cases/ports/TextToSpeechPort.js").TextToSpeechPort} TextToSpeechPort */

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

  /** @type {GameStore} */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  /** @type {TextToSpeechPort} */
  @consume({ context: ttsPortContext, subscribe: true })
  accessor ttsPort;

  @property({ type: Boolean, reflect: true })
  accessor hidden = true;

  #lastDialogueId = "";

  updated(changedProperties) {
    super.updated(changedProperties);
    const dialogue = this.gameStore?.currentDialogue.get();

    // Trigger speech side-effect when dialogue ID changes
    if (dialogue && dialogue.id !== this.#lastDialogueId) {
      this.#lastDialogueId = dialogue.id;

      if (this.gameStore?.npcVoiceEnabled.get() && this.ttsPort) {
        this.#speak(dialogue);
      }
    } else if (!dialogue) {
      this.#lastDialogueId = "";
    }
  }

  async #speak(dialogue) {
    if (!dialogue?.text) return;
    await ReadDialogueAloud.execute({
      text: dialogue.text,
      ttsPort: this.ttsPort,
    });
  }

  render() {
    if (!this.gameStore) return html``;

    const dialogue = this.gameStore.currentDialogue.get();

    // Update hidden state during render to avoid the "update after update completed" warning
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
        <wa-button variant="brand" @click=${this._handleNext}>Next</wa-button>
      </div>
    `;
  }

  _handleNext() {
    this.gameStore.advanceDialogue();
  }
}
