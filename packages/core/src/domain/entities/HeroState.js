import { Result } from "../Result.js";
import Position from "./Position.js";

/**
 * HeroState
 *
 * Aggregate representing the current state of the hero.
 */
export default class HeroState {
  #hp;
  #maxHp;
  #position;
  #inventory;
  #chapterId;

  /**
   * @param {number} hp
   * @param {number} maxHp
   * @param {Position} position
   * @param {string[]} inventory
   * @param {string} chapterId
   */
  constructor(hp, maxHp, position, inventory, chapterId) {
    this.#hp = hp;
    this.#maxHp = maxHp;
    this.#position = position;
    this.#inventory = inventory;
    this.#chapterId = chapterId;
  }

  /**
   * Factory method to create a HeroState.
   * @param {number} hp
   * @param {number} maxHp
   * @param {Position} position
   * @param {string[]} inventory
   * @param {string} chapterId
   * @returns {Result<HeroState>}
   */
  static create(hp, maxHp, position, inventory, chapterId) {
    if (hp <= 0) return Result.failure("Hero is dead.");
    if (hp > maxHp) return Result.failure("HP cannot exceed Max HP.");
    if (!position) return Result.failure("Position is required.");
    if (!chapterId) return Result.failure("Chapter ID is required.");
    return Result.success(new HeroState(hp, maxHp, position, inventory || [], chapterId));
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

  toJSON() {
    return {
      hp: this.#hp,
      maxHp: this.#maxHp,
      position: this.#position.toJSON(),
      inventory: this.#inventory,
      chapterId: this.#chapterId,
    };
  }

  static fromJSON(json) {
    return new HeroState(
      json.hp,
      json.maxHp,
      Position.fromJSON(json.position),
      json.inventory || [],
      json.chapterId,
    );
  }
}
