# 16 - AI Orchestration Pipelines

This document outlines the strategy for orchestrating an autonomous, multi-agent development workflow using GitHub Issues, Pull Requests, and GitHub Actions.

## 1. The Vision: Asynchronous Autonomous Development

Instead of a human developer prompting an AI locally, the goal is an asynchronous pipeline where humans (or other agents) create GitHub Issues, and a team of specialized AI agents collaborate to plan, implement, review, and merge the code.

## 2. Agent Roles

To prevent "AI hallucination loops," responsibilities must be segregated into different agents with opposing goals:

1.  **Product Manager / Architect Agent**:
    - **Trigger**: New GitHub Issue created.
    - **Role**: Reads the user request, checks the project constraints (Clean Architecture, Rulesync), and creates a technical checklist/plan.
2.  **Developer Agent**:
    - **Trigger**: Issue is labeled `ready-for-dev` or assigned.
    - **Role**: Checks out a branch, writes code, writes tests, runs local CI, and opens a Pull Request.
3.  **Reviewer Agent**:
    - **Trigger**: Pull Request opened or updated.
    - **Role**: Reviews the PR against `docs/05-architecture-and-standards.md`. It rejects the PR if standards (like the Result Pattern or 100% coverage) are not met.
4.  **The Deterministic Gatekeeper (Standard CI)**:
    - **Trigger**: Push to PR.
    - **Role**: Non-AI standard tools (Oxlint, Oxfmt, Vitest) that provide absolute truth. Agents cannot override this; they must fix their code to pass.

## 3. The Required Pipelines (GitHub Actions)

To ensure the orchestration logic is itself robust and maintainable, all complex logic is encapsulated in **testable Node.js scripts** located in `scripts/ci/`. The GitHub Actions YAML files act only as thin wrappers that invoke these scripts.

### 3.1 Script Architecture

- **Location**: `scripts/ci/*.js`
- **Testing**: Each script has a corresponding `__tests__/*.spec.js` file.
- **Tools**: Leveraging native Node.js 24 features (like `fetch`) and `@octokit/rest` for GitHub interaction.

### 3.2 Pipeline Definitions

1. **`ai-planner.yml`**: Triggers `node scripts/ci/plan-issue.js`.
2. **`ai-developer.yml`**: Triggers `node scripts/ci/implement-issue.js`.
3. **`ci-gatekeeper.yml`**: Triggers standard project scripts (`npm run lint`, etc.).
4. **`ai-reviewer.yml`**: Triggers `node scripts/ci/review-pr.js`.

## 4. The Feedback Loops (Self-Correction)

To make the system robust, we implement three critical feedback loops:

### Loop A: Plan Refinement (Human <-> AI)

1. **AI Planner** posts a proposal.
2. **Human** replies with corrections or constraints.
3. **AI Developer** reads the _entire issue thread_ to synthesize the final implementation plan before writing the first line of code.

### Loop B: Pre-flight Validation (AI Developer Self-Review)

The **AI Developer** must not push "broken" code. Its internal workflow in the CI runner is:

1. `Write Code` -> `Run npm run lint` -> `If fail, analyze error & fix`.
2. `Run npm test` -> `If fail, analyze stack trace & fix`.
3. Only when local validation passes, it performs `git push`. This leverages the project's existing **Husky** hooks.

### Loop C: Review Iteration (AI Reviewer <-> AI Developer)

1. If **AI Reviewer** requests changes via PR comments.
2. **AI Developer** is re-triggered. It reads the review comments as "new requirements."
3. It applies fixes to the existing branch and pushes again, restarting the CI cycle.

## 5. Security and Cost Optimization

To prevent unauthorized usage and unnecessary AI costs, the following measures are in place:

### 5.1 Authorized Triggers

Only comments from the following entities can trigger the **AI Developer Agent**:

- **Repository Owner**: Manual override or approval.
- **GitHub Actions Bot**: For loops triggered by other authorized AI pipelines (like the AI Reviewer).
- **Trusted Collaborators**: (Optional) Can be added to the whitelist.

### 5.2 Command-Based Invocation

Instead of triggering on every comment, the agent only responds to specific commands like `/implement` or `/fix`, ensuring that general discussion in an issue doesn't burn tokens.

## 6. Implementation Roadmap

- [ ] **Phase 1**: Implement `ci-gatekeeper.yml` to establish the deterministic baseline (Linters & Unit Tests).
- [ ] **Phase 2**: Implement `ai-reviewer.yml` using an existing marketplace action (e.g., CodeRabbit, or a custom prompt action using Anthropic/Gemini).
- [ ] **Phase 3**: Implement `ai-developer.yml`. This requires injecting a secure token and providing the agent with the Serena codebase context inside the runner.
- [ ] **Phase 4**: Orchestrate the loop so a failed CI or Review automatically triggers the Developer Agent to push a fix.
