---
root: false
targets: ["*"]
description: "AI orchestration pipelines: multi-agent development via GitHub Issues, Actions and autonomous AI workers"
globs: [".github/**/*", ".rulesync/**/*"]
antigravity:
  trigger: "model_decision"
  description: "Apply when working on GitHub Actions, AI pipelines or autonomous agent workflows"
geminicli:
  description: "Apply when working on GitHub Actions, AI pipelines or autonomous agent workflows"
---

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

## 7. Task Management Model (GitHub Issues)

All development work is tracked as GitHub Issues using a structured hierarchy of **Milestones → Issues → Sub-issues** with explicit blocking relationships.

### 7.1 Hierarchy

| Level        | GitHub Concept                          | Maps to                                              |
| :----------- | :-------------------------------------- | :--------------------------------------------------- |
| **Phase**    | **Milestone**                           | `Phase 1: Core & Domain`, `Phase 2: Use Cases`, etc. |
| **Task**     | **Issue**                               | A unit of work deliverable in one PR                 |
| **Sub-task** | **Sub-issue** (GitHub's native feature) | A smaller step within a complex task                 |

**Milestones** correspond exactly to the phases in [doc 12 - Roadmap](./12-roadmap.md). Every Issue must be assigned to a Milestone before work begins.

### 7.2 Issue Labels

| Label                 | Meaning                                                                                                                 |
| :-------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| `status: ready`       | No blocking dependencies — can be picked up                                                                             |
| `status: paused`      | Work started but suspended (pending sub-issues, new blocker, or manual pause). Must be resumed before picking new tasks |
| `status: in-progress` | Being actively worked on                                                                                                |
| `status: review`      | PR open, awaiting review                                                                                                |
| `status: done`        | Merged and closed                                                                                                       |
| `priority: critical`  | Must be resolved before others in the same milestone                                                                    |
| `type: task`          | Standard deliverable issue                                                                                              |
| `type: sub-task`      | Child of a parent task                                                                                                  |
| `type: bug`           | Defect discovered post-merge                                                                                            |
| `type: spike`         | Research/exploration with no direct code output                                                                         |

> **Note**: There is no `status: blocked` label. Blocked status is **derived dynamically** by the agent: it reads the "Blocked by" references in the issue body and checks via the GitHub API whether those issues are closed.

### 7.3 Blocking Relationships

Blocking relationships use **GitHub's native issue dependencies REST API** ([reference](https://docs.github.com/en/rest/issues/issue-dependencies?apiVersion=2022-11-28)). No body text or labels are required.

**Add a blocker** (Issue #42 is blocked by Issue #12):

```bash
# Via gh CLI
gh api -X POST repos/{owner}/{repo}/issues/42/dependencies \
  -f blocked_by_issue_number=12

# Via REST
POST /repos/{owner}/{repo}/issues/{issue_number}/dependencies
{ "blocked_by_issue_number": 12 }
```

**Check blockers** (used by the agent at task-selection time):

```bash
gh api repos/{owner}/{repo}/issues/42/dependencies
# Returns list of blocking issues with their `state` (open/closed)
# Issue is unblocked when all returned issues have state: "closed"
```

**Remove a blocker** (when no longer needed):

```bash
gh api -X DELETE repos/{owner}/{repo}/issues/42/dependencies \
  -f blocked_by_issue_number=12
```

The agent never needs to update anything when a blocker closes — it simply calls the GET endpoint and checks whether all returned issues have `state: "closed"`.

### 7.4 Complex Task Decomposition

When a task requires more than one focused session of work, it is decomposed into **sub-issues** (GitHub's native sub-issue feature, available in Projects):

```
Issue #42 — Implement ContentAdapter                    [type: task]
  └─ Sub-issue #43 — Parse quest.json                  [type: sub-task]
  └─ Sub-issue #44 — Merge with quest.messages.js     [type: sub-task]
  └─ Sub-issue #45 — Integrate TranslatorAdapter       [type: sub-task, status: blocked by #38]
```

The parent issue stays open until **all** sub-issues are resolved and merged.

### 7.5 Agent Task Selection Algorithm

When the **AI Developer Agent** is triggered (via `/implement` command or label assignment), it selects the next task using this priority order:

1. **Filter**: Issues in the **current active Milestone** without `status: in-progress`, `status: review`, or `status: done`.
2. **Blocked check**: For each candidate, call `GET .../issues/{n}/dependencies`. Skip if any blocker has `state: "open"`.
3. **Priority order** (from unblocked candidates):
   1. `status: paused` + `priority: critical`
   2. `status: paused` (any priority) — resume existing work before starting new
   3. `status: ready` + `priority: critical`
   4. `status: ready` — oldest by creation date
   5. `type: sub-task` preferred over `type: task` to keep PRs small
4. **Conflict check**: Ensure no other `status: in-progress` issue touches the same files.

If all candidates are blocked, the agent posts a comment listing the open blockers and waits for human resolution.

### 7.6 Milestone Completion Criteria

A Milestone (Phase) is considered complete when:

- All its Issues are `status: done`.
- The CI gatekeeper passes on `main`.
- Coverage targets for the phase are met (see [doc 12 - Roadmap §Coverage](./12-roadmap.md)).
