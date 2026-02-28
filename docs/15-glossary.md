---
root: false
targets: ["*"]
description: "Glossary of key narrative, technical and game design terms used in Legacy's End"
globs: ["**/*"]
antigravity:
  trigger: "model_decision"
  description: "Apply when encountering unfamiliar project-specific terminology or needing term definitions"
geminicli:
  description: "Apply when encountering unfamiliar project-specific terminology or needing term definitions"
---

# 15 - Glossary of Terms

This glossary defines key terms used in the development, narrative, and architecture of **Legacy's End** to ensure clear and consistent communication.

## 1. Narrative Terms

- **Alarion**: The game's protagonist, an "Adept of Clean Code".
- **The Monolith**: The antagonist entity representing "Legacy Code".
- **Corruption Zone**: A level or area of the world that personifies a software anti-pattern.
- **Healing**: The act of completing a mission, which visually transforms the environment from corrupt to clean.

## 2. Game Terms (Mechanics)

- **Quest**: A complete narrative and pedagogical unit (course).
- **Chapter**: An individual scene within a mission.
- **Slide**: The minimum unit of interaction in a dialogue.
- **Deck**: The sequential set of slides that make up a complete interaction.
- **Reward**: An object that grants the hero new skills, appearances, or effects.
- **ExitZone**: An area that allows the player to advance to the next chapter.

## 3. Architectural Terms

- **Clean Architecture**: The design pattern that divides the system into layers (Domain, Use Cases, Infrastructure, UI).
- **Result Pattern**: A pattern where functions return an `{ success, value, error }` object instead of throwing exceptions.
- **Composition Root**: The single place where all system dependencies are instantiated and assembled (`@legacys-end/game-app`).
- **Reactive Controller**: A Lit pattern for extracting logic from a component.
- **Accessor**: The keyword for TC39 decorators used to define reactive class properties.
- **Port**: An interface defined by the Use Cases layer describing what the business logic needs from infrastructure.
- **Signal**: A reactive primitive (`@lit-labs/signals`) used in the Infrastructure layer to bridge pure domain data with the reactive UI.
- **ContentAdapter**: An Infrastructure adapter that merges JSON data and `.messages.js` text files into complete Domain Entities.
- **Lit Context** (`@lit/context`): The DI mechanism used by the Composition Root to provide Use Cases and Services to UI components.
- **Content Package** (`@legacys-end/content`): A data-only package containing quest definitions (JSON) and translatable text (`.messages.js`).

## 4. AI Tools

- **Rulesync**: A tool to synchronize and apply consistent development rules.
- **Serena**: An MCP server that provides semantic code analysis.
- **Skill (AI Skill)**: A specialized capability that the agent can activate.
