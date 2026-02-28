# ADR 003: Content Localization Strategy (JSON + Messages)

- **Status**: Accepted
- **Date**: 2026-02-28
- **Author**: Jorge Casar / Gemini

## Context

The game content (`@legacys-end/content`) includes both structural data (coordinates, conditions, entity IDs) and user-facing text (dialogue, quest titles, slide narration). We need a strategy that:

1. Keeps structural data validatable via JSON Schema.
2. Makes all user-facing text discoverable by `@lit/localize` for extraction and translation.
3. Maintains Clean Architecture boundaries — the Domain layer should work with complete entities, unaware of the dual-source origin.

## Decision

We will separate content into two file types per quest:

- **`.json` files**: Pure data (mechanics, coordinates, conditions, entity structure). No user-facing strings.
- **`.messages.js` files**: Companion files containing all translatable strings wrapped in `msg()` from `@lit/localize`, keyed by entity ID.

The **Infrastructure layer** (`ContentAdapter`) is responsible for merging both sources into a single, complete **Domain Entity** before passing it to Use Cases or UI.

### Example Structure

```text
packages/content/quests/alarions-awakening/
├── quest.json              # { id, chapters, rewards, requirements }
├── quest.messages.js       # { title: msg("..."), description: msg("...") }
├── chapters.json           # { chapters: [{ id, startPos, exitZone, entities }] }
└── chapters.messages.js    # { dialogues, narration, insight text }
```

### Merge Point

```javascript
// infrastructure/content-adapter.js
import data from "@legacys-end/content/quests/alarions-awakening/quest.json";
import { questMessages } from "@legacys-end/content/quests/alarions-awakening/quest.messages.js";

// Domain receives a complete entity
const quest = { ...data, ...questMessages[data.id] };
```

## Alternatives Considered

1. **All content in `.js` with `msg()`**: Simpler structure, but loses JSON Schema validation and makes content harder to edit for non-developers.
2. **All content in `.json` with separate locale files**: Simpler data model, but `@lit/localize` cannot extract strings from JSON — requires a custom translation pipeline.
3. **Localized components** (e.g., `le-narration-slide-es`): Maximally flexible but extremely fragile, duplicates component logic, and scales poorly with each new locale.

## Consequences

- **Positive**: JSON remains validatable. `lit-localize extract` works natively on `.messages.js`. Domain entities are complete and locale-agnostic. Locale switches via `setLocale()` trigger automatic re-renders.
- **Negative**: Each quest has double the files (data + messages). The `ContentAdapter` must know the pairing convention.
- **Neutral**: Content creators must maintain two files per quest, but the separation is clear and predictable.

## References

- [@lit/localize documentation](https://lit.dev/docs/localization/overview/)
- [05-architecture-and-standards.md](../05-architecture-and-standards.md) — Communication Lifecycle §3
- [07-data-contract.md](../07-data-contract.md) — Content Package structure
