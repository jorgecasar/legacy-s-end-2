import { test, expect } from "@playwright/test";

test.describe("AI Settings Persistence", () => {
  test("should persist AI settings after page refresh", async ({ page }) => {
    await page.goto("/");

    // 1. Locate the NPC Voice switch
    // Accessing through shadow DOM chain: le-app -> le-quest-hub -> le-settings -> wa-switch#npc-voice
    const ttsSwitch = page
      .locator("le-app")
      .locator("le-quest-hub")
      .locator("le-settings")
      .locator("#npc-voice");

    // Ensure it's visible and starts unchecked (clean slate for test)
    await expect(ttsSwitch).toBeVisible();

    // Clear localStorage to ensure a clean start
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // 2. Toggle it ON
    await ttsSwitch.click();

    // 3. Verify it is checked in the UI
    await expect(ttsSwitch).toHaveAttribute("checked", "");

    // 4. Verify it is stored in LocalStorage
    const storageValue = await page.evaluate(() => localStorage.getItem("legacys_end_save"));
    expect(storageValue).toContain('"npcVoiceEnabled":true');

    // 5. Refresh the page
    await page.reload();

    // 6. Verify it remains checked after refresh
    const ttsSwitchAfter = page
      .locator("le-app")
      .locator("le-quest-hub")
      .locator("le-settings")
      .locator("#npc-voice");
    await expect(ttsSwitchAfter).toHaveAttribute("checked", "");
  });
});
