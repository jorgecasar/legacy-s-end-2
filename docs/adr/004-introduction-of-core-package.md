# ADR 004: Introduction of the Core Package

## Status
Accepted

## Context
As the project grows, several game mechanics (like hero state, movement, and result patterns) are becoming cross-cutting concerns that multiple feature packages might need. Keeping these within a specific feature package (like `feature-quest-hub`) leads to high coupling and duplication.

## Decision
We will introduce a `@legacys-end/core` package to house shared domain logic, universal use cases, and transversal infrastructure adapters.

Key components moved to `core`:
- **Domain Entities**: `HeroState`, `Position`.
- **Domain Services**: `CollisionService`.
- **Use Cases**: `MoveHero`, `StartQuest`.
- **Patterns**: A standardized `Result` class for consistent error handling.

## Consequences
- **Pros**: 
  - Centralizes shared game logic.
  - Reduces duplication across feature packages.
  - Simplifies testing of core business rules.
  - Enhances modularity by allowing feature packages to depend on a stable core.
- **Cons**: 
  - Increases the number of packages to manage in the monorepo.
  - Requires careful management of `exports` to maintain clean boundaries.
