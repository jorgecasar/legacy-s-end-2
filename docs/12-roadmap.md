# 12 - Project Roadmap

This document details current progress and upcoming milestones in the development of **Legacy's End**.

## 📍 Current Status: Phase 0 - Infrastructure

The project is in the initial phase of tool and standards setup.

### Completed Milestones ✅

- [x] Repository initialization and folder structure.
- [x] **Rulesync** and **Serena MCP** setup.
- [x] **Clean Architecture** standards definition.
- [x] Quality setup: **Oxlint**, **Oxfmt**, **Husky**, **Commitlint**.
- [x] Base technical documentation (17 documents + 3 ADRs).

---

## 🚀 Next Steps

### Phase 1: Core and Domain (Coming Soon) 🛠️

- [ ] Implement the base `Result` entity for the Result Pattern in `@legacys-end/core`.
- [ ] Define shared domain entities: `HeroState`, `Position`, `Reward` in `@legacys-end/domain`.
- [ ] Implement pure business logic (collision detection, visibility evaluation).
- [ ] Configure **Vitest** for unit testing.

### Phase 2: Use Cases and Infrastructure (Planned) 🏗️

- [ ] Implement use cases: `StartQuest`, `MoveHero`, `SaveProgress`.
- [ ] Define ports/interfaces (`StoragePort`, `ContentProvider`).
- [ ] Implement adapters (`LocalStorageAdapter`, `ContentAdapter`).
- [ ] Set up `@legacys-end/content` with JSON + `.messages.js` structure (see [ADR 003](./adr/003-content-localization-strategy.md)).

### Phase 3: UI and Components (Planned) 🎨

- [ ] Configure **Vite** and **Lit**.
- [ ] Set up `@lit/context` for Dependency Injection.
- [ ] Configure `@lit-labs/signals` for reactive state bridge.
- [ ] Integrate **Web Awesome** in `@legacys-end/theme`.
- [ ] Set up **Storybook** for component development.
- [ ] Implement base components: `le-game-viewport`, `le-dialogue-overlay`, `le-quest-hub`.
- [ ] Configure `@lit/localize` for i18n.

### Phase 4: Content and Polish (Planned) ✨

- [ ] Create first quest content: "Alarion's Awakening" (JSON + messages).
- [ ] Configure **Playwright** for E2E tests.
- [ ] Implement audio system and accessibility.
- [ ] Integrate **Chrome Built-in AI** (see [doc 17](./17-built-in-ai.md)):
  - [ ] Capability detection and fallback strategy.
  - [ ] Voice commands via Web Speech API (`SpeechRecognition`).
  - [ ] NPC dialogue generation via Prompt API (Gemini Nano).
  - [ ] NPC text-to-speech via `SpeechSynthesis`.

---

## 📈 Coverage Tracking

- **Domain**: 0%
- **Use Cases**: 0%
- **UI**: 0%
- **E2E**: 0%
