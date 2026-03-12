import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import AutoSaveService from "../src/infrastructure/AutoSaveService.js";

describe("AutoSaveService", () => {
  beforeEach(() => {
    mock.timers.enable({ apis: ["setTimeout"] });
  });

  afterEach(() => {
    mock.timers.reset();
  });

  it("should debounce save requests", () => {
    let saveCount = 0;
    /** @type {any} */
    const mockSaveProgress = {
      execute: async () => {
        saveCount++;
        return { success: true };
      },
    };

    const service = new AutoSaveService(mockSaveProgress, 100);
    service.requestSave({ a: 1 });
    service.requestSave({ a: 2 });
    service.requestSave({ a: 3 });

    mock.timers.tick(50);
    assert.strictEqual(saveCount, 0);

    mock.timers.tick(100); // 150 total

    // Wait a tick for async execute to be called
    setImmediate(() => {
      assert.strictEqual(saveCount, 1);
    });
  });

  it("should immediately save on forceSave", async () => {
    let saveCount = 0;
    /** @type {any} */
    const mockSaveProgress = {
      execute: async (data) => {
        saveCount++;
        return { success: true, value: data };
      },
    };

    const service = new AutoSaveService(mockSaveProgress, 5000);
    service.requestSave({ a: 1 });

    await service.forceSave({ a: 2 });

    assert.strictEqual(saveCount, 1);

    // Even if timer fires, it was stopped
    mock.timers.tick(6000);
    setImmediate(() => {
      assert.strictEqual(saveCount, 1); // still 1
    });
  });

  it("should handle failed auto-save", () => {
    let saveCount = 0;
    /** @type {any} */
    const mockSaveProgress = {
      execute: async () => {
        saveCount++;
        return { success: false, error: "Disk full" };
      },
    };

    const service = new AutoSaveService(mockSaveProgress, 100);
    service.requestSave({ a: 1 });

    mock.timers.tick(150);

    setImmediate(() => {
      assert.strictEqual(saveCount, 1);
    });
  });

  it("should stop pending saves", () => {
    let saveCount = 0;
    /** @type {any} */
    const mockSaveProgress = {
      execute: async () => {
        saveCount++;
        return { success: true };
      },
    };

    const service = new AutoSaveService(mockSaveProgress, 100);
    service.requestSave({ a: 1 });
    service.stop();

    mock.timers.tick(150);
    setImmediate(() => {
      assert.strictEqual(saveCount, 0);
    });
  });

  it("should do nothing when stop is called and no save is pending", () => {
    /** @type {any} */
    const mockSaveProgress = {
      execute: async () => ({ success: true }),
    };
    const service = new AutoSaveService(mockSaveProgress, 100);
    service.stop(); // No timeoutId, should just return
    assert.ok(true);
  });
});
