---
root: false
targets: ["*"]
description: "Project roadmap: Phase 0-4 milestones, current status and next implementation steps"
globs: ["**/*"]
antigravity:
  trigger: "model_decision"
  description: "Apply when planning next implementation steps, prioritizing work or checking project status"
geminicli:
  description: "Apply when planning next implementation steps, prioritizing work or checking project status"
---

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

### Pending Infrastructure 🔧

- [ ] Set up **Storybook** at the root level, with glob discovery of `*.stories.*` from all packages.
- [ ] Configure **`@vitest/browser`** with Playwright provider (real Chromium) for component-level TDD/BDD.
- [ ] Configure **Playwright** root config for E2E / BDD with Cucumber.

> For the full testing strategy, see [06 - Tech Stack and QA](./06-tech-stack-and-qa.md#2-quality-strategy-testing).

---

### Phase 1: Foundation & Homepage (Vertical Slice 1) 🏠

**Goal**: Deliver a functional, visually appealing Quest Hub without waiting for the full game engine domain to be built.

- [ ] Configure **Vite** and **Lit**.
- [ ] Set up `@lit/context` for Dependency Injection.
- [ ] Integrate **Web Awesome** in `@legacys-end/theme`.
- [x] Implement Dumb Components: `<le-quest-card>` and `<le-quest-hub>` with their Storybook stories.
- [x] Build `ListAvailableQuests` Use Case with a mocked `ContentAdapter` to feed the Hub.

### Phase 2: First Playable Level (Vertical Slice 2) ⚔️

**Goal**: Make "Alarion's Awakening" playable from start to finish.

- [ ] Implement Domain: `HeroState`, `Position`, `Result` pattern, and pure collision logic.
- [ ] Implement pure UI: `<le-game-viewport>` and `<le-dialogue-overlay>`.
- [ ] Implement Use Cases: `StartQuest`, `MoveHero`.
- [ ] Set up `@legacys-end/content` and real `ContentAdapter` parsing JSON files.
- [ ] Integrate `@lit-labs/signals` to bind the pure `HeroState` to the UI viewport dynamically.

### Phase 3: Persistence, Polish & Navigation 💾

**Goal**: Connect the Hub to the Game, allow saving progress, and support multiple languages.

- [ ] Implement Use Case: `SaveProgress` and `LocalStorageAdapter`.
- [ ] Create SPA Routing to transition between the Hub and Active Quests.
- [ ] Configure `@lit/localize` and `.messages.js` structures for i18n (see ADR-003).
- [ ] Configure **Playwright** for E2E testing the complete flow.

### Phase 4: Chrome Built-in AI Integration 🤖

**Goal**: Add next-generation API enhancements utilizing local on-device LLMs.

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
