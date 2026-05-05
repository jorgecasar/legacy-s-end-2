import { expect } from "@playwright/test";
import { Given, Then, When } from "@cucumber/cucumber";

const BASE_URL = "http://localhost:3000";

Given("I am on the home page", async function () {
  await this.page.goto(BASE_URL);
});

When("I select the quest {string}", async function (questTitle) {
  const questCard = this.page.locator(`le-quest-card:has-text("${questTitle}")`);
  await questCard.locator("wa-button").click();
});

Then("the URL should match {string}", async function (expectedPath) {
  await expect(this.page).toHaveURL(new RegExp(expectedPath));
});

Then("the Game Level should be visible", async function () {
  await expect(this.page.locator("le-game-level")).toBeVisible();
});

Given("I am in the quest {string} at chapter {int}", async function (questId, chapterIndex) {
  await this.page.goto(`${BASE_URL}/quest/${questId}/chapter/${chapterIndex}`);
  await expect(this.page.locator("le-game-level")).toBeVisible();
});

When("I advance to chapter {int}", async function (chapterIndex) {
  await this.page.evaluate((index) => {
    document.querySelector("le-app").gameStore.currentChapterIndex.set(index);
  }, chapterIndex);
});

When("I navigate directly to {string}", async function (path) {
  await this.page.goto(`${BASE_URL}${path}`);
});

Then("the Game Store should be initialized at chapter {int}", async function (expectedIndex) {
  const actualIndex = await this.page.evaluate(() => {
    return document.querySelector("le-app").gameStore.currentChapterIndex.get();
  });
  expect(actualIndex).toBe(expectedIndex);
});
