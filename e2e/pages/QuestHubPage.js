import { expect } from "@playwright/test";

/** @typedef {import("@playwright/test").Page} Page */
/** @typedef {import("@playwright/test").Locator} Locator */

export class QuestHubPage {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
    // Main container
    this.hubContainer = page.locator("le-quest-hub");
    // List of cards - using the custom element name as a reliable tag
    this.questCards = this.hubContainer.locator("le-quest-card");
  }

  async goto() {
    await this.page.goto("/");
  }

  async expectVisible() {
    await expect(this.hubContainer).toBeVisible();
    // Using accessibility selector to verify the main heading
    await expect(this.page.getByRole("heading", { name: /Quest Hub/i })).toBeVisible();
  }

  async getQuestCount() {
    // Wait for the first card to be visible to ensure async loading is done
    await this.questCards.first().waitFor({ state: "visible", timeout: 5000 });
    return await this.questCards.count();
  }

  /**
   * Finds a quest card by its title using accessible heading role
   * @param {string} title
   */
  getQuestCardByTitle(title) {
    return this.questCards.filter({
      has: this.page.getByRole("heading", { name: title }),
    });
  }

  /**
   * @param {string} title
   */
  async expectQuestVisible(title) {
    const card = this.getQuestCardByTitle(title);
    await expect(card).toBeVisible();
  }
}
