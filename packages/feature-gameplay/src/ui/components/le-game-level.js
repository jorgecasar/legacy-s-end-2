import { LeGameLevel } from "./LeGameLevel.js";

if (!customElements.get("le-game-level")) {
  customElements.define("le-game-level", LeGameLevel);
}
