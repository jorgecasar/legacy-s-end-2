import { Project } from "../../domain/entities/Project.js";

/**
 * Use Case: Select the most appropriate next task based on Kanban priority.
 *
 * @param {object} dependencies
 * @param {import('../../domain/ports/IProjectManager.js').IProjectManager} dependencies.projectManager
 * @param {import('../../domain/ports/IGitProvider.js').IGitProvider} dependencies.gitProvider
 * @param {string} dependencies.owner
 * @param {string} dependencies.repo
 * @param {string} dependencies.projectId
 * @param {number} [dependencies.wipLimit=5]
 * @param {(status: {message: string, [key: string]: any}) => void} [dependencies.onStatus]
 * @returns {Promise<{ success: boolean, value?: any, error?: string }>}
 */
export async function selectNextTask({
  projectManager,
  gitProvider,
  owner,
  repo,
  projectId,
  wipLimit = 5,
  onStatus = () => {},
}) {
  if (!owner || !repo || !projectManager) {
    return { success: false, error: "Missing required dependencies for task selection." };
  }
  try {
    // 1. Fetch current board state
    onStatus({ message: "Fetching current project board items..." });
    const rawItems = await projectManager.getProjectItems(projectId);

    // 2. Auto-Unblock Analysis: Check sub-tasks for Blocked items
    const updatedRawItems = [];
    for (const item of rawItems) {
      if (item.fields.Status === "Blocked" && item.number) {
        try {
          onStatus({ message: `Analyzing dependencies for blocked task #${item.number}...` });
          const subIssues = await gitProvider.listSubIssues(owner, repo, item.number);

          if (subIssues.length > 0 && subIssues.every((s) => s.state === "closed")) {
            onStatus({ message: `All sub-tasks for #${item.number} are closed. Unblocking...` });
            await projectManager.updateItemStatus(projectId, item.id, "Ready");
            // Create a new item object with updated status to maintain immutability
            updatedRawItems.push({
              ...item,
              fields: { ...item.fields, Status: "Ready" },
            });
            continue;
          }
        } catch (err) {
          console.error(`Failed to analyze dependencies for #${item.number}: ${err.message}`);
        }
      }
      updatedRawItems.push(item);
    }

    // 3. Hydrate Domain Entity
    const project = new Project({
      id: projectId,
      tasks: updatedRawItems,
      wipLimit,
    });

    // 4. Execute Selection Logic (Right-to-Left)
    const selectedTask = project.selectNextTask();

    // 5. Identify External Blockers (Blocked status with no sub-tasks or dependencies)
    const externallyBlocked = updatedRawItems.filter(
      (i) => i.fields.Status === "Blocked" && i.type === "Issue",
    );

    if (!selectedTask) {
      let reason = "No selectable tasks found in the 'Ready' or 'In review' columns.";

      if (!project.hasColumnCapacity("In review")) {
        reason =
          "WIP Limit reached for 'In review' column. Finish reviews before processing more feedback.";
      } else if (!project.hasColumnCapacity("In progress")) {
        reason =
          "WIP Limit reached for 'In progress' column. Finish current tasks before starting new ones.";
      }

      return {
        success: true,
        value: {
          selected: false,
          externallyBlocked,
          reason,
        },
      };
    }

    return {
      success: true,
      value: {
        selected: true,
        task: selectedTask,
        externallyBlocked,
        inProgressWIP: project.getColumnCount("In progress"),
        inReviewWIP: project.getColumnCount("In review"),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to select next task: ${error.message}`,
    };
  }
}
