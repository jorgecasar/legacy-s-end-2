import { LeMenu } from "./LeMenu.js";

if (!customElements.get("le-menu")) {
  customElements.define("le-menu", LeMenu);
}
