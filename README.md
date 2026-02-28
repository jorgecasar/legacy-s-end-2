# Legacy's End: Modular RPG Engine (Monorepo)

> **"Where the story meets the code."**

**Legacy's End** is a narrative RPG engine built with **Lit**, **Web Awesome**, and a **Clean Architecture** approach using **Vertical Slices**. This project is a monorepo that separates the core engine, the visual theme, and the narrative content into modular packages.

## 🏗️ Modular Architecture Overview

The project follows a strict monorepo structure under the `@legacys-end` namespace.

### Core Pillars

- **`@legacys-end/core`**: Technical primitives and the **Result Pattern**.
- **`@legacys-end/domain`**: Shared entities (Hero, Session) and pure logic.
- **`@legacys-end/theme`**: Multi-theme system with **Web Awesome** tokens.
- **`@legacys-end/ui`**: Shared UI atoms and Lit components.
- **`@legacys-end/content`**: Narrative data (Quests, Dialogues, Missions).

### Functional Slices (Features)

- **`@legacys-end/feature-quest`**: Full vertical slice for mission management.
- **`@legacys-end/feature-dialogue`**: Dialogue box and narrative interaction.
- **`@legacys-end/game-app`**: The final application (Composition Root).

## 🚀 Getting Started

1.  **Read the Docs**: Start with `docs/05-architecture-and-standards.md` to understand the 4-layer architecture.
2.  **Storybook**: View and interact with components in isolation (Coming soon).
3.  **Monorepo Commands**:
    - `npm install`: Install all dependencies across workspaces.
    - `npm test`: Run the test suite for all packages.
    - `npm run lint`: Check linting and formatting standards.

## 🛠️ Technology Stack

- **Runtime**: Node.js v24+ (ESM).
- **UI Framework**: Lit (Web Components).
- **Design System**: Web Awesome / Shoelace.
- **State Management**: Reactive Signals (at the Infrastructure/UI boundary).
- **Testing**: Vitest (Unit/Integration) and Playwright (E2E).

## 📜 Architectural Decisions

Decisions are recorded in the `docs/adr/` directory. See `ADR 002: Modular Monorepo Architecture` for the reasoning behind this structure.

---

_Created with ❤️ by Jorge Casar_
