import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { ChromePromptAdapter } from "../src/infrastructure/ChromePromptAdapter.js";
import { AIUtils } from "../src/infrastructure/AIUtils.js";

describe("ChromePromptAdapter", () => {
  let originalSelf;
  let originalWithTimeout;

  beforeEach(() => {
    originalSelf = global.self;
    originalWithTimeout = AIUtils.withTimeout;
    // Mock withTimeout to resolve instantly in tests
    AIUtils.withTimeout = async (p) => p;
  });

  afterEach(() => {
    global.self = originalSelf;
    AIUtils.withTimeout = originalWithTimeout;
  });

  it("should generate text using self.ai.languageModel", async () => {
    global.self = {
      navigator: { language: "en-US" },
      ai: {
        languageModel: {
          availability: async () => "readily",
          create: async (options) => {
            assert.ok(options.monitor);
            return {
              prompt: async (p) => {
                assert.strictEqual(p, "Hello AI");
                return "Hello Human";
              },
            };
          },
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.generate("Hello AI");

    assert.strictEqual(result.success, true, `Result failed: ${result.error}`);
    assert.strictEqual(result.value, "Hello Human");
  });

  it("should support legacy ai.assistant namespace", async () => {
    global.self = {
      navigator: { language: "en-US" },
      ai: {
        assistant: {
          availability: async () => "readily",
          create: async () => ({ prompt: async () => "Legacy OK" }),
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.generate("Hello");
    assert.strictEqual(result.value, "Legacy OK");
  });

  it("should support global model namespace", async () => {
    global.self = {
      navigator: { language: "en-US" },
      model: {
        availability: async () => "readily",
        create: async () => ({ prompt: async () => "Global Model OK" }),
      },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.generate("Hello");
    assert.strictEqual(result.value, "Global Model OK");
  });

  it("should handle unavailable API", async () => {
    global.self = {
      navigator: { language: "en-US" },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.generate("Hello");

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Prompt API not available");
  });

  it("should handle creation error", async () => {
    global.self = {
      navigator: { language: "en-US" },
      ai: {
        languageModel: {
          availability: async () => "readily",
          create: async () => {
            throw new Error("Creation failed");
          },
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.generate("Hello");
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Creation failed"));
  });

  it("should handle timeout in availability", async () => {
    // Restore original withTimeout for this specific test to test timeout logic
    AIUtils.withTimeout = originalWithTimeout;

    global.self = {
      navigator: { language: "en-US" },
      ai: {
        languageModel: {
          availability: () => new Promise(() => {}), // Never resolves
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.generate("Hello");
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Prompt API not available");
  });

  it("should report download progress through monitor", async () => {
    let progressReported = false;

    global.self = {
      navigator: { language: "en-US" },
      ai: {
        languageModel: {
          availability: async () => "after-download",
          create: async (options) => {
            const mockMonitor = {
              addEventListener: (name, cb) => {
                if (name === "downloadprogress") {
                  cb({ loaded: 50, total: 100 });
                }
              },
            };
            options.monitor(mockMonitor);
            return {
              prompt: async () => "OK",
            };
          },
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    await adapter.generate("Hello", {
      onDownloadProgress: (loaded, total) => {
        progressReported = true;
        assert.strictEqual(loaded, 50);
        assert.strictEqual(total, 100);
      },
    });

    assert.strictEqual(progressReported, true);
  });

  it("should handle monitor with missing callback", async () => {
    global.self = {
      navigator: { language: "en" },
      ai: {
        languageModel: {
          availability: async () => "readily",
          create: async (options) => {
            const mockMonitor = { addEventListener: () => {} };
            options.monitor(mockMonitor);
            return { prompt: async () => "OK" };
          },
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.generate("Hello");
    assert.strictEqual(result.success, true);
  });

  it("should catch prompt execution errors", async () => {
    global.self = {
      navigator: { language: "en" },
      ai: {
        languageModel: {
          availability: async () => "readily",
          create: async () => ({
            prompt: async () => {
              throw new Error("Execution failed");
            },
          }),
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.generate("Hello");
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Execution failed"));
  });

  it("should support downloadModel method", async () => {
    let createCalled = false;

    global.self = {
      navigator: { language: "en-US" },
      ai: {
        languageModel: {
          availability: async () => "after-download",
          create: async () => {
            createCalled = true;
            return { prompt: async () => "OK" };
          },
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.downloadModel();
    assert.strictEqual(result.success, true);
    assert.strictEqual(createCalled, true);
  });

  it("should return success in downloadModel if readily available", async () => {
    global.self = {
      navigator: { language: "en-US" },
      ai: {
        languageModel: {
          availability: async (options) => {
            if (!options || !options.languages) return "unavailable";
            return "readily";
          },
          create: async () => ({ prompt: async () => "OK" }),
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.downloadModel();
    assert.strictEqual(result.success, true, `Result failed: ${result.error}`);
  });

  it("should handle error in downloadModel", async () => {
    global.self = {
      navigator: { language: "en-US" },
      ai: {
        languageModel: {
          availability: async () => "after-download",
          create: async () => {
            throw new Error("Disk full");
          },
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.downloadModel();
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Disk full"));
  });

  it("should handle destroy logic", async () => {
    let destroyCalled = false;
    global.self = {
      navigator: { language: "en" },
      ai: {
        languageModel: {
          availability: async () => "readily",
          create: async () => ({
            prompt: async () => "OK",
            destroy: () => {
              destroyCalled = true;
            },
          }),
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    await adapter.generate("Hello");
    adapter.destroy();
    assert.strictEqual(destroyCalled, true);

    adapter.destroy(); // Second call
  });

  it("should handle error in downloadModel when availability check fails", async () => {
    global.self = {
      ai: {
        languageModel: {
          availability: async () => {
            throw new Error("Availability crash");
          },
        },
      },
    };

    const adapter = new ChromePromptAdapter();
    const result = await adapter.downloadModel();
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Prompt API not available");
  });
});
