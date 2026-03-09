import { calculateCost } from "../../domain/pricing.js";
import { checkTaskReadiness } from "../check-task-readiness/main.js";
import { removePlannerMetadata } from "../plan-issue/main.js";
import { isAIReport } from "../shared/ContextFilters.js";
import { removeCostReport } from "../track-cost-report/main.js";
import { implementIssue } from "./main.js";

/**
 * Orchestrates the developer workflow for an issue.
 *
 * @param {object} params
 * @param {import('../../domain/ports/ICIProvider.js').ICIProvider} params.ciProvider
 * @param {import('../../domain/ports/IGitProvider.js').IGitProvider} params.gitProvider
 * @param {import('../../domain/ports/IAIProvider.js').IAIProvider} params.aiProvider
 * @param {import('../../domain/ports/IGitClient.js').IGitClient} params.gitClient
 * @param {any} params.fileExecutor - The file executor service (injected)
 * @param {string} params.model
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {any} params.payload
 * @param {number} params.maxInputTokens
 * @param {number} params.maxOutputTokens
 * @param {boolean} params.simulationMode
 * @param {boolean} params.useMock
 * @param {import('../../domain/ports/IGitProvider.js').IGitProvider} [params.privilegedGitProvider] - Privileged provider (PAT) for PR creation.
 * @returns {Promise<{ success: boolean, value?: any, error?: string }>}
 */
