import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { BrowserAICapabilityAdapter } from "../src/infrastructure/BrowserAICapabilityAdapter.js";

describe("BrowserAICapabilityAdapter", () => {
  let originalWindow;
  let originalSelf;

  beforeEach(() => {
    originalWindow = global.window;
    originalSelf = global.self;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.self = originalSelf;
  });

  it("should detect capabilities when all APIs are present", async () => {
    global.window = {
      SpeechRecognition: class {},
      speechSynthesis: {},
    };

    global.self = {
      ai: {
        languageModel: {
          availability: async () => "readily",
        },
        translator: {
          availability: async () => "readily",
        },
      },
    };

    const adapter = new BrowserAICapabilityAdapter();
    const capabilities = await adapter.getCapabilities();

    assert.strictEqual(capabilities.speechRecognition, true);
    assert.strictEqual(capabilities.speechSynthesis, true);
    assert.strictEqual(capabilities.promptAPI, "readily");
    assert.strictEqual(capabilities.translatorAPI, true);
  });

  it("should detect capabilities when all APIs are missing", async () => {
    global.window = {};
    global.self = {};

    const adapter = new BrowserAICapabilityAdapter();
    const capabilities = await adapter.getCapabilities();

    assert.strictEqual(capabilities.speechRecognition, false);
    assert.strictEqual(capabilities.speechSynthesis, false);
    assert.strictEqual(capabilities.promptAPI, "unavailable");
    assert.strictEqual(capabilities.translatorAPI, false);
  });

  it("should handle error in Prompt API check", async () => {
    global.window = {};
    global.self = {
      ai: {
        languageModel: {
          availability: async () => {
            throw new Error("API Crash");
          },
        },
      },
    };

    const adapter = new BrowserAICapabilityAdapter();
    const capabilities = await adapter.getCapabilities();

    assert.strictEqual(capabilities.promptAPI, "unavailable");
  });

  it("should handle error in Translator API check", async () => {
    global.window = {};
    global.self = {
      ai: {
        translator: {
          availability: async () => {
            throw new Error("Translator crash");
          },
        },
      },
    };

    const adapter = new BrowserAICapabilityAdapter();
    const capabilities = await adapter.getCapabilities();

    assert.strictEqual(capabilities.translatorAPI, false);
  });
});
