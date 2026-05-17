import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { SignalWatcher } from "@lit-labs/signals";
import { msg } from "@lit/localize";
import { gameStoreContext } from "./GameStore.context.js";
import { questRepositoryContext } from "@legacys-end/feature-quest-hub/ui/components/QuestRepository.context.js";
import { QuestId } from "@legacys-end/feature-quest-hub/domain/entities/QuestId.js";

import { gameLevelStyles } from "./LeGameLevel.styles.js";
import { contentAdapterContext } from "@legacys-end/core/infrastructure/ContentAdapter.context.js";
import { storageAdapterContext } from "@legacys-end/core/infrastructure/StorageAdapter.context.js";
import { InitializeQuest } from "@legacys-end/core/use-cases/InitializeQuest.js";
import { LoadProgress } from "@legacys-end/core/use-cases/LoadProgress.js";
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
import "./le-menu.js";

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

  @state()
  accessor _toastMessage = "";

  /** @type {import("../../infrastructure/GameStore.js").GameStore} */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  /** @type {import("@legacys-end/core/infrastructure/ContentAdapter.js").ContentAdapter} */
  @consume({ context: contentAdapterContext, subscribe: true })
  accessor contentAdapter;

  /** @type {import("@legacys-end/core/use-cases/ports/StoragePort.js").StoragePort} */
  @consume({ context: storageAdapterContext, subscribe: true })
  accessor storageAdapter;

  /** @type {import("@legacys-end/feature-quest-hub/infrastructure/StaticQuestRepository.js").StaticQuestRepository} */
  @consume({ context: questRepositoryContext, subscribe: true })
  accessor questRepository;

  _initializationPromise = null;

  willUpdate(changedProperties) {
    // Re-initialize if critical properties change or dependencies become available
    const depsAvailable = this.contentAdapter && this.questRepository;
    const propsChanged = changedProperties.has("questId") || changedProperties.has("chapterIndex");

    if (depsAvailable && (propsChanged || !this._gameInitialized)) {
      this._initializeGame();
    }
  }

  async _initializeGame() {
    if (this._initializationPromise || !this.storageAdapter) return;

    this._initializationPromise = (async () => {
      console.log(
        `[LeGameLevel] Initializing quest: ${this.questId}, chapter: ${this.chapterIndex}`,
      );

      await this._syncActiveQuest();
      this.gameStore.currentDialogue.set(null);

      const result = await this._loadChapterData();
      if (!result.success) {
        console.error(`[LeGameLevel] Failed to initialize quest: ${result.error}`);
        this._initializationPromise = null;
        return;
      }

      const { quest, exitZone, entities } = result.value;
      const heroState = this._restoreProgress(result.value);

      this.gameStore.initialize(heroState, result.value.obstacles, entities, quest, exitZone);
      this.gameStore.currentChapterIndex.set(this.chapterIndex);

      this._triggerIntroDialogue(entities, heroState, quest);

      this._gameInitialized = true;
      this.initialized = true;
      this._initializationPromise = null;
      console.log("[LeGameLevel] Initialization complete.");
    })();
  }

  async _syncActiveQuest() {
    if (!this.gameStore.activeQuest.get() && this.questId) {
      const questIdResult = QuestId.create(this.questId);
      if (questIdResult.success) {
        const questResult = await this.questRepository.getById(questIdResult.value);
        if (questResult.success) {
          this.gameStore.activeQuest.set(questResult.value);
        }
      }
    }
  }

  async _loadChapterData() {
    return await InitializeQuest.execute({
      contentAdapter: this.contentAdapter,
      questData,
      questMessages,
      chaptersData,
      chaptersMessages: chapterMessages,
      entityDecks,
      chapterIndex: this.chapterIndex,
    });
  }

  _restoreProgress({ quest, heroState: initialHeroState }) {
    const currentChapterId = quest.chapters?.[this.chapterIndex]?.id;
    const loadResult = LoadProgress.execute({ storageAdapter: this.storageAdapter });

    if (loadResult.success) {
      const savedHeroState = loadResult.value;
      if (savedHeroState.chapterId === currentChapterId) {
        console.log("[LeGameLevel] Restored progress for chapter:", currentChapterId);
        return savedHeroState;
      }
    }
    return initialHeroState;
  }

  _triggerIntroDialogue(entities, heroState, quest) {
    const currentChapterId = quest.chapters?.[this.chapterIndex]?.id;
    const loadResult = LoadProgress.execute({ storageAdapter: this.storageAdapter });
    const isNewChapter = !loadResult.success || loadResult.value.chapterId !== currentChapterId;

    if (isNewChapter) {
      const firstNPC = entities[0];
      if (firstNPC?.decks) {
        this.gameStore.setDialogue(firstNPC.decks.talk);
      }
    }
  }

  _showToast(message) {
    this._toastMessage = message;
    setTimeout(() => {
      this._toastMessage = "";
    }, 3000);
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    // Synchronize URL with current chapter index
    const quest = this.gameStore.activeQuest.get();
    const chapterIndex = this.gameStore.currentChapterIndex.get();

    if (quest && this._gameInitialized) {
      const newUrl = `/quest/${quest.id}/chapter/${chapterIndex}`;
      if (window.location.pathname !== newUrl) {
        window.history.replaceState(null, "", newUrl);
      }
    }
  }

  render() {
    const quest = this.gameStore.activeQuest.get();
    const chapterIndex = this.gameStore.currentChapterIndex.get();
    const chapters = quest?.chapters || [];
    const chapter = chapters[chapterIndex];

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
        <le-menu id="game-menu"></le-menu>
        ${
          this._toastMessage
            ? html`
                <div class="toast">${this._toastMessage}</div>
              `
            : ""
        }
      </main>
    `;
  }
}
