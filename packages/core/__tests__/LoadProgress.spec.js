import { describe, it } from "node:test";
import assert from "node:assert";
import LoadProgress from "../src/use-cases/LoadProgress.js";

describe("LoadProgress", () => {
  it("should successfully load data via provider", async () => {
    /** @type {any} */
    const mockProvider = {
      load: async (key) => {
        assert.strictEqual(key, "testKey");
        return { success: true, value: { level: 2 } };
      },
    };

    const useCase = new LoadProgress(mockProvider, "testKey");
    const result = await useCase.execute();

    assert.strictEqual(result.success, true);
    assert.deepStrictEqual(result.value, { level: 2 });
  });

  it("should return error if provider fails", async () => {
    /** @type {any} */
    const mockProvider = {
      load: async () => {
        return { success: false, error: "Not found" };
      },
    };

    const useCase = new LoadProgress(mockProvider, "testKey");
    const result = await useCase.execute();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Not found");
  });

  it("should return default error if provider fails without message", async () => {
    /** @type {any} */
    const mockProvider = {
      load: async () => {
        return { success: false };
      },
    };

    const useCase = new LoadProgress(mockProvider, "testKey");
    const result = await useCase.execute();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Unknown error");
  });

  it("should catch exceptions and return failure result", async () => {
    /** @type {any} */
    const mockProvider = {
      load: async () => {
        throw new Error("Disk error");
      },
    };

    const useCase = new LoadProgress(mockProvider, "testKey");
    const result = await useCase.execute();

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Failed to load progress: Disk error");
  });
});
