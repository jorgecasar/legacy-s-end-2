import "@awesome.me/webawesome/dist/components/spinner/spinner.js";
import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { Task } from "@lit/task";
import { html, LitElement } from "lit";
import { gameStoreContext } from "./GameStore.context.js";
import { questUseCaseContext } from "./LeQuestHub.context.js";
import { questHubStyles } from "./LeQuestHub.styles.js";
import "./le-quest-card.js";

/** @typedef {import("../../use-cases/ports/ListAvailableQuests.js").ListAvailableQuests} ListAvailableQuests */
/** @typedef {import("../../domain/entities/Quest.js").Quest} Quest */
/** @typedef {import("../../infrastructure/GameStore.js").GameStore} GameStore */
/** @typedef {import("lit").TemplateResult} TemplateResult */

/**
 * LeQuestHub
 *
 * Smart Component (Container) that manages the Quest Hub user interface.
 * It follows Clean Architecture by consuming an abstracted Use Case through context.
 *
 * @customElement le-quest-hub
 */
export class LeQuestHub extends SignalWatcher(LitElement) {
  static styles = questHubStyles;

  /**
   * The use case implementation for listing quests.
   * Injected via @lit/context from the Composition Root.
   * @type {ListAvailableQuests}
   */
  @consume({ context: questUseCaseContext, subscribe: true })
  accessor listQuestsUseCase;

  /**
   * The GameStore instance.
   * @type {GameStore}
   */
  @consume({ context: gameStoreContext, subscribe: true })
  accessor gameStore;

  /**
   * Internal reactive task that manages the asynchronous loading lifecycle.
   * Handles pending, error, and completion states automatically.
   * @type {Task<[ListAvailableQuests | undefined], Quest[]>}
   */
  #loadQuestsTask = new Task(this, {
    task: (args) => this.#runLoadQuestsTask(args),
    args: () => (this.listQuestsUseCase ? [this.listQuestsUseCase] : undefined),
  });

  /**
   * Orchestrates the execution of the use case.
   * @param {readonly [ListAvailableQuests | undefined]} args - Arguments passed by the Task.
   * @returns {Promise<Quest[]>}
   */
  async #runLoadQuestsTask([useCase]) {
    if (!useCase) return [];
    const result = await useCase.execute();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.value || [];
  }

  /**
   * Main render method using the Task pattern.
   * @returns {TemplateResult}
   */
  render() {
    return html`
      ${this.#renderActiveMission()}
      ${this.#loadQuestsTask.render({
        initial: () => this.#renderInitial(),
        pending: () => this.#renderPending(),
        error: (error) =>
          this.#renderError(error instanceof Error ? error : new Error(String(error))),
        complete: (quests) => this.#renderSuccess(quests),
      })}
    `;
  }

  /**
   * Renders the active mission section if there is one.
   * @returns {TemplateResult | typeof import("lit").nothing}
   */
  #renderActiveMission() {
    const activeQuest = this.gameStore?.activeQuest.get();
    if (!activeQuest)
      return html`
        <div class="active-mission" id="no-active-mission">
          <h2>Active Mission</h2>
          <p>You don't have an active mission. Select one from the catalogue below.</p>
        </div>
      `;

    return html`
      <div class="active-mission" id="active-mission-section">
        <h2>Active Mission: ${activeQuest.title}</h2>
        <p>${activeQuest.description}</p>
        <div class="meta">
          <span><strong>Objective:</strong> ${activeQuest.objective}</span>
        </div>
      </div>
    `;
  }

  /**
   * Renders the initial state (waiting for context).
   * @returns {TemplateResult}
   */
  #renderInitial() {
    return html`
      <div class="center-content"><wa-spinner></wa-spinner> Waiting for Use Case...</div>
    `;
  }

  /**
   * Renders the loading state with a spinner.
   * @returns {TemplateResult}
   */
  #renderPending() {
    return html`
      <div class="center-content"><wa-spinner></wa-spinner> Loading missions...</div>
    `;
  }

  /**
   * Renders the error state.
   * @param {Error} error - The error object from the task.
   * @returns {TemplateResult}
   */
  #renderError(error) {
    return html`<div class="error">${error.message}</div>`;
  }

  /**
   * Renders the success state with the list of quest cards.
   * @param {Quest[]} quests - The list of quests to render.
   * @returns {TemplateResult}
   */
  #renderSuccess(quests) {
    if (quests.length === 0) {
      return html`
        <div class="center-content">No missions available.</div>
      `;
    }

    return html`
        <h1>Quest Hub</h1>
        <div class="grid">
          ${quests.map(
            (quest) => html`
              <le-quest-card .quest=${quest} @quest-selected=${this.#onQuestSelected}></le-quest-card>
            `,
          )}
        </div>
    `;
  }

  /**
   * Handles the selection of a quest card.
   * @param {CustomEvent} e - The custom event from the card.
   */
  #onQuestSelected(e) {
    const { quest } = e.detail;
    if (this.gameStore) {
      this.gameStore.activateQuest(quest);
    }
    console.log("Quest selected and set as active:", quest.title);
  }
}
