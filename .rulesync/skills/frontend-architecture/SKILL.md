# frontend-architecture

## Purpose

Enforce and validate the mandatory architecture and code standards for Legacy's End. This skill ensures that all feature packages follow Clean Architecture principles, implement the Result Pattern correctly, and adhere to Lit component standards.

## When to Use This Skill

This skill should be used when:
- Creating a new feature package or module.
- Modifying existing business logic in Domain, Use Cases, or Infrastructure layers.
- Developing or refactoring UI components using Lit.
- Reviewing code for architectural consistency.
- Validating the implementation of the Result Pattern.

## Core Mandates

### 1. Clean Architecture & Modular Monorepo
- **Structure**: Every feature package must be in `packages/feature-*`.
- **Layers**:
    - `src/domain/`: Pure logic, entities, value objects. No external deps.
    - `src/use-cases/`: Business logic orchestrators and Ports (Interfaces).
    - `src/infrastructure/`: Port implementations (Adapters).
    - `src/ui/`: Lit components, styles, and controllers.
- **Dependency Flow**: UI → Use Cases → Domain. Infrastructure → Use Cases (via Ports). Sibling feature dependencies are strictly forbidden.

### 2. The Result Pattern (Mandatory)
- All functions in non-UI layers must return `{ success, value, error }`.
- Always type the result using JSDoc: `/** @type {import("../domain/Result.js").Result<T>} */`.
- Ensure proper error propagation: `if (!result.success) return { success: false, error: result.error };`.

### 3. UI Component Standards (Lit)
- **Data Fetching**: Use `@lit/task` for asynchrony. Handle `initial`, `pending`, `error`, and `complete` states.
- **Styles**: Keep styles in a separate `[ComponentName].styles.js` file.
- **DI**: Consume dependencies via `@lit/context`. Consume interfaces, not implementations.
- **Web Awesome**: Prioritize Web Awesome components (`wa-*`) for standard UI elements.

### 4. Code Quality & Typing
- **JSDoc**: Required for all files. Place `@typedef` at the top.
- **Naming**: 
    - Files: `kebab-case.js`.
    - Classes: `PascalCase`.
    - Components: `le-` prefix, `kebab-case` tag.
- **Decorators**: Use `accessor` for decorated fields (e.g., `@state() accessor name = ""`).

## Workflow

### 1. Research & Analysis
- Verify the package structure and current layer implementation.
- Identify the target logic or component to modify.

### 2. Implementation
- Apply the required layer logic.
- Ensure the Result Pattern is used consistently.
- Use `accessor` for all Lit decorators.

### 3. Validation
- **Linting**: Run `npm run lint` (oxlint).
- **Type Checking**: Run `npm run lint:types` (tsc).
- **Logic Verification**: Ensure 100% coverage in business logic.

## Technical Standards

- **Runtime**: Node.js v24+ (ESM).
- **Framework**: Lit (Web Components).
- **Typing**: JSDoc with TypeScript (tsc).
