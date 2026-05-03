import { describe, it } from "node:test";
import assert from "node:assert";
import { InitializeQuest } from "../src/use-cases/InitializeQuest.js";
import { ContentAdapter } from "../src/infrastructure/ContentAdapter.js";

describe("Use Case: InitializeQuest", () => {
  it("should coordinate loading and starting a quest", async () => {
    const contentAdapter = new ContentAdapter();
    const questData = { id: "q1", chapters: ["c1"] };
    const questMessages = { q1: { title: "Title" } };
    const chaptersData = {
      chapters: [
        {
          id: "c1",
          startPos: { x: 50, y: 50 },
          obstacles: [],
          entities: [{ id: "n1" }],
        },
      ],
    };
    const chaptersMessages = { c1: { name: "Chapter Name" } };
    const entityDecks = { n1: { talk: [] } };

    const result = await InitializeQuest.execute({
      contentAdapter,
      questData,
      questMessages,
      chaptersData,
      chaptersMessages,
      entityDecks,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.heroState.position.x, 50);
    assert.strictEqual(result.value.entities.length, 1);
    assert.strictEqual(result.value.obstacles.length, 0);
  });

  it("should fail if content loading fails", async () => {
    const result = await InitializeQuest.execute({
      contentAdapter: {
        getQuest: () => ({ success: false, error: "Load failed" }),
      },
    });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Load failed");
  });
});
