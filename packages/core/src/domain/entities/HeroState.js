import { Result } from "../Result.js";
/** @typedef {import("./Position.js").default} Position */

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

  /**
   * @param {number} hp
   * @param {number} maxHp
   * @param {Position} position
   * @param {string[]} inventory
   */
  constructor(hp, maxHp, position, inventory) {
    this.#hp = hp;
    this.#maxHp = maxHp;
    this.#position = position;
    this.#inventory = inventory;
  }

  /**
   * Factory method to create a HeroState.
   * @param {number} hp
   * @param {number} maxHp
   * @param {Position} position
   * @param {string[]} inventory
   * @returns {Result<HeroState>}
   */
  static create(hp, maxHp, position, inventory) {
    if (hp <= 0) return Result.failure("Hero is dead.");
    if (hp > maxHp) return Result.failure("HP cannot exceed Max HP.");
    if (!position) return Result.failure("Position is required.");
    return Result.success(new HeroState(hp, maxHp, position, inventory || []));
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
}
