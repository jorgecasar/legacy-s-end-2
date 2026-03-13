import { describe, it } from "node:test";
import assert from "node:assert";
import DialogueNode from "../src/domain/entities/DialogueNode.js";

describe("Domain: DialogueNode Entity", () => {
  it("should create a valid DialogueNode using factory", () => {
    const result = DialogueNode.create("node1", "Speaker", "Hello", "node2");
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.id, "node1");
    assert.strictEqual(result.value.speaker, "Speaker");
    assert.strictEqual(result.value.text, "Hello");
    assert.strictEqual(result.value.nextId, "node2");
  });

  it("should fail if id is missing", () => {
    const result = DialogueNode.create("", "Speaker", "Hello");
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Dialogue ID is required.");
  });

  it("should fail if speaker is missing", () => {
    const result = DialogueNode.create("node1", "", "Hello");
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Speaker is required.");
  });

  it("should fail if text is missing", () => {
    const result = DialogueNode.create("node1", "Speaker", "");
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Text is required.");
  });

  it("should default nextId to null", () => {
    const result = DialogueNode.create("node1", "Speaker", "Hello");
    assert.strictEqual(result.value.nextId, null);
  });
});
