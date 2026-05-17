import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { SpeechSynthesisAdapter } from "../src/infrastructure/SpeechSynthesisAdapter.js";

describe("SpeechSynthesisAdapter", () => {
  let originalWindow;
  let originalUtterance;

  beforeEach(() => {
    originalWindow = global.window;
    originalUtterance = global.SpeechSynthesisUtterance;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.SpeechSynthesisUtterance = originalUtterance;
  });

  it("should speak text using window.speechSynthesis", async () => {
    let speakCalled = false;
    let cancelCalled = false;

    global.window = {
      speechSynthesis: {
        speak: (u) => {
          speakCalled = true;
          // Simulate onend asynchronously
          setTimeout(() => u.onend(), 0);
        },
        cancel: () => {
          cancelCalled = true;
        },
      },
    };

    global.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };

    const adapter = new SpeechSynthesisAdapter();
    const result = await adapter.speak("Hello world");

    assert.strictEqual(speakCalled, true);
    assert.strictEqual(cancelCalled, true); // stop() is called before speak
    assert.strictEqual(result.success, true);
  });

  it("should return failure if speechSynthesis is missing", async () => {
    global.window = {};

    const adapter = new SpeechSynthesisAdapter();
    const result = await adapter.speak("Hello");

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "SpeechSynthesis API not available in this browser");
  });

  it("should handle error event", async () => {
    global.window = {
      speechSynthesis: {
        speak: (u) => {
          setTimeout(() => u.onerror({ error: "not-allowed" }), 0);
        },
        cancel: () => {},
      },
    };

    global.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };

    const adapter = new SpeechSynthesisAdapter();
    const result = await adapter.speak("Hello");

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "SpeechSynthesis error: not-allowed");
  });

  it("should handle stop correctly", () => {
    let cancelCalled = false;
    global.window = {
      speechSynthesis: {
        cancel: () => {
          cancelCalled = true;
        },
      },
    };

    const adapter = new SpeechSynthesisAdapter();
    adapter.stop();
    assert.strictEqual(cancelCalled, true);
  });
});
