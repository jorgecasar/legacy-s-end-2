import { test, expect } from "@playwright/test";

test.describe("LeQuestCard Component", () => {
  test("should render quest details correctly", async ({ page }) => {
    // Navigate to the Storybook story for an available quest
    await page.goto("/iframe.html?id=components-questcard--available");

    const card = page.locator("le-quest-card");
    await expect(card).toBeVisible();

    // Check title and description inside Shadow DOM
    await expect(card.locator(".title")).toContainText("Alarion's Awakening");
    await expect(card.locator(".description")).toContainText("basics of variables");

    // Check badge
    await expect(card.locator("wa-badge")).toContainText("Available");
  });

  test("should emit quest-selected event when clicked", async ({ page }) => {
    await page.goto("/iframe.html?id=components-questcard--available");

    // Set up a listener for the custom event in the browser context
    await page.evaluate(() => {
      window.addEventListener("quest-selected", (e: any) => {
        (window as any).lastSelectedQuestId = e.detail.quest.id;
      });
    });

    // Click the button
    await page.locator("le-quest-card wa-button").click();

    // Verify the event was caught with the correct data
    const questId = await page.evaluate(() => (window as any).lastSelectedQuestId);
    expect(questId).toBe("q1");
  });

  test("should show locked state correctly", async ({ page }) => {
    await page.goto("/iframe.html?id=components-questcard--locked");

    const card = page.locator("le-quest-card");
    await expect(card.locator("wa-badge")).toContainText("Locked");
    await expect(card.locator("wa-icon[name='lock']")).toBeVisible();

    // Button should not be present
    await expect(card.locator("wa-button")).not.toBeVisible();
  });
});
