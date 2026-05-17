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

  it("should initialize a specific chapter index", async () => {
    const contentAdapter = new ContentAdapter();
    const questData = { id: "q1", chapters: ["c1", "c2"] };
    const questMessages = { q1: { title: "Title" } };
    const chaptersData = {
      chapters: [
        { id: "c1", startPos: { x: 0, y: 0 }, obstacles: [], entities: [] },
        {
          id: "c2",
          startPos: { x: 80, y: 80 },
          obstacles: [],
          entities: [{ id: "n2" }],
        },
      ],
    };
    const chaptersMessages = { c1: { name: "C1" }, c2: { name: "C2" } };
    const entityDecks = { n2: { talk: [] } };

    const result = await InitializeQuest.execute({
      contentAdapter,
      questData,
      questMessages,
      chaptersData,
      chaptersMessages,
      entityDecks,
      chapterIndex: 1,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.heroState.position.x, 80);
    assert.strictEqual(result.value.heroState.chapterId, "c2");
    assert.strictEqual(result.value.entities[0].id, "n2");
  });

  it("should fail if specific chapter index does not exist", async () => {
    const contentAdapter = new ContentAdapter();
    const result = await InitializeQuest.execute({
      contentAdapter,
      questData: { id: "q1", chapters: ["c1"] },
      questMessages: { q1: { title: "T" } },
      chaptersData: {
        chapters: [{ id: "c1", startPos: { x: 0, y: 0 }, entities: [] }],
      },
      chaptersMessages: { c1: { name: "N" } },
      entityDecks: {},
      chapterIndex: 5,
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Chapter with index 5 not found.");
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

  it("should fail if quest has no chapters", async () => {
    const result = await InitializeQuest.execute({
      contentAdapter: {
        getQuest: () => ({ success: true, value: { chapters: [] } }),
      },
    });
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, "Quest has no chapters.");
  });

  it("should fail if start quest fails", async () => {
    const result = await InitializeQuest.execute({
      contentAdapter: {
        getQuest: () => ({
          success: true,
          value: { chapters: [{ startPos: { x: "invalid", y: 0 } }] },
        }),
      },
    });
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("number"));
  });

  it("should catch unexpected errors", async () => {
    const result = await InitializeQuest.execute(null);
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Failed to initialize quest"));
  });
});
