import { signal, computed } from "@lit-labs/signals";
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
  /** @type {import("@lit-labs/signals").State<any>} */
  heroState = signal(null);

  /** @type {import("@lit-labs/signals").State<any[]>} */
  obstacles = signal([]);

  /** @type {import("@lit-labs/signals").State<any>} */
  currentDialogue = signal(null);

  /** @type {import("@lit-labs/signals").State<any>} */
  activeQuest = signal(null);

  /** Granular signals for UI performance */
  heroPosition = computed(() => this.heroState.get()?.position || { x: 0, y: 0 });
  heroOutfit = computed(() => this.heroState.get()?.outfit || "base");

  /** @type {import("@legacys-end/core/domain/entities/DialogueNode.js").default[]} */
  #dialogueNodes = [];

  /**
   * Initializes the game state.
   * @param {import("@legacys-end/core/domain/entities/HeroState.js").default} heroState
   * @param {Array<{x: number, y: number, width: number, height: number}>} obstacles
   */
  initialize(heroState, obstacles = []) {
    this.heroState.set(heroState);
    this.obstacles.set(obstacles);
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
   * Moves the hero in a given direction.
   * @param {'UP' | 'DOWN' | 'LEFT' | 'RIGHT'} direction
   * @param {number} step - Percentage of movement (default 2%)
   */
  moveHero(direction, step = 2) {
    const currentHero = this.heroState.get();
    const currentObstacles = this.obstacles.get();

    if (!currentHero) return;

    const result = MoveHero.execute({
      heroState: currentHero,
      direction,
      step,
      obstacles: currentObstacles,
    });

    if (result.success) {
      this.heroState.set(result.value);
    } else {
      console.warn("Movement blocked:", result.error);
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
