import { describe, it } from "node:test";
import assert from "node:assert";
import { LoadProgress } from "../src/use-cases/LoadProgress.js";
import { Result } from "../src/domain/Result.js";

describe("LoadProgress", () => {
  it("should successfully load and reconstruct a HeroState", () => {
    const savedData = { hp: 80, maxHp: 100, position: { x: 3, y: 4 }, inventory: ["sword"] };
    const mockAdapter = {
      load() {
        return Result.success(savedData);
      },
    };

    const result = LoadProgress.execute({ storageAdapter: mockAdapter });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.hp, 80);
    assert.strictEqual(result.value.maxHp, 100);
    assert.strictEqual(result.value.position.x, 3);
    assert.strictEqual(result.value.position.y, 4);
    assert.deepStrictEqual(result.value.inventory, ["sword"]);
  });

  it("should return failure when adapter fails", () => {
    const mockAdapter = {
      load() {
        return Result.failure("Disk error");
      },
    };

    const result = LoadProgress.execute({ storageAdapter: mockAdapter });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Disk error");
  });

  it("should return failure when no save data exists", () => {
    const mockAdapter = {
      load() {
        return Result.success(null);
      },
    };

    const result = LoadProgress.execute({ storageAdapter: mockAdapter });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "No save data found");
  });
});
