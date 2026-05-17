import "@awesome.me/webawesome/dist/components/switch/switch.js";
import "@awesome.me/webawesome/dist/components/progress-bar/progress-bar.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { html, LitElement } from "lit";
import { state } from "lit/decorators.js";
import { aiCapabilityPortContext } from "@legacys-end/core/infrastructure/AICapabilityPort.context.js";
import { aiGenerationPortContext } from "@legacys-end/core/infrastructure/AIGenerationPort.context.js";
import { gameStoreContext } from "@legacys-end/feature-gameplay/ui/components/GameStore.context.js";
import { settingsStyles } from "./LeSettings.styles.js";

/**
 * LeSettings
 *
 * Component that manages global AI settings and shows API availability.
 *
 * @customElement le-settings
 */
export class LeSettings extends SignalWatcher(LitElement) {
  static styles = settingsStyles;

  /** @type {import("@legacys-end/core/use-cases/ports/AICapabilityPort.js").AICapabilityPort} */
  @consume({ context: aiCapabilityPortContext, subscribe: true })
  accessor aiCapabilityPort;

  /** @type {import("@legacys-end/core/use-cases/ports/AIGenerationPort.js").AIGenerationPort} */
  @consume({ context: aiGenerationPortContext, subscribe: true })
  accessor aiGenerationPort;

  /** @type {import("@legacys-end/feature-gameplay/infrastructure/GameStore.js").GameStore} */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  @state()
  accessor #capabilities = {
    speechRecognition: false,
    speechSynthesis: false,
    promptAPI: "unavailable",
    translatorAPI: false,
  };

  @state()
  accessor #downloadProgress = { loaded: 0, total: 0 };

  @state()
  accessor #isDownloading = false;

  async firstUpdated() {
    await this.#recheck();
  }

  async #recheck() {
    if (this.aiCapabilityPort) {
      this.#capabilities = await this.aiCapabilityPort.getCapabilities();
      console.log("[LeSettings] Capabilities updated:", this.#capabilities);
    }
  }

  #onSettingChange(signal, e) {
    const checked = e.target.checked;
    console.log(`[LeSettings] Setting changed: ${checked}`);
    signal.set(checked);
    this.gameStore.saveSettings();

    // Special case: AI Dialogue needs to check for download
    if (
      signal === this.gameStore.aiDialogueEnabled &&
      checked &&
      this.#capabilities.promptAPI === "after-download"
    ) {
      this.#startDownload();
    }
  }

  async #startDownload() {
    if (this.#isDownloading || !this.aiGenerationPort) return;

    this.#isDownloading = true;
    const result = await this.aiGenerationPort.downloadModel({
      onDownloadProgress: (loaded, total) => {
        this.#downloadProgress = { loaded, total };
      },
    });

    this.#isDownloading = false;
    if (result.success) {
      this.#capabilities = await this.aiCapabilityPort.getCapabilities();
    }
  }

  render() {
    if (!this.gameStore) return html``;

    return html`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="margin: 0;">AI Settings</h2>
        <wa-button variant="neutral" size="small" @click=${this.#recheck}>
          Re-check Status
        </wa-button>
      </div>
      <div class="setting-group">
        ${this.#renderSetting({
          id: "npc-voice",
          label: "NPC Voice (TTS)",
          info: "Read NPC dialogue aloud.",
          unavailableInfo: "Speech Synthesis API not available.",
          isAvailable: this.#capabilities.speechSynthesis,
          signal: this.gameStore.npcVoiceEnabled,
        })}

        ${this.#renderSetting({
          id: "voice-commands",
          label: "Voice Commands (STT)",
          info: "Use your voice to control the hero.",
          unavailableInfo: "Speech Recognition API not available.",
          isAvailable: this.#capabilities.speechRecognition,
          signal: this.gameStore.voiceCommandsEnabled,
        })}

        ${this.#renderSetting({
          id: "ai-dialogue",
          label: "AI Dynamic Dialogue",
          info: "", // Handled by #renderPromptAPIInfo
          unavailableInfo: "",
          isAvailable: this.#capabilities.promptAPI !== "unavailable",
          signal: this.gameStore.aiDialogueEnabled,
        })}
        ${this.#renderPromptAPIInfo()}
      </div>
    `;
  }

  #renderSetting({ id, label, info, unavailableInfo, isAvailable, signal }) {
    return html`
      <div class="setting-item">
        <label for=${id}>${label}</label>
        <wa-switch
          id=${id}
          ?disabled=${!isAvailable}
          ?checked=${signal.get()}
          @change=${(e) => this.#onSettingChange(signal, e)}
          @wa-change=${(e) => this.#onSettingChange(signal, e)}
        ></wa-switch>
      </div>
      ${
        !isAvailable && unavailableInfo
          ? html`<div class="info unavailable">${unavailableInfo}</div>`
          : info
            ? html`<div class="info">${info}</div>`
            : html``
      }
    `;
  }

  #renderPromptAPIInfo() {
    const status = this.#capabilities.promptAPI;
    if (status === "unavailable") {
      return html`
        <div class="info unavailable">
          Prompt API (Gemini Nano) not available.
          <div style="margin-top: 8px">
            <strong>Troubleshooting Checklist:</strong>
            <ol style="margin: 4px 0; padding-left: 20px">
              <li>
                Flags: <code>#optimization-guide-on-device-model</code> (Enabled BypassPref) and
                <code>#prompt-api-for-gemini-nano</code> (Enabled).
              </li>
              <li>Hardware: Chrome requires at least 4GB of RAM and a capable GPU for local AI.</li>
              <li>
                Power: If you are on a laptop, <strong>plug in the charger</strong>. Chrome often disables
                AI on battery.
              </li>
              <li>
                Components: Check <code>chrome://components</code> for "Optimization Guide" version >
                0.0.0.0.
              </li>
            </ol>
          </div>
        </div>
      `;
    }

    if (this.#isDownloading) {
      const percent = this.#downloadProgress.total
        ? Math.round((this.#downloadProgress.loaded / this.#downloadProgress.total) * 100)
        : 0;
      return html`
        <div class="info">
          Downloading model: ${percent}%
          <wa-progress-bar value=${percent}></wa-progress-bar>
        </div>
      `;
    }

    if (status === "after-download") {
      return html`
        <div class="info">
          Gemini Nano needs to be downloaded.
          <span class="status-badge">Download required</span>
          <wa-button variant="brand" size="small" @click=${this.#startDownload} style="margin-left: 8px">Download Now</wa-button>
        </div>
      `;
    }
    return html`
      <div class="info">Generate unique NPC responses via Gemini Nano.</div>
    `;
  }
}
