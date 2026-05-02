# Task List: Phase 1 Completion

## Task 1: Composition Root Skeleton
- [x] Create `LeApp.js`, `le-app.js`, and `LeApp.styles.js` in `packages/feature-quest-hub/src/ui/components/`.
- [x] Implement `LeApp` class as a `LitElement` that provides `gameStoreContext` and `questUseCaseContext`.
- [x] **Acceptance Criteria**: Component exists and renders a `<le-quest-hub>` inside a container.
- [x] **Verification**: Run `npm run lint` and verify no errors in new files.

## Task 2: Service Instantiation & DI
- [x] Instantiate `GameStore` and `ListAvailableQuestsInteractor` (with `StaticQuestRepository`) inside `LeApp`.
- [x] Pass these instances to the `@provide` decorators in `LeApp`.
- [x] **Acceptance Criteria**: `<le-quest-hub>` transitions from "Waiting for Use Case" to rendering quest cards in a Storybook story.
- [x] **Verification**: Create `le-app.stories.js` and verify it works in Storybook.

## Task 3: Web Awesome & Theme Integration
- [x] Import Web Awesome base styles and setup design tokens in `LeApp.styles.js`.
- [x] Add theme wrapper classes in `LeApp.render()` and `index.html`.
- [x] **Acceptance Criteria**: Buttons, cards, and spinners use Web Awesome design system.
- [x] **Verification**: Visual check in Storybook.

## Task 4: Production Entry Point
- [ ] Update `index.html` to use `<le-app>` instead of `<le-quest-hub>`.
- [ ] Ensure `vite.config.js` correctly handles imports.
- [ ] **Acceptance Criteria**: `npm start` shows a fully functional Quest Hub at `localhost:3000`.
- [ ] **Verification**: Run `npm start`, navigate to the hub, and select a mission.

## Task 5: BDD Verification
- [ ] Update Cucumber step definitions to wait for `<le-app>` initialization.
- [ ] **Acceptance Criteria**: `npm run test:bdd` passes all scenarios.
- [ ] **Verification**: Run `npm run test:bdd`.
