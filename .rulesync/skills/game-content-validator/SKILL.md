---
name: game-content-validator
description: "Static content auditor: ensures referential integrity, geometric consistency, and spawn safety in JSON game data."
triggers: ["validate json", "audit level", "check narrative", "integrity check"]
---

# Game Content Validator

Protects the game engine from malformed static data in `@legacys-end/content`.

## 1. Referential & Logic Checks

### 1.1 Dialogues
- **Integrity**: Every `nextId` must resolve to an actual node `id`.
- **Termination**: Ensure at least one terminal node (`nextId: null`).
- **Cleanliness**: Report unreachable (orphan) nodes.

### 1.2 Levels
- **Geometry**: Grid matrix must be rectangular (consistent row lengths).
- **Spawn**: Hero's initial position must be within bounds and on a walkable tile (type 0).
- **Tiles**: Only defined tile types allowed.

## 2. Operational Workflow

1. **Discovery**: Identify modified JSON files in `packages/content/`.
2. **Analysis**: Run specialized integrity logic for dialogues or levels.
3. **Diagnosis**: Output errors as `[FILE] -> Node/Tile [ID] -> Error Detail`.
4. **Conclusion**: Fail the validation if any referential error is found.

## 3. Mandates
- **Zero Crashes**: Content must never cause a runtime exception.
- **Playability**: Levels must be fully traversable from spawn.
