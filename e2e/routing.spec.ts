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
});
