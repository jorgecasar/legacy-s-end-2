import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { GameLevelPage } from "../../e2e/pages/GameLevelPage.js";

const GAME_STORY_URL =
  "http://localhost:6006/iframe.html?id=features-game-level-legamelevel--default";

Given("the game is initialized with the {string} level", async function (_levelName) {
  // We assume the story handles initialization as per current LeGameLevel.js
  await this.page.goto(GAME_STORY_URL);
});

Given("the {string} dialogue is active", async function (_dialogueName) {
  const gamePage = new GameLevelPage(this.page);
  await gamePage.expectDialogueVisible();
});

Then("the dialogue overlay should show {string} as the speaker", async function (expectedSpeaker) {
  const gamePage = new GameLevelPage(this.page);
  const actualSpeaker = await gamePage.getSpeakerText();
  expect(actualSpeaker).toBe(expectedSpeaker);
});

Then("the text should be {string}", async function (expectedText) {
  const gamePage = new GameLevelPage(this.page);
  const actualText = await gamePage.getDialogueContent();
  expect(actualText).toBe(expectedText);
});

When("I click the {string} button in the dialogue overlay", async function (_buttonLabel) {
  const gamePage = new GameLevelPage(this.page);
  await gamePage.clickNext();
});

Then("the text should change to {string}", async function (expectedText) {
  const gamePage = new GameLevelPage(this.page);
  const actualText = await gamePage.getDialogueContent();
  expect(actualText).toBe(expectedText);
});

Then("the dialogue overlay should disappear", async function () {
  const gamePage = new GameLevelPage(this.page);
  await gamePage.expectDialogueHidden();
});

Then("the hero should be visible in the viewport", async function () {
  const gamePage = new GameLevelPage(this.page);
  await gamePage.expectHeroVisible();
});

Then("the hero should be at position \\({int}, {int}\\)", async function (expectedX, expectedY) {
  const gamePage = new GameLevelPage(this.page);
  const position = await gamePage.getHeroGridPosition();
  expect(position.x).toBe(expectedX);
  expect(position.y).toBe(expectedY);
});
