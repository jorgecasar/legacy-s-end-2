import { describe, it } from "node:test";
import assert from "node:assert";
import { CollisionService } from "../src/domain/services/CollisionService.js";
import Position from "../src/domain/entities/Position.js";

describe("Domain Service: CollisionService", () => {
  describe("Euclidean Distance", () => {
    it("should return true when distance is within threshold", () => {
      const p1 = new Position(50, 50);
      const p2 = new Position(52, 52); // dist ~2.8
      assert.strictEqual(CollisionService.isNearby(p1, p2, 5), true);
    });

    it("should return false when distance is outside threshold", () => {
      const p1 = new Position(50, 50);
      const p2 = new Position(60, 60); // dist ~14.1
      assert.strictEqual(CollisionService.isNearby(p1, p2, 5), false);
    });
  });

  describe("World Collisions", () => {
    it("should block movement into solid zones", () => {
      const pos = new Position(20, 20);
      const obstacles = [{ x: 15, y: 15, width: 10, height: 10 }]; // Overlaps 20,20
      assert.strictEqual(CollisionService.checkCollision(pos, obstacles), true);
    });
  });
});
