import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { gameStoreContext } from "./GameStore.context.js";

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
export class LeGameLevel extends LitElement {
  static styles = gameLevelStyles;

  /** @type {import("../../infrastructure/GameStore.js").GameStore} */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  /** @type {import("@legacys-end/core/infrastructure/ContentAdapter.js").ContentAdapter} */
  @consume({ context: contentAdapterContext, subscribe: true })
  accessor contentAdapter;

  _gameInitialized = false;

  willUpdate(_changedProperties) {
    if (this.contentAdapter && !this._gameInitialized) {
      this._initializeGame();
    }
  }

  async _initializeGame() {
    this._gameInitialized = true;
    console.log("Initializing game level via InitializeQuest Use Case...");

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

    const { obstacles, entities } = result.value;
    let { heroState } = result.value;

    // Try to restore saved progress
    const storageAdapter = new LocalStorageAdapter();
    const loadResult = LoadProgress.execute({ storageAdapter });
    if (loadResult.success) {
      heroState = loadResult.value;
      console.log("Restored saved progress.");
    }

    this.gameStore.initialize(heroState, obstacles, entities);

    // Automatically trigger intro dialogue if no saved progress
    if (!loadResult.success) {
      const firstNPC = entities[0];
      if (firstNPC?.decks) {
        this.gameStore.setDialogue(firstNPC.decks.talk);
      }
    }

    console.log("Game level initialized successfully.");
  }

  render() {
    return html`
      <le-game-viewport></le-game-viewport>
      <le-dialogue-overlay></le-dialogue-overlay>
    `;
  }
}
