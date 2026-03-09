import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

Given("I am on the home page", async function () {
  // Navigation to the base URL as defined in playwright.config.ts
  // For now we assume http://localhost:3000
  await this.page.goto("http://localhost:3000");
});

When("I navigate to the Quest Hub", async function () {
  // Simulation of navigation to the quest hub route
  // In a future implementation, this could involve clicking a navigation link
  await this.page.goto("http://localhost:3000/quest-hub");
});

Then("I should see the Quest Hub interface loaded correctly", async function () {
  // Verification that the quest hub custom element is rendered and visible
  const questHub = this.page.locator("le-quest-hub");
  await expect(questHub).toBeVisible();
});
