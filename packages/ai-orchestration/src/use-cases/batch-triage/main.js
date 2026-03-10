import { isAIReport } from "../shared/ContextFilters.js";

/**
 * Use Case: Triage all open issues that are not yet in the Project Board.
 * @param {object} params
 * @param {import('../../domain/ports/IGitProvider.js').IGitProvider} params.gitProvider
 * @param {import('../../domain/ports/IProjectManager.js').IProjectManager} params.projectManager
 * @param {import('../../domain/ports/IAIProvider.js').IAIProvider} params.aiProvider
 * @param {string} params.model
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {string} params.projectId
 * @param {(status: {message: string, [key: string]: any}) => void} [params.onStatus]
 */
export async function batchTriage({
  gitProvider,
  projectManager,
  aiProvider,
  model,
  owner,
  repo,
  projectId,
  onStatus = () => {},
}) {
  try {
    // 1. Fetch all open issues
    onStatus({ message: "Fetching all open issues from repository..." });
    const allIssues = await gitProvider.listIssues(owner, repo, { state: "open" });

    // 2. Fetch current project items to identify what's missing or incomplete
    onStatus({ message: "Fetching current project board items..." });
    const projectItems = await projectManager.getProjectItems(projectId, owner);

    // Check available fields in the board
    const availableFields = projectItems.length > 0 ? Object.keys(projectItems[0].fields) : [];
    const hasPhaseField = availableFields.includes("Phase");
    const hasPriorityField = availableFields.includes("Priority");

    // An issue needs triage if:
    // a) It's not in the board at all.
    // b) It's in the board but missing Priority (if the field exists).
    const issuesInBoard = new Set(projectItems.map((i) => i.number));
    const incompleteItems = projectItems
      .filter((item) => {
        // If we have a priority field, it must be filled.
        const isMissingPriority = hasPriorityField && !item.fields.Priority;
        // Phase is optional now (can be mapped to Milestone)
        const isMissingPhase = hasPhaseField && !item.fields.Phase;

        const isMissing = isMissingPriority || isMissingPhase;

        if (isMissing && item.number) {
          onStatus({
            message: `[Debug] Issue #${item.number} is missing fields: Priority(${!item.fields.Priority}), Phase(${!item.fields.Phase})`,
          });
        }
        return isMissing;
      })
      .map((i) => i.number);

    const untriagedIssues = allIssues.filter((i) => {
      const notInBoard = !issuesInBoard.has(i.number);
      const incomplete = incompleteItems.includes(i.number);
      return notInBoard || incomplete;
    });

    if (untriagedIssues.length === 0) {
      return { success: true, value: { count: 0, message: "Backlog is already fully triaged." } };
    }

    onStatus({ message: `Found ${untriagedIssues.length} issues to triage.` });

    let triagedCount = 0;
    for (const issue of untriagedIssues) {
      onStatus({ message: `Processing issue #${issue.number}: ${issue.title}...` });

      // 3. Check for existing reports in comments first
      const comments = await gitProvider.listComments(owner, repo, issue.number);
      let existingTriage = null;

      for (const comment of comments) {
        if (isAIReport(comment.body)) {
          const phaseMatch =
            comment.body.match(/-\s\*\*Phase\*\*:\s`?(Phase\s\d+)`?/i) ||
            comment.body.match(/-\s\*\*Milestone\*\*:\s`?(Phase\s\d+)`?/i);
          const priorityMatch = comment.body.match(
            /-\s\*\*Priority\*\*:\s`?(P[0-2]|priority:\s\w+)`?/i,
          );

          if (phaseMatch || priorityMatch) {
            existingTriage = {
              phase: phaseMatch ? phaseMatch[1] : "Phase 1",
              priority: priorityMatch ? priorityMatch[1].replace("priority: ", "") : "standard",
            };
            onStatus({
              message: `[Config] Found existing triage report for #${issue.number}. Skipping AI call.`,
            });
            break;
          }
        }
      }

      let triage = existingTriage;

      if (!triage) {
        onStatus({ message: `Triaging issue #${issue.number} via AI...` });
        // Ask AI for Triage (Phase & Priority)
        const prompt = `Analyze this GitHub issue and suggest a Phase (Phase 1, Phase 2, Phase 3, Phase 4) and a Priority (P0, P1, P2) based on its title and body.

        Issue #${issue.number}: ${issue.title}
        Body: ${issue.body || "No description provided."}

        Respond only with a JSON object: { "phase": "Phase X", "priority": "PY" }`;

        const aiResponse = await aiProvider.generateContent(
          model,
          "You are a Project Manager bot. Analyze issues for triage.",
          prompt,
        );

        try {
          const match = aiResponse.text.match(/\{.*\}/s);
          if (!match) throw new Error("AI response did not contain a valid JSON block.");
          triage = JSON.parse(match[0]);
        } catch (err) {
          console.error(`Failed to parse AI triage for #${issue.number}: ${err.message}`);
          continue;
        }
      }

      try {
        // 4. Add to Project Board
        const itemId = await projectManager.addItemToProject(projectId, issue.node_id, owner);

        // 5. Update Custom Fields (only if they exist in the board)
        if (hasPhaseField) {
          await projectManager.updateCustomField(projectId, itemId, "Phase", triage.phase, owner);
        }

        if (hasPriorityField) {
          await projectManager.updateCustomField(
            projectId,
            itemId,
            "Priority",
            triage.priority,
            owner,
          );
        }

        // 6. Update GitHub native Milestone if applicable (extract number from Phase)
        if (triage.phase) {
          const milestoneNumber = parseInt(triage.phase.match(/\d+/)?.[0] || "1", 10);
          try {
            await gitProvider.updateMilestone(owner, repo, issue.number, milestoneNumber);
          } catch {
            // Milestone might not exist or other API error, skip silently
          }
        }

        // Set initial status to Backlog
        await projectManager.updateItemStatus(projectId, itemId, "Backlog", owner);

        triagedCount++;
      } catch (err) {
        console.error(`Failed to link issue #${issue.number} to board: ${err.message}`);
      }
    }

    return {
      success: true,
      value: { count: triagedCount, message: `Successfully triaged ${triagedCount} issues.` },
    };
  } catch (error) {
    return { success: false, error: `Batch triage failed: ${error.message}` };
  }
}
