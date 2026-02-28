---
root: false
targets: ["*"]
description: "Tech stack and QA: Node 24, Lit, Web Awesome, TDD/BDD, Vitest, Playwright and linting"
globs: ["**/*.js", "**/*.ts", "*.config.*", "package.json"]
antigravity:
  trigger: "model_decision"
  description: "Apply when setting up tools, configuring tests, or choosing libraries and frameworks"
geminicli:
  description: "Apply when setting up tools, configuring tests, or choosing libraries and frameworks"
---

# 06 - Tech Stack and QA

> ℹ️ **Note on implementation status**: The tech stack described here is planned for game development. Dependencies will be incorporated as logic and UI development phases begin (see [Roadmap](./12-roadmap.md)).

## 1. Technological Core

- **Runtime**: Node.js v24+ (Native ESM).
- **UI Engine**: [Lit](https://lit.dev/).
- **Component Library**: [Web Awesome](https://webawesome.com/) (`@awesome.me/webawesome`) — Buttons, inputs, wa-grid, wa-icon.
- **Build Tool**: [Vite](https://vitejs.dev/) configured for modern bundles (es2022+).

## 2. Quality Strategy (Testing)

The project must be implemented strictly following **TDD** or **BDD**.

> **Rule**: Everything that runs in the browser must be tested in a **real browser**. No `happy-dom` or `jsdom` simulations.

### 2.1 Test Runners

| Package                                  | Runner                                    | Environment             |
| :--------------------------------------- | :---------------------------------------- | :---------------------- | --- |
| `ai-orchestration`                       | `node:test`                               | Node.js (GitHub Action) |
| `domain`, `use-cases`, `ui`, `feature-*` | `vitest` + `@vitest/browser` + Playwright | Real Chromium           |     |
| End-to-end flows                         | Playwright + Cucumber                     | Real Chromium           |

### 2.2 Validation Levels

- **Unit/Component Testing**: 100% coverage in the Use Cases and Domain layers.
- **E2E Testing (Playwright)**: Mandatory validation of full user flows in **real browsers**.
- **Visual Regression**: Snapshot capture to ensure consistent hero background and outfit changes.

### 2.3 Testing Conventions

- **Location**: Tests must be co-located with the source file (`move-hero.js` → `move-hero.test.js`).
- **Naming**: Use `describe/it` patterns in natural language (Gherkin style for BDD).
- **Unit Test Example (`vitest` + `@vitest/browser`)**:

  ```javascript
  import { describe, it, expect } from "vitest";
  import { moveHero } from "../src/move-hero.js";

  describe("UseCase: moveHero", () => {
    it("should increment X position by 2%", () => {
      const initialState = { x: 10, y: 10 };
      const result = moveHero(initialState, "RIGHT");
      expect(result.value.x).toBe(12);
    });
  });
  ```

- **Coverage**: **100% coverage** is required in the Domain and Use Cases layers before considering a task finished.

## 3. Bundle Optimization

- **Tree-shaking**: Aggressive dead code elimination.
- **Code Splitting**: Deferred loading (`import()`) of data for each mission.
- **Compression**: Serving compressed files with **Brotli** or Gzip for minimal latency.

## 4. Asset Management

- **Pixel Art**: 32x32px sprites rendered with `image-rendering: pixelated;`.
- **Audio**: Optimized OGG/MP3 formats (with AAC fallback) for fast loading.
