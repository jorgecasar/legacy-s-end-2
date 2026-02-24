# Project Overview: Legacy's End

## Purpose

Legacy's End is a narrative game following Clean Architecture and modern standards. It features an AI-orchestrated development pipeline.

## Tech Stack

- **Runtime**: Node.js v24+ (ESM).
- **UI Engine**: Lit (Web Components).
- **Component Library**: Web Awesome.
- **Architecture**: Clean Architecture (4 layers: Domain, Use Cases, Infrastructure, UI).
- **Formatting/Linting**: oxfmt, oxlint, tsc.

## Codebase Structure

- `packages/ai-orchestration`: Standalone AI Orchestration Pipeline for GitHub Actions.
- `packages/apps/game`: The main game application (Web Components based).
- `docs/`: Extensive documentation on product vision, mechanics, architecture, and standards.

## Architecture (Clean Architecture)

1. **Domain**: Pure logic, entities, and value objects. Mandatory Result pattern.
2. **Use Cases**: Business rules orchestration. Ports definition.
3. **Infrastructure**: Adapters for external systems. Port implementation.
4. **UI**: Dumb components (Lit) and Controllers (ReactiveControllers).

Dependency flow is unidirectional (inward). DI is managed in `src/composition-root.js`.
