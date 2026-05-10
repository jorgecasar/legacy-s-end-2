import { LeGameViewport } from "./LeGameViewport.js";

if (!customElements.get("le-game-viewport")) {
  customElements.define("le-game-viewport", LeGameViewport);
}
