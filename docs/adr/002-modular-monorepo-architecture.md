# ADR 002: Modular Monorepo Architecture (Vertical Slices)

- **Status**: Accepted
- **Date**: 2026-02-25
- **Author**: Jorge Casar / Gemini

## Context

We need a structure that allows for incremental development ("component by component"), clear dependency management, and high reusability of game logic and UI elements. The game combines a reactive UI layer (Lit + Web Components) with pure domain logic, so the architecture must enforce clean separation between these concerns.

## Decision

We will implement a modular monorepo structure under the `@legacys-end` namespace, using **Vertical Slices** combined with **Clean Architecture** layers.

### Key Drivers:

- **Modularity**: Features like Quests or Dialogues should be autonomous packages with their own Domain, Use Cases, Infrastructure, and UI layers.
- **Agnosticism**: UI components (atoms) should be decoupled from business logic.
- **Incremental Delivery**: Allow building and testing a full feature (Domain to UI) independently.
- **Developer Clarity**: Explicit dependencies in `package.json` prevent "spaghetti code" and enforce unidirectional flow.

## Alternatives Considered

1. **Layered Monolith** (single package, folders per layer): Simpler initial setup, but layers become tangled as the project grows. Features cannot be developed or tested in isolation.
2. **Multi-repo** (separate Git repos per package): Maximum isolation, but introduces complexity in cross-repo versioning, CI pipelines, and local development workflows. Overkill for a single-product team.
3. **Nx/Turborepo orchestrated monorepo**: Adds powerful task caching and dependency graph tooling, but introduces additional tooling overhead. Can be adopted later if npm workspaces proves insufficient — the package structure is compatible.

## Consequences

- **Positive**: High testability, clear boundaries between features, easy to maintain and onboard new contributors. Each feature can be built end-to-end without touching others.
- **Negative**: Initial overhead in setting up multiple packages and cross-workspace dependency wiring.
- **Neutral**: Requires strict adherence to the dependency flow rules (`UI → Use Cases → Domain → Core`). A feature package must never depend on another feature package.

## References

- [Vertical Slice Architecture — Jimmy Bogard](https://www.jimmybogard.com/vertical-slice-architecture/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [05-architecture-and-standards.md](../05-architecture-and-standards.md) — Detailed package hierarchy and dependency rules
