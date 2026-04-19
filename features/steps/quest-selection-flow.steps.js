import { Given, Then, When } from "@cucumber/cucumber";
import { QuestHubPage } from "../../e2e/pages/QuestHubPage.js";

const HUB_STORY_URL =
  "http://localhost:6006/iframe.html?id=features-quest-hub-le-quest-hub--default";

Given("I am in the Quest Hub", async function () {
  await this.page.goto(HUB_STORY_URL);
  this.questHub = new QuestHubPage(this.page);
  await this.questHub.expectVisible();
});

Given("there is no active mission", async function () {
  await this.questHub.expectNoActiveMission();
});

When("I select the mission {string}", async function (title) {
  await this.questHub.selectQuest(title);
});

Then(
  "the {string} mission should be displayed in the Active Mission section",
  async function (title) {
    await this.questHub.expectActiveMission(title);
  },
);
