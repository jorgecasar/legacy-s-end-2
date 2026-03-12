import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import LocalStorageAdapter from "../src/infrastructure/LocalStorageAdapter.js";

describe("LocalStorageAdapter", () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    /** @type {any} */
    const mockValue = {
      setItem: (key, value) => {
        mockStorage[key] = value;
      },
      getItem: (key) => (key in mockStorage ? mockStorage[key] : null),
      removeItem: (key) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    };
    global.localStorage = mockValue;
  });

  afterEach(() => {
    delete global.localStorage;
  });

  it("should save data to localStorage", async () => {
    const adapter = new LocalStorageAdapter();
    const result = await adapter.save("testKey", { val: 42 });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, undefined);
    assert.strictEqual(mockStorage["testKey"], '{"val":42}');
  });

  it("should return false if save fails", async () => {
    global.localStorage.setItem = () => {
      throw new Error("Quota exceeded");
    };

    const adapter = new LocalStorageAdapter();
    const result = await adapter.save("testKey", { val: 42 });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.value, undefined);
    assert.strictEqual(result.error, "LocalStorage save failed: Quota exceeded");
  });

  it("should load data from localStorage", async () => {
    mockStorage["testKey"] = '{"val":42}';

    const adapter = new LocalStorageAdapter();
    const result = await adapter.load("testKey");

    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.value, { val: 42 });
  });

  it("should return undefined if key not found", async () => {
    const adapter = new LocalStorageAdapter();
    const result = await adapter.load("missingKey");

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, undefined);
  });

  it("should return false if load fails", async () => {
    mockStorage["testKey"] = "invalid json";

    const adapter = new LocalStorageAdapter();
    const result = await adapter.load("testKey");

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.value, undefined);
    assert.ok(result.error.startsWith("LocalStorage load failed:"));
  });
});
