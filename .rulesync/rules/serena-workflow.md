---
targets: ["*"]
description: "Workflow rules inspired by Serena for AI-assisted development"
globs: ["**/*"]
---

# Serena-Inspired AI Workflow

To maximize the efficiency of **Serena** and other AI agents, follow these procedural rules:

## 1. Clean State & Context

- **Git Hygiene**: Always start a task from a clean git state. This allows the agent to use `git diff` to review and correct its own changes.
- **Onboarding**: Be aware that the first run generates "memories" in `.serena/memories/`. These are the foundation of the agent's project understanding.

## 2. Coding Task Lifecycle

- **Action**: Implement changes using the available semantic tools (Serena/CLI).
- **Validation**: After any change, the agent must run:
  1. **Linting**: To ensure syntactic correctness.
  2. **Tests**: To ensure functional correctness.
- **Reflection**: The agent MUST inspect the output of the validation step (logs, errors, diffs). If something fails, it must use the feedback to refine the solution without being asked.

## 3. Code for AI Readability

- **Semantic Structure**: Maintain a clear file and folder structure (Clean Architecture) as Serena uses relational structures for retrieval.
- **Interpretability**: Prioritize code that produces meaningful logs and test outputs. The agent cannot use a debugger; it relies on text feedback.
