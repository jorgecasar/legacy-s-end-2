import { describe, it } from "node:test";
import assert from "node:assert";
import { SaveProgress } from "../src/use-cases/SaveProgress.js";
import { Result } from "../src/domain/Result.js";
import HeroState from "../src/domain/entities/HeroState.js";
import Position from "../src/domain/entities/Position.js";

describe("SaveProgress", () => {
  const hero = HeroState.create(80, 100, Position.create(3, 4).value, ["sword"]).value;

  it("should successfully save heroState via storageAdapter", () => {
    const mockAdapter = {
      save(data) {
        assert.deepStrictEqual(data, hero.toJSON());
        return Result.success(true);
      },
    };

    const result = SaveProgress.execute({ heroState: hero, storageAdapter: mockAdapter });

    assert.strictEqual(result.success, true);
  });

  it("should propagate adapter failure", () => {
    const mockAdapter = {
      save() {
        return Result.failure("Storage full");
      },
    };

    const result = SaveProgress.execute({ heroState: hero, storageAdapter: mockAdapter });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Storage full");
  });
});
