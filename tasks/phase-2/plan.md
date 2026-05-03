# Phase 2 Plan: First Playable Level

## 1. Dependency Graph
- **MoveHero Use Case**
  - Depends on `HeroState` (Entity) and `CollisionService` (Domain Service).
- **LeGameViewport (UI)**
  - Depends on `GameStore` (Signals) and `HeroState`.
- **ContentAdapter (Infra)**
  - Depends on `packages/content` JSON files.
- **StartQuest Use Case**
  - Depends on `ContentAdapter` and `GameStore`.

## 2. Vertical Slices Strategy
1. **Movement Core**: Implement the math and domain logic for moving the hero without UI.
2. **Visual Viewport**: Build the responsive viewport and render the hero using signals.
3. **Content & Setup**: Load the "Alarion Awakening" data and initialize the level.
4. **Interaction Core**: Add proximity detection and interaction triggers.

## 3. Checkpoints
- **Checkpoint A**: Unit tests for movement pass with 100% coverage.
- **Checkpoint B**: Hero moves in the browser when pressing arrow keys.
- **Checkpoint C**: NPC is rendered at its JSON-defined position.
- **Checkpoint D**: Dialogue overlay appears when close to NPC and "E" is pressed.
