import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import AutoSaveService from "../src/infrastructure/AutoSaveService.js";
import { Result } from "../src/domain/Result.js";
import HeroState from "../src/domain/entities/HeroState.js";
import Position from "../src/domain/entities/Position.js";

describe("AutoSaveService", () => {
  const hero = HeroState.create(100, 100, Position.create(1, 2).value, []).value;

  beforeEach(() => {
    mock.timers.enable({ apis: ["setTimeout"] });
  });

  afterEach(() => {
    mock.timers.reset();
  });

  it("should debounce save requests", () => {
    let saveCount = 0;
    const mockAdapter = {
      save() {
        saveCount++;
        return Result.success(true);
      },
    };

    const service = new AutoSaveService(mockAdapter, 100);
    service.requestSave(hero);
    service.requestSave(hero);
    service.requestSave(hero);

    mock.timers.tick(50);
    assert.strictEqual(saveCount, 0);

    mock.timers.tick(100);
    assert.strictEqual(saveCount, 1);
  });

  it("should immediately save on forceSave", () => {
    let saveCount = 0;
    const mockAdapter = {
      save() {
        saveCount++;
        return Result.success(true);
      },
    };

    const service = new AutoSaveService(mockAdapter, 5000);
    service.requestSave(hero);

    const result = service.forceSave(hero);

    assert.strictEqual(saveCount, 1);
    assert.strictEqual(result.success, true);

    mock.timers.tick(6000);
    assert.strictEqual(saveCount, 1); // still 1, pending was cleared
  });

  it("should handle failed auto-save gracefully", () => {
    let saveCount = 0;
    const mockAdapter = {
      save() {
        saveCount++;
        return Result.failure("Disk full");
      },
    };

    const service = new AutoSaveService(mockAdapter, 100);
    service.requestSave(hero);

    mock.timers.tick(150);
    assert.strictEqual(saveCount, 1);
  });

  it("should stop pending saves", () => {
    let saveCount = 0;
    const mockAdapter = {
      save() {
        saveCount++;
        return Result.success(true);
      },
    };

    const service = new AutoSaveService(mockAdapter, 100);
    service.requestSave(hero);
    service.stop();

    mock.timers.tick(150);
    assert.strictEqual(saveCount, 0);
  });

  it("should do nothing when stop is called and no save is pending", () => {
    const mockAdapter = { save: () => Result.success(true) };
    const service = new AutoSaveService(mockAdapter, 100);
    service.stop();
    assert.ok(true);
  });
});
