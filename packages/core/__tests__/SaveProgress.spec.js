import { describe, it } from "node:test";
import assert from "node:assert";
import SaveProgress from "../src/use-cases/SaveProgress.js";

describe("SaveProgress", () => {
  it("should successfully save data via provider", async () => {
    /** @type {any} */
    const mockProvider = {
      save: async (key, data) => {
        assert.strictEqual(key, "testKey");
        assert.deepStrictEqual(data, { level: 1 });
        return { success: true };
      },
    };

    const useCase = new SaveProgress(mockProvider, "testKey");
    const result = await useCase.execute({ level: 1 });

    assert.strictEqual(result.success, true);
  });

  it("should return error if provider fails", async () => {
    /** @type {any} */
    const mockProvider = {
      save: async () => {
        return { success: false, error: "Storage full" };
      },
    };

    const useCase = new SaveProgress(mockProvider, "testKey");
    const result = await useCase.execute({ level: 1 });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Storage full");
  });

  it("should return default error if provider fails without message", async () => {
    /** @type {any} */
    const mockProvider = {
      save: async () => {
        return { success: false };
      },
    };

    const useCase = new SaveProgress(mockProvider, "testKey");
    const result = await useCase.execute({ level: 1 });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Unknown error");
  });

  it("should catch exceptions and return failure result", async () => {
    /** @type {any} */
    const mockProvider = {
      save: async () => {
        throw new Error("Unexpected error");
      },
    };

    const useCase = new SaveProgress(mockProvider, "testKey");
    const result = await useCase.execute({ level: 1 });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Failed to save progress: Unexpected error");
  });
});
