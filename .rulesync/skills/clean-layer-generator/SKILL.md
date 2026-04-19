---
name: clean-layer-generator
description: "Vertical slice generator for Clean Architecture: enforces Domain purity, Result pattern validation, and class exports."
triggers: ["new feature slice", "implement mechanic", "add layers", "clean architecture generator"]
---

# Clean Layer Generator

Orchestrates the implementation of game features across the 4 architectural layers, ensuring the Domain remains pure and logic is robust.

## 1. Layer Mandates

### 1.1 Domain & Use Cases (Pure Logic)
- **Purity**: Zero UI or infrastructure imports.
- **Result Pattern**: NEVER access `.value` without checking `.success`.
- ✅ `if (res.success) { handle(res.value); }`
- ❌ `handle(res.value);` (unchecked)

### 1.2 Infrastructure (Adapters)
- **Rule**: Classes MUST be explicitly exported (`export class X`) for JSDoc/TS support.
- **State**: Use `signal()` in Stores to bridge logic and UI.

## 2. Execution Workflow

### Step 1: Core Logic (TDD)
1. Generate **Entity** in `domain/entities/` with `#private` fields and static `create()`.
2. Generate **Use Case** and its **Port** (Interface).
3. Implement unit tests (`.spec.js`) with 100% coverage.

### Step 2: Implementation
1. Create **Infrastructure** adapters (Repositories/Stores).
2. Scaffold **UI** components using `lit-component-scaffolder`.
3. Wire everything via `@lit/context` in the feature root.

## 3. Quality Gate
- [ ] No framework imports in Domain.
- [ ] All error paths in Use Cases handled and returned as `Result.failure`.
- [ ] 100% test pass rate.
