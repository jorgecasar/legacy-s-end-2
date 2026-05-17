import { describe, it } from "node:test";
import assert from "node:assert";
import { ReadDialogueAloud } from "../src/use-cases/ReadDialogueAloud.js";
import { Result } from "../src/domain/Result.js";

describe("Use Case: ReadDialogueAloud", () => {
  it("should speak the provided text using the port", async () => {
    let speakCalled = false;
    const mockTtsPort = {
      speak: async (text) => {
        speakCalled = true;
        assert.strictEqual(text, "Hello NPC");
        return Result.success(undefined);
      },
    };

    const result = await ReadDialogueAloud.execute({
      text: "Hello NPC",
      ttsPort: mockTtsPort,
    });

    assert.strictEqual(speakCalled, true);
    assert.strictEqual(result.success, true);
  });

  it("should fail if no text is provided", async () => {
    const mockTtsPort = { speak: async () => Result.success(undefined) };

    const result = await ReadDialogueAloud.execute({
      text: "",
      ttsPort: mockTtsPort,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "No text provided for speech");
  });

  it("should catch errors from the port", async () => {
    const mockTtsPort = {
      speak: async () => {
        throw new Error("Port Crash");
      },
    };

    const result = await ReadDialogueAloud.execute({
      text: "Hello",
      ttsPort: mockTtsPort,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Failed to read dialogue: Port Crash");
  });
});
