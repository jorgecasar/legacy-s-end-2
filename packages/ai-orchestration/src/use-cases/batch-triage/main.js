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

    // 2. Fetch current project items to identify what's missing
    onStatus({ message: "Fetching current project board items..." });
    const projectItems = await projectManager.getProjectItems(projectId);
    const existingIssueNumbers = new Set(projectItems.map((i) => i.number));

    const untriagedIssues = allIssues.filter((i) => !existingIssueNumbers.has(i.number));

    if (untriagedIssues.length === 0) {
      return { success: true, value: { count: 0, message: "Backlog is already fully triaged." } };
    }

    onStatus({ message: `Found ${untriagedIssues.length} issues to triage.` });

    let triagedCount = 0;
    for (const issue of untriagedIssues) {
      onStatus({ message: `Triaging issue #${issue.number}: ${issue.title}...` });

      // 3. Ask AI for Triage (Phase & Priority)
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
        if (!match) {
          throw new Error("AI response did not contain a valid JSON block.");
        }
        const triage = JSON.parse(match[0]);

        // 4. Add to Project Board
        const itemId = await projectManager.addItemToProject(projectId, issue.node_id);

        // 5. Update Custom Fields
        await projectManager.updateCustomField(projectId, itemId, "Phase", triage.phase);
        await projectManager.updateCustomField(projectId, itemId, "Priority", triage.priority);
        // Set initial status to Backlog
        await projectManager.updateItemStatus(projectId, itemId, "Backlog");

        triagedCount++;
      } catch (err) {
        console.error(`Failed to triage issue #${issue.number}: ${err.message}`);
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
