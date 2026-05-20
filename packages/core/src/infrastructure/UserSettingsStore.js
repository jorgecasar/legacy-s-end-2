import { signal } from "@lit-labs/signals";

/**
 * UserSettingsStore
 *
 * Separated state management for player settings/preferences
 * (NPC voice, AI dialogue, Voice commands, and active Language).
 */
export class UserSettingsStore {
  #storageAdapter = null;

  /** Settings signals */
  npcVoiceEnabled = signal(false);
  aiDialogueEnabled = signal(false);
  voiceCommandsEnabled = signal(false);
  language = signal("en");

  /**
   * Sets the storage adapter to load and save settings
   * @param {import("../use-cases/ports/StoragePort.js").StoragePort} storageAdapter
   */
  setStorageAdapter(storageAdapter) {
    this.#storageAdapter = storageAdapter;
  }

  /**
   * Loads saved settings from storage
   * @returns {object} Result object containing success and settings
   */
  loadSettings() {
    if (!this.#storageAdapter) {
      return { success: false, error: "Storage adapter not set" };
    }

    const savedData = this.#storageAdapter.load();
    if (savedData.success && savedData.value?.settings) {
      const { settings } = savedData.value;
      if (settings.npcVoiceEnabled !== undefined) {
        this.npcVoiceEnabled.set(settings.npcVoiceEnabled);
      }
      if (settings.aiDialogueEnabled !== undefined) {
        this.aiDialogueEnabled.set(settings.aiDialogueEnabled);
      }
      if (settings.voiceCommandsEnabled !== undefined) {
        this.voiceCommandsEnabled.set(settings.voiceCommandsEnabled);
      }
      if (settings.language !== undefined) {
        this.language.set(settings.language);
      }
      return { success: true, value: settings };
    }
    return { success: true, value: null };
  }

  /**
   * Persists the current settings to storage
   * @returns {object} Result object containing success
   */
  saveSettings() {
    if (!this.#storageAdapter) {
      return { success: false, error: "Storage adapter not set" };
    }

    const settings = {
      npcVoiceEnabled: this.npcVoiceEnabled.get(),
      aiDialogueEnabled: this.aiDialogueEnabled.get(),
      voiceCommandsEnabled: this.voiceCommandsEnabled.get(),
      language: this.language.get(),
    };

    const currentData = this.#storageAdapter.load().value || {};
    const updatedData = {
      ...currentData,
      settings,
    };

    const saveResult = this.#storageAdapter.save(updatedData);
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }
    return { success: true, value: true };
  }
}
