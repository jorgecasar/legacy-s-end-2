import { LeInventory } from "./LeInventory.js";

if (!customElements.get("le-inventory")) {
  customElements.define("le-inventory", LeInventory);
}
