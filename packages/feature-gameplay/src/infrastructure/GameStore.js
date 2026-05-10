import { signal, computed } from "@lit-labs/signals";
import { MoveHero } from "@legacys-end/core/use-cases/MoveHero.js";
import { AdvanceDialogue } from "@legacys-end/core/use-cases/AdvanceDialogue.js";
import { AdvanceChapter } from "@legacys-end/core/use-cases/AdvanceChapter.js";
import { CollisionService } from "@legacys-end/core/domain/services/CollisionService.js";
import DialogueNode from "@legacys-end/core/domain/entities/DialogueNode.js";
import Position from "@legacys-end/core/domain/entities/Position.js";

/**
 * GameStore
 *
 * Infrastructure service that manages the reactive game state.
 * It acts as an adapter between the pure Domain layer and the UI.
 */
export class GameStore {
  /** @type {import("@legacys-end/core/infrastructure/AutoSaveService.js").default | null} */
  #autoSaveService = null;
  /** @type {import("@lit-labs/signals").State<any>} */
  heroState = signal(null);

  /** @type {import("@lit-labs/signals").State<any[]>} */
  obstacles = signal([]);

  /** @type {import("@lit-labs/signals").State<any>} */
  currentDialogue = signal(null);

  /** @type {import("@lit-labs/signals").State<any>} */
  activeQuest = signal(null);

  /** @type {import("@lit-labs/signals").State<number>} */
  currentChapterIndex = signal(0);

  /** @type {import("@lit-labs/signals").State<any>} */
  exitZone = signal(null);

  /** @type {import("@lit-labs/signals").State<any[]>} */
  entities = signal([]);

  /** Granular signals for UI performance */
  heroPosition = computed(() => this.heroState.get()?.position || { x: 0, y: 0 });
  heroOutfit = computed(() => this.heroState.get()?.outfit || "base");

  /** Current chapter background */
  background = computed(() => {
    const quest = this.activeQuest.get();
    const index = this.currentChapterIndex.get();
    return quest?.chapters?.[index]?.background || "default";
  });

  /** Proximity signal: returns the entity ID if hero is near an NPC */
  nearbyEntityId = computed(() => {
    const pos = this.heroPosition.get();
    const currentEntities = this.entities.get();
    if (!pos || !currentEntities.length) return null;

    const INTERACTION_THRESHOLD = 5; // 5%
    const nearby = currentEntities.find((ent) =>
      CollisionService.isNearby(pos, ent.position, INTERACTION_THRESHOLD),
    );

    return nearby?.id || null;
  });

  /** @type {import("@legacys-end/core/domain/entities/DialogueNode.js").default[]} */
  #dialogueNodes = [];

  /**
   * Sets the AutoSaveService for automatic persistence.
   * @param {import("@legacys-end/core/infrastructure/AutoSaveService.js").default} service
   */
  setAutoSaveService(service) {
    this.#autoSaveService = service;
  }

  /**
   * Initializes the game state.
   * @param {import("@legacys-end/core/domain/entities/HeroState.js").default} heroState
   * @param {Array<{x: number, y: number, width: number, height: number}>} obstacles
   * @param {any[]} entities
   * @param {object} quest
   * @param {object} exitZone
   */
  initialize(heroState, obstacles = [], entities = [], quest = null, exitZone = null) {
    this.heroState.set(heroState);
    this.obstacles.set(obstacles);
    this.entities.set(entities);
    this.activeQuest.set(quest);
    this.exitZone.set(exitZone);
    this.currentChapterIndex.set(0);
  }

  /**
   * Triggers interaction with the nearby entity if one exists.
   */
  interact() {
    const entityId = this.nearbyEntityId.get();
    if (!entityId) return;

    const entity = this.entities.get().find((e) => e.id === entityId);
    if (entity?.decks) {
      this.setDialogue(entity.decks.talk);
    }
  }

  /**
   * Sets the current dialogue tree.
   * @param {object[]} nodesData
   */
  setDialogue(nodesData) {
    this.#dialogueNodes = nodesData
      .map((n) => DialogueNode.create(n.id, n.speaker, n.text, n.nextId))
      .filter((r) => r.success || (console.error(r.error), false))
      .map((r) => r.value);

    this.currentDialogue.set(this.#dialogueNodes[0] || null);
  }

  /**
   * Sets the active quest.
   * @param {import("@legacys-end/feature-quest-hub/domain/entities/Quest.js").Quest} quest
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
    // Blocker fix: prevent movement during dialogue
    if (this.currentDialogue.get()) {
      console.warn("[GameStore] Movement blocked: Dialogue is active.");
      return;
    }

    const currentHero = this.heroState.get();
    const currentObstacles = this.obstacles.get();

    if (!currentHero) {
      console.warn("[GameStore] Movement blocked: No hero state.");
      return;
    }

    const result = MoveHero.execute({
      heroState: currentHero,
      direction,
      step,
      obstacles: currentObstacles,
    });

    if (result.success) {
      this.heroState.set(result.value);
      this.#autoSaveService?.requestSave(result.value);
      this.#checkExitZone(result.value.position);
    } else {
      console.warn("[GameStore] Movement blocked:", result.error);
    }
  }

  /**
   * Checks if hero is in the exit zone to advance chapter.
   * @param {import("@legacys-end/core/domain/entities/Position.js").default} position
   */
  #checkExitZone(position) {
    const zone = this.exitZone.get();
    if (!zone) return;

    const zonePos = Position.create(zone.x, zone.y).value;
    if (CollisionService.isNearby(position, zonePos, zone.radius)) {
      this.advanceChapter();
    }
  }

  /**
   * Advances to the next chapter if available.
   */
  advanceChapter() {
    const quest = this.activeQuest.get();
    const nextIndex = this.currentChapterIndex.get() + 1;
    const heroState = this.heroState.get();

    if (!quest || !quest.chapters?.[nextIndex]) {
      console.log("Quest completed!");
      this.currentDialogue.set(null);

      // Dispatch custom event for the application to handle
      window.dispatchEvent(
        new CustomEvent("quest-completed", {
          detail: { questId: quest?.id },
        }),
      );
      return;
    }

    const result = AdvanceChapter.execute({
      quest,
      nextChapterIndex: nextIndex,
      heroState,
    });

    if (result.success) {
      console.log(
        `Advancing to Chapter ${nextIndex + 1}: ${quest.chapters?.[nextIndex]?.name || "Next"}`,
      );
      this.currentChapterIndex.set(nextIndex);
      this.heroState.set(result.value.heroState);
      this.obstacles.set(result.value.obstacles);
      this.entities.set(result.value.entities);
      this.exitZone.set(result.value.exitZone);
      this.#autoSaveService?.requestSave(result.value.heroState);
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
