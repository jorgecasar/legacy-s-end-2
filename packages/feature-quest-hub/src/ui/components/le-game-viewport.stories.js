import { html } from "lit";
import { gameStore } from "../../infrastructure/GameStore.js";
import HeroState from "@legacys-end/core/domain/entities/HeroState.js";
import Position from "@legacys-end/core/domain/entities/Position.js";
import "./le-game-viewport.js";
import "./le-game-level-decorator.js";

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
