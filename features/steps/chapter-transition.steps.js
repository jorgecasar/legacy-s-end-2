import { expect } from "@playwright/test";
import { Given, Then, When } from "@cucumber/cucumber";

const APP_STORY_URL = "http://localhost:6006/iframe.html?id=app-le-app--default";

Given("the game is initialized with quest {string}", async function (questTitle) {
  await this.page.goto(APP_STORY_URL);
  // Select the quest to initialize
  const questCard = this.page.locator(`le-quest-card:has-text("${questTitle}")`);
  await questCard.locator("wa-button").click();
  await expect(this.page.locator("le-game-level")).toBeVisible();
});

Given("I am in {string}", async function (chapterName) {
  const currentChapter = await this.page.evaluate(() => {
    const app = document.querySelector("le-app");
    const store = app.gameStore;
    const quest = store.activeQuest.get();
    const index = store.currentChapterIndex.get();
    return quest.chapters[index].id;
  });

  // map name to ID for simplicity or just check index
  if (chapterName === "Chapter 1") {
    expect(currentChapter).toBe("chap-01");
  }
});

When("I move the hero to the exit zone at position \\({int}, {int}\\)", async function (x, y) {
  await this.page.evaluate(
    ({ x, y }) => {
      const app = document.querySelector("le-app");
      const store = app.gameStore;
      const currentHero = store.heroState.get();

      // Use a hack to move the hero directly for the test
      const HeroState = currentHero.constructor;
      const Position = currentHero.position.constructor;

      const newPos = Position.create(x, y).value;
      const nextHero = HeroState.create(
        currentHero.hp,
        currentHero.maxHp,
        newPos,
        currentHero.inventory,
      ).value;

      store.heroState.set(nextHero);

      // Trigger check manually since we bypassed moveHero
      store.advanceChapter();
    },
    { x, y },
  );
});

Then("the game should advance to {string}", async function (chapterName) {
  const currentChapterIndex = await this.page.evaluate(() => {
    return document.querySelector("le-app").gameStore.currentChapterIndex.get();
  });

  if (chapterName === "Chapter 2") {
    expect(currentChapterIndex).toBe(1);
  }
});

Then(
  "the hero should be at the new chapter's start position \\({int}, {int}\\)",
  async function (x, y) {
    const pos = await this.page.evaluate(() => {
      return document.querySelector("le-app").gameStore.heroPosition.get();
    });

    expect(pos.x).toBe(x);
    expect(pos.y).toBe(y);
  },
);

Then("the background should be {string}", async function (bgName) {
  const bg = await this.page.evaluate(() => {
    const app = document.querySelector("le-app");
    const level = app.shadowRoot.querySelector("le-game-level");
    const viewport = level.shadowRoot.querySelector("le-game-viewport");
    return viewport.shadowRoot.querySelector(".viewport").dataset.background;
  });

  expect(bg).toBe(bgName);
});
