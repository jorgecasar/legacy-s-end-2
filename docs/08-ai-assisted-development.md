# 08 - AI-Assisted Development

## 1. Development Philosophy

In **Legacy's End**, AI is not just a co-pilot; it is an integrated part of the development lifecycle. We use a "Human-in-the-loop" approach where agents handle implementation and validation while humans provide architectural direction.

## 2. Tooling Infrastructure

### 2.1 Rulesync (Governance)

[Rulesync](https://github.com/dyoshikawa/rulesync) is our orchestration tool that unifies rules across agents.

- **Workflow**: Run `npx rulesync install` to sync skills and `npx rulesync generate` to update agent instructions.
- **Skills**: Integrated with ~30 curated skills from Antigravity Awesome Skills covering architecture, security, and QA.

### 2.2 Serena (Semantic Context)

[Serena](https://github.com/oraios/serena) provides deep semantic analysis via an MCP server.

- **Function**: It allows agents to understand cross-file dependencies and symbol relationships, ensuring refactors don't break the architecture.

## 3. Agent Capabilities

Authorized agents are equipped with specialized skill sets:

- **Architectural**: Clean Architecture patterns, DDD tactical modelling, and ADR management.
- **Quality**: TDD/BDD workflows, 100% coverage enforcement, and E2E automation.
- **Technical**: Lit component standards, TC39 Decorators, and secure frontend coding.

## 5. Continuous Improvement (Kaizen)

The AI ecosystem is not static. Developers are encouraged to:

- **Add Rules**: Create new specialized rules in `.rulesync/rules/` for new patterns discovered during development.
- **Add Skills**: Incorporate new agent skills that automate repetitive tasks specific to the game's mechanics.
- **Update Context**: Refine the instructions in `rulesync.jsonc` as the project's architecture evolves.
