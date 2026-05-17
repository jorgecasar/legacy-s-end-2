import { createContext } from "@lit/context";

/** @type {import("@lit/context").Context<unknown, import("../use-cases/ports/SpeechRecognitionPort.js").SpeechRecognitionPort>} */
export const speechRecognitionPortContext = createContext("speech-recognition-port");
