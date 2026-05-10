import { createContext } from "@lit/context";

/** @type {import("@lit/context").Context<unknown, import("../../infrastructure/StaticQuestRepository.js").StaticQuestRepository>} */
export const questRepositoryContext = createContext("quest-repository");
