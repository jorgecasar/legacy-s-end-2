import { ProjectTask } from "./ProjectTask.js";

/**
 * Aggregate Root representing a Project Board.
 */
export class Project {
  constructor({ id, tasks = [], wipLimit = 5 }) {
    this.id = id;
    this.tasks = tasks.map((t) => (t instanceof ProjectTask ? t : new ProjectTask(t)));
    this.wipLimit = wipLimit; // Default limit per active column
  }

  /**
   * Returns the count of tasks in a specific column.
   */
  getColumnCount(status) {
    return this.tasks.filter((t) => t.status === status).length;
  }

  /**
   * Returns true if a specific column has capacity.
   */
  hasColumnCapacity(status) {
    return this.getColumnCount(status) < this.wipLimit;
  }

  /**
   * Implements the core Right-to-Left selection algorithm with per-column WIP guards.
   */
  selectNextTask() {
    // 1. Priority: Review (Closing work is top priority)
    const reviewTasks = this.tasks
      .filter((t) => t.status === "In review")
      .sort((a, b) => a.getPriorityScore() - b.getPriorityScore());

    // We prioritize tasks that are already in review regardless of the column capacity,
    // because addressing feedback helps move items to 'Done'.
    if (reviewTasks.length > 0) {
      return reviewTasks[0];
    }

    // 2. Priority: Ready tasks (Phase > Priority) -> Transition to 'In progress'
    // Check if 'In progress' column has capacity before selecting a new task.
    if (this.hasColumnCapacity("In progress")) {
      const readyTasks = this.tasks
        .filter((t) => t.isSelectable())
        .sort((a, b) => a.getPriorityScore() - b.getPriorityScore());

      return readyTasks[0] || null;
    }

    return null;
  }
}
