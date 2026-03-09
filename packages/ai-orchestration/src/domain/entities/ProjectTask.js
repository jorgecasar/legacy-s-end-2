/**
 * Domain Entity representing a task within a Project Board.
 */
export class ProjectTask {
  constructor(data) {
    const { id, number, title, status, phase, priority, type = "Issue", fields } = data;
    this.id = id;
    this.number = number;
    this.title = title;
    this.status = status || fields?.Status || "";
    this.phase = phase || fields?.Phase || "";
    this.priority = priority || fields?.Priority || "";
    this.type = type;
  }

  /**
   * Determines if the task is currently active (being worked on or reviewed).
   */
  isActive() {
    return ["In progress", "In review"].includes(this.status);
  }

  /**
   * Determines if the task is ready to be picked up.
   */
  isSelectable() {
    return this.status === "Ready";
  }

  /**
   * Calculates a numeric priority score for sorting.
   * Lower score = Higher priority.
   */
  getPriorityScore() {
    const phaseMap = { "Phase 1": 1, "Phase 2": 2, "Phase 3": 3, "Phase 4": 4 };
    const priorityMap = { P0: 0, P1: 1, P2: 2 };

    // If phase is missing, it's untriaged, put it at the end (very high score)
    const phaseScore = phaseMap[this.phase] || 100;

    // Priority score: P0 (0) should be lower than P1 (1)
    const priorityScore = priorityMap[this.priority] ?? 10;

    // Phase is the primary tie-breaker, then priority.
    // Phase 1 P0 = 1 * 1000 + 0 = 1000
    // Phase 1 P1 = 1 * 1000 + 1 = 1001
    // Untriaged = 100 * 1000 + 10 = 100010
    return phaseScore * 1000 + priorityScore;
  }
}
