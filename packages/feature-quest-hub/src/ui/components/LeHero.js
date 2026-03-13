import { LitElement, html } from "lit";
import { heroStyles } from "./LeHero.styles.js";

/**
 * LeHero
 *
 * Component representing the hero on the game viewport.
 *
 * @customElement le-hero
 */
export class LeHero extends LitElement {
  static styles = heroStyles;

  render() {
    return html`
      <div></div>
    `;
  }
}
