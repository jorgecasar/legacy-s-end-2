import { calculateCost } from "../../domain/pricing.js";
import { removePlannerMetadata } from "../plan-issue/main.js";
import { reviewPR } from "../review-pr/main.js";
import { isAIReport } from "../shared/ContextFilters.js";
import { removeCostReport, trackCostReport } from "../track-cost-report/main.js";

/**
 * Orchestrates the reviewer workflow for a Pull Request.
 *
 * @param {object} params
 * @param {import('../../domain/ports/ICIProvider.js').ICIProvider} params.ciProvider
 * @param {import('../../domain/ports/IGitProvider.js').IGitProvider} params.gitProvider
 * @param {import('../../domain/ports/IAIProvider.js').IAIProvider} params.aiProvider
 * @param {string} params.model
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {any} params.payload
 * @param {number} params.maxInputTokens
 * @param {number} params.maxOutputTokens
 * @param {boolean} params.simulationMode
 * @param {boolean} params.useMock
 * @returns {Promise<{ success: boolean, value?: any, error?: string }>}
 */
export async function ReviewerWorkflow({
  ciProvider,
  gitProvider,
  aiProvider,
  model,
  owner,
  repo,
  payload,
  maxInputTokens,
  maxOutputTokens,
  simulationMode,
  useMock,
}) {
  try {
    const manualPullNumber = ciProvider.getInput("pull_number");

    // Extract PR number from multiple possible payload locations
    const pullNumber = manualPullNumber
      ? parseInt(manualPullNumber, 10)
      : payload.pull_request?.number ||
        payload.issue?.number ||
        payload.workflow_run?.pull_requests?.[0]?.number;

    if (!pullNumber) {
      return {
        success: false,
        error: "Could not determine Pull Request number from GitHub context for reviewer.",
      };
    }

    // Fetch metadata to find the associated issue/task
    ciProvider.info(`[Reviewer] Fetching metadata for PR #${pullNumber}...`);
    const prMetadata = await gitProvider.getPullRequestMetadata(owner, repo, pullNumber);

    if (prMetadata.state === "closed") {
      ciProvider.info(`Reviewer skipped: PR #${pullNumber} is already closed.`);
      return { success: true, value: { skipped: true, reason: "PR is closed" } };
    }

    // Try to identify task number from branch (feat/issue-123) or PR body (closes #123)
    const branchMatch = prMetadata.head?.ref?.match(/issue-(\d+)/);
    const bodyMatch = prMetadata.body?.match(/(?:closes|fixes|resolves) #(\d+)/i);
    const taskNumber = branchMatch
      ? parseInt(branchMatch[1], 10)
      : bodyMatch
        ? parseInt(bodyMatch[1], 10)
        : pullNumber; // Fallback to PR if no issue found

    if (taskNumber !== pullNumber) {
      ciProvider.info(`[Reviewer] Associated task identified: #${taskNumber}`);
    } else {
      ciProvider.info(`[Reviewer] No associated task found. Reporting cost on PR #${pullNumber}.`);
    }

    ciProvider.info(`[Reviewer] Fetching diff for PR #${pullNumber} in ${owner}/${repo}...`);
    const diff = await gitProvider.getPullRequest(owner, repo, pullNumber);
    ciProvider.info(`[Reviewer] Diff fetched successfully (${diff.length} characters).`);

    // Fetch existing conversation to provide continuity and avoid repetition
    ciProvider.info(`[Reviewer] Fetching existing conversation for context...`);
    const comments = await gitProvider.listComments(owner, repo, pullNumber);
    const reviewCommentsList = await gitProvider.listReviewComments(owner, repo, pullNumber);

    const conversationContext = [...comments, ...reviewCommentsList]
      .filter((c) => {
        const body = c.body || "";
        const isAIReportResult = isAIReport(body);
        return !isAIReportResult;
      })
      .map((c) => {
        const isBot = c.user?.login?.includes("bot") || c.user?.type === "Bot";
        const author = isBot ? "AI/Bot" : c.user?.login || "unknown";
        let cleanBody = removeCostReport(c.body || "").value;
        cleanBody = removePlannerMetadata(cleanBody).value;

        const location = c.path ? ` on ${c.path} L${c.line}` : "";
        return `[${author}${location}]: ${cleanBody}`;
      })
      .join("\n\n---\n\n");

    const customSystemPrompt = ciProvider.getInput("reviewer_system_prompt");
    const customUserPrompt = ciProvider.getInput("reviewer_user_prompt");

    const logPrefix = simulationMode ? "SIMULATION" : "EXECUTION";
    const result = await reviewPR({
      aiProvider,
      model,
      repo,
      diff,
      conversationContext, // Pass the previous conversation
      customSystemPrompt,
      customUserPrompt,
      maxInputTokens,
      maxOutputTokens,
      onStart: ({ systemPrompt, userPrompt }) => {
        ciProvider.info(`--- AI ${logPrefix} (REVIEWER) ---`);
        ciProvider.info(`PR: #${pullNumber} in ${owner}/${repo}`);
        ciProvider.info(`SYSTEM PROMPT:\n${systemPrompt}`);
        ciProvider.info(`USER PROMPT:\n${userPrompt}`);
        ciProvider.info("--------------------------------------");
      },
    });

    if (!result.success) {
      return result;
    }

    const { usage, response } = result.value;
    const costResult = calculateCost(model, usage);
    const costs = costResult.value;
    ciProvider.info(
      `[Cost] AI Reviewer (${model}) used ${usage.total_tokens} tokens. Estimated cost: $${costs.total_cost} ${costs.currency}`,
    );

    ciProvider.info(`REAL RESPONSE:\n${response}`);
    ciProvider.info(`REAL USAGE: ${JSON.stringify(usage, null, 2)}`);
    ciProvider.info(`ESTIMATED API COST: $${costs.total_cost} ${costs.currency}`);
    ciProvider.info("--------------------------------------");

    // Post the review result back to the Pull Request
    ciProvider.info(`[Reviewer] Posting review comment to PR #${pullNumber}...`);
    const reviewHeader = "### 🔍 AI Architecture Review\n\n";
    const reviewFooter = "\n\n---\n_Review generated by AI Orchestration_";
    await gitProvider.createComment(
      owner,
      repo,
      pullNumber,
      `${reviewHeader}${response}${reviewFooter}`,
    );
    ciProvider.info(`[Reviewer] Review comment posted successfully.`);

    const trackResult = await trackCostReport(gitProvider, {
      owner,
      repo,
      issueNumber: taskNumber, // Use identified task number
      agent: "Reviewer",
      provider: useMock ? "mock" : "real",
      usage,
      model,
    });

    if (!trackResult.success) {
      ciProvider.warning(trackResult.error);
    } else if (useMock) {
      ciProvider.info(`[COST REPORT SIMULATION] Updating table with reviewer details.`);
    }

    return {
      success: true,
      value: { pullNumber, taskNumber, response, usage, costs },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
