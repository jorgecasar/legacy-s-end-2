import { Result } from "../Result.js";

/**
 * DialogueNode
 *
 * Entity representing a single step in a dialogue tree.
 */
export default class DialogueNode {
  #id;
  #speaker;
  #text;
  #nextId;

  /**
   * @param {string} id - Unique identifier for the node.
   * @param {string} speaker - Name of the character speaking.
   * @param {string} text - The dialogue text.
   * @param {string|null} nextId - ID of the next node, or null if it's the end.
   */
  constructor(id, speaker, text, nextId) {
    this.#id = id;
    this.#speaker = speaker;
    this.#text = text;
    this.#nextId = nextId;
  }

  /**
   * Factory method to create a DialogueNode.
   * @param {string} id
   * @param {string} speaker
   * @param {string} text
   * @param {string|null} nextId
   * @returns {Result<DialogueNode>}
   */
  static create(id, speaker, text, nextId = null) {
    if (!id) return Result.failure("Dialogue ID is required.");
    if (!speaker) return Result.failure("Speaker is required.");
    if (!text) return Result.failure("Text is required.");
    return Result.success(new DialogueNode(id, speaker, text, nextId));
  }

  get id() {
    return this.#id;
  }
  get speaker() {
    return this.#speaker;
  }
  get text() {
    return this.#text;
  }
  get nextId() {
    return this.#nextId;
  }
}
