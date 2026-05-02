import { provide } from "@lit/context";
import { html, LitElement } from "lit";
import { gameStoreContext } from "./GameStore.context.js";
import { questUseCaseContext } from "./LeQuestHub.context.js";
import { appStyles } from "./LeApp.styles.js";
import { GameStore } from "../../infrastructure/GameStore.js";
import { StaticQuestRepository } from "../../infrastructure/StaticQuestRepository.js";
import { ListAvailableQuestsInteractor } from "../../use-cases/ListAvailableQuestsInteractor.js";
import { QuestStatus } from "../../domain/entities/QuestStatus.js";
import "./le-quest-hub.js";

/**
 * LeApp
 *
 * Composition Root component that manages the lifecycle of shared services
 * and provides them to the rest of the application via @lit/context.
 *
 * @customElement le-app
 */
export class LeApp extends LitElement {
  static styles = appStyles;

  /** @type {import("../../use-cases/ports/ListAvailableQuests.js").ListAvailableQuests} */
  @provide({ context: questUseCaseContext })
  accessor listQuestsUseCase;

  /** @type {import("../../infrastructure/GameStore.js").GameStore} */
  @provide({ context: gameStoreContext })
  accessor gameStore;

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

    // Use Case setup
    this.listQuestsUseCase = new ListAvailableQuestsInteractor(questRepository);

    // Store setup
    this.gameStore = new GameStore();
  }

  render() {
    return html`
      <div class="app-container wa-theme-awesome wa-dark">
        <main>
          <le-quest-hub></le-quest-hub>
        </main>
      </div>
    `;
  }
}
