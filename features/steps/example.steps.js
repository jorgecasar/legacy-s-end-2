import assert from "node:assert";
import { Given, Then, When } from "@cucumber/cucumber";

Given("the application is configured", function () {
  this.isConfigured = true;
});

When("I run the test suite", function () {
  this.testRun = true;
});

Then("the setup should pass validation", function () {
  assert.ok(this.isConfigured);
  assert.ok(this.testRun);
});
