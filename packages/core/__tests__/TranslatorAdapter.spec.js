import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { TranslatorAdapter } from "../src/infrastructure/TranslatorAdapter.js";

describe("TranslatorAdapter", () => {
  let originalSelf;

  beforeEach(() => {
    originalSelf = global.self;
  });

  afterEach(() => {
    global.self = originalSelf;
  });

  it("should translate text using self.ai.translator", async () => {
    let createCalled = false;
    let translateCalled = false;

    global.self = {
      ai: {
        translator: {
          availability: async () => "readily",
          create: async (options) => {
            createCalled = true;
            assert.strictEqual(options.sourceLanguage, "en");
            assert.strictEqual(options.targetLanguage, "es");
            return {
              translate: async (text) => {
                translateCalled = true;
                assert.strictEqual(text, "Hello");
                return "Hola";
              },
            };
          },
        },
      },
    };

    const adapter = new TranslatorAdapter();
    const result = await adapter.translate("Hello", {
      sourceLanguage: "en",
      targetLanguage: "es",
    });

    assert.strictEqual(createCalled, true);
    assert.strictEqual(translateCalled, true);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, "Hola");
  });

  it("should cache translator instances", async () => {
    let createCount = 0;

    global.self = {
      ai: {
        translator: {
          availability: async () => "readily",
          create: async () => {
            createCount++;
            return {
              translate: async () => "Hola",
            };
          },
        },
      },
    };

    const adapter = new TranslatorAdapter();
    await adapter.translate("Hello", { sourceLanguage: "en", targetLanguage: "es" });
    await adapter.translate("World", { sourceLanguage: "en", targetLanguage: "es" });

    assert.strictEqual(createCount, 1);
  });

  it("should handle unavailable translation pair", async () => {
    global.self = {
      ai: {
        translator: {
          availability: async () => "unavailable",
        },
      },
    };

    const adapter = new TranslatorAdapter();
    const result = await adapter.translate("Hello", {
      sourceLanguage: "en",
      targetLanguage: "xx",
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Translation unavailable"));
  });

  it("should report status via getAvailability", async () => {
    global.self = {
      ai: {
        translator: {
          availability: async () => "after-download",
        },
      },
    };

    const adapter = new TranslatorAdapter();
    const status = await adapter.getAvailability("en", "es");
    assert.strictEqual(status, "after-download");
  });

  it("should handle error in translate execution", async () => {
    global.self = {
      ai: {
        translator: {
          availability: async () => "readily",
          create: async () => ({
            translate: async () => {
              throw new Error("API Crash");
            },
          }),
        },
      },
    };

    const adapter = new TranslatorAdapter();
    const result = await adapter.translate("Hello", { sourceLanguage: "en", targetLanguage: "es" });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("API Crash"));
  });

  it("should handle error in availability check", async () => {
    global.self = {
      ai: {
        translator: {
          availability: async () => {
            throw new Error("Detection failed");
          },
        },
      },
    };

    const adapter = new TranslatorAdapter();
    const status = await adapter.getAvailability("en", "es");
    assert.strictEqual(status, "unavailable");
  });

  it("should handle destroy logic", async () => {
    let destroyCount = 0;
    global.self = {
      ai: {
        translator: {
          availability: async () => "readily",
          create: async () => ({
            translate: async () => "OK",
            destroy: () => {
              destroyCount++;
            },
          }),
        },
      },
    };

    const adapter = new TranslatorAdapter();
    await adapter.translate("A", { sourceLanguage: "en", targetLanguage: "es" });
    await adapter.translate("B", { sourceLanguage: "en", targetLanguage: "fr" });
    adapter.destroy();
    assert.strictEqual(destroyCount, 2);
  });

  it("should handle missing translator API in self", async () => {
    global.self = { ai: {} }; // No translator

    const adapter = new TranslatorAdapter();
    const status = await adapter.getAvailability("en", "es");
    assert.strictEqual(status, "unavailable");
  });
});
