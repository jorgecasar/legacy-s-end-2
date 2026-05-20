import "@awesome.me/webawesome/dist/components/switch/switch.js";
import "@awesome.me/webawesome/dist/components/progress-bar/progress-bar.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { html, LitElement } from "lit";
import { state } from "lit/decorators.js";
import { msg, updateWhenLocaleChanges } from "@lit/localize";
import { setLocale, getLocale } from "@legacys-end/core/i18n/localization.js";
import { aiCapabilityPortContext } from "@legacys-end/core/infrastructure/AICapabilityPort.context.js";
import { aiGenerationPortContext } from "@legacys-end/core/infrastructure/AIGenerationPort.context.js";
import { gameStoreContext } from "@legacys-end/feature-gameplay/ui/components/GameStore.context.js";
import { userSettingsStoreContext } from "@legacys-end/core/infrastructure/UserSettingsStore.context.js";
import { settingsStyles } from "./LeSettings.styles.js";

/**
 * LeSettings
 *
 * Component that manages global AI settings and shows API availability.
 *
 * @customElement le-settings
 */
export class LeSettings extends SignalWatcher(LitElement) {
  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

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

  /** @type {import("@legacys-end/core/infrastructure/UserSettingsStore.js").UserSettingsStore} */
  @consume({ context: userSettingsStoreContext, subscribe: true })
  accessor userSettingsStore;

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
    this.userSettingsStore.saveSettings();

    // Special case: AI Dialogue needs to check for download
    if (
      signal === this.userSettingsStore.aiDialogueEnabled &&
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

  async #onLanguageChange(e) {
    const lang = e.target.value;
    console.log(`[LeSettings] Changing language to: ${lang}`);
    await setLocale(lang);
    this.userSettingsStore.language.set(lang);
    this.userSettingsStore.saveSettings();
  }

  render() {
    if (!this.gameStore) return html``;

    return html`
      <div class="wa-split" style="margin-bottom: var(--wa-spacing-medium);">
        <h2 class="wa-heading-l" style="margin: 0;">${msg("Settings")}</h2>
        <wa-button variant="neutral" size="small" @click=${this.#recheck}>
          ${msg("Re-check Status")}
        </wa-button>
      </div>
      <div class="wa-stack" style="gap: var(--wa-spacing-medium); margin-bottom: var(--wa-spacing-medium);">
        <div class="wa-split" style="align-items: center; gap: var(--wa-spacing-medium);">
          <label for="language-select" style="font-weight: var(--wa-font-weight-semibold);">${msg("Language")}</label>
          <select id="language-select" @change=${this.#onLanguageChange}>
            <option value="en" ?selected=${getLocale() === "en"}>English</option>
            <option value="es" ?selected=${getLocale() === "es"}>Español</option>
          </select>
        </div>
      </div>
      <div class="wa-stack" style="gap: var(--wa-spacing-medium);">
        ${this.#renderSetting({
          id: "npc-voice",
          label: msg("NPC Voice (TTS)"),
          info: msg("Read NPC dialogue aloud."),
          unavailableInfo: msg("Speech Synthesis API not available."),
          isAvailable: this.#capabilities.speechSynthesis,
          signal: this.userSettingsStore.npcVoiceEnabled,
        })}

        ${this.#renderSetting({
          id: "voice-commands",
          label: msg("Voice Commands (STT)"),
          info: msg("Use your voice to control the hero."),
          unavailableInfo: msg("Speech Recognition API not available."),
          isAvailable: this.#capabilities.speechRecognition,
          signal: this.userSettingsStore.voiceCommandsEnabled,
        })}

        ${this.#renderSetting({
          id: "ai-dialogue",
          label: msg("AI Dynamic Dialogue"),
          info: "", // Handled by #renderPromptAPIInfo
          unavailableInfo: "",
          isAvailable: this.#capabilities.promptAPI !== "unavailable",
          signal: this.userSettingsStore.aiDialogueEnabled,
        })}
        ${this.#renderPromptAPIInfo()}

        <div style="margin-top: var(--wa-spacing-large); padding-top: var(--wa-spacing-medium); border-top: 1px solid var(--wa-color-surface-border);">
          <wa-button variant="danger" @click=${() => this.gameStore.resetProgress()} fill>
            <wa-icon slot="prefix" name="trash"></wa-icon>
            ${msg("Reset All Progress")}
          </wa-button>
          <div class="wa-body-s wa-color-text-quiet" style="margin-top: var(--wa-spacing-small);">${msg("Clears inventory, objectives, and returns to Hub.")}</div>
        </div>
      </div>
    `;
  }

