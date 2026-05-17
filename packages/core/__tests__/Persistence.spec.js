import { describe, it } from "node:test";
import assert from "node:assert";
import { Result } from "../src/domain/Result.js";
import { HeroState } from "../src/domain/entities/HeroState.js";
import { Position } from "../src/domain/entities/Position.js";
import { SaveProgress } from "../src/use-cases/SaveProgress.js";
import { LoadProgress } from "../src/use-cases/LoadProgress.js";

describe("Persistence Use Cases", () => {
  const mockStorage = {
    data: null,
    save(d) {
      this.data = d;
      return Result.success(true);
    },
    load() {
      return Result.success(this.data);
    },
  };

  it("should save and load progress successfully", () => {
    const hero = HeroState.create(100, 100, Position.create(1, 2).value, ["key"], "chap-01").value;

    const result = SaveProgress.execute({ heroState: hero, storageAdapter: mockStorage });
    assert.strictEqual(result.success, true);

    const loaded = LoadProgress.execute({ storageAdapter: mockStorage });

    assert.strictEqual(loaded.success, true);
    assert.strictEqual(loaded.value.hp, 100);
    assert.deepStrictEqual(loaded.value.inventory, ["key"]);
    assert.ok(loaded.value.position.equals(hero.position));
  });

  it("should handle corrupted save data gracefully", () => {
    const corruptAdapter = {
      load() {
        return Result.success({ hp: "not-a-number", position: null });
      },
    };

    const result = LoadProgress.execute({ storageAdapter: corruptAdapter });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Invalid or missing hero state in save data");
  });

  it("should handle missing fields in saved data", () => {
    const partialAdapter = {
      load() {
        return Result.success({
          hp: 50,
          maxHp: 100,
          position: { x: 0, y: 0 },
          chapterId: "chap-01",
        });
      },
    };

    const result = LoadProgress.execute({ storageAdapter: partialAdapter });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.hp, 50);
    assert.deepStrictEqual(result.value.inventory, []);
  });

  it("should fail load when storage returns null", () => {
    const emptyAdapter = {
      load() {
        return Result.success(null);
      },
    };

    const result = LoadProgress.execute({ storageAdapter: emptyAdapter });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "No save data found");
  });

  it("should propagate storage adapter errors on save", () => {
    const hero = HeroState.create(50, 100, Position.create(0, 0).value, [], "chap-01").value;
    const failAdapter = {
      load: () => Result.success(null),
      save() {
        return Result.failure("QuotaExceededError");
      },
    };

    const result = SaveProgress.execute({ heroState: hero, storageAdapter: failAdapter });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "QuotaExceededError");
  });

  it("should propagate storage adapter errors on load", () => {
    const failAdapter = {
      load() {
        return Result.failure("SecurityError: access denied");
      },
    };

    const result = LoadProgress.execute({ storageAdapter: failAdapter });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "SecurityError: access denied");
  });
});
