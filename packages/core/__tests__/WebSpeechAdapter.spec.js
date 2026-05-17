import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { WebSpeechAdapter } from "../src/infrastructure/WebSpeechAdapter.js";

describe("WebSpeechAdapter", () => {
  let originalWindow;

  beforeEach(() => {
    originalWindow = global.window;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("should recognize voice command using SpeechRecognition", async () => {
    let startCalled = false;

    class MockSpeechRecognition {
      constructor() {
        this.lang = "";
        this.continuous = false;
        this.interimResults = false;
      }
      start() {
        startCalled = true;
        // Simulate result
        setTimeout(() => {
          this.onresult({
            results: [[{ transcript: "move up" }]],
          });
        }, 0);
      }
      stop() {}
    }

    global.window = {
      SpeechRecognition: MockSpeechRecognition,
    };

    const adapter = new WebSpeechAdapter();
    const result = await adapter.listen();

    assert.strictEqual(startCalled, true);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, "move up");
  });

  it("should return failure if SpeechRecognition is missing", async () => {
    global.window = {};

    const adapter = new WebSpeechAdapter();
    const result = await adapter.listen();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Speech Recognition API not available in this browser");
  });

  it("should handle error event", async () => {
    class MockSpeechRecognition {
      start() {
        setTimeout(() => this.onerror({ error: "no-speech" }), 0);
      }
      stop() {}
    }

    global.window = {
      webkitSpeechRecognition: MockSpeechRecognition,
    };

    const adapter = new WebSpeechAdapter();
    const result = await adapter.listen();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Speech recognition error: no-speech");
  });

  it("should handle no match event", async () => {
    class MockSpeechRecognition {
      start() {
        setTimeout(() => this.onnomatch(), 0);
      }
      stop() {}
    }
    global.window = { SpeechRecognition: MockSpeechRecognition };

    const adapter = new WebSpeechAdapter();
    const result = await adapter.listen();
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "No voice match found");
  });

  it("should handle start error", async () => {
    class MockSpeechRecognition {
      start() {
        throw new Error("Permission denied");
      }
      stop() {}
    }
    global.window = { SpeechRecognition: MockSpeechRecognition };

    const adapter = new WebSpeechAdapter();
    const result = await adapter.listen();
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Failed to start"));
  });

  it("should cleanup on stop", async () => {
    let stopCalled = false;
    class MockSpeechRecognition {
      start() {
        // Just stay open
      }
      stop() {
        stopCalled = true;
      }
    }
    global.window = { SpeechRecognition: MockSpeechRecognition };

    const adapter = new WebSpeechAdapter();
    // Start listening but don't await result yet
    adapter.listen();
    adapter.stop();
    assert.strictEqual(stopCalled, true);
  });

  it("should handle error during stop", async () => {
    class MockSpeechRecognition {
      start() {}
      stop() {
        throw new Error("Already stopped");
      }
    }
    global.window = { SpeechRecognition: MockSpeechRecognition };

    const adapter = new WebSpeechAdapter();
    adapter.listen(); // Start it without awaiting
    adapter.stop(); // Should catch error silently
    assert.ok(true);
  });
});
