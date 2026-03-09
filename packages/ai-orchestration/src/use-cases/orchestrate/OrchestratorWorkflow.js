import { batchTriage } from "../batch-triage/main.js";
import { selectNextTask } from "../select-next-task/main.js";

/**
 * Use Case: Master Orchestrator Workflow
 * Unifies Batch Triage and Task Selection.
 *
 * @param {object} params
 * @param {import('../../domain/ports/ICIProvider.js').ICIProvider} params.ciProvider
 * @param {import('../../domain/ports/IGitProvider.js').IGitProvider} params.gitProvider
 * @param {import('../../domain/ports/IProjectManager.js').IProjectManager} params.projectManager
 * @param {import('../../domain/ports/IAIProvider.js').IAIProvider} params.aiProvider
 * @param {string} params.model
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {string} params.projectId
 * @param {boolean} [params.simulationMode]
 * @param {number} [params.wipLimit=5]
 * @returns {Promise<{ success: boolean, value?: any, error?: string }>}
 */
export async function OrchestratorWorkflow({
  ciProvider,
  gitProvider,
  projectManager,
  aiProvider,
  model,
  owner,
  repo,
  projectId,
  simulationMode,
  wipLimit = 5,
}) {
  const isSimulation = simulationMode;

  if (!projectId) {
    if (isSimulation) {
      projectId = "SIMULATION_PROJECT_ID";
      ciProvider.info("[Simulation] Using dummy projectId for dry-run.");
    } else {
      return {
        success: false,
        error:
          "Missing projectId for Orchestrator workflow. Please provide 'project_id' input or set PROJECT_ID environment variable.",
      };
    }
  }

  try {
    ciProvider.info("--- AI ORCHESTRATOR: Phase 1 - Batch Triage ---");
    const triageResult = await batchTriage({
      gitProvider,
      projectManager,
      aiProvider,
      model,
      owner,
      repo,
      projectId,
      onStatus: (st) => ciProvider.info(st.message),
    });

    if (!triageResult.success) {
      ciProvider.warning(`Batch Triage failed: ${triageResult.error}`);
    } else {
      ciProvider.info(triageResult.value.message);
    }

    ciProvider.info("\n--- AI ORCHESTRATOR: Phase 2 - Task Selection ---");
    const selectionResult = await selectNextTask({
      projectManager,
      gitProvider,
      owner,
      repo,
      projectId,
      wipLimit,
      onStatus: (st) => ciProvider.info(st.message),
    });

    if (!selectionResult.success) {
      return selectionResult;
    }

    const { selected, task, reason, externallyBlocked } = selectionResult.value;

    if (selected) {
      ciProvider.info(`🎯 Selected Next Task: #${task.number} - ${task.title}`);
      ciProvider.info(
        `   Priority Score: ${task.getPriorityScore()} (Phase: ${task.phase}, Priority: ${task.priority})`,
      );
      ciProvider.setOutput("selected_task_number", task.number.toString());
      ciProvider.setOutput("selected_task_id", task.id);
    } else {
      ciProvider.info(`⏸️ No task selected. Reason: ${reason}`);
    }

    if (externallyBlocked && externallyBlocked.length > 0) {
      ciProvider.info(`\n🚧 Externally Blocked Tasks: ${externallyBlocked.length}`);
      for (const item of externallyBlocked) {
        ciProvider.info(`   - #${item.number}: ${item.title}`);
      }
    }

    return { success: true, value: selectionResult.value };
  } catch (error) {
    return { success: false, error: `Orchestrator workflow failed: ${error.message}` };
  }
}
