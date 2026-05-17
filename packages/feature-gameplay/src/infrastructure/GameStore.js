import { signal, computed } from "@lit-labs/signals";
import { MoveHero } from "@legacys-end/core/use-cases/MoveHero.js";
import { AdvanceDialogue } from "@legacys-end/core/use-cases/AdvanceDialogue.js";
import { AdvanceChapter } from "@legacys-end/core/use-cases/AdvanceChapter.js";
import { PerformInteraction } from "@legacys-end/core/use-cases/PerformInteraction.js";
import { SensorService } from "@legacys-end/core/domain/services/SensorService.js";
import { DialogueNode } from "@legacys-end/core/domain/entities/DialogueNode.js";
import { Position } from "@legacys-end/core/domain/entities/Position.js";

/**
 * GameStore
 *
 * Infrastructure service that manages the reactive game state.
 * It acts as an adapter between the pure Domain layer and the UI.
 */
export class GameStore {
  /** @type {import("@legacys-end/core/infrastructure/AutoSaveService.js").AutoSaveService | null} */
  #autoSaveService = null;
  /** @type {any} */
  #storageAdapter = null;
  /** @type {import("@legacys-end/core/use-cases/ports/AIGenerationPort.js").AIGenerationPort | null} */
  #aiGenerationPort = null;

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

  /** Event signals */
  lastCollision = signal(null);
  /** @type {import("@lit-labs/signals").State<Set<string>>} */
  objectivesMet = signal(new Set());

  /** AI Settings */
  npcVoiceEnabled = signal(false);
  aiDialogueEnabled = signal(false);
  voiceCommandsEnabled = signal(false);

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
    const INTERACTION_THRESHOLD = 5; // 5%

