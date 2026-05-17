# Task List: Phase 2 - First Playable Level

## Task 1: Movement & Collision Domain
- [x] Implement `CollisionService` with Euclidean distance logic.
- [x] Implement `MovementService` to update coordinates (0-100%).
- [x] Update `MoveHero` use case to use these services.
- [x] **Acceptance Criteria**: Hero position updates correctly in unit tests; out-of-bounds movement is blocked.
- [x] **Verification**: Run `npm test` in `@legacys-end/core`.

## Task 2: Reactive Game Viewport
- [x] Update `GameStore` to expose `heroPosition` and `heroOutfit` as signals.
- [x] Implement `<le-game-viewport>` using `SignalWatcher` to render the hero.
- [x] **Acceptance Criteria**: Hero appears in the viewport at the position defined in the store.
- [x] **Verification**: Create a Storybook story for `<le-game-viewport>`.

## Task 3: Content Package & Level Data
- [x] Create `packages/content/quests/alarions-awakening/` data files.
- [x] Implement `ContentAdapter` to load and merge this data.
- [x] **Acceptance Criteria**: Data is correctly merged and returned as domain entities.
- [x] **Verification**: Integration tests for `ContentAdapter`.

## Task 4: Interactive Level Lifecycle
- [x] Implement `StartQuest` use case to initialize the viewport with level data.
- [x] Add event listeners for arrow keys to trigger `MoveHero`.
- [x] **Acceptance Criteria**: Pressing keys moves the hero sprite in the browser.
- [x] **Verification**: Manual test with `npm start`.

## Task 5: Proximity & Interaction
- [x] Implement proximity check logic in `GameStore` or a dedicated service.
- [x] Show an interaction indicator when close to an NPC.
- [x] Trigger `<le-dialogue-overlay>` when interacting.
- [x] **Acceptance Criteria**: Dialogue opens when hero is near NPC and interaction key is pressed.
- [x] **Verification**: BDD scenario "Proximity Interaction".

---
**Phase 2 Completion Status**: ✅ 100%

## Phase 2.5: Interactive Polish & Inventory
- [x] Implement visual inventory HUD (`<le-inventory>`).
- [x] Add support for collectible item entities in `GameStore` and `LeGameViewport`.
- [x] Implement item pickup logic in `interact()` method.
- [x] **Acceptance Criteria**: Items appear in the world, can be picked up with 'E', and appear in the inventory bar.
- [x] **Verification**: Unit test in `GameStore.spec.js` and manual verification.