export async function DeveloperWorkflow({
  ciProvider,
  gitProvider,
  aiProvider,
  gitClient,
  fileExecutor,
  model,
  owner,
  repo,
  payload,
  maxInputTokens,
  maxOutputTokens,
  simulationMode,
  useMock,
  privilegedGitProvider,
}) {
  try {
    const manualIssueNumber = ciProvider.getInput("issue_number");
    const issueNumber = manualIssueNumber
      ? parseInt(manualIssueNumber, 10)
      : payload.issue?.number || payload.pull_request?.number;

    let context = payload.comment?.body || payload.issue?.body || "";
    context = removeCostReport(context).value;
    context = removePlannerMetadata(context).value;

    let issueTitle = payload.issue?.title || "";
    let prBranch = null;
    let issue = null;
    let standardComments = [];
    let reviewComments = [];
    let reviewSummaries = [];

    if (issueNumber) {
      try {
        issue = await gitProvider.getIssue(owner, repo, issueNumber);
        issueTitle = issue.title || issueTitle;

        let linkedPullNumber = issue.pull_request ? issueNumber : null;

        // If it's a PR, get the branch name
        if (issue.pull_request) {
          try {
            const prMetadata = await gitProvider.getPullRequestMetadata(owner, repo, issueNumber);
            prBranch = prMetadata.head?.ref;
            if (prBranch) {
              ciProvider.info(`[Developer] Detected PR branch: ${prBranch}`);
            }
          } catch (prErr) {
            ciProvider.warning(`Failed to fetch PR metadata: ${prErr.message}`);
          }
        } else {
          // Check if there is a PR for the expected branch
          const expectedBranch = `feat/issue-${issueNumber}`;
          try {
            const prs = await gitProvider.listPullRequests(owner, repo, {
              head: `${owner}:${expectedBranch}`,
              state: "open",
            });
            if (prs.length > 0) {
              const pr = prs[0];
              prBranch = pr.head?.ref;
              linkedPullNumber = pr.number;
              ciProvider.info(
                `Found linked PR #${linkedPullNumber} for branch ${prBranch}. Including PR context for reviews.`,
              );
            }
          } catch (err) {
            ciProvider.info(`PR search by branch failed: ${err.message}`);
          }
        }

        ciProvider.info(`Fetching comments for issue #${issueNumber} to build full context...`);
        const commentsList = await gitProvider.listComments(owner, repo, issueNumber);
        standardComments = commentsList
          .filter((c) => {
            const body = c.body || "";
            // Skip bot reports to reduce context noise (by signature, independent of username)
            const isAIReportResult = isAIReport(body);
            return !isAIReportResult;
          })
          .map((c) => {
            let cleanBody = removeCostReport(c.body || "").value;
            cleanBody = removePlannerMetadata(cleanBody).value;

            return cleanBody ? `[Comment by ${c.user?.login || "unknown"}]:\n${cleanBody}` : null;
          })
          .filter(Boolean);
        ciProvider.info(`Found ${standardComments.length} standard comments.`);

        // Fetch Review Comments if it's a PR (Reviewer feedback on specific lines)

        // Try to fetch reviews if it's a PR or if we found a linked one
        if (linkedPullNumber) {
          try {
            ciProvider.info(`Fetching review comments for PR #${linkedPullNumber}...`);
            const reviews = await gitProvider.listReviewComments(owner, repo, linkedPullNumber);
            reviewComments = reviews
              .map((c) => {
                const body = c.body || "";
                if (isAIReport(body)) return null;

                let cleanBody = removeCostReport(body).value;
                cleanBody = removePlannerMetadata(cleanBody).value;
                return cleanBody
                  ? `[Review Comment on ${c.path} L${c.line} by ${c.user?.login || "unknown"}]:\n${cleanBody}`
                  : null;
              })
              .filter(Boolean);
            ciProvider.info(`Found ${reviewComments.length} review comments.`);
          } catch (err) {
            ciProvider.info(`No review comments found or not a PR: ${err.message}`);
          }

          // Fetch Review Summaries (APPROVE/REQUEST_CHANGES top-level bodies)
          try {
            ciProvider.info(`Fetching review summaries for #${issueNumber}...`);
            const reviews = await gitProvider.listReviews(owner, repo, issueNumber);
            reviewSummaries = reviews
              .map((r) => {
                const body = r.body || "";
                if (isAIReport(body)) return null;

                let cleanBody = removeCostReport(body).value;
                cleanBody = removePlannerMetadata(cleanBody).value;
                return cleanBody
                  ? `[Review Summary (${r.state}) by ${r.user?.login || "unknown"}]:\n${cleanBody}`
                  : null;
              })
              .filter(Boolean);
            ciProvider.info(`Found ${reviewSummaries.length} review summaries.`);
          } catch (err) {
            ciProvider.info(`No review summaries found or not a PR: ${err.message}`);
          }
        }
      } catch (err) {
        ciProvider.warning(`Failed to fetch full issue context: ${err.message}`);
      }
    }

    const allCommentsText = [...standardComments, ...reviewSummaries, ...reviewComments].join(
      "\n\n---\n\n",
    );

    let cleanIssueBody = removeCostReport(issue?.body || "").value;
    cleanIssueBody = removePlannerMetadata(cleanIssueBody).value;

    let parentContext = "";
    const parentMatch = issue?.body?.match(/Sub-task of #(\d+)/i);
    if (parentMatch) {
      const parentId = parseInt(parentMatch[1], 10);
      try {
        ciProvider.info(
          `[Developer] Detected sub-task. Bridging parent context from #${parentId}...`,
        );
        const parentIssue = await gitProvider.getIssue(owner, repo, parentId);
        let cleanParentBody = removeCostReport(parentIssue.body || "").value;
        cleanParentBody = removePlannerMetadata(cleanParentBody).value;
        parentContext = `\n\n--- PARENT MASTER PLAN (#${parentId}) ---\n${cleanParentBody}\n`;
      } catch (err) {
        ciProvider.warning(`Failed to fetch parent issue #${parentId}: ${err.message}`);
      }
    }

    context = `Issue Description:\n${cleanIssueBody}${parentContext}\n\n---\n\n${allCommentsText}\n\n---\n\nTriggering Context:\n${context}`;

    if (!issueNumber) {
      return {
        success: false,
        error: "Could not determine issue or PR number from GitHub context for developer.",
      };
    }

    // Blocker Check (Algorithm 7.5)
    const readinessResult = await checkTaskReadiness(
      gitProvider,
      { owner, repo, issueNumber },
      ({ issueNumber: num }) => {
        ciProvider.info(`[Selector] Checking readiness for issue #${num}...`);
      },
      ({ message }) => {
        ciProvider.info(`[Selector] ${message}`);
      },
    );

    if (!readinessResult.success) {
      return readinessResult;
    }

    if (!readinessResult.value.ready) {
      ciProvider.warning(`Skipping task #${issueNumber}: ${readinessResult.value.reason}`);
      return {
        success: true,
        value: { skipped: true, reason: readinessResult.value.reason },
      };
    }

    if (readinessResult.value.warning) {
      ciProvider.info(`[Selector] ${readinessResult.value.warning}`);
    } else {
      ciProvider.info(`[Selector] Issue #${issueNumber} is READY.`);
    }

    // Configurable git author
    const gitAuthorName = ciProvider.getInput("git_author_name") || "github-actions[bot]";
    const gitAuthorEmail =
      ciProvider.getInput("git_author_email") || "github-actions[bot]@users.noreply.github.com";

    // Branch management: checkout existing branch and rebase on main
    if (!useMock) {
      const devBranchName = prBranch || `feat/issue-${issueNumber}`;
      gitClient.configAuthor(gitAuthorName, gitAuthorEmail);

      ciProvider.info("Fetching latest main and refreshing state...");
      // Ensure we have the latest main to rebase or branch from
      try {
        gitClient.fetch("origin", "main");
      } catch (err) {
        ciProvider.warning(`Git fetch failed: ${err.message}. Proceeding with local main.`);
      }

      const branchExists = gitClient.branchExistsRemotely(devBranchName);

      if (branchExists) {
        ciProvider.info(
          `Branch "${devBranchName}" exists remotely. Checking out and rebasing on origin/main...`,
        );
        gitClient.checkout(devBranchName, false, true); // force: true
        const rebaseResult = gitClient.rebase("origin/main");
        if (rebaseResult.success) {
          ciProvider.info("Rebase on origin/main successful.");
        } else {
          ciProvider.warning(
            "Rebase failed (conflicts). Staying on branch as-is to preserve prior work.",
          );
          gitClient.abortRebase();
        }
      } else {
        ciProvider.info(
          `Branch "${devBranchName}" does not exist remotely. Creating from origin/main.`,
        );
        // Ensure we are on main and up to date before creating the new branch
        gitClient.checkout("main");
        try {
          gitClient.resetHard("FETCH_HEAD");
        } catch {
          /* ignore reset errors */
        }
        gitClient.checkout(devBranchName, true /* create */);
      }
    }

    const customSystemPrompt = ciProvider.getInput("developer_system_prompt");
    const customUserPrompt = ciProvider.getInput("developer_user_prompt");

    let iteration = 0;
    const maxIterations = 5;
    let currentContext = context;
    let verifySuccess = false;

    while (iteration < maxIterations) {
      iteration++;
      const logPrefix = simulationMode ? "SIMULATION" : "EXECUTION";
      const iterSuffix = maxIterations > 1 ? ` (Iteration ${iteration}/${maxIterations})` : "";

      const result = await implementIssue({
        aiProvider,
        model,
        repo,
        issueNumber,
        context: currentContext,
        customSystemPrompt,
        customUserPrompt,
        maxInputTokens,
        maxOutputTokens,
        onStart: ({ systemPrompt, userPrompt }) => {
          ciProvider.info(`--- AI ${logPrefix} (DEVELOPER)${iterSuffix} ---`);
          ciProvider.info(`Issue/PR: #${issueNumber} in ${owner}/${repo}`);
          ciProvider.info(`SYSTEM PROMPT:\n${systemPrompt}`);
          ciProvider.info(`USER PROMPT:\n${userPrompt}`);
          ciProvider.info("---------------------------------------");
        },
      });

      if (!result.success) {
        return result;
      }

      const { usage, response } = result.value;
      const costResult = calculateCost(model, usage);
      const costs = costResult.value;
      ciProvider.info(
        `[Cost] AI Developer (${model}) used ${usage.total_tokens} tokens. Estimated cost: $${costs.total_cost} ${costs.currency}`,
      );

      ciProvider.info(`REAL RESPONSE:\n${response}`);
      ciProvider.info(`REAL USAGE: ${JSON.stringify(usage, null, 2)}`);
      ciProvider.info(`ESTIMATED API COST: $${costs.total_cost} ${costs.currency}`);
      ciProvider.info("---------------------------------------");

      // Execute file changes autonomously
      ciProvider.info("[FileExecutor] Searching for file changes in AI response...");
      const changesCount = await fileExecutor.execute(response, ciProvider);
      if (changesCount > 0) {
        ciProvider.info(`[FileExecutor] Successfully applied ${changesCount} file changes.`);
      }

      // Verification logic
      ciProvider.info(`Verification step${iterSuffix}: running linters and tests...`);
      if (gitClient) {
        const verification = gitClient.runVerification();
        verifySuccess = verification.success;

        if (verifySuccess) {
          ciProvider.info("Verification successful!");
          break;
        }

        ciProvider.warning(`Verification failed${iterSuffix}. Output:\n${verification.output}`);

        if (iteration < maxIterations) {
          ciProvider.info("Feeding errors back to AI for next iteration...");
          currentContext = `${context}\n\n### Previous Attempt Feedback:\n${verification.output}\n\nPlease fix the errors above and provide the corrected code.`;
        } else {
          ciProvider.error("Max iterations reached. Verification still failing.");
        }
      } else {
        verifySuccess = true; // No git client, assume success (e.g. simulation without git)
        break;
      }
    }

    if (gitClient) {
      try {
        if (gitClient.hasChanges()) {
          ciProvider.info("Changes detected. Proceeding to commit...");

          const branchName = verifySuccess
            ? `feat/issue-${issueNumber}`
            : `feat/ai-backup-issue-${issueNumber}`;

          // Commit message: describe work done + reference the issue
          const safeTitle = issueTitle
            ? issueTitle
                .toLowerCase()
                .replace(/[^a-z0-9 ]/g, "")
                .trim()
            : `implement issue #${issueNumber}`;
          const commitMsg = verifySuccess
            ? `feat: ${safeTitle} (#${issueNumber})`
            : `chore(ai): backup broken code for #${issueNumber} [skip ci]`;

          // Create or switch to branch only if not already on it
          const currentBranch = gitClient.getCurrentBranch();
          if (currentBranch !== branchName) {
            gitClient.checkout(branchName, true /* create */);
          }

          gitClient.stageAll();

          // Squash all branch commits into a single commit
          try {
            gitClient.squashOnto("main");
            gitClient.commit(commitMsg);
          } catch {
            // Fallback: normal commit if squash fails (e.g., no common ancestor)
            gitClient.commit(commitMsg);
          }

          gitClient.pushForce(branchName);

          if (verifySuccess) {
            ciProvider.info(`Creating PR for issue #${issueNumber}`);

            // Use privileged provider if available to trigger other workflows (like AI Reviewer)
            const prProvider = privilegedGitProvider || gitProvider;

            await prProvider.createPullRequest(
              owner,
              repo,
              commitMsg,
              branchName,
              "main",
              `Resolves #${issueNumber}`,
            );
            ciProvider.info(`Successfully created Pull Request for issue #${issueNumber}`);
          } else {
            ciProvider.info(`Pipeline failed. Work saved to fallback branch: ${branchName}`);
          }
        } else {
          ciProvider.info("No changes to verify or commit.");
        }
      } catch (err) {
        ciProvider.warning("Git or PR operations failed: " + err.message);
      }
    } else {
      ciProvider.info(
        `[Simulation Mode] Skipping test execution, branching, and PR creation for #${issueNumber}.`,
      );
    }

    return { success: true, value: { issueNumber, verifySuccess } };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
