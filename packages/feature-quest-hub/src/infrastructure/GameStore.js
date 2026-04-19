import { signal } from "@lit-labs/signals";
import { MoveHero } from "@legacys-end/core/use-cases/MoveHero.js";
import { AdvanceDialogue } from "@legacys-end/core/use-cases/AdvanceDialogue.js";
import DialogueNode from "@legacys-end/core/domain/entities/DialogueNode.js";

/**
 * GameStore
 *
 * Infrastructure service that manages the reactive game state.
 * It acts as an adapter between the pure Domain layer and the UI.
 */
export class GameStore {
  /** @type {any} */
  heroState = signal(null);

  /** @type {any} */
  levelMap = signal([]);

  /** @type {any} */
  currentDialogue = signal(null);

  /** @type {any} */
  activeQuest = signal(null);

  /** @type {import("@legacys-end/core/domain/entities/DialogueNode.js").default[]} */
  #dialogueNodes = [];

  /**
   * Initializes the game state.
   * @param {import("@legacys-end/core/domain/entities/HeroState.js").default} heroState
   * @param {number[][]} levelMap
   */
  initialize(heroState, levelMap) {
    this.heroState.set(heroState);
    this.levelMap.set(levelMap);
  }

  /**
   * Sets the current dialogue tree.
   * @param {object[]} nodesData
   */
  setDialogue(nodesData) {
    this.#dialogueNodes = nodesData
      .map((node) => DialogueNode.create(node.id, node.speaker, node.text, node.nextId))
      .filter((result) => {
        if (!result.success) {
          console.error(`Failed to create dialogue node: ${result.error}`);
          return false;
        }
        return true;
      })
      .map((result) => result.value);

    if (this.#dialogueNodes.length > 0) {
      this.currentDialogue.set(this.#dialogueNodes[0]);
    }
  }

  /**
   * Sets the active quest.
   * @param {import("../domain/entities/Quest.js").Quest} quest
   */
  activateQuest(quest) {
    this.activeQuest.set(quest);
  }

  /**
   * Moves the hero to a new position.
   * @param {number} x
   * @param {number} y
   */
  moveHero(x, y) {
    const currentHero = this.heroState.get();
    const currentMap = this.levelMap.get();

    if (!currentHero) return;

    const result = MoveHero.execute({
      heroState: currentHero,
      newX: x,
      newY: y,
      levelMap: currentMap,
    });

    if (result.success) {
      this.heroState.set(result.value);
    } else {
      console.error(result.error);
    }
  }

  /**
   * Advances the current dialogue.
   */
  advanceDialogue() {
    const currentNode = this.currentDialogue.get();
    if (!currentNode) return;

    const result = AdvanceDialogue.execute({
      currentNodeId: currentNode.id,
      dialogueNodes: this.#dialogueNodes,
    });

    if (result.success) {
      this.currentDialogue.set(result.value);
    } else {
      console.error(result.error);
    }
  }
}

export const gameStore = new GameStore();
