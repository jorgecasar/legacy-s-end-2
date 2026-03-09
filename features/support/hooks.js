import { After, Before, setDefaultTimeout } from "@cucumber/cucumber";

setDefaultTimeout(60 * 1000);

Before(async function () {
  await this.init();
});

After(async function () {
  await this.close();
});
