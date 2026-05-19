import { provide } from "@lit/context";
import { Router } from "@lit-labs/router";
import { SignalWatcher } from "@lit-labs/signals";
import { html, LitElement } from "lit";
import { registerIconLibrary } from "@awesome.me/webawesome/dist/components/icon/library.js";

// Register default icon library using public Font Awesome 6 free CDN to prevent 403 kit access errors.
registerIconLibrary("default", {
  resolver: (name) =>
    `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/solid/${name}.svg`,
});

import { contentAdapterContext } from "@legacys-end/core/infrastructure/ContentAdapter.context.js";
import { storageAdapterContext } from "@legacys-end/core/infrastructure/StorageAdapter.context.js";
import { ContentAdapter } from "@legacys-end/core/infrastructure/ContentAdapter.js";
import { LocalStorageAdapter } from "@legacys-end/core/infrastructure/LocalStorageAdapter.js";
import { BrowserAICapabilityAdapter } from "@legacys-end/core/infrastructure/BrowserAICapabilityAdapter.js";
import { aiCapabilityPortContext } from "@legacys-end/core/infrastructure/AICapabilityPort.context.js";
import { SpeechSynthesisAdapter } from "@legacys-end/core/infrastructure/SpeechSynthesisAdapter.js";
import { ttsPortContext } from "@legacys-end/core/infrastructure/TextToSpeechPort.context.js";
import { WebSpeechAdapter } from "@legacys-end/core/infrastructure/WebSpeechAdapter.js";
import { speechRecognitionPortContext } from "@legacys-end/core/infrastructure/SpeechRecognitionPort.context.js";
import { ChromePromptAdapter } from "@legacys-end/core/infrastructure/ChromePromptAdapter.js";
import { aiGenerationPortContext } from "@legacys-end/core/infrastructure/AIGenerationPort.context.js";
import { AutoSaveService } from "@legacys-end/core/infrastructure/AutoSaveService.js";
import { ProcessVoiceCommand } from "@legacys-end/core/use-cases/ProcessVoiceCommand.js";
import { setLocale } from "@legacys-end/core/i18n/localization.js";

import { QuestStatus } from "@legacys-end/feature-quest-hub/domain/entities/QuestStatus.js";
import { StaticQuestRepository } from "@legacys-end/feature-quest-hub/infrastructure/StaticQuestRepository.js";
import { ListAvailableQuestsInteractor } from "@legacys-end/feature-quest-hub/use-cases/ListAvailableQuestsInteractor.js";
import { InitializeQuest } from "@legacys-end/core/use-cases/InitializeQuest.js";
import { CompleteQuestInteractor } from "@legacys-end/feature-quest-hub/use-cases/CompleteQuestInteractor.js";
import { GameStore } from "@legacys-end/feature-gameplay/infrastructure/GameStore.js";
import { gameStoreContext } from "@legacys-end/feature-gameplay/ui/components/GameStore.context.js";
import { questRepositoryContext } from "@legacys-end/feature-quest-hub/ui/components/QuestRepository.context.js";

import { appStyles } from "./LeApp.styles.js";

/** @typedef {import("@legacys-end/feature-quest-hub/domain/entities/Quest.js").Quest} Quest */

const baselineQuests = [
  {
    id: "alarions-awakening",
    title: "Story: Awakening",
    description: "The void stirs. Wake up, hero.",
    status: QuestStatus.AVAILABLE,
  },
  {
    id: "the-shattered-coast",
    title: "Side: Shattered Coast",
    description: "Help the fishermen retrieve their lost nets.",
    status: QuestStatus.LOCKED,
  },
];

/**
 * LeApp (Composition Root)
 *
 * The main application shell that manages routing, global services, and cross-feature orchestration.
 *
 * @customElement le-app
 */
export class LeApp extends SignalWatcher(LitElement) {
  static styles = appStyles;

  /** @type {GameStore} */
  @provide({ context: gameStoreContext })
  accessor gameStore;

  /** @type {import("@legacys-end/core/infrastructure/ContentAdapter.js").ContentAdapter} */
  @provide({ context: contentAdapterContext })
  accessor contentAdapter;

