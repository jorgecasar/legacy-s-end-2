/**
 * @typedef {'LOCKED' | 'AVAILABLE' | 'COMPLETED'} QuestStatusValues
 */

/**
 * @type {{
 *  LOCKED: QuestStatusValues,
 *  AVAILABLE: QuestStatusValues,
 *  COMPLETED: QuestStatusValues
 * }}
 */
export const QuestStatus = Object.freeze({
  LOCKED: "LOCKED",
  AVAILABLE: "AVAILABLE",
  COMPLETED: "COMPLETED",
});
