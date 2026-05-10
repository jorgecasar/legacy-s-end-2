import { contentAdapterContext } from "@legacys-end/core/infrastructure/ContentAdapter.context.js";
import { ContentAdapter } from "@legacys-end/core/infrastructure/ContentAdapter.js";
import { LocalStorageAdapter } from "@legacys-end/core/infrastructure/LocalStorageAdapter.js";
import AutoSaveService from "@legacys-end/core/infrastructure/AutoSaveService.js";
import { provide } from "@lit/context";
import { Router } from "@lit-labs/router";
import { SignalWatcher } from "@lit-labs/signals";
import { html, LitElement } from "lit";
import { setLocale } from "../../i18n/localization.js";
import { QuestStatus } from "../../domain/entities/QuestStatus.js";
import { GameStore } from "../../infrastructure/GameStore.js";
import { StaticQuestRepository } from "../../infrastructure/StaticQuestRepository.js";
import { ListAvailableQuestsInteractor } from "../../use-cases/ListAvailableQuestsInteractor.js";
import { CompleteQuestInteractor } from "../../use-cases/CompleteQuestInteractor.js";
import { gameStoreContext } from "./GameStore.context.js";
import { appStyles } from "./LeApp.styles.js";
import { questUseCaseContext } from "./LeQuestHub.context.js";
import { questRepositoryContext } from "./QuestRepository.context.js";
import "./le-quest-hub.js";
import "./le-game-level.js";

/**
 * LeApp
 *
 * Composition Root component that manages the lifecycle of shared services
 * and provides them to the rest of the application via @lit/context.
 *
 * @customElement le-app
 */
export class LeApp extends SignalWatcher(LitElement) {
  static styles = appStyles;

  /** @type {Router} */
  #router = new Router(this, [
    {
      path: "/",
      render: () =>
        html`
          <le-quest-hub></le-quest-hub>
        `,
    },
    {
      // Fallback for Storybook iframe environment
      path: "/iframe.html",
      render: () =>
        html`
          <le-quest-hub></le-quest-hub>
        `,
    },
    {
      path: "/quest/:id",
      render: (params) => html`<le-game-level .questId=${params.id}></le-game-level>`,
    },
    {
      path: "/quest/:id/chapter/:chapter",
      render: (params) =>
        html`<le-game-level .questId=${params.id} .chapterIndex=${Number(params.chapter)}></le-game-level>`,
    },
  ]);

  /** @type {import("../../infrastructure/StaticQuestRepository.js").StaticQuestRepository} */
  @provide({ context: questRepositoryContext })
  accessor questRepository;

  /** @type {import("../../use-cases/ports/ListAvailableQuests.js").ListAvailableQuests} */
  @provide({ context: questUseCaseContext })
  accessor listQuestsUseCase;

  /** @type {import("../../infrastructure/GameStore.js").GameStore} */
  @provide({ context: gameStoreContext })
  accessor gameStore;

  /** @type {import("@legacys-end/core/infrastructure/ContentAdapter.js").ContentAdapter} */
  @provide({ context: contentAdapterContext })
  accessor contentAdapter;

  constructor() {
    super();

    // Initialize localization
    const detectedLocale = navigator.language.split("-")[0];
    if (detectedLocale === "es") {
      setLocale("es");
    }

    // Baseline mission data (Synchronized with content IDs)
    const baselineQuests = [
      {
        id: "alarions-awakening",
        title: "Story: Awakening",
        status: QuestStatus.AVAILABLE,
        description: "Wake up, hero. The world is ending.",
        objective: "Wake up and talk to Elder Alarion.",
        image: "",
        level: 1,
      },
      {
        id: "syntax-mastery",
        title: "Story: Syntax",
        status: QuestStatus.LOCKED,
        description: "Master the ancient syntax of the world.",
        objective: "Unlock the first gate.",
        image: "",
        level: 2,
      },
    ];

    // Infrastructure setup
    this.questRepository = new StaticQuestRepository(baselineQuests);
    this.contentAdapter = new ContentAdapter();

    // Use Case setup
    this.listQuestsUseCase = new ListAvailableQuestsInteractor(this.questRepository);

    // Store setup
    this.gameStore = new GameStore();

    const completeQuestUseCase = new CompleteQuestInteractor(this.questRepository);

    // Event listeners
    window.addEventListener("quest-selected", (e) => {
      const { quest } = /** @type {any} */ (e).detail;
      this.gameStore.activateQuest(quest);
      this.#router.goto(`/quest/${quest.id}`);
    });

    window.addEventListener("quest-completed", async (e) => {
      const { questId } = /** @type {any} */ (e).detail;
      await completeQuestUseCase.execute({ questId });
      // Return to hub
      this.gameStore.activeQuest.set(null);
      this.#router.goto("/");
    });

    window.addEventListener("navigate-to-hub", () => {
      this.gameStore.activeQuest.set(null);
      this.#router.goto("/");
    });

    // Persistence setup
    const storageAdapter = new LocalStorageAdapter();
    const autoSaveService = new AutoSaveService(storageAdapter);
    this.gameStore.setAutoSaveService(autoSaveService);

    // Force save on page unload
    window.addEventListener("beforeunload", () => {
      const heroState = this.gameStore.heroState.get();
      if (heroState) autoSaveService.forceSave(heroState);
    });

    // Keyboard controls
    this._handleKeyDown = this._handleKeyDown.bind(this);
    window.addEventListener("keydown", this._handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._handleKeyDown);
  }

  /** @type {Record<string, 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>} */
  #KEY_MAP = {
    ArrowUp: "UP",
    w: "UP",
    ArrowDown: "DOWN",
    s: "DOWN",
    ArrowLeft: "LEFT",
    a: "LEFT",
    ArrowRight: "RIGHT",
    d: "RIGHT",
  };

  /**
   * Global keyboard handler for hero movement and interaction.
   * @param {KeyboardEvent} e
   */
  _handleKeyDown(e) {
    if (!this.gameStore.activeQuest.get()) return;

    const key = e.key.toLowerCase();
    const direction = this.#KEY_MAP[e.key] || this.#KEY_MAP[key];

    if (direction) {
      this.gameStore.moveHero(direction);
    } else if (key === "e") {
      this.gameStore.interact();
    } else if (key === " " || key === "enter") {
      if (this.gameStore.currentDialogue.get()) {
        this.gameStore.advanceDialogue();
      }
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
