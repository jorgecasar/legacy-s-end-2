import { provide } from "@lit/context";
import { html, LitElement } from "lit";
import { gameStoreContext } from "./GameStore.context.js";
import { questUseCaseContext } from "./LeQuestHub.context.js";
import { appStyles } from "./LeApp.styles.js";
import "./le-quest-hub.js";

/**
 * LeApp
 *
 * Composition Root component that manages the lifecycle of shared services
 * and provides them to the rest of the application via @lit/context.
 *
 * @customElement le-app
 */
export class LeApp extends LitElement {
  static styles = appStyles;

  /** @type {import("../../use-cases/ports/ListAvailableQuests.js").ListAvailableQuests} */
  @provide({ context: questUseCaseContext })
  accessor listQuestsUseCase;

  /** @type {import("../../infrastructure/GameStore.js").GameStore} */
  @provide({ context: gameStoreContext })
  accessor gameStore;

  render() {
    return html`
      <main>
        <le-quest-hub></le-quest-hub>
      </main>
    `;
  }
}
