import { calculateCost } from "../../domain/pricing.js";

export const REPORT_SIGNATURE = "<!-- ai-usage-report -->";

/**
 * Removes the cost report block from a text string.
 * @param {string} text
 * @returns {string}
 */
export function removeCostReport(text) {
  if (!text) return "";

  // 1. Surgical removal if markers exist
  const markerRegex = /<!-- ai-cost-report-start -->[\s\S]*?<!-- ai-cost-report-end -->/g;
  let cleanText = text.replace(markerRegex, "\n");

  // 2. Fallback: Search for the report header and signature
  const contentRegex =
    /## 💰 AI Usage & Cost Report[\s\S]*?_Updated automatically by AI Orchestration_/g;
  cleanText = cleanText.replace(contentRegex, "\n");

  // 3. Robust cleanup of rogue markers
  cleanText = cleanText.replace(/<!-- ai-usage-report -->/g, "");
  cleanText = cleanText.replace(/<!-- ai-triage-end -->/g, "");

  // 4. Collapse consecutive newlines to a single one and trim
  cleanText = cleanText.replace(/\n{2,}/g, "\n");

  return cleanText.trim();
}

/**
 * Updates or creates a cost tracking comment on a GitHub issue/PR.
 * @returns {Promise<{ success: boolean, value?: { body: string, isUpdate: boolean, commentId?: number }, error?: string }>}
 */
export async function trackCostReport(
  gitProvider,
  { owner, repo, issueNumber, agent, provider, usage, model },
) {
  const costs = calculateCost(model, usage);
  const displayModel = model || provider;
  const newRow = `| ${agent} | ${displayModel} | ${usage.prompt_tokens || 0} | ${usage.completion_tokens || 0} | $${costs.total_cost.toFixed(6)} |`;

  try {
    const comments = await gitProvider.listComments(owner, repo, issueNumber);
    const reportComment = comments.find((c) => c.body?.includes(REPORT_SIGNATURE));

    let body;
    let isUpdate = false;
    let commentId;

    if (reportComment) {
      const lines = reportComment.body.split("\n");
      const dataRows = lines.filter(
        (l) =>
          l.startsWith("|") &&
          !l.includes("Agent") &&
          !l.includes("---") &&
          !l.toLowerCase().includes("total") &&
          !l.includes("<!--"),
      );

      let currentTotal = 0;
      const filteredRows = dataRows.map((row) => {
        const parts = row
          .split("|")
          .map((p) => p.trim())
          .filter(Boolean);
        const costStr = parts[4]?.replace("$", "").replace("**", "") || "0";
        const cost = parseFloat(costStr);
        if (!Number.isNaN(cost)) {
          currentTotal += cost;
        }
        return row;
      });

      currentTotal += costs.total_cost;

      body = [
        "<!-- ai-cost-report-start -->",
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
        "---",
        "<!-- ai-cost-report-end -->",
      ].join("\n");

      try {
        await gitProvider.updateComment(owner, repo, reportComment.id, body);
        isUpdate = true;
        commentId = reportComment.id;
      } catch (err) {
        // If update fails (e.g. permission issue), fallback to creating a new comment
        console.warn(
          `[CostReport] Failed to update existing comment #${reportComment.id}: ${err.message}. Creating a new one instead.`,
        );
        await gitProvider.createComment(owner, repo, issueNumber, body);
        isUpdate = false;
      }
    } else {
      body = [
        "<!-- ai-cost-report-start -->",
        REPORT_SIGNATURE,
        "## 💰 AI Usage & Cost Report",
        "",
        "| Agent | Model | In Tokens | Out Tokens | Cost (USD) |",
        "| :--- | :--- | :--- | :--- | :--- |",
        newRow,
        `| **Total** | | | | **$${costs.total_cost.toFixed(6)}** |`,
        "",
        "_Updated automatically by AI Orchestration_",
        "---",
        "<!-- ai-cost-report-end -->",
      ].join("\n");

      await gitProvider.createComment(owner, repo, issueNumber, body);
    }

    return {
      success: true,
      value: { body, isUpdate, commentId },
    };
  } catch (error) {
    const isPermissionError =
      error.message?.includes("Resource not accessible") ||
      error.status === 403 ||
      error.status === 404;

    if (isPermissionError) {
      return {
        success: false,
        error: `Cost tracking skipped: GITHUB_TOKEN lacks 'issues:write' permissions to post the report.`,
      };
    }

    return {
      success: false,
      error: `Failed to update cost tracking comment: ${error.message}`,
    };
  }
}
