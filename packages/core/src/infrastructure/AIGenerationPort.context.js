import { createContext } from "@lit/context";

/** @type {import("@lit/context").Context<unknown, import("../use-cases/ports/AIGenerationPort.js").AIGenerationPort>} */
export const aiGenerationPortContext = createContext("ai-generation-port");
