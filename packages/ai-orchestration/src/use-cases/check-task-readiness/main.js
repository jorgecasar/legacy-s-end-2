export async function checkTaskReadiness(
  gitProvider,
  { owner, repo, issueNumber },
  onStart = (_args) => {},
  onStatus = (_args) => {},
) {
  onStart({ issueNumber });
  try {
    const issue = await gitProvider.getIssue(owner, repo, issueNumber);

    const body = issue.body || "";
    const blockerMatches = [...body.matchAll(/(?:depends on|blocked by)\s+#(\d+)/gi)];
    const filterBlockerIds = blockerMatches.map((m) => parseInt(m[1], 10));

    const blockerIds = [...new Set(filterBlockerIds)];
    const openBlockers = [];

    for (const blockerId of blockerIds) {
      try {
        const blockerIssue = await gitProvider.getIssue(owner, repo, blockerId);
        if (blockerIssue.state === "open") {
          openBlockers.push(blockerIssue);
        }
      } catch (err) {
        onStatus({
          type: "warning",
          message: `Could not fetch blocker issue #${blockerId}: ${err.message}. Skipping check for this specific dependency.`,
        });
      }
    }

    if (openBlockers.length > 0) {
      const ids = openBlockers.map((b) => `#${b.number}`).join(", ");
      return {
        success: true,
        value: {
          ready: false,
          reason: `Blocked by open issues: ${ids}`,
          openBlockers: openBlockers.map((b) => b.number),
        },
      };
    }

    return { success: true, value: { ready: true } };
  } catch (error) {
    if (error.status === 404) {
      return {
        success: true,
        value: {
          ready: true,
          warning: "Dependency API not found or issue not present. Proceeding with caution.",
        },
      };
    }
    return {
      success: false,
      error: `Failed to check task readiness: ${error.message}`,
    };
  }
}
