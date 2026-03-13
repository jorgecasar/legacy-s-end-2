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
    // Extract grid-row: Y+1 and grid-column: X+1
    const rowMatch = style.match(/grid-row:\s*(\d+)/);
    const colMatch = style.match(/grid-column:\s*(\d+)/);
    return {
      x: parseInt(colMatch[1]) - 1,
      y: parseInt(rowMatch[1]) - 1,
    };
  }

  async expectDialogueVisible() {
    await expect(this.dialogueOverlay).toBeVisible();
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