    const nearby = SensorService.getNearbyEntity(pos, currentEntities, INTERACTION_THRESHOLD);
    return nearby?.id || null;
  });

  /** @type {import("@legacys-end/core/domain/entities/DialogueNode.js").DialogueNode[]} */
  #dialogueNodes = [];

  /** @type {{metObjective?: string, spawnedEntity?: any} | null} */
  #pendingConsequences = null;

  /**
   * Sets the AutoSaveService for automatic persistence.
   * @param {import("@legacys-end/core/infrastructure/AutoSaveService.js").AutoSaveService} service
   */
  setAutoSaveService(service) {
    this.#autoSaveService = service;
  }

  /**
   * Sets the StorageAdapter for settings persistence.
   * @param {any} adapter
   */
  setStorageAdapter(adapter) {
    this.#storageAdapter = adapter;
  }

  /**
   * Sets the AI Generation Port.
   * @param {import("@legacys-end/core/use-cases/ports/AIGenerationPort.js").AIGenerationPort} port
   */
  setAIGenerationPort(port) {
    this.#aiGenerationPort = port;
  }

  /**
   * Initializes the game state.
   * @param {import("@legacys-end/core/domain/entities/HeroState.js").HeroState} heroState
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
  async interact() {
    if (this.currentDialogue.get()) return;

    const entityId = this.nearbyEntityId.get();
    if (!entityId) return;

    const entity = this.entities.get().find((e) => e.id === entityId);
    if (!entity) return;

    const quest = this.activeQuest.get();
    const chapter = quest?.chapters?.[this.currentChapterIndex.get()];

    // Show loading state if AI is enabled
    if (this.aiDialogueEnabled.get() && this.#aiGenerationPort && entity.persona) {
      this.currentDialogue.set({
        id: "ai-loading",
        speaker: entity.name || entity.id,
        text: "...",
      });
    }

    const result = await PerformInteraction.execute({
      entity,
      heroState: this.heroState.get(),
      aiDialogueEnabled: this.aiDialogueEnabled.get(),
      aiGenerationPort: this.#aiGenerationPort,
      chapterName: chapter?.name || "World",
    });

    if (!result.success) {
      console.warn("[GameStore] Interaction failed:", result.error);
      if (this.currentDialogue.get()?.id === "ai-loading") {
        this.currentDialogue.set(null);
      }
      return;
    }

    const { type, value, updatedHero, metObjective, spawnedEntity } = result.value;

    // Queue consequences for dialogues
    if (type === "AI_DIALOGUE" || type === "STATIC_DIALOGUE") {
      this.#pendingConsequences = { metObjective, spawnedEntity };
    }

    switch (type) {
      case "ITEM_PICKUP":
        console.log(`[GameStore] Item picked up: ${entity.name || entity.id}`);
        this.heroState.set(updatedHero);
        this.#autoSaveService?.requestSave(updatedHero);

        // Apply pickup objectives immediately
        if (metObjective) this.#applyObjective(metObjective);

        // Remove from world
        this.entities.set(this.entities.get().filter((e) => e.id !== entityId));
        break;

      case "AI_DIALOGUE":
        this.currentDialogue.set({
          id: `ai-${Date.now()}`,
          speaker: entity.name || entity.id,
          text: value,
        });
        break;

      case "STATIC_DIALOGUE":
        this.setDialogue(value);
        break;
    }
  }

  /**
   * Applies an objective to the met set.
   * @param {string} objectiveId
   */
  #applyObjective(objectiveId) {
    const current = this.objectivesMet.get();
    if (!current.has(objectiveId)) {
      console.log(`[GameStore] Objective met: ${objectiveId}`);
      this.objectivesMet.set(new Set([...current, objectiveId]));
    }
  }

  /**
   * Spawns a new entity in the world.
   * @param {any} entity
   */
  #spawnEntity(entity) {
    if (!entity) return;
    const currentEntities = this.entities.get();
    if (!currentEntities.some((e) => e.id === entity.id)) {
      console.log(`[GameStore] Entity spawned: ${entity.name}`);
      this.entities.set([...currentEntities, entity]);
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
      this.lastCollision.set(null);
      this.#autoSaveService?.requestSave(result.value);
      this.#checkExitZone(result.value.position);
    } else {
      console.warn("[GameStore] Movement blocked:", result.error);
      this.lastCollision.set({
        direction,
        time: Date.now(),
      });
    }
  }

  /**
   * Checks if hero is in the exit zone to advance chapter.
   * @param {import("@legacys-end/core/domain/entities/Position.js").Position} position
   */
  #checkExitZone(position) {
    const zone = this.exitZone.get();
    if (!zone) return;

    const zonePos = Position.create(zone.x, zone.y).value;
    if (SensorService.getNearbyEntity(position, [{ id: "exit", position: zonePos }], zone.radius)) {
      this.advanceChapter();
    }
  }

  /**
   * Advances to the next chapter if available.
   */
  advanceChapter() {
    const quest = this.activeQuest.get();
    const zone = this.exitZone.get();

    // Check completion objectives from the exitZone signal (loaded by InitializeQuest)
    const required = zone?.requiredObjectives || [];
    const met = this.objectivesMet.get();
    const missing = SensorService.getMissingObjectives(required, met);

    if (missing.length > 0) {
      console.warn("[GameStore] Cannot advance chapter. Missing objectives:", missing);
      // Dispatch event to show feedback in UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("objectives-missing", {
            detail: { missing },
          }),
        );
      }
      return;
    }

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
   * Saves AI settings to the storage adapter if available.
   */
  saveSettings() {
    if (!this.#storageAdapter) return;

    const settings = {
      npcVoiceEnabled: this.npcVoiceEnabled.get(),
      aiDialogueEnabled: this.aiDialogueEnabled.get(),
      voiceCommandsEnabled: this.voiceCommandsEnabled.get(),
    };

    const currentData = this.#storageAdapter.load().value || {};
    this.#storageAdapter.save({ ...currentData, settings });
  }

  /**
   * Advances the current dialogue.
   */
  advanceDialogue() {
    const currentNode = this.currentDialogue.get();
    if (!currentNode) return;

    let nextNode = null;

    // If it's an AI-generated node, we just close it on advance (no next node)
    if (currentNode.id.startsWith("ai-")) {
      nextNode = null;
    } else {
      const result = AdvanceDialogue.execute({
        currentNodeId: currentNode.id,
        dialogueNodes: this.#dialogueNodes,
      });
      if (result.success) {
        nextNode = result.value;
      } else {
        console.error(result.error);
      }
    }

    this.currentDialogue.set(nextNode);

    // If dialogue ended, apply consequences
    if (!nextNode && this.#pendingConsequences) {
      const { metObjective, spawnedEntity } = this.#pendingConsequences;
      if (metObjective) this.#applyObjective(metObjective);
      if (spawnedEntity) this.#spawnEntity(spawnedEntity);
      this.#pendingConsequences = null;
    }
  }
}

export const gameStore = new GameStore();
