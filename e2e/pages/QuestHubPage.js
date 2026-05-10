import { expect } from "@playwright/test";

/** @typedef {import("@playwright/test").Page} Page */
/** @typedef {import("@playwright/test").Locator} Locator */

export class QuestHubPage {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
    // Use a more robust way to find the hub that works in both Storybook and App
    this.hubContainer = page.locator("le-quest-hub");
    // Active mission section
    this.activeMissionSection = page.locator(".active-mission");
  }

  async goto() {
    await this.page.goto("/");
  }

  async expectVisible() {
    // Wait for the custom element to be defined and visible
    await expect(this.hubContainer).toBeVisible({ timeout: 15000 });
    // Verify the main heading
    await expect(this.page.getByRole("heading", { name: /Quest Hub/i })).toBeVisible();
  }

  async getQuestCount() {
    const cards = this.page.locator("le-quest-card");
    await cards.first().waitFor({ state: "visible", timeout: 10000 });
    return await cards.count();
  }

  /**
   * Finds a quest card by its title
   * @param {string} title
   */
  getQuestCardByTitle(title) {
    return this.page.locator("le-quest-card").filter({
      hasText: title,
    });
  }

  /**
   * @param {string} title
   */
  async expectQuestVisible(title) {
    const card = this.getQuestCardByTitle(title);
    await expect(card).toBeVisible();
  }

  /**
   * Selects a quest by its title
   * @param {string} title
   */
  async selectQuest(title) {
    const card = this.getQuestCardByTitle(title);
    // Click the card directly or the button
    const button = card.locator("wa-button");
    if (await button.isVisible()) {
      await button.click();
    } else {
      await card.click({ force: true });
    }
  }

  /**
   * Verifies if the active mission section contains the expected title
   * @param {string} title
   */
  async expectActiveMission(title) {
    await expect(this.activeMissionSection).toContainText(title);
  }

  /**
   * Verifies if there is no active mission
   */
  async expectNoActiveMission() {
    await expect(this.activeMissionSection).toContainText(/don't have an active mission/i);
  }
}
