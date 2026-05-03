import { contentAdapterContext } from "@legacys-end/core/infrastructure/ContentAdapter.context.js";
import { ContentAdapter } from "@legacys-end/core/infrastructure/ContentAdapter.js";
import { LocalStorageAdapter } from "@legacys-end/core/infrastructure/LocalStorageAdapter.js";
import AutoSaveService from "@legacys-end/core/infrastructure/AutoSaveService.js";
import { provide } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { html, LitElement } from "lit";
import { QuestStatus } from "../../domain/entities/QuestStatus.js";
import { GameStore } from "../../infrastructure/GameStore.js";
import { StaticQuestRepository } from "../../infrastructure/StaticQuestRepository.js";
import { ListAvailableQuestsInteractor } from "../../use-cases/ListAvailableQuestsInteractor.js";
import { gameStoreContext } from "./GameStore.context.js";
import { appStyles } from "./LeApp.styles.js";
import { questUseCaseContext } from "./LeQuestHub.context.js";
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

    // Baseline mission data (Static for Phase 1)
    const baselineQuests = [
      {
        id: "q1",
        title: "Story: Awakening",
        status: QuestStatus.AVAILABLE,
        description: "Wake up, hero. The world is ending.",
        objective: "Wake up and talk to Elder Alarion.",
        image: "",
        level: 1,
      },
      {
        id: "q2",
        title: "Story: Syntax",
        status: QuestStatus.LOCKED,
        description: "Master the ancient syntax of the world.",
        objective: "Unlock the first gate.",
        image: "",
        level: 2,
      },
      {
        id: "q3",
        title: "Story: Master",
        status: QuestStatus.LOCKED,
        description: "The ultimate challenge awaits.",
        objective: "Defeat the void.",
        image: "",
        level: 3,
      },
    ];

    // Infrastructure setup
    const questRepository = new StaticQuestRepository(baselineQuests);
    this.contentAdapter = new ContentAdapter();

    // Use Case setup
    this.listQuestsUseCase = new ListAvailableQuestsInteractor(questRepository);

    // Store setup
    this.gameStore = new GameStore();

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
    window.addEventListener("keydown", (e) => this.#handleKeyDown(e));
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
  #handleKeyDown(e) {
    if (!this.gameStore.activeQuest.get()) return;

    const direction = this.#KEY_MAP[e.key];
    if (direction) {
      this.gameStore.moveHero(direction);
    } else if (e.key === "e") {
      this.gameStore.interact();
    }
  }

  render() {
    return html`
      <main>
        ${
          this.gameStore.activeQuest.get()
            ? html`
                <le-game-level></le-game-level>
              `
            : html`
                <le-quest-hub></le-quest-hub>
              `
        }
      </main>
    `;
  }
}
