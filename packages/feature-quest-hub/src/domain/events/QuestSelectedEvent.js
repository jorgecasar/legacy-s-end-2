/**
 * @typedef {import("../entities/Quest.js").Quest} Quest
 */
/**
 * Event emitted when a quest is selected in the UI.
 * Defined in the domain to standardize the data contract.
 */
export class QuestSelectedEvent extends CustomEvent {
  static NAME = "quest-selected";

  /**
   * @param {Quest} quest - The selected quest entity.
   */
  constructor(quest) {
    super(QuestSelectedEvent.NAME, {
      detail: { quest },
      bubbles: true,
      composed: true,
    });
  }
}
