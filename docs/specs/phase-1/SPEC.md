# SPEC.md - Completing Phase 1: Composition Root & Integration

## 1. Objective

Complete Phase 1 by establishing a functional production environment where the Quest Hub is correctly assembled and styled using Web Awesome.

- **Target Users**: Developers and stakeholders needing a live preview of the Quest Hub.
- **Success Criteria**: `index.html` loads a functional Quest Hub with real/mocked data, styled correctly, and reacting to state changes.

## 2. Core Features

- **Composition Root**: Implementation of a main application container (`<le-app>`) that manages the lifecycle of shared services.
- **Dependency Injection**: Full setup of `@lit/context` providers at the app level for:
  - `GameStore` (State management)
  - `ListAvailableQuests` (Use Case)
  - `QuestRepository` (Data source)
- **Web Awesome Integration**: Global CSS and theme initialization (fonts, design tokens, icons).
- **Navigation**: Basic routing or state-based switching to prepare for Phase 2.

## 3. Project Structure

- **New Files**:
  - `packages/feature-quest-hub/src/ui/components/le-app.js`: Main composition component.
  - `packages/feature-quest-hub/src/ui/components/LeApp.js`: Logic for the composition root.
  - `packages/feature-quest-hub/src/ui/components/LeApp.styles.js`: Global/App-level styles.
- **Modified Files**:
  - `index.html`: Update entry point to `<le-app>`.
  - `vite.config.js`: Ensure correct resolution for monorepo packages.

## 4. Code Style & Standards

- **Decorators**: Use TC39 `accessor` syntax for all decorated fields.
- **Clean Architecture**: Domain/Use Case logic remains decoupled from Lit components.
- **Styling**: All styles must be in separate `.styles.js` files using the `css` tagged template.

## 5. Testing Strategy

- **BDD**: Update existing Cucumber features to verify the full flow through `<le-app>`.
- **Storybook**: Add an `App` story to verify the composition root independently.
- **Linting**: Ensure 0 errors/warnings with `oxlint`.

## 6. Boundaries

- **Always do**: Use the Result pattern for interactor returns.
- **Ask first**: If adding new dependencies to `package.json`.
- **Never do**: Inline CSS in component files.
- **Never do**: Hardcode API keys or secrets.

---
**Status**: Pending User Confirmation
