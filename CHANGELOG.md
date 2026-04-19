# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Configured **CI/CD pipeline** with GitHub Actions (`ci.yml`) including automated linting, unit tests, and E2E/BDD tests.
- Implemented **Active Mission** state management in `GameStore` and UI in `LeQuestHub`.
- Integrated **Cucumber BDD** into the E2E infrastructure with Playwright and Storybook.
- Created `quest-selection-flow.feature` to validate the full user journey from quest selection to mission activation.
- Refactored `Quest` entity to follow immutable state transition patterns (returning new instances).
- Enhanced `NavigateToQuestHub` use case with explicit `Result` pattern.
- Improved `StaticQuestRepository` with robust mapping and static factory `fromRawData`.
- Modernized `LeQuestCard` and `LeQuestHub` components with TC39 decorators and `@lit/task`.

### Fixed

- Fixed syntax error in root `package.json` `postinstall` script that caused CI failures during `npm ci`.
- Fixed pre-existing BDD test failures in `dialogue-interaction.feature` by increasing timeouts for async initialization.
- Improved Storybook isolation by providing necessary context providers in component stories.

## [1.0.0] - 2026-04-19

### Added

- Implemented `@legacys-end/content` package for game level and dialogue definitions.
- Created `DialogueNode` entity and `AdvanceDialogue` use case in `@legacys-end/core`.
- Developed `GameStore` infrastructure service using `@lit-labs/signals` for reactive state management.
- Implemented `<le-game-viewport>` component with CSS Grid rendering and hero positioning.
- Implemented `<le-dialogue-overlay>` component for interactive NPC interactions.
- Added `game.html` as a test page for the game viewport and dialogue system.
- Added `<le-game-level>` container component to orchestrate the game level initialization and rendering.
- Implemented `le-quest-card` component covering all 4 architectural layers (Domain, Use Cases, Infrastructure, UI).
- Defined `Quest` entity and `QuestStatus` (Available, Locked, Completed) in `@legacys-end/feature-quest-hub`.
- Implemented `ListAvailableQuests` use case following the Result Pattern.
- Developed `StaticQuestAdapter` as an in-memory repository for quest data.
- Created `le-quest-card` Lit component with TC39 decorators and encapsulated styles.
- Added Storybook stories for all quest states.
- Initialized npm project as native ESM.
- Configured **AI Infrastructure** using **Rulesync** and **Serena** MCP for semantic code analysis.
- Defined **Google Antigravity** and **Gemini CLI** as authorized agents with official and community skills.
- Established core standards: **Conventional Commits**, **Clean Architecture**, and **Serena-inspired workflow**.
- Integrated over 70 specialized agent capabilities from `antigravity-awesome-skills` managed via **Rulesync**.
- Created initial documentation and automated project tracking rules.
- Configured **JavaScript Quality Stack**:
  - **Oxlint**: Integrated as an ultrafast linter with JSDoc support.
  - **Oxfmt**: Integrated for high-performance code formatting.
  - **Exclusions**: Ignored AI-related directories (`.rulesync`, `.serena`, etc.) from linting, formatting, and type checking.
  - **Type Checking**: Established strict JSDoc validation using TypeScript (`jsconfig.json`).
- Configured **Git Hooks with Husky**:
  - **commit-msg**: Added validation for Conventional Commits using `commitlint`.
  - **pre-commit**: Integrated `lint-staged` (configured via `.lintstagedrc.json`) to automatically format and lint files before committing.
  - **Scripts**: Added `lint`, `format`, and `type-check` to `package.json`.

### Fixed

- Resolved YAML syntax errors in external skills and refined documentation consistency.
- Corrected `.gitignore` rules to properly exclude generated agent settings.
- Added missing `test` scripts to root `package.json` to fix CI failures.
- Fixed `lint:types` configuration in `package.json` and `jsconfig.json` to correctly perform type checking on workspaces and skip `node_modules`.
- Corrected `.lintstagedrc.json` by removing unsupported `oxfmt` task for Markdown files.
- Fixed `ai-orchestration` integration tests by renaming inputs to use underscores, ensuring compatibility with environment variable naming restrictions in CI.

### Changed

- Refactored `LeHero` and `LeDialogueOverlay` placeholders to follow project standards (separate styles, signal-based reactivity).
- Updated `packages/feature-quest-hub/package.json` with new dependencies (`@lit-labs/signals`, `@legacys-end/content`) and exports.
- Improved documentation structure and clarity:
  - Created root `README.md` as a central entry point.
  - Refactored `docs/09-getting-started.md` to be more actionable for new developers.
  - Added `docs/12-roadmap.md` to track project progress and milestones.
  - Updated `docs/README.md` index to include new documents.
- Translated all project documentation to English to follow professional standards and ensure global accessibility.
