import { calculateCost } from "../../domain/pricing.js";
import { removeCostReport, trackCostReport } from "../track-cost-report/main.js";
import { planIssue, removePlannerMetadata } from "./main.js";

/**
 * Orchestrates the planning workflow for an issue.
 *
 * @param {object} params
 * @param {import('../../domain/ports/ICIProvider.js').ICIProvider} params.ciProvider
 * @param {import('../../domain/ports/IGitProvider.js').IGitProvider} params.gitProvider
 * @param {import('../../domain/ports/IAIProvider.js').IAIProvider} params.aiProvider
 * @param {string[]} params.availableProviders - The list of available AI models (injected)
 * @param {string} params.model
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {any} params.payload
 * @param {string} params.eventName
 * @param {number} params.maxInputTokens
 * @param {number} params.maxOutputTokens
 * @param {boolean} params.simulationMode
 * @param {boolean} params.useMock
 * @returns {Promise<{ success: boolean, value?: any, error?: string }>}
 */
export async function PlannerWorkflow({
  ciProvider,
  gitProvider,
  aiProvider,
  availableProviders,
  model,
  owner,
  repo,
  payload,
  eventName,
  maxInputTokens,
  maxOutputTokens,
  simulationMode,
  useMock,
}) {
  try {
    // Support manual trigger via workflow_dispatch input
    const manualIssueNumber = ciProvider.getInput("issue_number");
    const contextIssueNumber = payload.issue?.number;

    ciProvider.info(`[Debug] Manual Issue Number input: "${manualIssueNumber}"`);
    ciProvider.info(`[Debug] GitHub Context Issue Number: ${contextIssueNumber}`);

    const issueNumber =
      manualIssueNumber && manualIssueNumber !== ""
        ? parseInt(manualIssueNumber, 10)
        : contextIssueNumber;

    ciProvider.info(`[Debug] Resolved Issue Number: ${issueNumber}`);

    // Safety check to only run if intended (explicit label or manual/dispatch)
    const isTriageLabeled = payload.label?.name === "needs-triage";
    const isManual = eventName === "workflow_dispatch";

    if (!isTriageLabeled && !isManual && (!manualIssueNumber || manualIssueNumber === "")) {
      ciProvider.info(
        "Planner skipped: Issue not labeled 'needs-triage' and not manually triggered.",
      );
      return { success: true, value: { skipped: true } };
    }

    if (!issueNumber || Number.isNaN(issueNumber)) {
      return {
        success: false,
        error: "Could not determine issue number from GitHub context for planner.",
      };
    }

    // Fetch issue details if it was a manual trigger (context might be empty)
    let issueTitle = payload.issue?.title || "";
    let issueBody = payload.issue?.body || "";

    if (isManual && !issueTitle) {
      ciProvider.info(`Fetching details for issue #${issueNumber}...`);
      const issue = await gitProvider.getIssue(owner, repo, issueNumber);
      issueTitle = issue.title;
      issueBody = issue.body || "";
    }

    issueTitle = removePlannerMetadata(removeCostReport(issueTitle));
    issueBody = removePlannerMetadata(removeCostReport(issueBody));

    const customSystemPrompt = ciProvider.getInput("planner_system_prompt");
    const customUserPrompt = ciProvider.getInput("planner_user_prompt");

    const logPrefix = simulationMode ? "SIMULATION" : "EXECUTION";

    const result = await planIssue({
      aiProvider,
      model,
      availableProviders,
      gitProvider,
      owner,
      repo,
      issueNumber,
      issueTitle,
      issueBody,
      customSystemPrompt,
      customUserPrompt,
      maxInputTokens,
      maxOutputTokens,
      onStart: ({ systemPrompt, userPrompt }) => {
        ciProvider.info(`--- AI ${logPrefix} (PLANNER) ---`);
        ciProvider.info(`Issue: #${issueNumber} in ${owner}/${repo}`);
        ciProvider.info(`SYSTEM PROMPT:\n${systemPrompt}`);
        ciProvider.info(`USER PROMPT:\n${userPrompt}`);
        ciProvider.info("-------------------------------------");
      },
      onStatus: ({ message }) => {
        ciProvider.info(message);
      },
    });

    if (!result.success) {
      return result;
    }

    const { usage, plan } = result.value;
    const costs = calculateCost(model, usage);
    ciProvider.info(
      `[Cost] AI Planner (${model}) used ${usage.total_tokens} tokens. Estimated cost: $${costs.total_cost} ${costs.currency}`,
    );

    ciProvider.info(`REAL RESPONSE:\n${plan}`);
    ciProvider.info(`REAL USAGE: ${JSON.stringify(usage, null, 2)}`);
    ciProvider.info(`ESTIMATED API COST: $${costs.total_cost} ${costs.currency}`);
    ciProvider.info("-------------------------------------");

    const trackResult = await trackCostReport(gitProvider, {
      owner,
      repo,
      issueNumber,
      agent: "Planner",
      provider: useMock ? "mock" : "real", // This might need refinement in pricing.js
      usage,
      model,
    });

    if (!trackResult.success) {
      ciProvider.warning(trackResult.error);
    } else if (useMock) {
      ciProvider.info(`[COST REPORT SIMULATION] Updating table with plan details.`);
    }

    return { success: true, value: { issueNumber, plan, usage, costs } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
