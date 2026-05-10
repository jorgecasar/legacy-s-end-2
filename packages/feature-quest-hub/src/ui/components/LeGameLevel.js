import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { SignalWatcher } from "@lit-labs/signals";
import { msg } from "@lit/localize";
import { gameStoreContext } from "./GameStore.context.js";
import { questRepositoryContext } from "./QuestRepository.context.js";
import { QuestId } from "../../domain/entities/QuestId.js";

import { gameLevelStyles } from "./LeGameLevel.styles.js";
import { contentAdapterContext } from "@legacys-end/core/infrastructure/ContentAdapter.context.js";
import { InitializeQuest } from "@legacys-end/core/use-cases/InitializeQuest.js";
import { LoadProgress } from "@legacys-end/core/use-cases/LoadProgress.js";
import { LocalStorageAdapter } from "@legacys-end/core/infrastructure/LocalStorageAdapter.js";
// Raw data imports (to be passed to adapter)
import questData from "@legacys-end/content/quests/alarions-awakening/quest.json" with { type: "json" };
import { questMessages } from "@legacys-end/content/quests/alarions-awakening/quest.messages.js";
import chaptersData from "@legacys-end/content/quests/alarions-awakening/chapters.json" with { type: "json" };
import {
  chapterMessages,
  entityDecks,
} from "@legacys-end/content/quests/alarions-awakening/chapters.messages.js";
import "./le-game-viewport.js";
import "./le-dialogue-overlay.js";

/**
 * LeGameLevel
 *
 * Main container for a game level.
 * It initializes the gameStore with data from the content package via InitializeQuest Use Case.
 *
 * @customElement le-game-level
 */
export class LeGameLevel extends SignalWatcher(LitElement) {
  static styles = gameLevelStyles;

  @property({ type: String })
  accessor questId;

  @property({ type: Number })
  accessor chapterIndex = 0;

  @property({ type: Boolean, reflect: true })
  accessor initialized = false;

  /** @type {import("../../infrastructure/GameStore.js").GameStore} */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  /** @type {import("@legacys-end/core/infrastructure/ContentAdapter.js").ContentAdapter} */
  @consume({ context: contentAdapterContext, subscribe: true })
  accessor contentAdapter;

  /** @type {import("../../infrastructure/StaticQuestRepository.js").StaticQuestRepository} */
  @consume({ context: questRepositoryContext, subscribe: true })
  accessor questRepository;

  _gameInitialized = false;

  willUpdate(_changedProperties) {
    if ((this.contentAdapter || this.questRepository) && !this._gameInitialized) {
      this._initializeGame();
    }
  }

  async _initializeGame() {
    this._gameInitialized = true;
    console.log("Initializing game level via InitializeQuest Use Case...");

    // Ensure gameStore has the active quest if loaded directly by URL
    if (!this.gameStore.activeQuest.get() && this.questId && this.questRepository) {
      console.log(
        `Direct URL load detected for quest ${this.questId}, synchronizing active quest...`,
      );
      const questIdResult = QuestId.create(this.questId);
      if (questIdResult.success) {
        const questResult = await this.questRepository.getById(questIdResult.value);
        if (questResult.success) {
          this.gameStore.activeQuest.set(questResult.value);
        }
      }
    }

    // Clear previous dialogue state
    this.gameStore.currentDialogue.set(null);

    const result = await InitializeQuest.execute({
      contentAdapter: this.contentAdapter,
      questData,
      questMessages,
      chaptersData,
      chaptersMessages: chapterMessages,
      entityDecks,
    });

    if (!result.success) {
      console.error(`Failed to initialize quest: ${result.error}`);
      return;
    }

    const { obstacles, entities, quest, exitZone } = result.value;
    let { heroState } = result.value;

    // Try to restore saved progress
    const storageAdapter = new LocalStorageAdapter();
    const loadResult = LoadProgress.execute({ storageAdapter });
    if (loadResult.success) {
      const savedHeroState = loadResult.value;
      const firstChapterId = quest.chapters?.[0]?.id;

      // Only restore if chapterId exists and matches
      if (savedHeroState.chapterId && savedHeroState.chapterId === firstChapterId) {
        heroState = savedHeroState;
        console.log("Restored saved progress for chapter:", firstChapterId);
      } else {
        console.warn(
          "Ignoring incompatible or old saved progress.",
          savedHeroState.chapterId ? `Found: ${savedHeroState.chapterId}` : "No chapterId found",
          `Expected: ${firstChapterId}`,
        );
      }
    }

    this.gameStore.initialize(heroState, obstacles, entities, quest, exitZone);
    this.gameStore.currentChapterIndex.set(this.chapterIndex);

    // Automatically trigger intro dialogue if no saved progress
    if (!loadResult.success) {
      const firstNPC = entities[0];
      if (firstNPC?.decks) {
        this.gameStore.setDialogue(firstNPC.decks.talk);
      }
    }

    console.log("Game level initialized successfully.");
    this.initialized = true;
  }

  render() {
    const quest = this.gameStore.activeQuest.get();
    const chapterIndex = this.gameStore.currentChapterIndex.get();
    const chapters = quest?.chapters || [];
    const chapter = chapters[chapterIndex];

    // Synchronize URL with current chapter index
    if (quest && this._gameInitialized) {
      const newUrl = `/quest/${quest.id}/chapter/${chapterIndex}`;
      if (window.location.pathname !== newUrl) {
        window.history.replaceState(null, "", newUrl);
      }
    }

    return html`
      <header>
        <div class="chapter-info">
          <h2>${quest?.title || msg("Loading Quest...")}</h2>
          <p>${chapter?.name || msg("Initializing...")} (${chapterIndex + 1}/${chapters.length || 1})</p>
        </div>
        <div class="controls-hint">
          ${msg("WASD to move | E to interact")}
        </div>
      </header>
      <main>
        <le-game-viewport></le-game-viewport>
        <le-dialogue-overlay></le-dialogue-overlay>
      </main>
    `;
  }
}
