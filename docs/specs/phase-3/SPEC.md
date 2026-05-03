# SPEC.md - Phase 3: Persistence and Navigation

## 1. Objective

Enable game state persistence across sessions and support multi-chapter navigation, laying the groundwork for internationalization.

- **Target Users**: Players who want to save progress and developers preparing for a multi-language, multi-level game structure.
- **Success Criteria**:
  - Hero state (HP, inventory, position) survives page refreshes.
  - Game transitions seamlessly between chapters based on triggers.
  - Localization extraction and injection workflow is functional.

## 2. Core Features

- **LocalStorageAdapter**: Domain-driven persistence layer.
- **Chapter Router**: Logic to handle `chapterId` transitions within `InitializeQuest`.
- **Lit-Localize Setup**: Integration with the `lit-localize` CLI for string extraction and transformation.

## 3. Project Structure

- **New Files**:
  - `packages/core/src/infrastructure/LocalStorageAdapter.js`: Serialization/deserialization of game state.
  - `packages/core/src/use-cases/SaveProgress.js`: Use case for state persistence.
- **Modified Files**:
  - `packages/feature-quest-hub/src/infrastructure/GameStore.js`: Hook into `SaveProgress` on state updates.
  - `packages/feature-quest-hub/src/ui/components/LeGameLevel.js`: Enhance level transition logic.

## 4. Code Style & Standards

- **Persistence**: Use a throttled auto-save strategy to minimize IO/Memory impact.
- **Localization**: Follow the `lit-localize` workflow: `extract` strings -> `generate` templates.
- **Result Pattern**: All persistence operations must return `Result`.

## 5. Testing Strategy

- **Unit Tests**: Verify JSON serialization of `HeroState` entities.
- **BDD**: Add scenarios for "Resuming a game" and "Transitioning between chapters".

## 6. Boundaries

- **Always do**: Keep `LocalStorage` access in Infrastructure layer.
- **Ask first**: Before adding large localization translation files.
- **Never do**: Expose raw persistence methods in UI components.
