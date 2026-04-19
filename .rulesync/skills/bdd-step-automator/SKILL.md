---
name: bdd-step-automator
description: "Acceptance testing engineer: automates Page Objects and declarative Step Definitions for Playwright/Cucumber."
triggers: ["generate steps", "setup bdd", "scaffold acceptance test", "create page object"]
---

# BDD Step Automator

Bridging the gap between Gherkin and Playwright. Ensures acceptance tests are declarative, isolated, and maintainable.

## 1. Tactical Implementation

### 1.1 Page Objects (POM)
- **Goal**: Encapsulate locators and waiting logic.
- **Rule**: Step definitions MUST NOT interact with `page` directly.
- **Semantics**: Prefer `aria-role` and `accessible-name`.

### 1.2 Step Definitions
- **Rule**: Steps must be declarative.
- ✅ `When("I advance the dialogue", ...)`
- ❌ `When("I click the button with .next-btn class", ...)`

## 2. Operational Workflow

1. **Analysis**: Extract Given/When/Then from `.feature`.
2. **Audit**: Inspect the target Lit component for interactive elements.
3. **Generate POM**: Create `e2e/pages/[Name]Page.js` with semantic locators.
4. **Generate Steps**: Create `features/steps/[Name].steps.js` instantiating the POM.
5. **Validation**: Run `npx cucumber-js` on the specific feature file.

## 3. Engineering Mandates
- Every scenario must be independent.
- Use `Before` hooks to initialize signals/localStorage if needed.
- Use `expect` for all assertions.
