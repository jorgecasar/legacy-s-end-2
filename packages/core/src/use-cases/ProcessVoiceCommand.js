import { Result } from "../domain/Result.js";

/**
 * ProcessVoiceCommand Use Case
 *
 * Maps recognized voice transcripts to specific game actions.
 */
export class ProcessVoiceCommand {
  /**
   * Executes the use case.
   * @param {Object} params
   * @param {string} params.transcript - The text recognized from voice.
   * @param {any} params.gameStore - The store to trigger actions on.
   * @returns {Result<string | null>} The identified action name or null.
   */
  static execute({ transcript, gameStore }) {
    if (!transcript) return Result.success(null);

    const command = transcript.toLowerCase().trim();

    // Movement Commands
    if (this.#matches(command, ["move up", "go up", "north", "arriba"])) {
      gameStore.moveHero("UP");
      return Result.success("MOVE_UP");
    }
    if (this.#matches(command, ["move down", "go down", "south", "abajo"])) {
      gameStore.moveHero("DOWN");
      return Result.success("MOVE_DOWN");
    }
    if (this.#matches(command, ["move left", "go left", "west", "izquierda"])) {
      gameStore.moveHero("LEFT");
      return Result.success("MOVE_LEFT");
    }
    if (this.#matches(command, ["move right", "go right", "east", "derecha"])) {
      gameStore.moveHero("RIGHT");
      return Result.success("MOVE_RIGHT");
    }

    // Interaction Commands
    if (
      this.#matches(command, [
        "interact",
        "talk",
        "open",
        "check",
        "hablar",
        "interactuar",
        "interactúa",
      ])
    ) {
      gameStore.interact();
      return Result.success("INTERACT");
    }

    // Dialogue Commands
    if (this.#matches(command, ["next", "continue", "siguiente", "continuar"])) {
      gameStore.advanceDialogue();
      return Result.success("NEXT_DIALOGUE");
    }

    return Result.failure(`Unknown command: "${transcript}"`);
  }

  /**
   * @param {string} command
   * @param {string[]} variants
   */
  static #matches(command, variants) {
    return variants.some((v) => command.includes(v));
  }
}
