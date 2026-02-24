# Style and Conventions

## Naming Conventions

- **Files**: `kebab-case.js` (e.g., `move-hero.js`).
- **Classes**: `PascalCase` (e.g., `class StartQuest`).
- **Functions**: `camelCase` (e.g., `moveHero()`).
- **Components**: `PascalCase` class name, `kebab-case` tag name (e.g., `le-game-viewport`).
- **Styles**: `[ComponentName].styles.js` (e.g., `GameViewport.styles.js`).
- **Variables**: `camelCase`.
- **Constants**: `UPPER_SNAKE_CASE`.

## Coding Standards

- **TC39 Decorators**: Use `accessor` for decorated fields (e.g., `@state() accessor name = ""`).
- **Separate Styles**: Component styles must be in a separate file.
- **Result Pattern**: Functions in Domain and Use Cases must return `{ success, value, error }`. Do not throw exceptions for business logic.
- **Immutability**: States should only be modified through authorized controllers.
- **Signals**: Allowed ONLY in the Infrastructure layer as a reactive bridge to the UI. Prohibited in Domain and Use Cases.

## Documentation

- Reflect significant changes in the `docs/` folder.
- Keep `CHANGELOG.md` updated using the "Keep a Changelog" format.
- Follow Conventional Commits for commit messages.
