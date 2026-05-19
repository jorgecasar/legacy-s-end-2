import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { html, css, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { ReadDialogueAloud } from "@legacys-end/core/use-cases/ReadDialogueAloud.js";
import { ttsPortContext } from "@legacys-end/core/infrastructure/TextToSpeechPort.context.js";
import { gameStoreContext } from "./GameStore.context.js";

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
  static styles = css`
    :host {
      position: absolute;
      bottom: var(--wa-spacing-large);
      left: var(--wa-spacing-large);
      right: var(--wa-spacing-large);
      z-index: 100;
    }

    :host([hidden]) {
      display: none !important;
    }

    :host(:not([hidden])) {
      display: flex !important;
    }

    wa-card {
      width: 100%;
    }
  `;

  /** @type {GameStore} */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  /** @type {TextToSpeechPort} */
  @consume({ context: ttsPortContext, subscribe: true })
  accessor ttsPort;

  @property({ type: Boolean, reflect: true })
  accessor hidden = true;

  #lastDialogueId = "";

  willUpdate(_changedProperties) {
    if (this.gameStore) {
      this.hidden = !this.gameStore.currentDialogue.get();
    }
  }

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

    if (!dialogue) {
      return html`
        <!-- No active dialogue -->
      `;
    }

    return html`
      <wa-card>
        <div slot="header" class="wa-heading-l wa-font-weight-bold wa-color-brand-on-quiet">${dialogue.speaker}</div>
        <div class="wa-body-m wa-color-text-normal" style="min-height: 2em; padding: var(--wa-spacing-medium) 0;">${dialogue.text}</div>
        <div slot="footer" class="wa-cluster" style="justify-content: flex-end;">
          <wa-button variant="brand" @click=${this._handleNext}>${msg("Next")}</wa-button>
        </div>
      </wa-card>
    `;
  }

  _handleNext() {
    console.log("[LeDialogueOverlay] 'Next' clicked.");
    this.gameStore.advanceDialogue();
  }
}
