# Task List: Phase 2 - First Playable Level

## Task 1: Movement & Collision Domain
- [ ] Implement `CollisionService` with Euclidean distance logic.
- [ ] Implement `MovementService` to update coordinates (0-100%).
- [ ] Update `MoveHero` use case to use these services.
- [ ] **Acceptance Criteria**: Hero position updates correctly in unit tests; out-of-bounds movement is blocked.
- [ ] **Verification**: Run `npm test` in `@legacys-end/core`.

## Task 2: Reactive Game Viewport
- [ ] Update `GameStore` to expose `heroPosition` and `heroOutfit` as signals.
- [ ] Implement `<le-game-viewport>` using `SignalWatcher` to render the hero.
- [ ] **Acceptance Criteria**: Hero appears in the viewport at the position defined in the store.
- [ ] **Verification**: Create a Storybook story for `<le-game-viewport>`.

## Task 3: Content Package & Level Data
- [ ] Create `packages/content/quests/alarions-awakening/` data files.
- [ ] Implement `ContentAdapter` to load and merge this data.
- [ ] **Acceptance Criteria**: Data is correctly merged and returned as domain entities.
- [ ] **Verification**: Integration tests for `ContentAdapter`.

## Task 4: Interactive Level Lifecycle
- [ ] Implement `StartQuest` use case to initialize the viewport with level data.
- [ ] Add event listeners for arrow keys to trigger `MoveHero`.
- [ ] **Acceptance Criteria**: Pressing keys moves the hero sprite in the browser.
- [ ] **Verification**: Manual test with `npm start`.

## Task 5: Proximity & Interaction
- [ ] Implement proximity check logic in `GameStore` or a dedicated service.
- [ ] Show an interaction indicator when close to an NPC.
- [ ] Trigger `<le-dialogue-overlay>` when interacting.
- [ ] **Acceptance Criteria**: Dialogue opens when hero is near NPC and interaction key is pressed.
- [ ] **Verification**: BDD scenario "Proximity Interaction".
