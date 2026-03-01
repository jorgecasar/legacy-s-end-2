import "@awesome.me/webawesome/dist/components/spinner/spinner.js";
import { consume, provide } from "@lit/context";
import { html, LitElement } from "lit";
import { state } from "lit/decorators.js";
import { ListAvailableQuests } from "../../use-cases/ListAvailableQuests.js";
import { questUseCaseContext } from "./LeQuestHub.context.js";
import { questHubStyles } from "./LeQuestHub.styles.js";
import { questRepositoryContext } from "./QuestRepository.context.js";
import "./le-quest-card.js";

/**
 * LeQuestHub
 * Smart Component/Container for the Quest Hub.
 * Orchestrates use cases and manages state.
 */
export class LeQuestHub extends LitElement {
  static styles = questHubStyles;

  /**
   * Consume the Repository Port
   * This allows injecting different implementations (Mock, Static, API, etc.)
   */
  @consume({ context: questRepositoryContext, subscribe: true })
  accessor questRepository;

  /**
   * Provide the Use Case to children
   */
  @provide({ context: questUseCaseContext })
  @state()
  accessor listQuestsUseCase;

  @state() accessor quests = [];
  @state() accessor error = "";
  @state() accessor loading = false;

  willUpdate(changedProperties) {
    if (changedProperties.has("questRepository") && this.questRepository) {
      this.listQuestsUseCase = new ListAvailableQuests(this.questRepository);
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    // Wait for context to be resolved if possible, or just load if it is already there
    if (this.questRepository) {
      await this.loadQuests();
    }
  }

  // Effect to load quests when use case changes or component connects
  async updated(changedProperties) {
    if (changedProperties.has("listQuestsUseCase") && this.listQuestsUseCase) {
      await this.loadQuests();
    }
  }

  async loadQuests() {
    if (!this.listQuestsUseCase) return;

    this.loading = true;
    const result = await this.listQuestsUseCase.execute();
    this.loading = false;

    if (result.success) {
      this.quests = result.value;
    } else {
      this.error = result.error;
    }
  }

  render() {
    if (this.loading)
      return html`
        <div class="center-content"><wa-spinner></wa-spinner> Loading missions...</div>
      `;
    if (this.error) return html`<div class="error">${this.error}</div>`;
    if (!this.questRepository)
      return html`
        <div class="center-content"><wa-spinner></wa-spinner> Waiting for Quest Repository...</div>
      `;

    return html`
      <div class="grid">
        ${this.quests.map(
          (quest) => html`
            <le-quest-card .quest=${quest} @quest-selected=${this._handleQuestSelected}></le-quest-card>
          `,
        )}
      </div>
    `;
  }

  _handleQuestSelected(e) {
    const { quest } = e.detail;
    console.log("Quest selected in Hub:", quest.title);
  }
}
