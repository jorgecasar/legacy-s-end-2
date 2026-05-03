import { expect } from "@playwright/test";

export class GameLevelPage {
  constructor(page) {
    this.page = page;
  }

  get viewport() {
    return this.page.locator("le-game-viewport");
  }

  get dialogueOverlay() {
    return this.page.locator("le-dialogue-overlay");
  }

  get speaker() {
    return this.dialogueOverlay.locator(".speaker");
  }

  get dialogueText() {
    return this.dialogueOverlay.locator(".text");
  }

  get nextButton() {
    return this.dialogueOverlay.locator("button");
  }

  get hero() {
    return this.viewport.locator("le-hero");
  }

  async expectHeroVisible() {
    await expect(this.hero).toBeVisible();
  }

  async getHeroGridPosition() {
    const style = await this.hero.getAttribute("style");
    // Extract left: X% and top: Y%
    const leftMatch = style.match(/left:\s*([\d.]+)%/);
    const topMatch = style.match(/top:\s*([\d.]+)%/);
    return {
      x: parseFloat(leftMatch[1]),
      y: parseFloat(topMatch[1]),
    };
  }

  async expectDialogueVisible() {
    await expect(this.dialogueOverlay).toBeVisible({ timeout: 10000 });
  }

  async expectDialogueHidden() {
    await expect(this.dialogueOverlay).toBeHidden();
  }

  async getSpeakerText() {
    return await this.speaker.textContent();
  }

  async getDialogueContent() {
    return await this.dialogueText.textContent();
  }

  async clickNext() {
    await this.nextButton.click();
  }
}
