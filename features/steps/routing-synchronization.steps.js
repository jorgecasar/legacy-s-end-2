import { expect } from "@playwright/test";
import { Given, Then, When } from "@cucumber/cucumber";

const BASE_URL = "http://localhost:6006/iframe.html?id=app-le-app--default";

Given("I am on the application home page", async function () {
  await this.page.goto(BASE_URL);
});

When("I select the quest {string}", async function (questTitle) {
  // Wait for the app to be ready
  await expect(this.page.locator("le-app")).toBeVisible({ timeout: 10000 });
  const questCard = this.page.locator(`le-quest-card:has-text("${questTitle}")`);
  await questCard.locator("wa-button").click();
});

Then("the URL should match {string}", async function (expectedPath) {
  // In Storybook iframe, we check the iframe URL itself as the router updates it
  await expect(this.page).toHaveURL(new RegExp(expectedPath));
});

Then("the Game Level should be visible", async function () {
  await expect(this.page.locator("le-game-level")).toBeVisible();
});

Given("I am in the quest {string} at chapter {int}", async function (questId, chapterIndex) {
  // Navigate directly via evaluate since deep-linking works inside the component
  await this.page.goto(BASE_URL);
  const app = this.page.locator("le-app");
  await expect(app).toBeVisible({ timeout: 10000 });

  await this.page.evaluate(
    ({ qId, cIndex }) => {
      window.history.pushState(null, "", `/quest/${qId}/chapter/${cIndex}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    },
    { qId: questId, cIndex: chapterIndex },
  );

  await expect(this.page.locator("le-game-level")).toBeVisible({ timeout: 10000 });
});

When("I advance to chapter {int}", async function (chapterIndex) {
  const app = this.page.locator("le-app");
  await expect(app).toBeVisible();
  await this.page.evaluate((index) => {
    // @ts-ignore
    document.querySelector("le-app").gameStore.currentChapterIndex.set(index);
  }, chapterIndex);
});

When("I navigate directly to {string}", async function (path) {
  await this.page.goto(BASE_URL);
  const app = this.page.locator("le-app");
  await expect(app).toBeVisible({ timeout: 10000 });

  await this.page.evaluate((p) => {
    window.history.pushState(null, "", p);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
});

Then("the Game Store should be initialized at chapter {int}", async function (expectedIndex) {
  const actualIndex = await this.page.evaluate(() => {
    return document.querySelector("le-app").gameStore.currentChapterIndex.get();
  });
  expect(actualIndex).toBe(expectedIndex);
});
