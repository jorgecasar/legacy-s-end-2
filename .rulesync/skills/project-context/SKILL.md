---
name: project-context
description: "Summary of project context and its key architectural constraints."
targets: ["*"]
---

# Project Context: Legacy's End

## Core Goals
- Integral replication of a narrative RPG game following high-quality standards.
- Use of **Clean Architecture** and **DDD**.
- AI-assisted development (rulesync + Serena) with unified rules.

## Infrastructure & Tooling
- **AI**: Rulesync (rules management) and Serena (semantic analysis).
- **Runtime**: Node.js v24+ (ESM).
- **UI Engine**: Lit (Web Components) + Web Awesome.
- **Workflow**: Strict TDD/BDD, Conventional Commits, and Serena's reflection cycle.

## Coding Mandates
- **TC39 Decorators**: Mandatory `accessor` keyword for all decorated fields.
- **Separated Styles**: UI styles MUST be in `[ComponentName].styles.js`.
- **Result Pattern**: Mandatory `{ success, value, error }` return for business logic.

## Verification
- Every change must be validated with linting (oxlint) and tests (node test) before proposal.
- No commits without explicit user confirmation.
