import "@awesome.me/webawesome/dist/components/spinner/spinner.js";
import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { msg, updateWhenLocaleChanges } from "@lit/localize";
import { Task } from "@lit/task";
import { html, LitElement } from "lit";
import { questHubStyles } from "./LeQuestHub.styles.js";
import { gameStoreContext } from "@legacys-end/feature-gameplay/ui/components/GameStore.context.js";
import { questUseCaseContext } from "./LeQuestHub.context.js";
import "./le-quest-card.js";
import "@legacys-end/shell/ui/components/le-settings.js";

/** @typedef {import("../../use-cases/ports/ListAvailableQuests.js").ListAvailableQuests} ListAvailableQuests */
/** @typedef {import("../../domain/entities/Quest.js").Quest} Quest */
/** @typedef {import("@legacys-end/feature-gameplay/infrastructure/GameStore.js").GameStore} GameStore */
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
  constructor() {
    super();
    updateWhenLocaleChanges(this);
  }

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
        <wa-card
          class="active-mission"
          id="no-active-mission"
          style="
            margin-bottom: var(--wa-spacing-large);
            width: 100%;
            background: var(--wa-color-brand-fill-quiet);
            border-color: var(--wa-color-brand-border-normal);
          "
        >
          <h2 class="wa-heading-l wa-color-brand-on-quiet" style="margin-top: 0">${msg("Active Mission")}</h2>
          <p class="wa-body-m wa-color-text-normal">
            ${msg("You don't have an active mission. Select one from the catalogue below.")}
          </p>
        </wa-card>
      `;

    return html`
      <wa-card class="active-mission" id="active-mission-section" style="margin-bottom: var(--wa-spacing-large); width: 100%; background: var(--wa-color-brand-fill-quiet); border-color: var(--wa-color-brand-border-normal);">
        <h2 class="wa-heading-l wa-color-brand-on-quiet" style="margin-top: 0;">${msg("Active Mission:")} ${activeQuest.title}</h2>
        <p class="wa-body-m wa-color-text-normal">${activeQuest.description}</p>
        <div class="meta wa-body-m wa-color-text-normal">
          <span><strong>${msg("Objective:")}</strong> ${activeQuest.objective}</span>
        </div>
      </wa-card>
    `;
  }

  /**
   * Renders the initial state (waiting for context).
   * @returns {TemplateResult}
   */
  #renderInitial() {
    return html`
      <div
        class="wa-cluster wa-body-l wa-color-text-quiet"
        style="justify-content: center; padding: var(--wa-spacing-large)"
      >
        <wa-spinner></wa-spinner> ${msg("Waiting for Use Case...")}
      </div>
    `;
  }

  /**
   * Renders the loading state with a spinner.
   * @returns {TemplateResult}
   */
  #renderPending() {
    return html`
      <div
        class="wa-cluster wa-body-l wa-color-text-quiet"
        style="justify-content: center; padding: var(--wa-spacing-large)"
      >
        <wa-spinner></wa-spinner> ${msg("Loading missions...")}
      </div>
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
        <div
          class="wa-cluster wa-body-l wa-color-text-quiet"
          style="justify-content: center; padding: var(--wa-spacing-large)"
        >
          ${msg("No missions available.")}
        </div>
      `;
    }

    return html`
        <h1 class="wa-heading-2xl">${msg("Quest Hub")}</h1>
        <div class="wa-grid" style="--min-column-size: 280px; gap: var(--wa-spacing-medium);">
          ${quests.map(
            (quest) => html`
              <le-quest-card .quest=${quest} @quest-selected=${this.#onQuestSelected}></le-quest-card>
            `,
          )}
        </div>
        <le-settings></le-settings>
    `;
  }

  /**
   * Handles the selection of a quest card.
   * The actual navigation is handled by the parent (LeApp) via event delegation.
   * @param {CustomEvent} e - The custom event from the card.
   */
  #onQuestSelected(e) {
    const { quest } = e.detail;
    console.log("Quest selected in Hub:", quest.title);
    // No manual navigation here; we let the QuestSelectedEvent bubble up to LeApp.
  }
}
