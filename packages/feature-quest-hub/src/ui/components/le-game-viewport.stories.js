import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { provide } from "@lit/context";
import { gameStoreContext } from "./GameStore.context.js";
import { gameStore } from "../../infrastructure/GameStore.js";
import HeroState from "@legacys-end/core/domain/entities/HeroState.js";
import Position from "@legacys-end/core/domain/entities/Position.js";
import "./le-game-viewport.js";

// Simple decorator component to provide context in stories
if (!customElements.get("le-game-level-decorator")) {
  class LeGameLevelDecorator extends LitElement {
    @provide({ context: gameStoreContext })
    @property({ type: Object })
    accessor store;

    render() {
      return html`
        <slot></slot>
      `;
    }
  }
  customElements.define("le-game-level-decorator", LeGameLevelDecorator);
}

export default {
  title: "Features/Game Level/LeGameViewport",
  component: "le-game-viewport",
};

const Template = () => {
  const levelMap = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 2, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ];

  const posResult = Position.create(2, 2);
  const heroResult = posResult.success ? HeroState.create(100, 100, posResult.value, []) : null;

  if (heroResult?.success) {
    gameStore.initialize(heroResult.value, levelMap);
  }

  return html`
    <le-game-level-decorator .store=${gameStore}>
      <le-game-viewport></le-game-viewport>
    </le-game-level-decorator>
  `;
};

export const Default = {
  render: Template,
};
