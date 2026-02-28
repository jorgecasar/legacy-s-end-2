/**
 * Task Selector Utility
 * Implements the algorithm from Doc 16 §7.5 to verify task readiness.
 */

export async function checkTaskReadiness(gitProvider, { owner, repo, issueNumber }) {
  try {
    // 1. Fetch the issue to parse its body for blockers
    const issue = await gitProvider.getIssue(owner, repo, issueNumber);

    const body = issue.body || "";
    const blockerMatches = [...body.matchAll(/(?:depends on|blocked by)\s+#(\d+)/gi)];
    const filterBlockerIds = blockerMatches.map((m) => parseInt(m[1], 10));

    // Deduplicate IDs
    const blockerIds = [...new Set(filterBlockerIds)];
    const openBlockers = [];

    for (const blockerId of blockerIds) {
      try {
        const blockerIssue = await gitProvider.getIssue(owner, repo, blockerId);

        if (blockerIssue.state === "open") {
          openBlockers.push(blockerIssue);
        }
      } catch (err) {
        console.warn(`[Selector] Could not fetch blocker #${blockerId}:`, err.message);
      }
    }

    if (openBlockers.length > 0) {
      const ids = openBlockers.map((b) => `#${b.number}`).join(", ");
      console.warn(`[Selector] Issue #${issueNumber} is BLOCKED by: ${ids}`);
      return {
        ready: false,
        reason: `Blocked by open issues: ${ids}`,
      };
    }

    // 2. Additional custom checks (labels, milestone) could go here
    // For now, we assume if it's not blocked by native dependencies, it's ready for test simulation.

    console.log(`[Selector] Issue #${issueNumber} is READY.`);
    return { ready: true };
  } catch (error) {
    if (error.status === 404) {
      // If the dependencies API is not available or issue not found, we fall back to a "safe" assumption
      console.log(
        `[Selector] Dependency API not found or issue not present. Proceeding with caution.`,
      );
      return { ready: true };
    }
    throw error;
  }
}
