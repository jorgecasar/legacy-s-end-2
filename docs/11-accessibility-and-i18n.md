# 11 - Accessibility and i18n

> ℹ️ **Note on implementation status**: These accessibility and i18n guidelines will be applied during the UI and Components development phase. Tools such as `@lit/localize` have not been installed yet (see [Roadmap](./12-roadmap.md)).

## 1. Accessibility (a11y)

### 1.1 Keyboard Navigation

- All interactive elements must be reachable with `Tab`.
- The Game Viewport captures focus and manages controls via `keydown`.
- Web Awesome components already implement native ARIA roles.

### 1.2 ARIA and Semantics

- The stage (`le-stage`) must have `role="application"` and a descriptive `aria-label`.
- Dialogue slides must use `role="dialog"` with `aria-live="polite"` for screen readers.
- Progress indicators must use `role="progressbar"` with `aria-valuenow`.
- Quest Cards must have `aria-disabled="true"` when locked.

### 1.3 Contrast and Visuals

- Minimum contrast ratio: **4.5:1** for normal text, **3:1** for large text.
- Interaction indicators (bubbles) should not depend solely on color; use icons or text as well.
- High contrast mode: respect the `prefers-contrast` media query.

### 1.4 Reduced Motion

- Respect `prefers-reduced-motion`:
  - Disable hero CSS transition animations.
  - Immediate discrete movement (no `transition`).
  - Keep functionality intact.

## 2. Internationalization (i18n)

### 2.1 Strategy

- Use [`@lit/localize`](https://lit.dev/docs/localization/overview/) as Lit's official localization solution.
- Translations are extracted and compiled at build-time for optimal performance (no runtime overhead).

### 2.2 Language & Locale Policy

- **Source Locale**: The primary development language is **English (`en`)**. All base strings in code and documentation use English as the source of truth.
- **Target Locales**: Spanish (`es`) is the primary target for localization, reflecting the project's roots and target audience.
- **Content vs UI**:
  - **UI Strings**: Managed via `@lit/localize` (e.g., button labels, menu items).
  - **Narrative Content**: Quests, dialogues, and slides should be localized within the data contract (see `docs/07-data-contract.md`).

### 2.3 Setup

```bash
npm install @lit/localize
npm install -D @lit/localize-tools
```

`lit-localize.json` file in the root:

```json
{
  "sourceLocale": "en",
  "targetLocales": ["es"],
  "tsConfig": "jsconfig.json",
  "output": {
    "mode": "runtime",
    "outputDir": "src/i18n/generated"
  }
}
```

### 2.4 Use in Components

```javascript
import { msg } from "@lit/localize";

// In render:
html`<button>${msg("Continue Mission")}</button>`;
```

### 2.4 Extraction and Compilation

```bash
npx lit-localize extract   # Generates XLIFF for translation
npx lit-localize build     # Compiles translations
```

### 2.5 Language Change

- Language selector in the Hub header (global settings).
- Selected language is persisted in `localStorage`.
- `setLocale()` from `@lit/localize` is used to switch at runtime.
