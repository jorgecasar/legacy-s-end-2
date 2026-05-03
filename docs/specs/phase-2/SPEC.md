# SPEC.md - Phase 2: First Playable Level (Alarion's Awakening)

## 1. Objective
Enable the first playable experience of "Alarion's Awakening". The user should be able to start the mission, move the hero across the map using relative coordinates, and interact with the first NPC.

- **Target Users**: Developers testing core engine mechanics and early-access players.
- **Success Criteria**: 
  - Hero can move in 4 directions within the 0-100% grid.
  - Collisions with map boundaries and obstacles are respected.
  - Proximity to an NPC triggers an interaction prompt.
  - "Alarion Awakening" level data is loaded from the content package.

## 2. Core Features
- **Responsive Game Viewport**: A canvas/container that renders the hero and level entities based on % coordinates.
- **Movement Engine**: Use cases for handling input and updating `HeroState` position while checking for collisions.
- **Content Adapter**: Integration of the `@legacys-end/content` package to load static JSON level definitions.
- **Reactive State (Signals)**: Binding the domain `HeroState` to the UI using `@lit-labs/signals` for 0-latency updates.
- **Collision Service**: Pure domain logic to calculate distances and valid movements.

## 3. Project Structure
- **New Files**:
  - `packages/core/src/domain/services/MovementService.js`: Logic for calculating new positions.
  - `packages/core/src/infrastructure/ContentAdapter.js`: Service to merge JSON and messages.
  - `packages/feature-quest-hub/src/ui/components/LeGameViewport.js`: Rendering engine.
  - `packages/content/quests/alarions-awakening/`: Initial level data.
- **Modified Files**:
  - `packages/core/src/domain/entities/HeroState.js`: Finalize fields and state transitions.
  - `packages/feature-quest-hub/src/infrastructure/GameStore.js`: Add signals for hero movement and level entities.

## 4. Code Style & Standards
- **Math**: Use Euclidean distance for all proximity checks.
- **Purity**: Domain services must not have side effects or UI dependencies.
- **Signals**: Viewport component must use `SignalWatcher` to react to state changes.

## 5. Testing Strategy
- **Unit Tests**: 100% coverage for `MovementService` and collision logic.
- **BDD**: New scenarios for "Hero Movement" and "Proximity Interaction".
- **Integration**: Verify `ContentAdapter` correctly merges JSON data with localized strings.

## 6. Boundaries
- **Always do**: Keep coordinates between 0.0 and 100.0.
- **Ask first**: If implementing complex physics (keep it simple Euclidean for now).
- **Never do**: Hardcode level data inside components.

---
**Status**: Pending User Confirmation
