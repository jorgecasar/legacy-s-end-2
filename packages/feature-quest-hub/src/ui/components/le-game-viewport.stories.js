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
  const obstacles = [
    { x: 0, y: 0, width: 100, height: 5 }, // Top wall
    { x: 0, y: 95, width: 100, height: 5 }, // Bottom wall
    { x: 0, y: 0, width: 5, height: 100 }, // Left wall
    { x: 95, y: 0, width: 5, height: 100 }, // Right wall
    { x: 40, y: 40, width: 20, height: 20 }, // Central block
  ];

  const posResult = Position.create(10, 50);
  const heroResult = posResult.success ? HeroState.create(100, 100, posResult.value, []) : null;

  if (heroResult?.success) {
    gameStore.initialize(heroResult.value, obstacles);
  }

  return html`
    <le-game-level-decorator .store=${gameStore}>
      <le-game-viewport></le-game-viewport>
    </le-game-level-decorator>
    <div style="margin-top: 20px; color: white;">
      <p>Controls (Simulated):</p>
      <button @click=${() => gameStore.moveHero("UP", 5)}>UP</button>
      <button @click=${() => gameStore.moveHero("DOWN", 5)}>DOWN</button>
      <button @click=${() => gameStore.moveHero("LEFT", 5)}>LEFT</button>
      <button @click=${() => gameStore.moveHero("RIGHT", 5)}>RIGHT</button>
    </div>
  `;
};

export const Default = {
  render: Template,
};
