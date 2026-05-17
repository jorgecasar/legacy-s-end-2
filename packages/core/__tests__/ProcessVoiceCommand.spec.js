import { describe, it } from "node:test";
import assert from "node:assert";
import { ProcessVoiceCommand } from "../src/use-cases/ProcessVoiceCommand.js";

describe("Use Case: ProcessVoiceCommand", () => {
  it("should trigger MOVE_UP for valid transcripts", () => {
    let moveHeroCalled = false;
    const mockGameStore = {
      moveHero: (dir) => {
        if (dir === "UP") moveHeroCalled = true;
      },
    };

    const result = ProcessVoiceCommand.execute({
      transcript: "Move up please",
      gameStore: mockGameStore,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, "MOVE_UP");
    assert.strictEqual(moveHeroCalled, true);
  });

  it("should trigger INTERACT for valid transcripts", () => {
    let interactCalled = false;
    const mockGameStore = {
      interact: () => {
        interactCalled = true;
      },
    };

    const result = ProcessVoiceCommand.execute({
      transcript: "Talk to NPC",
      gameStore: mockGameStore,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, "INTERACT");
    assert.strictEqual(interactCalled, true);
  });

  it("should trigger MOVE_DOWN for valid transcripts", () => {
    let moveHeroCalled = false;
    const mockGameStore = {
      moveHero: (dir) => {
        if (dir === "DOWN") moveHeroCalled = true;
      },
    };

    const result = ProcessVoiceCommand.execute({
      transcript: "go down",
      gameStore: mockGameStore,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, "MOVE_DOWN");
    assert.strictEqual(moveHeroCalled, true);
  });

  it("should trigger MOVE_LEFT for valid transcripts", () => {
    let moveHeroCalled = false;
    const mockGameStore = {
      moveHero: (dir) => {
        if (dir === "LEFT") moveHeroCalled = true;
      },
    };

    const result = ProcessVoiceCommand.execute({
      transcript: "izquierda",
      gameStore: mockGameStore,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, "MOVE_LEFT");
    assert.strictEqual(moveHeroCalled, true);
  });

  it("should trigger MOVE_RIGHT for valid transcripts", () => {
    let moveHeroCalled = false;
    const mockGameStore = {
      moveHero: (dir) => {
        if (dir === "RIGHT") moveHeroCalled = true;
      },
    };

    const result = ProcessVoiceCommand.execute({
      transcript: "derecha",
      gameStore: mockGameStore,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, "MOVE_RIGHT");
    assert.strictEqual(moveHeroCalled, true);
  });

  it("should trigger NEXT_DIALOGUE for valid transcripts", () => {
    let nextCalled = false;
    const mockGameStore = {
      advanceDialogue: () => {
        nextCalled = true;
      },
    };

    const result = ProcessVoiceCommand.execute({
      transcript: "siguiente",
      gameStore: mockGameStore,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, "NEXT_DIALOGUE");
    assert.strictEqual(nextCalled, true);
  });

  it("should return null if transcript is empty", () => {
    const result = ProcessVoiceCommand.execute({
      transcript: "",
      gameStore: {},
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, null);
  });

  it("should fail for unknown command", () => {
    const mockGameStore = {};
    const result = ProcessVoiceCommand.execute({
      transcript: "dance",
      gameStore: mockGameStore,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'Unknown command: "dance"');
  });
});
