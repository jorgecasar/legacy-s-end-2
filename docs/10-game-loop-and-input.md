---
root: false
targets: ["*"]
description: "Game loop and input: event-driven update model, hero movement, controls and touch support"
globs: ["packages/**/game-loop*", "packages/**/input*", "packages/**/hero*"]
antigravity:
  trigger: "model_decision"
  description: "Apply when implementing the game loop, movement mechanics, keyboard/touch input or hero controls"
geminicli:
  description: "Apply when implementing the game loop, movement mechanics, keyboard/touch input or hero controls"
---

# 10 - Game Loop and Input

> ℹ️ **Note on implementation status**: This document defines the planned engine behavior. Currently, there is no engine code implemented (see [Roadmap](./12-roadmap.md)).

## 1. Update Model

Legacy's End **does not** use a continuous game loop (`requestAnimationFrame`). Movement and updates are **event-driven**.

### 1.1 Hero Movement

- **Input**: Direction keys (`Arrow Keys`) or `WASD`.
- **Type**: Movement is **step-based** (discrete), not fluid. Each press moves the hero by a fixed increment (e.g., 2% in the corresponding coordinate).
- **Animation**: The visual transition between positions is performed using CSS `transition` to smooth the movement.

### 1.2 Step Evaluation Cycle

Every time the hero moves, the following sequence is executed:

```
1. Input detected (keydown)
2. Use Case: MoveHero → calculates new position
3. Use Case: EvaluateVisibility → updates visible entities
4. Collision Check → is it near any entity?
   ├── Yes → Show interaction indicator (bubble)
   └── No → Hide indicator
5. UI renders the new state
```

### 1.3 Interactions

- **Interaction key**: `E` or `Space`.
- Only triggers if there is an entity within range.
- Opens the dialogue overlay (Slide Deck).

## 2. Complete Controls

| Action        | Key(s)                    | Context                     |
| ------------- | ------------------------- | --------------------------- |
| Move up       | `W` / `↑`                 | Game Viewport               |
| Move down     | `S` / `↓`                 | Game Viewport               |
| Move left     | `A` / `←`                 | Game Viewport               |
| Move right    | `D` / `→`                 | Game Viewport               |
| Interact      | `E` / `Space`             | Game Viewport (near entity) |
| Advance slide | `Space` / `Enter` / Click | Open dialogue               |
| Pause / Menu  | `Escape`                  | Game Viewport               |

## 3. Touch Support (Mobile)

- **Virtual D-Pad**: On-screen direction buttons for devices without a keyboard.
- **Tap on entity**: Equivalent to pressing `E` when in range.
- **Tap on dialogue**: Advances the slide.
