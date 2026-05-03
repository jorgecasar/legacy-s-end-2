import { contentAdapterContext } from "@legacys-end/core/infrastructure/ContentAdapter.context.js";
import { ContentAdapter } from "@legacys-end/core/infrastructure/ContentAdapter.js";
import { ContextProvider } from "@lit/context";
import { gameStore } from "../../infrastructure/GameStore.js";
import { gameStoreContext } from "./GameStore.context.js";
import "./le-game-level.js";

export default {
  title: "Features/Game Level/LeGameLevel",
  component: "le-game-level",
};

const adapter = new ContentAdapter();

export const Default = {
  render: () => {
    const container = document.createElement("div");

    // Provide Store
    new ContextProvider(container, {
      context: gameStoreContext,
      initialValue: gameStore,
    });

    // Provide Adapter
    new ContextProvider(container, {
      context: contentAdapterContext,
      initialValue: adapter,
    });

    container.innerHTML = "<le-game-level></le-game-level>";
    return container;
  },
};
