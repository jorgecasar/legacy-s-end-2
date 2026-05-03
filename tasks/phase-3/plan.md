# Implementation Plan: Phase 3 - Persistence & Navigation

## 1. Dependency Graph

- **LocalStorageAdapter (Infra)**
  - Depends on `HeroState` serialization.
- **SaveProgress (Use Case)**
  - Depends on `LocalStorageAdapter`.
- **GameStore (Infra)**
  - Depends on `SaveProgress` and `LoadProgress` use cases.
- **LeGameLevel (UI)**
  - Depends on `GameStore` for level transition logic.

## 2. Vertical Slices Strategy

1. **Persistence Slice**: Implement JSON serialization and storage adapter.
2. **Auto-save Slice**: Hook the `GameStore` to trigger saves on state changes (with throttling).
3. **Multi-Chapter Slice**: Enhance `InitializeQuest` to handle multi-chapter sequences.
4. **Localization Slice**: Configure `lit-localize` and prepare the build pipeline.

## 3. Checkpoints

- **Checkpoint A**: `HeroState` serializes/deserializes correctly without losing field integrity.
- **Checkpoint B**: Refreshing the page resumes progress from the last auto-save point.
- **Checkpoint C**: Levels transition from Chapter 1 to Chapter 2 based on level objectives.
