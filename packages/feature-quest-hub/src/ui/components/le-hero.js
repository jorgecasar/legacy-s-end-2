import { LeHero } from "./LeHero.js";

if (!customElements.get("le-hero")) {
  customElements.define("le-hero", LeHero);
}
