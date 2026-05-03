import { describe, it } from "node:test";
import assert from "node:assert";
import { ContentAdapter } from "../src/infrastructure/ContentAdapter.js";

describe("Infrastructure: ContentAdapter", () => {
  it("should correctly merge JSON data and messages", async () => {
    const adapter = new ContentAdapter();
    const questData = { id: "q1", chapters: ["c1"] };
    const questMessages = { q1: { title: "Title" } };
    const chaptersData = { chapters: [{ id: "c1", entities: [{ id: "n1" }] }] };
    const chaptersMessages = { c1: { name: "Chapter Name" } };
    const entityDecks = { n1: { talk: [] } };

    const result = await adapter.getQuest({
      questData,
      questMessages,
      chaptersData,
      chaptersMessages,
      entityDecks,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.title, "Title");
    assert.strictEqual(result.value.chapters[0].name, "Chapter Name");
    assert.deepStrictEqual(result.value.chapters[0].entities[0].decks, { talk: [] });
  });

  it("should return failure on unexpected errors", async () => {
    const adapter = new ContentAdapter();
    const result = await adapter.getQuest(null);
    assert.strictEqual(result.success, false);
    assert.match(result.error, /Failed to merge content/);
  });
});
