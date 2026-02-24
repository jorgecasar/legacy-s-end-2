# Contributing to Legacy's End

Thank you for your interest in contributing to **Legacy's End**. This project follows high-quality software engineering standards and AI-assisted development workflows.

## 🚀 Development Workflow

To ensure consistency and quality, follow this process for every task:

1.  **Synchronize**: Get the latest rules and AI skills:
    ```bash
    npx rulesync install
    ```
2.  **Branching**: Create a descriptive branch:
    ```bash
    git checkout -b feat/new-mechanic
    ```
3.  **Development Standards**:
    - Follow **Clean Architecture** (4 layers).
    - Use the **Result Pattern** for all business logic.
    - Strictly follow **TDD/BDD** (tests first).
    - Use **TC39 Decorators** with `accessor`.
4.  **Local Validation**:
    ```bash
    npm run lint          # Check code quality
    npm run format        # Ensure consistent style
    npm run lint:types    # Validate JSDoc types
    ```
5.  **Commits**: Use **Conventional Commits**. Husky hooks will validate your message automatically.
    - `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, etc.

## 🏗️ Architecture Layers

- **Domain**: Pure logic and entities. No dependencies.
- **Use Cases**: Business rules orchestration. Defines Ports.
- **Infrastructure**: External adapters (Storage, Audio). Implements Ports.
- **UI**: Lit Web Components and Reactive Controllers.

## ✅ Definition of Done (DoD)

Before a task is considered finished, it must meet the following criteria:

1.  **Code Standards**: All code follows the standards in `docs/05-architecture-and-standards.md`.
2.  **Linting & Formatting**: `npm run lint` and `npm run format` pass without errors.
3.  **Type Safety**: `npm run lint:types` (JSDoc/TypeScript) passes.
4.  **Testing**:
    - Unit tests for Domain and Use Cases have 100% coverage.
    - E2E tests (if applicable) pass in all target browsers.
5.  **Documentation**:
    - Public APIs and complex logic are documented with JSDoc.
    - New features are reflected in the relevant `docs/*.md` files.
    - Architectural decisions are recorded in a new ADR (if necessary).
6.  **AI Alignment**: `npx rulesync generate` has been run to ensure rules are synced.

## 🐞 Bug Reports and Features

Please open an issue before starting major work to discuss the architectural approach.
