# 07 - Data Contract and Content Management

## 1. Domain Entities

### 1.1 HeroState

The root entity that persists between sessions. It is the single source of truth for the player's progress.

```javascript
/** @typedef {Object} HeroState */
{
  id: "alarion",
  name: "Alarion",
  position: { x: 10, y: 50 },           // % Coordinates (0-100)
  outfit: "base",                         // Active outfit/skin
  aura: null,                             // Visual effect (null = none)
  skills: [],                             // Skill[] — acquired architectural skills
  rewards: [],                            // Reward[] — collected reward items
  activeQuestId: "alarions-awakening",    // Current quest (null = none)
  activeChapterId: "chap-01",            // Current chapter within quest
  completedInteractions: ["npc-kael"],   // Entity IDs fully interacted with
  completedQuests: [],                    // Quest IDs completed
  playMode: "codelab"                     // "codelab" (default) | "talk"
}
```

### 1.2 Skill

An engineering concept unlocked as a reward. Skills serve as **knowledge keys** (see [doc 03 §4.1](./03-game-mechanics.md#41-skills-as-knowledge-keys)).

```javascript
/** @typedef {Object} Skill */
{
  id: "encapsulation-shield",
  name: "Encapsulation Shield",
  description: "You master the encapsulation principle...",
  icon: "shield-icon"                     // Asset icon reference
}
```

### 1.3 Reward

An object collected during gameplay that can grant effects or be exchanged with NPCs (see [doc 03 §4.2](./03-game-mechanics.md#42-rewards-as-exchange-items)).

```javascript
/** @typedef {Object} Reward */
{
  id: "clean-code-rune",
  position: { x: 50, y: 50 },           // Map position (visible after conditions met)
  visibility: "all_interactions_done",    // When the reward appears
  consumable: false,                      // true = consumed on exchange, false = permanent
  effects: {
    outfit: "advanced_armor",             // Outfit change (optional)
    skill: "encapsulation-shield",        // Skill to unlock (optional)
    aura: "clean-code-glow"              // Visual aura (optional)
  }
}
```

### 1.4 Save System (Persistence)

The `HeroState` is the **only persisted entity**. It is saved automatically after every meaningful action (dialogue end, reward collected, chapter transition).

- **Initial implementation**: `localStorage` via a `LocalStorageAdapter` implementing the `StoragePort`.
- **Future**: When a user registration system is implemented, the adapter will be swapped for a `RemoteStorageAdapter` — the Use Cases and UI remain unchanged thanks to the port abstraction.
- **Save key**: `legacys-end:hero-state`
- **Format**: JSON serialization of `HeroState`.

## 2. The Content Package (`@legacys-end/content`)

The `@legacys-end/content` package acts as the "Script" of the game. It is a **data-only** package decoupled from the game engine logic.

Content is split into two file types to separate structural data from translatable text (see [ADR 003](./adr/003-content-localization-strategy.md)):

- **`.json`**: Pure data — mechanics, coordinates, conditions, entity structure. Validatable via JSON Schema.
- **`.messages.js`**: Companion files with all user-facing strings wrapped in `msg()` from `@lit/localize`.

### 1.1 Package Structure

```text
packages/content/
├── quests/
│   └── alarions-awakening/
│       ├── quest.json              # Metadata, rewards, requirements
│       ├── quest.messages.js       # Title, description (translatable)
│       ├── chapters.json           # Chapter sequence, positions, entities
│       └── chapters.messages.js    # Dialogues, narration, insight text
├── package.json
└── ...
```

## 3. Content Consumption Flow

Content is never imported directly by UI components. The **Infrastructure layer** merges both sources into complete Domain Entities:

1.  **Infrastructure**: `ContentAdapter` imports `.json` data and `.messages.js` texts, merges them into a single object.
2.  **Use Cases**: Request content (e.g., `GetQuestById`) via the `ContentProvider` port.
3.  **Domain**: Receives complete entities (e.g., `Quest` with both `id` and `title`).
4.  **UI**: Renders the Domain Entities. When the locale changes, `msg()` values update and Lit re-renders automatically.

## 4. JSON Schema Standards

### 4.1 Quest Definition (`quest.json`)

```json
{
  "id": "alarions-awakening",
  "rewards": [{ "type": "skill", "id": "clean-code-aura" }],
  "requirements": {
    "completedQuests": []
  },
  "chapters": ["chap-01", "chap-02"]
}
```

### 4.2 Quest Messages (`quest.messages.js`)

```javascript
import { msg } from "@lit/localize";

export const questMessages = {
  "alarions-awakening": {
    title: msg("Alarion's Awakening"),
    description: msg("The first step into the corrupted code..."),
  },
};
```

### 4.3 Chapter Structure (`chapters.json`)

The JSON defines the **spatial and logical structure** of each chapter. Entities reference no slide content — only their ID, position, and visibility rules:

```json
{
  "chapters": [
    {
      "id": "chap-01",
      "background": "forest-corrupted",
      "startPos": { "x": 10, "y": 20 },
      "exitZone": { "x": 90, "y": 90, "radius": 5 },
      "condition": "hasReward:clean-code-aura",
      "entities": [
        {
          "id": "npc-kael",
          "type": "npc",
          "position": { "x": 30, "y": 50 },
          "visibility": "always"
        },
        {
          "id": "npc-guardian",
          "type": "npc",
          "position": { "x": 70, "y": 20 },
          "visibility": "after:npc-kael",
          "interactionRequirement": {
            "type": "requireSkill",
            "id": "encapsulation-shield"
          }
        }
      ]
    }
  ]
}
```

### 4.4 Chapter Messages (`chapters.messages.js`)

The messages file defines the **full deck content** for each entity, organized by entity ID and play mode. When the player interacts with an NPC, the `ContentAdapter` resolves `entityDecks[entityId][activeMode]` to get the slide sequence:

```javascript
import { msg } from "@lit/localize";

export const entityDecks = {
  "npc-kael": {
    talk: [
      { type: "narration", speaker: msg("Master Kael"), text: msg("Welcome, Adept...") },
      {
        type: "code-comparison",
        title: msg("Global vs Local Scope"),
        before: "var x = 1;",
        after: "const x = 1;",
      },
      {
        type: "diagram",
        title: msg("Scope Chain"),
        imageUrl: "assets/diagrams/scope.png",
        alt: msg("Scope chain diagram"),
      },
      {
        type: "insight",
        category: msg("Fundamentals"),
        text: msg("Always prefer const over var..."),
      },
    ],
    codelab: [
      { type: "narration", speaker: msg("Master Kael"), text: msg("Welcome, Adept...") },
      {
        type: "refactor-challenge",
        title: msg("Fix the Scope"),
        brokenCode: "var x = 1;",
        correctAnswer: "const x = 1;",
      },
      {
        type: "terminal",
        output: "ReferenceError: x is not defined",
        question: msg("What caused this error?"),
      },
      {
        type: "quiz",
        question: msg("Which keyword prevents reassignment?"),
        options: ["var", "let", "const"],
        correctIndex: 2,
      },
      {
        type: "insight",
        category: msg("Fundamentals"),
        text: msg("Always prefer const over var..."),
      },
    ],
  },
  "npc-guardian": {
    talk: [
      /* ... */
    ],
    codelab: [
      /* ... */
    ],
  },
};
```

## 6. Slide Types Reference

### 6.1 Shared (Both Modes)

| Type        | Mandatory Fields    | Optional Fields                     |
| ----------- | ------------------- | ----------------------------------- |
| `narration` | `text`, `speaker`   | `portrait`                          |
| `insight`   | `text`, `category`  | `icon`                              |
| `exchange`  | `prompt`, `accepts` | `onSuccess`, `onFail`, `consumable` |

### 6.2 Talk Mode

| Type              | Mandatory Fields           | Optional Fields                   |
| ----------------- | -------------------------- | --------------------------------- |
| `code-comparison` | `title`, `before`, `after` | `highlights` (lines to highlight) |
| `diagram`         | `title`, `imageUrl`, `alt` | `caption`                         |

### 6.3 Codelab Mode

| Type                 | Mandatory Fields                       | Optional Fields  |
| -------------------- | -------------------------------------- | ---------------- |
| `quiz`               | `question`, `options`, `correctIndex`  | `explanation`    |
| `refactor-challenge` | `title`, `brokenCode`, `correctAnswer` | `hints`          |
| `terminal`           | `output`, `question`                   | `expectedAnswer` |
| `diff`               | `title`, `before`, `after`             | `explanation`    |

## 7. Visibility Conditions

| Predicate                 | Semantics                                               |
| ------------------------- | ------------------------------------------------------- |
| `"always"`                | Always visible                                          |
| `"after:<entity_id>"`     | Visible after completing interaction with `<entity_id>` |
| `"sequential"`            | Appears according to order in the `entities` array      |
| `"all_interactions_done"` | Visible when all mandatory interactions are completed   |
| `"reward_collected"`      | Visible when the chapter reward has been collected      |
| `"hasSkill:<skill_id>"`   | Visible only if the player has acquired the skill       |
| `"hasReward:<reward_id>"` | Visible only if the player possesses the reward         |

## 8. Maintenance & Scaling

- **Versioning**: The content package is versioned independently to allow "Content Updates" without changing the core engine.
- **Validation**: JSON Schema validation in CI/CD ensures structural correctness before merging.
- **Localization**: `lit-localize extract` scans `.messages.js` files and generates XLIFF for translators.
