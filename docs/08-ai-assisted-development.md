---
root: false
targets: ["*"]
description: "AI-assisted development workflow: Rulesync, Serena MCP, skills ecosystem and AI agent conventions"
globs: ["rulesync.jsonc", ".rulesync/**/*", ".agent/**/*"]
antigravity:
  trigger: "model_decision"
  description: "Apply when configuring AI tools, rulesync, Serena MCP or setting up agent skills"
geminicli:
  description: "Apply when configuring AI tools, rulesync, Serena MCP or setting up agent skills"
---

# 08 - AI-Assisted Development & Modular Architecture

## 1. AI Integration in the Monorepo

In **Legacy's End**, AI agents (Gemini CLI, Serena) must respect the modular boundaries defined in the monorepo architecture.

## 2. Working with Packages (`@legacys-end/*`)

When an agent is tasked with a new feature, it must follow this workflow:

1.  **Scope Check**: Identify if the task belongs to an existing `feature-*` package or requires a new one.
2.  **Layered Search**: Use Serena to analyze symbols within the specific package before looking at global dependencies.
3.  **Dependency Alignment**: Ensure any new `package.json` dependencies follow the unidirectional flow (`UI -> Use Case -> Domain -> Core`).

## 3. Tooling for Agents

### 3.1 Rulesync (Modular Governance)

Rules are applied globally but can be overridden at the package level if needed.

- **Constraint**: Agents must check `.rulesync/rules/` for architectural compliance before proposing changes.

### 3.2 Serena (Semantic Integrity)

Agents must use Serena to verify that:

- Deleting a symbol in a `feature` domain doesn't break its local Use Cases.
- Moving a symbol to `@legacys-end/domain` (Promotion) is handled with a clean refactor across all referencing packages.

## 4. Automated Validation

Agents are responsible for:

- Running `npm run lint` and `npm test` within the specific package they are modifying.
- Verifying the component in **Storybook** (generating the corresponding story if it doesn't exist).
- Updating the `CHANGELOG.md` following the "Documentation First" rule.

## 5. Generation & Scaffolding

Agents should prioritize using the project's **Scaffolding Tools** (when implemented) to create new features, ensuring the 4-layer structure is identical and follows the naming conventions in `docs/05-architecture-and-standards.md`.
