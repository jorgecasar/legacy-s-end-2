import { LitElement, html } from "lit";
import { provide } from "@lit/context";
import { gameStore } from "../../infrastructure/GameStore.js";
import { gameStoreContext } from "./GameStore.context.js";
import HeroState from "@legacys-end/core/domain/entities/HeroState.js";
import Position from "@legacys-end/core/domain/entities/Position.js";
import alarionAwakening from "@legacys-end/content/levels/alarion-awakening.json" with { type: "json" };
import alarionIntro from "@legacys-end/content/dialogues/alarion-intro.json" with { type: "json" };

import { gameLevelStyles } from "./LeGameLevel.styles.js";
import "./le-game-viewport.js";
import "./le-dialogue-overlay.js";

/**
 * LeGameLevel
 *
 * Main container for a game level.
 * It initializes the gameStore with data from the content package.
 *
 * @customElement le-game-level
 */
export class LeGameLevel extends LitElement {
  static styles = gameLevelStyles;

  @provide({ context: gameStoreContext })
  accessor gameStore = gameStore;

  constructor() {
    super();
    this._initializeGame();
  }

  async _initializeGame() {
    const { levelMap, initialHeroPosition } = alarionAwakening;

    const posResult = Position.create(initialHeroPosition.x, initialHeroPosition.y);
    if (!posResult.success) {
      console.error(`Failed to initialize position: ${posResult.error}`);
      return;
    }

    const heroResult = HeroState.create(100, 100, posResult.value, []);
    if (!heroResult.success) {
      console.error(`Failed to initialize hero: ${heroResult.error}`);
      return;
    }

    this.gameStore.initialize(heroResult.value, levelMap);
    this.gameStore.setDialogue(alarionIntro);
  }

  render() {
    return html`
      <le-game-viewport></le-game-viewport>
      <le-dialogue-overlay></le-dialogue-overlay>
    `;
  }
}
