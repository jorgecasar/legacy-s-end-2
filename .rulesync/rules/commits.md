---
targets: ["*"]
description: "Rules for commit messages following Conventional Commits"
globs: [".git/**/*"]
---

# Conventional Commits Rule

All commits in this project must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

`<type>[optional scope]: <description>`

## Types

- **feat**: A new feature.
- **fix**: A bug fix.
- **docs**: Documentation only changes.
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- **refactor**: A code change that neither fixes a bug nor adds a feature.
- **perf**: A code change that improves performance.
- **test**: Adding missing tests or correcting existing tests.
- **build**: Changes that affect the build system or external dependencies.
- **ci**: Changes to CI configuration files and scripts.
- **chore**: Other changes that don't modify src or test files.
- **revert**: Reverts a previous commit.

## Rules

- Use lowercase for the type.
- The description must start with a lowercase letter.
- Do not end the description with a period.
- Use the imperative, present tense: "change" not "changed" nor "changes".
