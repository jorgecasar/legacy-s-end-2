import { LeQuestHub } from "./LeQuestHub.js";

if (!customElements.get("le-quest-hub")) {
  customElements.define("le-quest-hub", LeQuestHub);
}
