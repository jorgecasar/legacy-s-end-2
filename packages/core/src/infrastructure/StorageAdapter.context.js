import { createContext } from "@lit/context";

/** @type {import("@lit/context").Context<unknown, import("../use-cases/ports/StoragePort.js").StoragePort>} */
export const storageAdapterContext = createContext("storage-adapter");
