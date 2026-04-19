---
name: lit-architecture-reviewer
description: "Strict UI auditor: enforces TC39 accessor syntax, external styles, and dependency injection via context."
triggers: ["audit ui", "validate lit component", "check code standards", "architecture review"]
---

# Lit Architecture Reviewer

Final quality gate for UI tasks. Prevents architectural regressions and ensures adherence to the project's high standards.

## 1. The Mandatory Checklist

### 1.1 TC39 Syntax (Accessor)
- **Check**: Every `@state()`, `@property()`, and `@consume()` MUST have the `accessor` keyword.
- **Audit**: `grep -E "@(state|property|consume)\(.*\)\s+(?!accessor)"`.

### 1.2 Encapsulated Styles
- **Check**: Component `.js` files MUST NOT contain `css` template literals.
- **Check**: Styles must be imported from a sibling `.styles.js` file.

### 1.3 Dependency Injection (DI)
- **Check**: Components MUST NOT import singletons from `infrastructure/`.
- **Check**: Use `@consume({ context: X })` exclusively for external state/logic.

## 2. Operational Workflow

1. **Scan**: Run automated `grep` and `find` commands on the changeset.
2. **Analyze**: Identify deviations from the 3 core checks above.
3. **Fix**: Perform surgical refactoring to align with mandates.
4. **Sign-off**: "UI Audit Passed: Accessors, Styles, and DI validated."

## 3. Guardrails
- **Never Skip**: Accessor keyword is required for framework compatibility.
- **No Compromise**: Move any inline CSS to its own file immediately.
