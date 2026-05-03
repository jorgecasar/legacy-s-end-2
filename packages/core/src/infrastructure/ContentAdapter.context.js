import { createContext } from "@lit/context";

/** @type {import("@lit/context").Context<unknown, import("../infrastructure/ContentAdapter.js").ContentAdapter>} */
export const contentAdapterContext = createContext("content-adapter");