  /** @type {import("@legacys-end/core/use-cases/ports/StoragePort.js").StoragePort} */
  @provide({ context: storageAdapterContext })
  accessor storageAdapter;

  /** @type {import("@legacys-end/feature-quest-hub/infrastructure/StaticQuestRepository.js").StaticQuestRepository} */
  @provide({ context: questRepositoryContext })
  accessor questRepository;

  /** @type {import("@legacys-end/core/use-cases/ports/AICapabilityPort.js").AICapabilityPort} */
  @provide({ context: aiCapabilityPortContext })
  accessor aiCapabilityPort;

  /** @type {import("@legacys-end/core/use-cases/ports/TextToSpeechPort.js").TextToSpeechPort} */
  @provide({ context: ttsPortContext })
  accessor ttsPort;

  /** @type {import("@legacys-end/core/use-cases/ports/SpeechRecognitionPort.js").SpeechRecognitionPort} */
  @provide({ context: speechRecognitionPortContext })
  accessor speechRecognitionPort;

  /** @type {import("@legacys-end/core/use-cases/ports/AIGenerationPort.js").AIGenerationPort} */
  @provide({ context: aiGenerationPortContext })
  accessor aiGenerationPort;

  constructor() {
    super();

    // Initialize localization
    const detectedLocale = navigator.language.split("-")[0];
    setLocale(detectedLocale || "en");

    // Infrastructure setup
    this.questRepository = new StaticQuestRepository(baselineQuests);
    this.contentAdapter = new ContentAdapter();
    this.storageAdapter = new LocalStorageAdapter();
    this.aiCapabilityPort = new BrowserAICapabilityAdapter();
    this.ttsPort = new SpeechSynthesisAdapter();
    this.speechRecognitionPort = new WebSpeechAdapter();
    this.aiGenerationPort = new ChromePromptAdapter();

    // Store setup
    this.gameStore = new GameStore();
    this.gameStore.setAIGenerationPort(this.aiGenerationPort);

    // Persistence setup
    const autoSaveService = new AutoSaveService(this.storageAdapter);
    this.gameStore.setAutoSaveService(autoSaveService);
    this.gameStore.setStorageAdapter(this.storageAdapter);

    // Load AI settings
    const savedData = this.storageAdapter.load();
    if (savedData.success && savedData.value?.settings) {
      const { settings } = savedData.value;
      if (settings.npcVoiceEnabled !== undefined)
        this.gameStore.npcVoiceEnabled.set(settings.npcVoiceEnabled);
      if (settings.aiDialogueEnabled !== undefined)
        this.gameStore.aiDialogueEnabled.set(settings.aiDialogueEnabled);
      if (settings.voiceCommandsEnabled !== undefined)
        this.gameStore.voiceCommandsEnabled.set(settings.voiceCommandsEnabled);
    }

    // Use Case setup
    this.listQuestsUseCase = new ListAvailableQuestsInteractor(this.questRepository);
    const completeQuestUseCase = new CompleteQuestInteractor(this.questRepository);

    // Event listeners
    window.addEventListener("quest-selected", (e) => {
      try {
        const { quest } = /** @type {any} */ (e).detail;
        this.#router.goto(`/quest/${quest.id}/chapter/0`);
      } catch (err) {
        console.error("[LeApp] Navigation failed:", err);
      }
    });

    window.addEventListener("quest-completed", async (e) => {
      const customEvent = /** @type {CustomEvent} */ (e);
      console.log("[LeApp] quest-completed event received:", customEvent.detail);
      const { questId } = customEvent.detail;
      await completeQuestUseCase.execute({ questId });

      // Return to hub
      this.gameStore.activeQuest.set(null);
      this.#router.goto("/");
    });

    window.addEventListener("navigate-to-hub", () => {
      console.log("[LeApp] navigate-to-hub event received.");
      const heroState = this.gameStore.heroState.get();
      if (heroState) {
        autoSaveService.forceSave(heroState);
      }
      this.gameStore.activeQuest.set(null);
      this.#router.goto("/");
    });

    // Key handlers for rapid prototyping/testing
    window.addEventListener("keydown", (e) => this.#handleGlobalKeys(e));

    // Force save on page unload
    window.addEventListener("beforeunload", () => {
      const heroState = this.gameStore.heroState.get();
      if (heroState) autoSaveService.forceSave(heroState);
    });
  }

  /** @type {import("@lit-labs/router").Router} */
  #router = new Router(this, [
    {
      path: "/",
      render: () =>
        html`<le-quest-hub .listQuestsUseCase=${this.listQuestsUseCase}></le-quest-hub>`,
      enter: async () => {
        await import("@legacys-end/feature-quest-hub/ui/components/le-quest-hub.js");
        return true;
      },
    },
    {
      path: "/quest/:id/chapter/:chapter",
      render: (params) => {
        return html`
          <le-game-level
            .questId=${params.id}
            .chapterIndex=${parseInt(params.chapter)}
            .initializeQuestUseCase=${InitializeQuest}
          ></le-game-level>
        `;
      },
      enter: async () => {
        await import("@legacys-end/feature-gameplay/ui/components/le-game-level.js");
        return true;
      },
    },
  ]);

  #KEY_MAP = {
    w: "UP",
    a: "LEFT",
    s: "DOWN",
    d: "RIGHT",
    ArrowUp: "UP",
    ArrowLeft: "LEFT",
    ArrowDown: "DOWN",
    ArrowRight: "RIGHT",
  };

  #handleGlobalKeys(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    const key = e.key;

    // Toggle Menu on Escape
    if (key === "Escape") {
      const level = this.renderRoot.querySelector("le-game-level");
      const menu = /** @type {any} */ (level?.shadowRoot?.querySelector("le-menu"));
      if (menu) {
        menu.open = !menu.open;
        return;
      }
    }

    const direction = this.#KEY_MAP[key] || this.#KEY_MAP[key.toLowerCase()];

    if (direction) {
      this.gameStore.moveHero(direction);
    } else if (key === "e") {
      console.log(
        "[LeApp] 'E' key pressed. Current dialogue:",
        !!this.gameStore.currentDialogue.get(),
      );
      if (this.gameStore.currentDialogue.get()) {
        this.gameStore.advanceDialogue();
      } else {
        this.gameStore.interact();
      }
    } else if (key === " " || key === "enter") {
      if (this.gameStore.currentDialogue.get()) {
        this.gameStore.advanceDialogue();
      }
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    this.#manageVoiceRecognition();
  }

  #isListening = false;
  async #manageVoiceRecognition() {
    const enabled = this.gameStore.voiceCommandsEnabled.get();

    if (enabled && !this.#isListening) {
      await this.#startListeningLoop();
    } else if (!enabled && this.#isListening) {
      this.speechRecognitionPort.stop();
    }
  }

  async #startListeningLoop() {
    this.#isListening = true;
    console.log("[LeApp] Starting voice recognition loop...");
    try {
      while (this.gameStore.voiceCommandsEnabled.get()) {
        const result = await this.speechRecognitionPort.listen();
        if (result.success && result.value) {
          console.log("[LeApp] Voice command recognized:", result.value);
          ProcessVoiceCommand.execute({
            transcript: result.value,
            gameStore: this.gameStore,
          });
        } else if (!result.success) {
          if (result.error.includes("no-speech")) {
            await new Promise((r) => setTimeout(r, 1000));
          } else {
            console.warn("[LeApp] Voice recognition error (non-fatal):", result.error);
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }
    } catch (e) {
      if (e.message.includes("message channel closed")) {
        console.debug("[LeApp] Browser IPC channel closed (ignoring).");
      } else {
        console.error("[LeApp] Critical error in voice recognition loop:", e);
      }
    } finally {
      this.#isListening = false;
      console.log("[LeApp] Voice recognition loop stopped.");
    }
  }

  render() {
    return html`
      <main>
        ${this.#router.outlet()}
      </main>
    `;
  }
}
