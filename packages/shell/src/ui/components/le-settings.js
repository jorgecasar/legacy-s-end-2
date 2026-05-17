import { LeSettings } from "./LeSettings.js";

if (!customElements.get("le-settings")) {
  customElements.define("le-settings", LeSettings);
}
