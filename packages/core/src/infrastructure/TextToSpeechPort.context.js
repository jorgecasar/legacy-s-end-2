import { createContext } from "@lit/context";

/** @type {import("@lit/context").Context<unknown, import("../use-cases/ports/TextToSpeechPort.js").TextToSpeechPort>} */
export const ttsPortContext = createContext("tts-port");