  #renderSetting({ id, label, info, unavailableInfo, isAvailable, signal }) {
    return html`
      <div class="wa-split" style="align-items: center; gap: var(--wa-spacing-medium);">
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
          ? html`<div class="wa-body-s wa-color-text-quiet" style="color: var(--wa-color-danger-default); margin-top: calc(-1 * var(--wa-spacing-small)); margin-bottom: var(--wa-spacing-small);">${unavailableInfo}</div>`
          : info
            ? html`<div class="wa-body-s wa-color-text-quiet" style="margin-top: calc(-1 * var(--wa-spacing-small)); margin-bottom: var(--wa-spacing-small);">${info}</div>`
            : html``
      }
    `;
  }

  #renderPromptAPIInfo() {
    const status = this.#capabilities.promptAPI;
    if (status === "unavailable") {
      return html`
        <div class="wa-body-s" style="color: var(--wa-color-danger-default); margin-top: calc(-1 * var(--wa-spacing-small)); margin-bottom: var(--wa-spacing-small);">
          ${msg("Prompt API (Gemini Nano) not available.")}
          <div style="margin-top: var(--wa-spacing-small)">
            <strong>${msg("Troubleshooting Checklist:")}</strong>
            <ol style="margin: var(--wa-spacing-small) 0; padding-left: var(--wa-spacing-large)">
              <li>
                ${msg("Flags:")} <code>#optimization-guide-on-device-model</code> (${msg("Enabled BypassPref")}) ${msg("and")}
                <code>#prompt-api-for-gemini-nano</code> (${msg("Enabled")}).
              </li>
              <li>${msg("Hardware: Chrome requires at least 4GB of RAM and a capable GPU for local AI.")}</li>
              <li>
                ${msg("Power: If you are on a laptop,")} <strong>${msg("plug in the charger")}</strong>. ${msg("Chrome often disables AI on battery.")}
              </li>
              <li>
                ${msg("Components: Check")} <code>chrome://components</code> ${msg('for "Optimization Guide" version > 0.0.0.0.')}
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
        <div class="wa-body-s wa-color-text-quiet" style="margin-top: calc(-1 * var(--wa-spacing-small)); margin-bottom: var(--wa-spacing-small);">
          ${msg("Downloading model:")} ${percent}%
          <wa-progress-bar value=${percent}></wa-progress-bar>
        </div>
      `;
    }

    if (status === "after-download") {
      return html`
        <div class="wa-body-s wa-color-text-quiet" style="margin-top: calc(-1 * var(--wa-spacing-small)); margin-bottom: var(--wa-spacing-small);">
          ${msg("Gemini Nano needs to be downloaded.")}
          <span style="font-size: var(--wa-font-size-2xs); padding: 2px 6px; border-radius: var(--wa-border-radius-small); background: var(--wa-color-surface-raised); border: 1px solid var(--wa-color-border-default);">${msg("Download required")}</span>
          <wa-button variant="brand" size="small" @click=${this.#startDownload} style="margin-left: var(--wa-spacing-small)">${msg("Download Now")}</wa-button>
        </div>
      `;
    }
    return html`
      <div class="wa-body-s wa-color-text-quiet" style="margin-top: calc(-1 * var(--wa-spacing-small)); margin-bottom: var(--wa-spacing-small);">${msg("Generate unique NPC responses via Gemini Nano.")}</div>
    `;
  }
}
