import "@awesome.me/webawesome/dist/components/badge/badge.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/skeleton/skeleton.js";
import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { QuestStatus } from "../../domain/entities/QuestStatus.js";
import { QuestSelectedEvent } from "../../domain/events/QuestSelectedEvent.js";
import { questCardStyles } from "./LeQuestCard.styles.js";

/** @typedef {import("../../domain/entities/Quest.js").Quest} Quest */
/** @typedef {import("../../domain/entities/QuestStatus.js").QuestStatusValues} QuestStatusValues */
/** @typedef {import("lit").TemplateResult} TemplateResult */
/** @typedef {import("lit").PropertyValues} PropertyValues */

/**
 * LeQuestCard
 *
 * UI Component representing a mission in the Quest Hub.
 * It is a "Dumb Component" that receives data via properties and emits domain events.
 *
 * @customElement le-quest-card
 * @fires {QuestSelectedEvent} quest-selected - Emitted when the user selects an available mission.
 * @fires {CustomEvent} quest-locked-attempt - Emitted when the user tries to click a locked mission.
 */
export class LeQuestCard extends LitElement {
  static styles = questCardStyles;

  /**
   * The Quest Entity from Domain.
   * @type {Quest}
   */
  @property({ type: Object }) accessor quest;

  /**
   * Current status of the quest (reflected to attribute for CSS styling).
   * @type {QuestStatusValues}
   */
  @property({ type: String, reflect: true }) accessor status = QuestStatus.LOCKED;

  /**
   * Synchronizes the internal status with the quest entity.
   * @param {PropertyValues} changedProperties
   */
  updated(changedProperties) {
    if (changedProperties.has("quest") && this.quest) {
      this.status = this.quest.status;
    }
  }

  /**
   * Main render method.
   * @returns {TemplateResult}
   */
  render() {
    if (!this.quest) {
      return html`
        <wa-skeleton effect="pulse"></wa-skeleton>
      `;
    }

    const badgeVariant =
      this.status === QuestStatus.COMPLETED
        ? "success"
        : this.status === QuestStatus.AVAILABLE
          ? "brand"
          : "neutral";

    return html`
      <wa-card class="card" @click=${this._handleQuestClick}>
        ${this.quest.image ? html`<img slot="media" src="${this.quest.image}" alt="${this.quest.title}" />` : ""}

        <div slot="header" class="header-container">
          <h3 class="title">${this.quest.title}</h3>
          ${this.quest.level ? html`<span class="level">Lvl ${this.quest.level}</span>` : ""}
        </div>

        <p class="description">${this.quest.description}</p>
        
        <div slot="footer" class="footer-container">
          <wa-badge variant=${badgeVariant} pill>${this.status}</wa-badge>
          
          ${
            this.status !== QuestStatus.LOCKED
              ? html`
            <wa-button variant=${this.status === QuestStatus.COMPLETED ? "neutral" : "brand"} size="small">
              ${this.status === QuestStatus.COMPLETED ? "Review" : "Start"}
              <wa-icon slot="prefix" name=${this.status === QuestStatus.COMPLETED ? "check" : "play"}></wa-icon>
            </wa-button>
          `
              : html`
                  <wa-icon name="lock"></wa-icon>
                `
          }
        </div>
      </wa-card>
    `;
  }

  /**
   * Handles user interaction with the card.
   * Emits the corresponding domain or UI events based on status.
   */
  _handleQuestClick() {
    if (this.status === QuestStatus.LOCKED) {
      this.dispatchEvent(
        new CustomEvent("quest-locked-attempt", {
          detail: { quest: this.quest },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    this.dispatchEvent(new QuestSelectedEvent(this.quest));
  }
}
