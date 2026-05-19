import { Result } from "../Result.js";
import { Position } from "./Position.js";

/**
 * HeroState
 *
 * Aggregate representing the current state of the hero.
 */
export class HeroState {
  #hp;
  #maxHp;
  #position;
  #inventory;
  #chapterId;
  #objectivesMet;

  /**
   * @param {number} hp
   * @param {number} maxHp
   * @param {Position} position
   * @param {string[]} inventory
   * @param {string} chapterId
   * @param {string[]} objectivesMet
   */
  constructor(hp, maxHp, position, inventory, chapterId, objectivesMet = []) {
    this.#hp = hp;
    this.#maxHp = maxHp;
    this.#position = position;
    this.#inventory = inventory;
    this.#chapterId = chapterId;
    this.#objectivesMet = objectivesMet;
  }

  /**
   * Factory method to create a HeroState.
   * @param {number} hp
   * @param {number} maxHp
   * @param {Position} position
   * @param {string[]} inventory
   * @param {string} chapterId
   * @param {string[]} objectivesMet
   * @returns {Result<HeroState>}
   */
  static create(hp, maxHp, position, inventory, chapterId, objectivesMet = []) {
    if (hp <= 0) return Result.failure("Hero is dead.");
    if (hp > maxHp) return Result.failure("HP cannot exceed Max HP.");
    if (!position) return Result.failure("Position is required.");
    if (!chapterId) return Result.failure("Chapter ID is required.");
    return Result.success(
      new HeroState(hp, maxHp, position, inventory || [], chapterId, objectivesMet || []),
    );
  }

  get hp() {
    return this.#hp;
  }
  get maxHp() {
    return this.#maxHp;
  }
  get position() {
    return this.#position;
  }
  get inventory() {
    return [...this.#inventory];
  }
  get chapterId() {
    return this.#chapterId;
  }
  get objectivesMet() {
    return [...this.#objectivesMet];
  }

  /**
   * Adds an item to the inventory.
   * @param {string} item
   * @returns {Result<HeroState>}
   */
  addItem(item) {
    if (this.#inventory.includes(item)) {
      return Result.failure("Item already in inventory.");
    }

    return HeroState.create(
      this.#hp,
      this.#maxHp,
      this.#position,
      [...this.#inventory, item],
      this.#chapterId,
      this.#objectivesMet,
    );
  }

  /**
   * Meets an objective.
   * @param {string} objectiveId
   * @returns {Result<HeroState>}
   */
  meetObjective(objectiveId) {
    if (this.#objectivesMet.includes(objectiveId)) {
      return Result.success(this);
    }

    return HeroState.create(
      this.#hp,
      this.#maxHp,
      this.#position,
      this.#inventory,
      this.#chapterId,
      [...this.#objectivesMet, objectiveId],
    );
  }

  toJSON() {
    return {
      hp: this.#hp,
      maxHp: this.#maxHp,
      position: this.#position.toJSON(),
      inventory: this.#inventory,
      chapterId: this.#chapterId,
      objectivesMet: this.#objectivesMet,
    };
  }

  static fromJSON(json) {
    if (!json || json.hp === undefined || !json.position) {
      return Result.failure("Invalid HeroState JSON structure.");
    }
    const positionResult = Position.fromJSON(json.position);
    if (!positionResult.success) {
      return Result.failure(
        `Failed to parse position during deserialization: ${positionResult.error}`,
      );
    }

    return HeroState.create(
      json.hp,
      json.maxHp,
      positionResult.value,
      json.inventory || [],
      json.chapterId,
      json.objectivesMet || [],
    );
  }
}
