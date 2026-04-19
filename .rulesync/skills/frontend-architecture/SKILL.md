---
name: frontend-architecture
description: "Architecture validator and guide for UI standards: Clean Architecture, Result Pattern, and Lit components."
triggers: ["frontend architecture", "code standards", "review architecture", "clean architecture check"]
---

# Frontend Architecture

## Purpose
Enforce and validate the mandatory architecture and code standards for Legacy's End. This skill ensures all feature packages follow Clean Architecture principles, implement the Result Pattern correctly, and adhere to Lit component standards.

## Core Mandates

### 1. Clean Architecture & Modular Monorepo
- **Layers**: 
    - `src/domain/`: Pure logic, entities, value objects.
    - `src/use-cases/`: Logic orchestrators and Ports (Interfaces).
    - `src/infrastructure/`: Port implementations (Adapters).
    - `src/ui/`: Lit components, styles, and controllers.
- **Dependency Flow**: Flow MUST go inwards: UI → Use Cases → Domain. Sibling feature dependencies are strictly forbidden.

### 2. The Result Pattern (Mandatory)
- Functions in Domain/Use Cases MUST return `{ success, value, error }`.
- Forbidden: accessing `.value` without checking `.success`.

### 3. UI Component Standards (Lit)
- **Decorators**: MUST use `accessor` for decorated fields (`@state() accessor #name;`).
- **Styles**: MUST be in a separate `[ComponentName].styles.js` file.
- **DI**: Consume dependencies via `@lit/context`.

## Operational Workflow (Task Tracking)

1. **Architecture Audit**: Verify layer boundaries and dependency flow.
2. **Result Check**: Ensure consistent error propagation and result typing.
3. **UI Validation**: Verify `accessor` usage and style segregation.
4. **Typing Verification**: Ensure JSDoc/TS compliance across all layers.

## Technical Standards
- **Runtime**: Node.js v24+ (ESM).
- **UI Engine**: Lit (Web Components).
- **Standards**: TC39 Decorators, Clean Architecture, DDD.
