import { LeQuestCard } from "./LeQuestCard.js";

if (!customElements.get("le-quest-card")) {
  customElements.define("le-quest-card", LeQuestCard);
}
