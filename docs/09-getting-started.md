---
root: false
targets: ["*"]
description: "Getting started guide: monorepo setup, Node 24, pnpm workspaces and initial dev environment"
globs: ["package.json", "pnpm-workspace.yaml", ".nvmrc", "*.config.*"]
antigravity:
  trigger: "model_decision"
  description: "Apply when setting up the development environment or onboarding to the project"
geminicli:
  description: "Apply when setting up the development environment or onboarding to the project"
---

# 09 - Getting Started & Setup

Welcome to **Legacy's End**. This document will guide you through setting up your development environment and understanding how the project's base infrastructure was built.

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: v24.0.0 or higher (recommended to use `fnm` or `nvm`).
- **npm**: v10.0.0 or higher.

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Development Commands

- `npm run lint`: Runs Oxlint to find code issues.
- `npm run format`: Formats code using Oxfmt.
- `npm run lint:types`: Validates types using TypeScript (JSDoc).

---

## 🛠️ AI Infrastructure Setup

The project uses an advanced ecosystem of assistant tools to ensure quality and consistency.

### 1. Rulesync (Rule Management)

Rulesync orchestrates the rules of authorized agents (**Google Antigravity** and **Gemini CLI**).

- The `rulesync.jsonc` file defines targets and rule sources.
- Skills are managed centrally for all agents.

### 2. Serena (Semantic Analysis)

We use **Serena** as an MCP server to provide deep semantic code analysis to agents.

- It is executed via `npm run serena`.

### 3. Specialized Skills Installation

To download the specialized skills, a GitHub access token configured in a `.env` file is required:

```bash
# Create a .env file with GITHUB_TOKEN=your_token
export $(cat .env | xargs) && npx rulesync install
```

---

## 📜 Initialization History

_This section documents the technical steps taken to create the project base._

1.  **NPM Initialization**: Configured as a native ESM project.
2.  **Quality Setup**:
    - Integration of **Oxlint** and **Oxfmt**.
    - **Husky** configuration for Git hooks (`pre-commit` and `commit-msg`).
    - **Conventional Commits** validation with `commitlint`.
3.  **Agent Setup**:
    - `npx rulesync init`.
    - `npx rulesync fetch dyoshikawa/rulesync --features skills`.
    - `.rulesync/mcp.json` configuration.
4.  **Rule Generation**:
    - `npx rulesync generate`.
    - `npx rulesync gitignore`.
