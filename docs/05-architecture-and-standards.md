# 05 - Architecture and Code Standards

## 1. Modular Monorepo Architecture (Vertical Slices)

The project is structured as a modular monorepo using the `@legacys-end` namespace. This approach combines **Clean Architecture** with **Vertical Slices** to ensure high modularity, clear dependencies, and incremental delivery.

### 1.1 Dependency Flow Diagram

```mermaid
graph TD
    subgraph UI_Layer [UI / Presentation]
        Components[Lit Components]
        Controllers[Reactive Controllers]
    end

    subgraph Infrastructure_Layer [Infrastructure / Adapters]
        Adapters[Storage, Audio, Content Adapters]
        Signals[Reactive Signals]
    end

    subgraph UseCases_Layer [Use Cases / Business Logic]
        Orchestration[StartQuest, MoveHero, etc.]
        Ports[Interfaces/Ports]
    end

    subgraph Domain_Layer [Domain / Pure Logic]
        Entities[HeroState, Quest, Chapter]
        PureLogic[Collision, Progression]
        Result[Result Pattern]
    end

    UI_Layer --> UseCases_Layer
    UI_Layer -.-> Ports
    Infrastructure_Layer --> Ports
    UseCases_Layer --> Domain_Layer
    UI_Layer --> Signals
    Infrastructure_Layer --> Signals
```

### 1.2 Package Hierarchy & Responsibility

| Package                       | Responsibility                                                     | Export Policy               |
| :---------------------------- | :----------------------------------------------------------------- | :-------------------------- |
| `@legacys-end/core`           | Technical primitives (Result, Errors).                             | Only logic. No UI/Infra.    |
| `@legacys-end/domain`         | **Shared** entities and pure logic (Hero, Session).                | Pure JS. No framework deps. |
| `@legacys-end/use-cases`      | **Shared** business orchestration (InitializeGame, SaveProgress).  | Ports/Interfaces only.      |
| `@legacys-end/theme`          | Visual system, CSS tokens, multi-theme support.                    | CSS & Style Objects.        |
| `@legacys-end/ui`             | Shared UI atoms (Web Awesome wrappers).                            | Lit Components.             |
| `@legacys-end/infrastructure` | Shared services (Storage, Audio, Asset Loader).                    | Implementation classes.     |
| `@legacys-end/content`        | Game script: quest data (JSON) + translatable text (.messages.js). | Data only. No logic.        |
| `@legacys-end/feature-*`      | autonomous functional modules.                                     | UI + Context Keys.          |
| `@legacys-end/game-app`       | **Composition Root**. Assembles all modules.                       | Final executable bundle.    |

### 1.3 Domain Promotion & The "Rule of Two"

Logic and entities follow a "local-first" policy:

- **Phase 1 (Local)**: Everything lives inside the `feature` package.
- **Phase 2 (Evaluation)**: If a second, unrelated feature requires the same logic/entity, it is **promoted** to a shared package (`@legacys-end/domain` or `@legacys-end/use-cases`).
- **Rule**: Direct sibling dependencies between features are strictly forbidden.

## 2. Dependency Injection & Reactivity

### 2.1 Dependency Injection (DI) with Lit Context

We use `@lit/context` to decouple components from business logic:

- **Providers**: High-level containers or the `game-app` provide implementations (Use Cases, Services).
- **Consumers**: UI components use the `@consume` decorator to request their dependencies.

### 2.2 Real-time State vs. Persistent State

- **Real-time State (Signals)**: High-frequency data (coordinates, animations, input). Managed in **Infrastructure** and observed in **UI**.
- **Persistent State (Services)**: Narrative progress, inventory, rewards. Orchestrated by **Use Cases** and persisted via **Infrastructure Services**.

## 3. Communication Lifecycle (The 6 Steps)

1.  **User Action (UI)**: Component dispatches an event or calls an **Injected Use Case**.
2.  **Orchestration (Use Case)**: Evaluates the business rule. Calls a **Port** (Interface).
3.  **Data Retrieval (Infra)**: The Adapter implementer fetches data (Content/Storage).
4.  **Business Logic (Domain)**: Pure entity validation via the **Result Pattern**.
5.  **Persistence (Use Case)**: If valid, the Use Case instructs Infra to save the state.
6.  **Reactive Update (Signals)**: Infra updates a **Signal**. The UI re-renders automatically.

## 4. Internal Folder Structure (per Package)

Every functional package (core, shared or feature) should follow this structure for consistency:

```text
src/
├── domain/                    # Layer 1: Pure Domain
│   ├── entities/              # Entities specific to this package
│   ├── value-objects/         # Immutables (Position, Reward)
│   └── logic/                 # Pure functions
│
├── use-cases/                 # Layer 2: Use Cases
│   ├── ports/                 # Interfaces/Ports
│   └── [use-case-name].js
│
├── infrastructure/            # Layer 3: Adapters
│   └── [adapter-name].js
│
└── ui/                        # Layer 4: Presentation
    ├── components/            # Lit Components
    ├── controllers/           # ReactiveControllers
    └── stories/               # Storybook Stories
```

## 5. Code Standards

### 5.1 Naming Conventions

- **Files**: `kebab-case.js` (e.g., `move-hero.js`).
- **Classes**: `PascalCase` (e.g., `class StartQuest`).
- **Functions**: `camelCase` (e.g., `moveHero()`).
- **Components**: `PascalCase` class, `kebab-case` tag with `le-` prefix (e.g., `le-game-viewport`).
- **Styles**: `[component-name].styles.js` (separate from logic).

### 5.2 Syntax Requirements

- **Decorators**: Always use `accessor` for decorated fields (e.g., `@state() accessor name = ""`).
- **Result Pattern**: Mandatory for all logic layers: `{ success, value, error }`.
