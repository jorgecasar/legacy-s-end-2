import { describe, it } from "node:test";
import assert from "node:assert";
import { GenerateNPCDialogue } from "../src/use-cases/GenerateNPCDialogue.js";
import { Result } from "../src/domain/Result.js";

describe("Use Case: GenerateNPCDialogue", () => {
  it("should generate NPC dialogue using the port", async () => {
    let generateCalled = false;
    const mockAiPort = {
      generate: async (prompt, options) => {
        generateCalled = true;
        assert.ok(options.systemPrompt.toLowerCase().includes("guard"));
        assert.ok(prompt.includes("Convert this"));
        assert.ok(prompt.includes("Halt!"));
        // Simulate response with some noise to test stripping
        return Result.success('(Thinking deeply) "¡Alto! ¿Quién va?"');
      },
    };

    const result = await GenerateNPCDialogue.execute({
      npcId: "guard-1",
      npcPersona: "A grumpy town guard",
      playerContext: "The player is running near the gate",
      baseMessage: "Halt! Who goes there?",
      aiPort: mockAiPort,
    });

    assert.strictEqual(result.success, true, `Generation failed: ${result.error}`);
    assert.strictEqual(generateCalled, true);
    // Should be stripped of parentheses and quotes
    assert.strictEqual(result.value, "¡Alto! ¿Quién va?");
  });

  it("should return baseMessage if AI returns empty string", async () => {
    const mockAiPort = {
      generate: async () => Result.success("()"), // Empty after stripping
    };

    const result = await GenerateNPCDialogue.execute({
      npcId: "npc-1",
      npcPersona: "Someone",
      playerContext: "Somewhere",
      baseMessage: "Static Hello",
      aiPort: mockAiPort,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, "Static Hello");
  });

  it("should return result if AI generation fails", async () => {
    const mockAiPort = {
      generate: async () => Result.failure("AI Busy"),
    };

    const result = await GenerateNPCDialogue.execute({
      npcId: "npc-1",
      npcPersona: "Someone",
      playerContext: "Somewhere",
      baseMessage: "Hello",
      aiPort: mockAiPort,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "AI Busy");
  });

  it("should catch errors from the port", async () => {
    const mockAiPort = {
      generate: async () => {
        throw new Error("AI Crash");
      },
    };

    const result = await GenerateNPCDialogue.execute({
      npcId: "npc-1",
      npcPersona: "Someone",
      playerContext: "Somewhere",
      aiPort: mockAiPort,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Failed to generate NPC dialogue: AI Crash");
  });
});
