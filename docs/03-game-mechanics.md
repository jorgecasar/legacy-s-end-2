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

## 4. Skills & Rewards as Active Mechanics

Skills and rewards are not passive collectibles — they are **gameplay keys** that unlock interactions and progression.

### 4.1 Skills as Knowledge Keys

A skill acquired in one quest can be **required** to interact with entities in later quests:

- **Gated Interaction**: An NPC can require the player to possess a specific skill before revealing their deck. Without it, the NPC shows a rejection message (e.g., "You're not ready yet, seek the Master first").
- **Quiz Advantage**: In Codelab mode, a `quiz` slide can offer additional answer options or hints if the player has a related skill.
- **Progressive Dialogue**: An NPC's dialogue content can change based on which skills the player has acquired, providing deeper explanations for skilled players.

### 4.2 Rewards as Exchange Items

Rewards collected during gameplay can be **given to NPCs** to unlock new interactions:

- **Exchange Interaction**: A new slide type (`exchange`) prompts the player to offer a specific reward. If the player has it, the NPC responds with new information or unlocks a path.
- **Consumable vs Permanent**: Some rewards are consumed on exchange (one-time use keys), while others are permanent proofs of mastery that remain in the inventory.
- **Chain Quests**: An NPC in Quest 3 may require a reward obtained in Quest 1, creating cross-quest dependencies and reinforcing that learning is cumulative.

### 4.3 Interaction Requirements (Data Model)

Each entity can define an optional `interactionRequirement` that the game evaluates before opening the deck:

| Requirement Type | Condition                                 | Fail Behavior                           |
| :--------------- | :---------------------------------------- | :-------------------------------------- |
| `requireSkill`   | Player must have the specified skill ID   | Show rejection message                  |
| `requireReward`  | Player must have the specified reward ID  | Show rejection message                  |
| `exchangeReward` | Player must surrender a reward to proceed | Show request message, consume on accept |
