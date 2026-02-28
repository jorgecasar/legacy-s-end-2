import { calculateCost } from "../../domain/pricing.js";

const REPORT_SIGNATURE = "<!-- ai-usage-report -->";

/**
 * Updates or creates a cost tracking comment on a GitHub issue/PR.
 */
export async function trackCostReport(
  gitProvider,
  { owner, repo, issueNumber, agent, provider, usage, model },
) {
  const costs = calculateCost(provider, usage, model);
  const displayModel = model || provider;
  const newRow = `| ${agent} | ${displayModel} | ${usage.prompt_tokens || 0} | ${usage.completion_tokens || 0} | $${costs.total_cost.toFixed(6)} |`;

  // Simulation for tests
  if (process.env.NODE_ENV === "test") {
    console.log(`[COST REPORT SIMULATION] Updating table with: ${newRow}`);
    return;
  }

  try {
    const comments = await gitProvider.listComments(owner, repo, issueNumber);

    const reportComment = comments.find((c) => c.body.includes(REPORT_SIGNATURE));

    let body;
    if (reportComment) {
      const lines = reportComment.body.split("\n");
      // Find valid table data rows, excluding header, separator, and existing Total row
      const dataRows = lines.filter(
        (l) =>
          l.startsWith("|") &&
          !l.includes("Agent") &&
          !l.includes("---") &&
          !l.toLowerCase().includes("total"),
      );

      // Extract existing rows and calculate new total
      let currentTotal = 0;
      const filteredRows = dataRows.map((row) => {
        const parts = row
          .split("|")
          .map((p) => p.trim())
          .filter(Boolean);
        // Cost is in the 5th column (index 4)
        const costStr = parts[4]?.replace("$", "").replace("**", "") || "0";
        const cost = parseFloat(costStr);
        if (!Number.isNaN(cost)) {
          currentTotal += cost;
        }
        return row;
      });

      currentTotal += costs.total_cost;

      // Rebuild body
      body = [
        REPORT_SIGNATURE,
        "## 💰 AI Usage & Cost Report",
        "",
        "| Agent | Model | In Tokens | Out Tokens | Cost (USD) |",
        "| :--- | :--- | :--- | :--- | :--- |",
        ...filteredRows,
        newRow,
        `| **Total** | | | | **$${currentTotal.toFixed(6)}** |`,
        "",
        "_Updated automatically by AI Orchestration_",
      ].join("\n");

      await gitProvider.updateComment(owner, repo, reportComment.id, body);
    } else {
      // Create new report
      body = [
        REPORT_SIGNATURE,
        "## 💰 AI Usage & Cost Report",
        "",
        "| Agent | Model | In Tokens | Out Tokens | Cost (USD) |",
        "| :--- | :--- | :--- | :--- | :--- |",
        newRow,
        `| **Total** | | | | **$${costs.total_cost.toFixed(6)}** |`,
        "",
        "_Updated automatically by AI Orchestration_",
      ].join("\n");

      await gitProvider.createComment(owner, repo, issueNumber, body);
    }
  } catch (error) {
    console.error("Failed to update cost tracking comment:", error.message);
  }
}
