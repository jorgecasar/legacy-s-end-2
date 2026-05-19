import { test, expect } from "@playwright/test";
import { QuestHubPage } from "./pages/QuestHubPage.js";
import { GameLevelPage } from "./pages/GameLevelPage.js";

test.describe("Narrative Gameplay Diagnostic Checks", () => {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const uncaughtExceptions: Error[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    consoleWarnings.length = 0;
    uncaughtExceptions.length = 0;

    page.on("console", (msg) => {
      const text = msg.text();
      console.log(`[Browser ${msg.type()}] ${text}`);
      if (msg.type() === "error") {
        if (
          !text.includes("WebSocket connection") &&
          !text.includes("net::ERR_CONNECTION_REFUSED")
        ) {
          consoleErrors.push(text);
        }
      } else if (msg.type() === "warning") {
        consoleWarnings.push(text);
      }
    });

    page.on("pageerror", (err) => {
      console.error("[Browser Uncaught Exception]", err);
      uncaughtExceptions.push(err);
    });
  });

  test("should load the application and run initial movement diagnostic", async ({ page }) => {
    const questHub = new QuestHubPage(page);
    const gameLevel = new GameLevelPage(page);

    // 1. Visit main page and ensure Quest Hub is loaded
    await questHub.goto();
    await questHub.expectVisible();

    // Verify no initial errors or exceptions
    expect(uncaughtExceptions).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);

    // 2. Select a quest to start gameplay
    console.log("[Diagnostic] Selecting first quest card...");
    const questCard = page.locator("le-quest-card").first();
    const button = questCard.locator("wa-button");
    if (await button.isVisible()) {
      await button.click();
    } else {
      await questCard.click({ force: true });
    }

    // Check we loaded game level and hero is visible
    await expect(page).toHaveURL(/\/quest\/alarions-awakening\/chapter\/0/);
    await gameLevel.expectHeroVisible();

    // 3. Perform simulated player movement and trigger interaction
    console.log("[Diagnostic] Moving player to trigger NPC dialogue...");
    const initialPos = await gameLevel.getHeroGridPosition();
    console.log(`[Diagnostic] Initial Hero position: X=${initialPos.x}%, Y=${initialPos.y}%`);

    // Move hero to the right
    await page.evaluate(() => {
      const app = document.querySelector("le-app") as any;
      app.gameStore.moveHero("RIGHT", 5);
    });

    const newPos = await gameLevel.getHeroGridPosition();
    console.log(`[Diagnostic] Post-move Hero position: X=${newPos.x}%, Y=${newPos.y}%`);
    expect(newPos.x).toBeGreaterThan(initialPos.x);

    // Try to trigger interaction with the nearby NPC/item
    console.log("[Diagnostic] Triggering interaction...");
    await page.evaluate(async () => {
      const app = document.querySelector("le-app") as any;
      await app.gameStore.interact();
    });

    // Verify if dialogue overlays open and dialogue operates properly
    const isOverlayPresent = await gameLevel.dialogueOverlay.isVisible();
    if (isOverlayPresent) {
      console.log("[Diagnostic] Dialogue overlay is active.");
      const speaker = await gameLevel.getSpeakerText();
      const text = await gameLevel.getDialogueContent();
      console.log(`[Diagnostic] Dialogue Speaker: "${speaker}"`);
      console.log(`[Diagnostic] Dialogue Text: "${text}"`);

      // Advance/dismiss dialogue
      await page.evaluate(() => {
        const app = document.querySelector("le-app") as any;
        app.gameStore.advanceDialogue();
      });
      console.log("[Diagnostic] Advanced dialogue successfully.");
    } else {
      console.log("[Diagnostic] No nearby entity found to trigger dialogue overlay.");
    }

    // 4. Check for final diagnostic anomalies
    console.log("[Diagnostic] Diagnostics finished.");
    console.log(`[Diagnostic] Uncaught exceptions: ${uncaughtExceptions.length}`);
    console.log(`[Diagnostic] Console errors: ${consoleErrors.length}`);
    console.log(`[Diagnostic] Console warnings: ${consoleWarnings.length}`);

    expect(uncaughtExceptions).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test("should complete Chapter 1 by talking to NPC, picking up relic reward, and exiting to Chapter 2", async ({
    page,
  }) => {
    const questHub = new QuestHubPage(page);
    const gameLevel = new GameLevelPage(page);

    // 1. Start Quest
    await questHub.goto();
    await questHub.expectVisible();
    console.log("[Diagnostic 2] Selecting quest card...");
    const questCard = page.locator("le-quest-card").first();
    const button = questCard.locator("wa-button");
    if (await button.isVisible()) {
      await button.click();
    } else {
      await questCard.click({ force: true });
    }
    await expect(page).toHaveURL(/\/quest\/alarions-awakening\/chapter\/0/);
    await gameLevel.expectHeroVisible();

    // 2. Move player near Elder Alarion (positioned at x: 30, y: 50)
    console.log("[Diagnostic 2] Moving player near Elder Alarion...");
    await page.evaluate(() => {
      const app = document.querySelector("le-app") as any;
      const hero = app.gameStore.heroState.get();
      const HeroStateClass = hero.constructor;
      const PositionClass = hero.position.constructor;
      const newPos = PositionClass.create(27, 50).value;
      const newHero = HeroStateClass.create(
        hero.hp,
        hero.maxHp,
        newPos,
        hero.inventory,
        hero.chapterId,
        hero.objectivesMet,
      ).value;
      app.gameStore.heroState.set(newHero);
    });

    // 3. Trigger interaction with NPC
    console.log("[Diagnostic 2] Interacting with Elder Alarion...");
    await page.evaluate(async () => {
      const app = document.querySelector("le-app") as any;
      await app.gameStore.interact();
    });

    // Dialogue overlay should be visible
    await gameLevel.expectDialogueVisible();
    const speaker = await gameLevel.getSpeakerText();
    const text = await gameLevel.getDialogueContent();
    console.log(`[Diagnostic 2] Dialogue Speaker: "${speaker}"`);
    console.log(`[Diagnostic 2] Dialogue Text: "${text}"`);
    expect(speaker).toContain("Alarion");

    // 4. Progress through all dialogue nodes to close the overlay and trigger consequences
    console.log("[Diagnostic 2] Progressing through dialogue nodes...");
    while (await gameLevel.dialogueOverlay.isVisible()) {
      await gameLevel.clickNext();
    }
    await gameLevel.expectDialogueHidden();

    // Verify 'talk-alarion' objective is met
    const objectives = await page.evaluate(() => {
      const app = document.querySelector("le-app") as any;
      return Array.from(app.gameStore.objectivesMet.get());
    });
    console.log("[Diagnostic 2] Met objectives after talking:", objectives);
    expect(objectives).toContain("talk-alarion");

    // 5. Verify the reward item (Strange Relic) is spawned in the world
    const entities = await page.evaluate(() => {
      const app = document.querySelector("le-app") as any;
      return app.gameStore.entities.get();
    });
    console.log(
      "[Diagnostic 2] Entities in world:",
      entities.map((e) => e.id),
    );
    expect(entities.some((e) => e.id === "item-relic")).toBe(true);

    // 6. Move player near the relic (positioned at x: 40, y: 30)
    console.log("[Diagnostic 2] Moving player near Strange Relic...");
    await page.evaluate(() => {
      const app = document.querySelector("le-app") as any;
      const hero = app.gameStore.heroState.get();
      const HeroStateClass = hero.constructor;
      const PositionClass = hero.position.constructor;
      const newPos = PositionClass.create(38, 30).value;
      const newHero = HeroStateClass.create(
        hero.hp,
        hero.maxHp,
        newPos,
        hero.inventory,
        hero.chapterId,
        hero.objectivesMet,
      ).value;
      app.gameStore.heroState.set(newHero);
    });

    // 7. Pick up the relic
    console.log("[Diagnostic 2] Picking up Strange Relic...");
    await page.evaluate(async () => {
      const app = document.querySelector("le-app") as any;
      await app.gameStore.interact();
    });

    // Verify relic is in hero inventory and met objectives
    const finalHeroState = await page.evaluate(() => {
      const app = document.querySelector("le-app") as any;
      return {
        inventory: app.gameStore.heroState.get().inventory,
        objectives: Array.from(app.gameStore.objectivesMet.get()),
      };
    });
    console.log("[Diagnostic 2] Final inventory:", finalHeroState.inventory);
    console.log("[Diagnostic 2] Final objectives:", finalHeroState.objectives);

    // DOM Inspection of le-inventory
    const inventoryHtml = await page.evaluate(() => {
      const app = document.querySelector("le-app");
      const level = app?.shadowRoot?.querySelector("le-game-level");
      const viewport = level?.shadowRoot?.querySelector("le-game-viewport");
      const inventory = viewport?.shadowRoot?.querySelector("le-inventory");
      if (!inventory) return "le-inventory not found!";

      const slots = Array.from(inventory.shadowRoot.querySelectorAll(".slot"));
      const slotsInfo = slots.map((slot, index) => {
        const hasItem = slot.classList.contains("occupied");
        const styles = window.getComputedStyle(slot);
        const childHtml = slot.innerHTML;
        return `Slot ${index}: occupied=${hasItem}, display=${styles.display}, visibility=${styles.visibility}, opacity=${styles.opacity}, width=${styles.width}, height=${styles.height}, bg=${styles.backgroundColor}, color=${styles.color}\nContent: ${childHtml}`;
      });

      return `Outer: ${inventory.outerHTML}\nShadow DOM content:\n${slotsInfo.join("\n---\n")}`;
    });
    console.log("[Diagnostic DOM Inspector]\n", inventoryHtml);

    expect(finalHeroState.inventory).toContain("item-relic");
    expect(finalHeroState.objectives).toContain("item-relic");

    // 8. Move player to the Exit Zone (positioned at x: 90, y: 90) to trigger level transition
    console.log("[Diagnostic 2] Moving player to exit zone...");
    await page.evaluate(() => {
      const app = document.querySelector("le-app") as any;
      const hero = app.gameStore.heroState.get();
      const HeroStateClass = hero.constructor;
      const PositionClass = hero.position.constructor;
      const newPos = PositionClass.create(90, 90).value;
      const newHero = HeroStateClass.create(
        hero.hp,
        hero.maxHp,
        newPos,
        hero.inventory,
        hero.chapterId,
        hero.objectivesMet,
      ).value;
      app.gameStore.heroState.set(newHero);
      // Manually trigger advanceChapter
      app.gameStore.advanceChapter();
    });

    // 9. Verify transition to Chapter 2
    console.log("[Diagnostic 2] Verifying transition to Chapter 2...");
    await expect(page).toHaveURL(/\/quest\/alarions-awakening\/chapter\/1/);
    const chapterIndex = await page.evaluate(() => {
      const app = document.querySelector("le-app") as any;
      return app.gameStore.currentChapterIndex.get();
    });
    expect(chapterIndex).toBe(1);
    console.log("[Diagnostic 2] Successfully advanced to Chapter 2!");
  });
});
