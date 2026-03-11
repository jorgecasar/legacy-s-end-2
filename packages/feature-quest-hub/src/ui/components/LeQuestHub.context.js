import { createContext } from "@lit/context";

/** @typedef {import("../../use-cases/ports/ListAvailableQuests.js").ListAvailableQuests} ListAvailableQuests */

/**
 * Context key for the ListAvailableQuests use case.
 * @type {import("@lit/context").Context<unknown, ListAvailableQuests>}
 */
export const questUseCaseContext = createContext("questUseCase");
