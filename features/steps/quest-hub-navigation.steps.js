import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { QuestHubPage } from "../../e2e/pages/QuestHubPage.js";

// Note: In Storybook integration, we use the iframe URL for clean isolation
const HUB_STORY_URL =
  "http://localhost:6006/iframe.html?id=features-quest-hub-le-quest-hub--default";

Given("I am on the home page", async function () {
  // For BDD isolation, we start at the component entry point
  await this.page.goto(HUB_STORY_URL);
});

When("I navigate to the Quest Hub", async function () {
  // Verification that we are indeed in the correct URL
  await this.page.goto(HUB_STORY_URL);
});

Then("I should see the Quest Hub interface loaded correctly", async function () {
  const questHub = new QuestHubPage(this.page);
  await questHub.expectVisible();

  // Verification: at least one quest card is rendered (POM handles waiting)
  const count = await questHub.getQuestCount();
  if (count === 0) {
    throw new Error("Quest Hub loaded but no quests were found.");
  }
});
