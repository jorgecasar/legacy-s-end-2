import { expect, test } from "@playwright/test";

test.describe("App functionality", () => {
  test("should launch a browser and verify Playwright setup", async ({ page }) => {
    // This test verifies that Playwright can launch a browser and interact with it.
    // We use setContent instead of goto("/") because the main application
    // is currently under development.
    await page.setContent("<h1>Playwright is Working!</h1>");
    const h1 = await page.locator("h1");
    await expect(h1).toHaveText("Playwright is Working!");
  });

  test("should verify test environment", async () => {
    expect(1 + 1).toBe(2);
  });
});
