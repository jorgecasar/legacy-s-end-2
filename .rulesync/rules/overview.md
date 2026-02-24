---
root: true
targets: ["*"]
description: "Project overview and general development guidelines"
globs: ["**/*"]
---

# Legacy's End Project Overview

## Core Technology Stack

- **Runtime**: Node.js v24+ (ESM).
- **UI Engine**: Lit (Web Components).
- **Component Library**: Web Awesome.
- **Architecture**: Clean Architecture (4 layers: Domain, Use Cases, Infrastructure, UI).

## Code Standards

- **TC39 Decorators**: Use `accessor` for decorated fields (e.g., `@state() accessor name = ""`).
- **Separate Styles**: Component styles must be in `[ComponentName].styles.js`.
- **Result Pattern**: Functions in Domain/Use Cases should return `{ success, value, error }`. No exceptions for business logic.
- **Immutability**: States should only be modified through authorized controllers.

## Development Workflow

- **TDD/BDD**: Strictly required for Use Cases and Domain.
- **Testing**: 100% coverage in business logic. E2E with Playwright.
- **AI Tools**: Use Rulesync for configuration and Serena for semantic analysis.
