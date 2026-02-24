---
targets: ["*"]
description: "Rules for project documentation and progress tracking"
globs: ["**/*.md", "CHANGELOG.md"]
---

# Documentation and Tracking Rules

## 1. Documentation First

- Every architectural decision or significant infrastructure change must be reflected in the `docs/` folder.
- Keep `docs/README.md` and `docs/10-getting-started.md` updated as the project evolves.

## 2. Changelog Management

- All notable changes must be recorded in `CHANGELOG.md` following the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.
- Group changes under: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

## 3. Continuous Improvement (Kaizen)

- Proactively identify opportunities to create new **Rulesync** assets:
  - **Commands**: For repetitive tasks or workflows.
  - **Rules**: For new coding standards or architectural patterns.
  - **Skills**: For specialized agent knowledge.
  - **Subagents**: For delegating complex multi-step processes.
  - **Hooks**: For automated checks or integrations.
