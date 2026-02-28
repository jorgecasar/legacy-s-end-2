import { calculateCost } from "./domain/pricing.js";
import { AnthropicAdapter } from "./infrastructure/adapters/AnthropicAdapter.js";
import { GeminiAdapter } from "./infrastructure/adapters/GeminiAdapter.js";
import { GitCliAdapter } from "./infrastructure/adapters/GitCliAdapter.js";
import { GitHubActionsAdapter } from "./infrastructure/adapters/GitHubActionsAdapter.js";
import { GitHubAdapter } from "./infrastructure/adapters/GitHubAdapter.js";
import { MockAIAdapter } from "./infrastructure/adapters/MockAIAdapter.js";
import { MockCIAdapter } from "./infrastructure/adapters/MockCIAdapter.js";
import { MockGitCliAdapter } from "./infrastructure/adapters/MockGitCliAdapter.js";
import { MockGitHubAdapter } from "./infrastructure/adapters/MockGitHubAdapter.js";
import { OpenAIAdapter } from "./infrastructure/adapters/OpenAIAdapter.js";
import { selectBestModel } from "./infrastructure/config.js";
import { checkTaskReadiness } from "./use-cases/check-task-readiness/main.js";
import { implementIssue } from "./use-cases/implement-issue/main.js";
import { planIssue } from "./use-cases/plan-issue/main.js";
import { reviewPR } from "./use-cases/review-pr/main.js";
import { trackCostReport } from "./use-cases/track-cost-report/main.js";

/**
 * Main orchestrator logic, decoupled from specific CI or Git CLI implementations.
 *
 * @param {import('./domain/ports/ICIProvider.js').ICIProvider} ciProvider 
 * @param {import('./domain/ports/IGitClient.js').IGitClient} gitClient 
 */
export async function runOrchestrator(ciProvider, gitClient) {
	try {
		const role = ciProvider.getInput("agent_role", { required: true });
		const token = ciProvider.getInput("github_token", { required: true });

		const eventContext = ciProvider.getEventContext();
		const { owner, repo } = eventContext;
		const { payload, eventName } = eventContext;

		// Detect available keys from inputs first, then env vars
		const geminiKey = ciProvider.getInput("gemini_api_key") || process.env.GEMINI_API_KEY;
		const anthropicKey = ciProvider.getInput("anthropic_api_key") || process.env.ANTHROPIC_API_KEY;
		const openaiKey = ciProvider.getInput("openai_api_key") || process.env.OPENAI_API_KEY;

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

		const maxInputTokens = parseInt(ciProvider.getInput("max_input_tokens") || "200000", 10);
		const maxOutputTokens = parseInt(ciProvider.getInput("max_output_tokens") || "200000", 10);

		// Check for explicit simulation mode input
		const simulationMode = ciProvider.getInput("simulation_mode") === "true";

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
			ciProvider.info(`Using Mock Git and AI Providers for simulation (${model})...`);
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
					return;
				}

				if (!issueNumber || Number.isNaN(issueNumber)) {
					throw new Error("Could not determine issue number from GitHub context for planner.");
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

				const customSystemPrompt = ciProvider.getInput("planner_system_prompt");
				const customUserPrompt = ciProvider.getInput("planner_user_prompt");

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
				ciProvider.info(
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
				const manualIssueNumber = ciProvider.getInput("issue_number");
				const issueNumber = manualIssueNumber
					? parseInt(manualIssueNumber, 10)
					: payload.issue?.number || payload.pull_request?.number;

				const context = payload.comment?.body || payload.issue?.body || "";

				// Fetch issue title for commit messages
				let issueTitle = payload.issue?.title || "";
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
					ciProvider.warning(`Skipping task #${issueNumber}: ${readiness.reason}`);
					return;
				}

				// Configurable git author
				const gitAuthorName = ciProvider.getInput("git_author_name") || "github-actions[bot]";
				const gitAuthorEmail =
					ciProvider.getInput("git_author_email") || "github-actions[bot]@users.noreply.github.com";

				// Branch management: checkout existing branch and rebase on main
				if (!useMock) {
					const devBranchName = `feat/issue-${issueNumber}`;
					gitClient.configAuthor(gitAuthorName, gitAuthorEmail);

					const branchExists = gitClient.branchExistsRemotely(devBranchName);

					if (branchExists) {
						ciProvider.info(
							`Branch "${devBranchName}" exists remotely. Checking out and rebasing on main...`,
						);
						gitClient.checkout(devBranchName);

						const rebaseResult = gitClient.rebase("main");
						if (rebaseResult.success) {
							ciProvider.info("Rebase on main successful.");
						} else {
							ciProvider.warning(
								"Rebase failed (conflicts). Staying on branch as-is to preserve prior work.",
							);
							gitClient.abortRebase();
							ciProvider.info(
								`Continuing on "${devBranchName}" without rebasing. Conflicts with main will be resolved at PR merge.`,
							);
						}
					} else {
						ciProvider.info(`Branch "${devBranchName}" does not exist remotely. Working from main.`);
					}
				}

				const customSystemPrompt = ciProvider.getInput("developer_system_prompt");
				const customUserPrompt = ciProvider.getInput("developer_user_prompt");

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
				ciProvider.info(
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
				ciProvider.info("Verification step: running linters and tests...");
				let verifySuccess = false;

				if (!useMock) {
					verifySuccess = gitClient.runVerification();
					if (!verifySuccess) {
						ciProvider.warning("Verification failed. Check the logs.");
					}

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
								await gitProvider.createPullRequest(
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
				break;
			}
			case "reviewer": {
				const manualPullNumber = ciProvider.getInput("pull_number");
				const pullNumber = manualPullNumber
					? parseInt(manualPullNumber)
					: payload.pull_request?.number || payload.issue?.number;

				if (!pullNumber) {
					throw new Error(
						"Could not determine Pull Request number from GitHub context for reviewer.",
					);
				}

				const diff = await gitProvider.getPullRequest(owner, repo, pullNumber);

				const customSystemPrompt = ciProvider.getInput("reviewer_system_prompt");
				const customUserPrompt = ciProvider.getInput("reviewer_user_prompt");

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
				ciProvider.info(
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
		ciProvider.setFailed(error.message);
	}
}

// Entry point execution
async function main() {
	const isTest = process.env.NODE_ENV === "test";

	// Bootstrap the CI provider first
	const ciProvider = new GitHubActionsAdapter();

	// Read simulation mode
	const simulationMode = ciProvider.getInput("simulation_mode") === "true";

	// Instantiate git client
	const gitClient = (isTest || simulationMode) ? new MockGitCliAdapter() : new GitCliAdapter();

	await runOrchestrator(ciProvider, gitClient);
}

// Enter main orchestrator flow
main();
