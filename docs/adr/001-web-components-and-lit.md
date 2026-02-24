# ADR 001: Web Components and Lit

- **Status**: Accepted
- **Date**: 2026-02-23
- **Author**: Jorge Casar / Gemini CLI

## Context

We need a UI engine that is lightweight, standards-compliant, and capable of handling the game's reactive requirements without imposing a heavy runtime or a proprietary ecosystem.

## Decision

We have chosen **Web Components** as the core component model and **Lit** as the helper library for rendering and reactivity.

### Why not React/Vue/Angular?

1.  **Browser Standards**: Web Components are native to the browser. This ensures longevity and compatibility across different stacks without a heavy build step.
2.  **Encapsulation**: Shadow DOM provides perfect style and DOM encapsulation, which aligns with the "Clean Architecture" goal of keeping UI boundaries clear.
3.  **Bundle Size**: Lit is extremely small (~5KB), which is crucial for the performance targets of a narrative game.
4.  **Interoperability**: Web Components can be used in any environment, making the "Master Replication Guide" more universal.

## Consequences

- **Positive**: Near-native performance, standard CSS encapsulation, easy integration with any library, future-proof.
- **Negative**: Requires understanding of custom elements lifecycle and Shadow DOM. Some legacy browsers (not a target) might need polyfills.
