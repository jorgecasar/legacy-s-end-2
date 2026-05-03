# Task List: Phase 3 - Persistence & Navigation

## Task 1: Serialization Core

- [ ] Implement `toJSON`/`fromJSON` in `HeroState` and `Position`.
- [ ] Create `LocalStorageAdapter` in `@legacys-end/core`.
- [ ] **Acceptance Criteria**: Data can be serialized/deserialized without data loss.
- [ ] **Verification**: Unit tests for serialization coverage.

## Task 2: Persistence Use Cases

- [ ] Implement `SaveProgress` and `LoadProgress` use cases.
- [ ] **Acceptance Criteria**: State can be saved/loaded via Use Case interface.
- [ ] **Verification**: Integration tests for these use cases.

## Task 3: Reactive Auto-save

- [ ] Integrate auto-save logic in `GameStore` with a throttle (e.g., 500ms).
- [ ] **Acceptance Criteria**: Game progress auto-saves after hero movement.
- [ ] **Verification**: Manual test: move hero -> refresh page -> hero is at same position.

## Task 4: Multi-Chapter Navigation

- [ ] Update `InitializeQuest` to handle multiple chapters.
- [ ] Implement trigger logic to load the next chapter when objectives are met.
- [ ] **Acceptance Criteria**: Successful transition from Chapter 1 to Chapter 2.
- [ ] **Verification**: BDD scenario "Chapter Transition".

## Task 5: i18n Pipeline

- [ ] Setup `@lit/localize` configuration in `package.json` and build scripts.
- [ ] Run `lit-localize extract` to generate source templates.
- [ ] **Acceptance Criteria**: Translation files generated and correctly applied.
- [ ] **Verification**: Run `npm run build` and ensure no localization errors.
