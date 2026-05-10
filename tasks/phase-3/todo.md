# Task List: Phase 3 - Persistence & Navigation

## Task 1: Serialization Core

- [x] Implement `toJSON`/`fromJSON` in `HeroState` and `Position`.
- [x] Create `LocalStorageAdapter` in `@legacys-end/core`.
- [x] **Acceptance Criteria**: Data can be serialized/deserialized without data loss.
- [x] **Verification**: Unit tests for serialization coverage.

## Task 2: Persistence Use Cases

- [x] Implement `SaveProgress` and `LoadProgress` use cases.
- [x] **Acceptance Criteria**: State can be saved/loaded via Use Case interface.
- [x] **Verification**: Integration tests for these use cases.

## Task 3: Reactive Auto-save

- [x] Integrate auto-save logic in `GameStore` with a throttle (e.g., 500ms).
- [x] **Acceptance Criteria**: Game progress auto-saves after hero movement.
- [x] **Verification**: Manual test: move hero -> refresh page -> hero is at same position.

## Task 4: Multi-Chapter Navigation

- [x] Update `InitializeQuest` to handle multiple chapters.
- [x] Implement trigger logic to load the next chapter when objectives are met.
- [x] **Acceptance Criteria**: Successful transition from Chapter 1 to Chapter 2.
- [x] **Verification**: BDD scenario "Chapter Transition".

## Task 5: i18n Pipeline

- [x] Setup `@lit/localize` configuration in `package.json` and build scripts.
- [x] Run `lit-localize extract` to generate source templates.
- [x] **Acceptance Criteria**: Translation files generated and correctly applied.
- [x] **Verification**: Run `npm run build` and ensure no localization errors.

## Task 6: Real-world Routing

- [x] Install and configure `@lit-labs/router`.
- [x] Implement URL-based navigation for Quest Hub (`/`) and Quest Levels (`/quest/:id`).
- [x] Synchronize `GameStore` active quest with URL parameters on direct load.
- [x] **Acceptance Criteria**: Navigating to `/quest/alarions-awakening` directly loads the mission. Browser "Back" button works.
- [x] **Verification**: E2E test with Playwright for deep-linking.
