import assert from "node:assert";
import { describe, it } from "node:test";
import { QuestId } from "../src/domain/entities/QuestId.js";

describe("Domain: QuestId Value Object", () => {
  it("should create a valid QuestId", () => {
    const result = QuestId.create("q123");
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.value, "q123");
  });

  it("should fail with empty string", () => {
    const result = QuestId.create("");
    assert.strictEqual(result.success, false);
    assert.match(result.error, /non-empty string/);
  });

  it("should fail with null or undefined", () => {
    // @ts-ignore
    assert.strictEqual(QuestId.create(null).success, false);
    // @ts-ignore
    assert.strictEqual(QuestId.create(undefined).success, false);
  });

  it("should check equality with other QuestId", () => {
    const id1 = QuestId.create("q1").value;
    const id2 = QuestId.create("q1").value;
    const id3 = QuestId.create("q2").value;

    assert.strictEqual(id1.equals(id2), true);
    assert.strictEqual(id1.equals(id3), false);
    // @ts-ignore
    assert.strictEqual(id1.equals("q1"), false);
  });

  it("should return string representation", () => {
    const id = QuestId.create("q1").value;
    assert.strictEqual(id.toString(), "q1");
    assert.strictEqual(String(id), "q1");
  });
});
