import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { LocalStorageAdapter } from "../src/infrastructure/LocalStorageAdapter.js";

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

  it("should save data to localStorage", () => {
    const adapter = new LocalStorageAdapter();
    const result = adapter.save({ val: 42 });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, true);
    assert.strictEqual(mockStorage["legacys_end_save"], '{"val":42}');
  });

  it("should return failure if save throws", () => {
    global.localStorage.setItem = () => {
      throw new Error("Quota exceeded");
    };

    const adapter = new LocalStorageAdapter();
    const result = adapter.save({ val: 42 });

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Quota exceeded"));
  });

  it("should load data from localStorage", () => {
    mockStorage["legacys_end_save"] = '{"val":42}';

    const adapter = new LocalStorageAdapter();
    const result = adapter.load();

    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.value, { val: 42 });
  });

  it("should return null if no save exists", () => {
    const adapter = new LocalStorageAdapter();
    const result = adapter.load();

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, null);
  });

  it("should return failure for corrupted JSON", () => {
    mockStorage["legacys_end_save"] = "not valid json{{{";

    const adapter = new LocalStorageAdapter();
    const result = adapter.load();

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Failed to load"));
  });
});
