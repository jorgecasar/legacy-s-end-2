import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

const CARD_STORY_LOCKED = "http://localhost:6006/iframe.html?id=components-questcard--locked";
const CARD_STORY_AVAILABLE = "http://localhost:6006/iframe.html?id=components-questcard--available";

Given("a quest card is displayed with status {string}", async function (status) {
  const url = status === "Locked" ? CARD_STORY_LOCKED : CARD_STORY_AVAILABLE;
  await this.page.goto(url);
  this.capturedEvents = [];

  // Wait for the component to be defined and rendered
  await this.page.waitForSelector("le-quest-card");

  // Setup event listener in the page to capture domain events
  await this.page.evaluate(() => {
    window.capturedEvents = [];
    document.addEventListener("quest-selected", (e) => {
      window.capturedEvents.push({ type: e.type, detail: e.detail });
    });
    document.addEventListener("quest-locked-attempt", (e) => {
      window.capturedEvents.push({ type: e.type, detail: e.detail });
    });
  });
});

When("I click on the quest card", async function () {
  const card = this.page.locator("le-quest-card");
  // Use force click because the component might have 0px width in isolation
  await card.click({ force: true });

  // Sync captured events from browser to test context
  this.capturedEvents = await this.page.evaluate(() => window.capturedEvents);
});

Then("the selection should be blocked", function () {
  const selectionEvent = this.capturedEvents.find((e) => e.type === "quest-selected");
  expect(selectionEvent).toBeUndefined();
});

Then("a warning should be displayed", function () {
  const lockedEvent = this.capturedEvents.find((e) => e.type === "quest-locked-attempt");
  expect(lockedEvent).toBeDefined();
});

Then("the quest should be selected", function () {
  const selectionEvent = this.capturedEvents.find((e) => e.type === "quest-selected");
  expect(selectionEvent).toBeDefined();
});

Then("the quest details should be emitted in the event", function () {
  const selectionEvent = this.capturedEvents.find((e) => e.type === "quest-selected");
  expect(selectionEvent.detail.quest).toBeDefined();
  expect(selectionEvent.detail.quest.title).toBeDefined();
});
