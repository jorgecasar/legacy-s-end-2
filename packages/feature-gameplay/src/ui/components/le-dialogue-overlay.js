import { LeDialogueOverlay } from "./LeDialogueOverlay.js";

if (!customElements.get("le-dialogue-overlay")) {
  customElements.define("le-dialogue-overlay", LeDialogueOverlay);
}
