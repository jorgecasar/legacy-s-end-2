import { Result } from "../domain/Result.js";

/** @typedef {import("../domain/entities/DialogueNode.js").default} DialogueNode */

/**
 * AdvanceDialogue
...
 * Use case for advancing to the next step in a dialogue.
 */
export const AdvanceDialogue = {
  /**
   * @param {object} params
   * @param {string} params.currentNodeId
   * @param {DialogueNode[]} params.dialogueNodes
   * @returns {Result<DialogueNode|null>}
   */
  execute: (params) => {
    try {
      const { currentNodeId, dialogueNodes } = params || {};
      const currentNode = dialogueNodes.find((node) => node.id === currentNodeId);

      if (!currentNode) {
        return Result.failure(`Dialogue node with ID ${currentNodeId} not found.`);
      }

      if (!currentNode.nextId) {
        return Result.success(null); // End of dialogue
      }

      const nextNode = dialogueNodes.find((node) => node.id === currentNode.nextId);
      if (!nextNode) {
        return Result.failure(`Next dialogue node with ID ${currentNode.nextId} not found.`);
      }

      return Result.success(nextNode);
    } catch (error) {
      return Result.failure(`Failed to advance dialogue: ${error.message}`);
    }
  },
};
