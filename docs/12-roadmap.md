# 12 - Project Roadmap

This document details current progress and upcoming milestones in the development of **Legacy's End**.

## 📍 Current Status: Phase 0 - Infrastructure

The project is in the initial phase of tool and standards setup.

### Completed Milestones ✅

- [x] Repository initialization and folder structure.
- [x] **Rulesync** and **Serena MCP** setup.
- [x] **Clean Architecture** standards definition.
- [x] Quality setup: **Oxlint**, **Oxfmt**, **Husky**, **Commitlint**.
- [x] Base technical documentation (16 documents).

---

## 🚀 Next Steps

### Phase 1: Core and Domain (Coming Soon) 🛠️

- [ ] Implement the base `Result` entity for the Result Pattern.
- [ ] Define domain entities: `HeroState`, `Quest`, `Chapter`.
- [ ] Implement pure business logic (condition evaluation, transitions).
- [ ] Configure **Vitest** for unit testing.

### Phase 2: Use Cases and Infrastructure (Planned) 🏗️

- [ ] Implement use cases: `StartQuest`, `EvaluateChapter`.
- [ ] Define infrastructure ports (Storage, Content).
- [ ] Implement base adapters (LocalStorage, JSON content loader).

### Phase 3: UI and Components (Planned) 🎨

- [ ] Configure **Vite** and **Lit**.
- [ ] Integrate **Web Awesome**.
- [ ] Implement base components: `GameViewport`, `DialogueBox`, `ProgressHub`.
- [ ] Implement reactive controllers.

### Phase 4: Content and Polish (Planned) ✨

- [ ] Load the first Chapter: "Alarion's Awakening".
- [ ] Configure **Playwright** for E2E tests.
- [ ] Implement audio system and accessibility.

---

## 📈 Coverage Tracking

- **Domain**: 0%
- **Use Cases**: 0%
- **UI**: 0%
- **E2E**: 0%
