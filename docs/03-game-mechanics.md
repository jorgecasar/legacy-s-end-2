# 03 - Advanced Game Mechanics

## 1. Interaction and Proximity Engine

The game uses simple yet powerful mathematical logic to handle movement and actions.

### 1.1 Relative Coordinates (%)

- All positions (`Hero`, `NPCs`, `Rewards`, `ExitZones`) are defined on a scale of **0.0 to 100.0**.
- This makes the game **100% responsive**. If the container resizes, positions don't need recalculating—they only need to be rendered in the new % of the space.

### 1.2 Collision Detection (Proximity)

- No physics engine. Uses **Euclidean Distance**:
  `distance = sqrt((x2-x1)^2 + (y2-y1)^2)`
- **Action Radius**: If the distance is less than a threshold (e.g., 5%), a **visual indicator** (interaction bubble) is shown and the player can interact by pressing a key (`E` or `Space`). Interaction is **not automatic**: it always requires explicit user action.

## 2. Conditions and Visibility Engine

The world is dynamic and reacts to the game state (`QuestState`).

### 2.1 Sequential Entity Appearance

- **Multi-NPC**: A chapter can have multiple NPCs.
- **Visibility Conditions**: Entities can appear or disappear based on predicates:
  - `always`: Always visible.
  - `after:interaction_id`: Appears only when a specific dialogue has ended.
  - `sequential`: NPCs appear one after another based on their **position in the `entities` array** of the chapter. The NPC at position `[n]` is only visible after completing the interaction with the NPC at position `[n-1]`.

### 2.2 Reactive World

- **Dynamic Background**: A chapter's background can change after an interaction (e.g., from a grey forest to a colorful one).
- **Scenario Evolution**: Decorative elements can be added or removed to reflect that the code has been "healed".

## 3. Reward and Exit Logic

There is a strict dependency for finishing a level:

1.  **Interactions**: The player must complete all mandatory interactions.
2.  **Reward Appearance**: Only when interactions are fulfilled does the **Reward object appear visually** on the map.
3.  **Collection**: The hero must collect the object. This may trigger an outfit or aura change.
4.  **Exit Enabled**: The `ExitZone` (exit area) only activates and becomes visible **after obtaining the reward**.
