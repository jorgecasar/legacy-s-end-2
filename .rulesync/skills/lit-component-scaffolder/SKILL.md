---
name: lit-component-scaffolder
description: "Atomic generator for Lit components: enforces TC39 accessor, external styles, and isolated Storybook providers."
triggers: ["scaffold lit component", "create web component", "new ui element", "generate storybook"]
---

# Lit Component Scaffolder

Tactical guide for generating high-quality UI components. Enforces strict architectural separation and modern TC39 syntax.

## 1. Engineering Mandates

### 1.1 TC39 Decorators
- **Rule**: ALL decorated fields (`@state`, `@property`, `@consume`) MUST use the `accessor` keyword.
- ✅ `@state() accessor #isActive = false;`
- ❌ `@state() isActive = false;`

### 1.2 Styles (Separation of Concerns)
- **Rule**: Component files MUST NOT contain `css` blocks.
- **Implementation**: Import `styles` from `./[Name].styles.js`.

### 1.3 Dependency Injection
- **Rule**: No infrastructure singletons. Use `@consume({ context: X, subscribe: true })`.

## 2. Operational Workflow

1. **Plan**: Identify component name (PascalCase) and consuming contexts.
2. **Execute (Atomic Turn)**:
   - Create `[Name].styles.js`: Encapsulated CSS.
   - Create `[Name].js`: Logic with `accessor` and `SignalWatcher`.
   - Create `[name].js`: Custom element registration.
   - Create `[name].stories.js`: Isolated story wrapped in required Context Providers.
3. **Validate**: Run `npm run check:fast` on the new files.

## 3. Reference Template (Isolated Story)
```javascript
export const Default = {
  render: () => html`
    <context-provider .value=${mock}>
      <le-component></le-component>
    </context-provider>
  `
};
```
