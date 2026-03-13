import { describe, it } from "node:test";
import assert from "node:assert";
import { AdvanceDialogue } from "../src/use-cases/AdvanceDialogue.js";
import DialogueNode from "../src/domain/entities/DialogueNode.js";

describe("Use Case: AdvanceDialogue", () => {
  const node1 = DialogueNode.create("1", "S1", "T1", "2").value;
  const node2 = DialogueNode.create("2", "S2", "T2", null).value;
  const nodes = [node1, node2];

  it("should advance to the next node", () => {
    const result = AdvanceDialogue.execute({
      currentNodeId: "1",
      dialogueNodes: nodes,
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.id, "2");
  });

  it("should return null if it is the end of dialogue", () => {
    const result = AdvanceDialogue.execute({
      currentNodeId: "2",
      dialogueNodes: nodes,
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value, null);
  });

  it("should return failure if current node not found", () => {
    const result = AdvanceDialogue.execute({
      currentNodeId: "99",
      dialogueNodes: nodes,
    });
    assert.strictEqual(result.success, false);
    assert.match(result.error, /not found/);
  });

  it("should return failure if next node not found", () => {
    const brokenNode = DialogueNode.create("3", "S3", "T3", "missing").value;
    const result = AdvanceDialogue.execute({
      currentNodeId: "3",
      dialogueNodes: [brokenNode],
    });
    assert.strictEqual(result.success, false);
    assert.match(result.error, /Next dialogue node.*not found/);
  });
});
