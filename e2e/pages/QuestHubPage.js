import { expect } from "@playwright/test";

/** @typedef {import("@playwright/test").Page} Page */
/** @typedef {import("@playwright/test").Locator} Locator */

export class QuestHubPage {
  /**
   * @param {Page} page
   */
  constructor(page) {
    this.page = page;
    this.hubContainer = page.locator("le-quest-hub");
    this.questList = this.hubContainer.locator(".quest-list");
    this.questCards = this.hubContainer.locator(".quest-card");
  }

  async goto() {
    // This assumes the Quest Hub is accessible via a specific route or component
    // For standalone testing, we might need a specific story or test page
    await this.page.goto("/");
  }

  async expectVisible() {
    await expect(this.hubContainer).toBeVisible();
  }

  async getQuestCount() {
    return await this.questCards.count();
  }

  /**
   * @param {string} title
   */
  async expectQuestVisible(title) {
    const quest = this.questCards.filter({ hasText: title });
    await expect(quest).toBeVisible();
  }
}
