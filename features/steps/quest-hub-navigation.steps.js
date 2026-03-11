import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

Given("I am on the home page", async function () {
  // Navigation to Storybook home or a safe entry point
  await this.page.goto(
    "http://localhost:6006/iframe.html?id=features-quest-hub-le-quest-hub--default",
  );
});

When("I navigate to the Quest Hub", async function () {
  // In Storybook context, we ensure the component story is loaded
  await this.page.goto(
    "http://localhost:6006/iframe.html?id=features-quest-hub-le-quest-hub--default",
  );
});

Then("I should see the Quest Hub interface loaded correctly", async function () {
  // Verification that the quest hub custom element is rendered and visible
  const questHub = this.page.locator("le-quest-hub");
  await expect(questHub).toBeVisible();
});
