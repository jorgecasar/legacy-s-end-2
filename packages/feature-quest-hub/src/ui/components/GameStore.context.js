import { createContext } from "@lit/context";

/** @typedef {import("../../infrastructure/GameStore.js").GameStore} GameStore */

/**
 * Context for the GameStore.
 * @type {import("@lit/context").Context<unknown, GameStore>}
 */
export const gameStoreContext = createContext("game-store");
