import { LeApp } from "./LeApp.js";

if (!customElements.get("le-app")) {
  customElements.define("le-app", LeApp);
}
