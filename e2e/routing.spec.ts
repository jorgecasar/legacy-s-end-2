import { test, expect } from "@playwright/test";

test.describe("Routing and Deep-linking", () => {
  test("should navigate to quest level when a quest is selected", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // Select the first quest
    const questCard = page.locator("le-quest-card").first();
    await questCard.locator("wa-button").click();

    // Check URL
    await expect(page).toHaveURL(/\/quest\/alarions-awakening\/chapter\/0/);
    await expect(page.locator("le-game-level")).toBeVisible();
  });

  test("should synchronize URL with chapter index", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    // Select the first quest
    const questCard = page.locator("le-quest-card").first();
    await questCard.locator("wa-button").click();

    // Initially should be chapter 0
    await expect(page).toHaveURL(/\/quest\/alarions-awakening\/chapter\/0/);

    // Mock advancing chapter
    await page.evaluate(() => {
      const app = document.querySelector("le-app") as any;
      app.gameStore.currentChapterIndex.set(1);
    });

    // Check URL updated
    await expect(page).toHaveURL(/\/quest\/alarions-awakening\/chapter\/1/);
  });

  test("should load specific quest and chapter via deep-link", async ({ page }) => {
    // Navigate directly to chapter 1
    await page.goto("http://localhost:3000/quest/alarions-awakening/chapter/1");

    await expect(page.locator("le-game-level")).toBeVisible();

    // Verify store state synchronized from URL
    const chapterIndex = await page.evaluate(() => {
      const app = document.querySelector("le-app") as any;
      return app.gameStore.currentChapterIndex.get();
    });

    expect(chapterIndex).toBe(1);
  });

  test("should automatically redirect and restore progress in saved chapter when entering the quest", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/");

    // Setup saved progress in local storage for chapter 1 (index 1)
    await page.evaluate(() => {
      const savedData = {
        hp: 95,
        maxHp: 100,
        position: { x: 40, y: 60 },
        inventory: ["item-relic"],
        chapterId: "chap-02",
        objectivesMet: ["talk-alarion", "item-relic"],
      };
      localStorage.setItem("legacys_end_save", JSON.stringify(savedData));
    });

    // Click the first quest to enter (which normally targets chapter 0)
    const questCard = page.locator("le-quest-card").first();
    await questCard.locator("wa-button").click();

    // Verify that the level component automatically redirected us to chapter 1!
    await expect(page).toHaveURL(/\/quest\/alarions-awakening\/chapter\/1/);

    // Verify the game state is correctly restored to the saved state
    const gameState = await page.evaluate(() => {
      const app = document.querySelector("le-app") as any;
      return {
        chapterIndex: app.gameStore.currentChapterIndex.get(),
        heroHp: app.gameStore.heroState.get().hp,
        heroInventory: app.gameStore.heroState.get().inventory,
        heroPos: app.gameStore.heroState.get().position.toJSON(),
      };
    });

    expect(gameState.chapterIndex).toBe(1);
    expect(gameState.heroHp).toBe(95);
    expect(gameState.heroInventory).toContain("item-relic");
    expect(gameState.heroPos).toEqual({ x: 40, y: 60 });
  });
});
