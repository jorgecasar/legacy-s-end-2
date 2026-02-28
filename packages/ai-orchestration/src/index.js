import * as core from "@actions/core";
import * as github from "@actions/github";
import { execSync } from "child_process";
import { calculateCost } from "./domain/pricing.js";
import { AnthropicAdapter } from "./infrastructure/adapters/AnthropicAdapter.js";
import { GeminiAdapter } from "./infrastructure/adapters/GeminiAdapter.js";
import { GitHubAdapter } from "./infrastructure/adapters/GitHubAdapter.js";
import { MockAIAdapter } from "./infrastructure/adapters/MockAIAdapter.js";
import { MockGitHubAdapter } from "./infrastructure/adapters/MockGitHubAdapter.js";
import { OpenAIAdapter } from "./infrastructure/adapters/OpenAIAdapter.js";
import { selectBestModel } from "./infrastructure/config.js";
import { checkTaskReadiness } from "./use-cases/check-task-readiness/main.js";
import { implementIssue } from "./use-cases/implement-issue/main.js";
import { planIssue } from "./use-cases/plan-issue/main.js";
import { reviewPR } from "./use-cases/review-pr/main.js";
import { trackCostReport } from "./use-cases/track-cost-report/main.js";

async function run() {
  try {
    const role = core.getInput("agent_role", { required: true });
    const token = core.getInput("github_token", { required: true });
    const { owner, repo } = github.context.repo;

    // Detect available keys from inputs first, then env vars
    const geminiKey = core.getInput("gemini_api_key") || process.env.GEMINI_API_KEY;
    const anthropicKey = core.getInput("anthropic_api_key") || process.env.ANTHROPIC_API_KEY;
    const openaiKey = core.getInput("openai_api_key") || process.env.OPENAI_API_KEY;

    // Model Selection logic based on available keys & preferences
    const { model, provider } = selectBestModel(role.toLowerCase(), null, {
      gemini: geminiKey,
      anthropic: anthropicKey,
      openai: openaiKey,
    });

    const anyKeyFound = geminiKey || anthropicKey || openaiKey;

    // Check if any specific key is missing for the selected provider
    const isGeminiMissing = provider === "gemini" && !geminiKey;
    const isAnthropicMissing = provider === "anthropic" && !anthropicKey;
    const isOpenAIMissing = provider === "openai" && !openaiKey;

    const maxInputTokens = parseInt(core.getInput("max_input_tokens") || "200000", 10);
    const maxOutputTokens = parseInt(core.getInput("max_output_tokens") || "200000", 10);

    // Check for explicit simulation mode input
    const simulationMode = core.getInput("simulation_mode") === "true";

    // Force mock if in test environment, provider is mock, keys are missing, or explicit simulation mode
    const useMock =
      process.env.NODE_ENV === "test" ||
      simulationMode ||
      provider === "mock" ||
      !anyKeyFound ||
      isGeminiMissing ||
      isAnthropicMissing ||
      isOpenAIMissing;

    let gitProvider;
    let aiProvider;
    if (useMock) {
      core.info(`Using Mock Git and AI Providers for simulation (${model})...`);
      gitProvider = new MockGitHubAdapter();
      aiProvider = new MockAIAdapter();
    } else {
      gitProvider = new GitHubAdapter(token);
      if (provider === "gemini") {
        aiProvider = new GeminiAdapter(geminiKey);
      } else if (provider === "anthropic") {
        aiProvider = new AnthropicAdapter(anthropicKey);
      } else if (provider === "openai") {
        aiProvider = new OpenAIAdapter(openaiKey);
      } else {
        throw new Error(`Unsupported AI provider determined: ${provider}`);
      }
    }

    switch (role.toLowerCase()) {
      case "planner": {
        // Support manual trigger via workflow_dispatch input
        const manualIssueNumber = core.getInput("issue_number");
        const contextIssueNumber = github.context.payload.issue?.number;

        core.info(`[Debug] Manual Issue Number input: "${manualIssueNumber}"`);
        core.info(`[Debug] GitHub Context Issue Number: ${contextIssueNumber}`);

        const issueNumber =
          manualIssueNumber && manualIssueNumber !== ""
            ? parseInt(manualIssueNumber, 10)
            : contextIssueNumber;

        core.info(`[Debug] Resolved Issue Number: ${issueNumber}`);

        // Safety check to only run if intended (explicit label or manual/dispatch)
        const isTriageLabeled = github.context.payload.label?.name === "needs-triage";
        const isManual = github.context.eventName === "workflow_dispatch";

        if (!isTriageLabeled && !isManual && (!manualIssueNumber || manualIssueNumber === "")) {
          core.info(
            "Planner skipped: Issue not labeled 'needs-triage' and not manually triggered.",
          );
          return;
        }

        if (!issueNumber || Number.isNaN(issueNumber)) {
          throw new Error("Could not determine issue number from GitHub context for planner.");
        }

        // Fetch issue details if it was a manual trigger (context might be empty)
        let issueTitle = github.context.payload.issue?.title || "";
        let issueBody = github.context.payload.issue?.body || "";

        if (isManual && !issueTitle) {
          core.info(`Fetching details for issue #${issueNumber}...`);
          const issue = await gitProvider.getIssue(owner, repo, issueNumber);
          issueTitle = issue.title;
          issueBody = issue.body || "";
        }

        const customSystemPrompt = core.getInput("planner_system_prompt");
        const customUserPrompt = core.getInput("planner_user_prompt");

        const result = await planIssue({
          aiProvider,
          model,
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
        });

        const costs = calculateCost(provider, result.usage, model);
        core.info(
          `[Cost] AI Planner (${model}) used ${result.usage.total_tokens} tokens. Estimated cost: $${costs.total_cost} ${costs.currency}`,
        );

        await trackCostReport(gitProvider, {
          owner,
          repo,
          issueNumber,
          agent: "Planner",
          provider,
          usage: result.usage,
          model,
        });
        break;
      }
      case "developer": {
        const manualIssueNumber = core.getInput("issue_number");
        const issueNumber = manualIssueNumber
          ? parseInt(manualIssueNumber, 10)
          : github.context.payload.issue?.number || github.context.payload.pull_request?.number;

        const context =
          github.context.payload.comment?.body || github.context.payload.issue?.body || "";

        // Fetch issue title for commit messages
        let issueTitle = github.context.payload.issue?.title || "";
        if (!issueTitle && !useMock) {
          try {
            const issue = await gitProvider.getIssue(owner, repo, issueNumber);
            issueTitle = issue.title || "";
          } catch {
            /* issue title unavailable */
          }
        }

        if (!issueNumber) {
          throw new Error(
            "Could not determine issue or PR number from GitHub context for developer.",
          );
        }

        // Blocker Check (Algorithm 7.5)
        const readiness = await checkTaskReadiness(gitProvider, {
          owner,
          repo,
          issueNumber,
        });
        if (!readiness.ready) {
          core.warning(`Skipping task #${issueNumber}: ${readiness.reason}`);
          return;
        }

        // Configurable git author
        const gitAuthorName = core.getInput("git_author_name") || "github-actions[bot]";
        const gitAuthorEmail =
          core.getInput("git_author_email") || "github-actions[bot]@users.noreply.github.com";

        // Branch management: checkout existing branch and rebase on main
        if (!useMock) {
          const devBranchName = `feat/issue-${issueNumber}`;
          execSync(`git config --global user.name "${gitAuthorName}"`);
          execSync(`git config --global user.email "${gitAuthorEmail}"`);

          let branchExists = false;
          try {
            const remoteHeads = execSync(`git ls-remote --heads origin "${devBranchName}"`)
              .toString()
              .trim();
            branchExists = remoteHeads.length > 0;
          } catch {
            /* ignore - branch doesn't exist */
          }

          if (branchExists) {
            core.info(
              `Branch "${devBranchName}" exists remotely. Checking out and rebasing on main...`,
            );
            execSync(`git checkout "${devBranchName}"`, { stdio: "inherit" });

            try {
              execSync("git rebase main", { stdio: "inherit" });
              core.info("Rebase on main successful.");
            } catch {
              core.warning(
                "Rebase failed (conflicts). Staying on branch as-is to preserve prior work.",
              );
              try {
                execSync("git rebase --abort", { stdio: "inherit" });
              } catch {
                /* already aborted */
              }
              core.info(
                `Continuing on "${devBranchName}" without rebasing. Conflicts with main will be resolved at PR merge.`,
              );
            }
          } else {
            core.info(`Branch "${devBranchName}" does not exist remotely. Working from main.`);
          }
        }

        const customSystemPrompt = core.getInput("developer_system_prompt");
        const customUserPrompt = core.getInput("developer_user_prompt");

        const result = await implementIssue({
          aiProvider,
          model,
          owner,
          repo,
          issueNumber,
          context,
          customSystemPrompt,
          customUserPrompt,
          maxInputTokens,
          maxOutputTokens,
        });

        const costs = calculateCost(provider, result.usage, model);
        core.info(
          `[Cost] AI Developer (${model}) used ${result.usage.total_tokens} tokens. Estimated cost: $${costs.total_cost} ${costs.currency}`,
        );

        await trackCostReport(gitProvider, {
          owner,
          repo,
          issueNumber,
          agent: "Developer",
          provider,
          usage: result.usage,
          model,
        });

        // Verification and PR creation logic
        core.info("Verification step: running linters and tests...");
        let verifySuccess = false;

        if (!useMock) {
          try {
            execSync("npm run format || true", { stdio: "inherit" });
            execSync("npm run lint:types", { stdio: "inherit" });
            execSync("npm run lint", { stdio: "inherit" });
            execSync("npm run test", { stdio: "inherit" });
            verifySuccess = true;
          } catch (err) {
            core.warning("Verification failed: " + err.message);
            verifySuccess = false;
          }

          try {
            const status = execSync("git status --porcelain").toString().trim();
            if (status) {
              core.info("Changes detected. Proceeding to commit...");

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
              const currentBranch = execSync("git branch --show-current").toString().trim();
              if (currentBranch !== branchName) {
                try {
                  execSync(`git checkout -b "${branchName}"`);
                } catch {
                  execSync(`git checkout "${branchName}"`);
                }
              }

              execSync("git add .");

              // Squash all branch commits into a single commit
              try {
                execSync("git reset --soft main");
                execSync(`git commit --no-verify -m "${commitMsg}"`);
              } catch {
                // Fallback: normal commit if squash fails (e.g., no common ancestor)
                execSync(`git commit --no-verify -m "${commitMsg}"`);
              }

              execSync(`git push origin "${branchName}" --force`);

              if (verifySuccess) {
                core.info(`Creating PR for issue #${issueNumber}`);
                await gitProvider.createPullRequest(
                  owner,
                  repo,
                  commitMsg,
                  branchName,
                  "main",
                  `Resolves #${issueNumber}`,
                );
                core.info(`Successfully created Pull Request for issue #${issueNumber}`);
              } else {
                core.info(`Pipeline failed. Work saved to fallback branch: ${branchName}`);
              }
            } else {
              core.info("No changes to verify or commit.");
            }
          } catch (err) {
            core.warning("Git or PR operations failed: " + err.message);
          }
        } else {
          core.info(
            `[Simulation Mode] Skipping test execution, branching, and PR creation for #${issueNumber}.`,
          );
        }
        break;
      }
      case "reviewer": {
        const manualPullNumber = core.getInput("pull_number");
        const pullNumber = manualPullNumber
          ? parseInt(manualPullNumber)
          : github.context.payload.pull_request?.number || github.context.payload.issue?.number;

        if (!pullNumber) {
          throw new Error(
            "Could not determine Pull Request number from GitHub context for reviewer.",
          );
        }

        const diff = await gitProvider.getPullRequest(owner, repo, pullNumber);

        const customSystemPrompt = core.getInput("reviewer_system_prompt");
        const customUserPrompt = core.getInput("reviewer_user_prompt");

        const result = await reviewPR({
          aiProvider,
          model,
          owner,
          repo,
          pullNumber,
          diff,
          customSystemPrompt,
          customUserPrompt,
          maxInputTokens,
          maxOutputTokens,
        });

        const costs = calculateCost(provider, result.usage, model);
        core.info(
          `[Cost] AI Reviewer (${model}) used ${result.usage.total_tokens} tokens. Estimated cost: $${costs.total_cost} ${costs.currency}`,
        );

        await trackCostReport(gitProvider, {
          owner,
          repo,
          issueNumber: pullNumber,
          agent: "Reviewer",
          provider,
          usage: result.usage,
          model,
        });
        break;
      }
      default:
        throw new Error(
          `Unknown agent_role: ${role}. Valid roles are: planner, developer, reviewer.`,
        );
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
