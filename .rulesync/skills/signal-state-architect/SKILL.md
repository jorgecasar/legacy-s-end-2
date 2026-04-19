---
name: signal-state-architect
description: "Reactive state strategist: designs Stores using TC39 signals and SignalWatcher to bridge Domain and UI."
triggers: ["setup reactive state", "create game store", "implement signals", "synchronize state"]
---

# Signal State Architect

Guides the design of the reactive core. Ensures efficient synchronization between pure Domain results and the Lit UI layer.

## 1. Tactical Patterns

### 1.1 Store Structure
- **Rule**: Stores MUST be exported classes.
- **Rule**: Encapsulate mutation. The UI calls methods; the Store updates signals.
- ✅ `this.heroSignal.set(newValue);` (Inside Store).

### 1.2 Unidirectional Flow
1. **Trigger**: UI event -> Store method.
2. **Logic**: Store method -> Use Case.
3. **Reactive Update**: Use Case `Result` -> Signal update.

## 2. Operational Workflow

1. **Model**: Identify reactive atoms (signals) vs. derived data (computed).
2. **Setup**: Create Store in `infrastructure/` with `@lit-labs/signals`.
3. **Integration**:
   - Wrap components in `SignalWatcher`.
   - Access signals via `.get()` in `render()`.
4. **Validation**: Verify that no signal mutation happens directly in UI files.

## 3. Mandatory Quality Check
- Is the class exported? (e.g., `export class GameStore`)
- Is the singleton exported? (e.g., `export const gameStore = new GameStore()`)
- Are derived states using `computed()`?
