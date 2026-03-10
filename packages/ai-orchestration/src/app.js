import { AnthropicAdapter } from "./infrastructure/adapters/AnthropicAdapter.js";
import { GeminiAdapter } from "./infrastructure/adapters/GeminiAdapter.js";
import { GitCliAdapter } from "./infrastructure/adapters/GitCliAdapter.js";
import { GitHubActionsAdapter } from "./infrastructure/adapters/GitHubActionsAdapter.js";
import { GitHubAdapter } from "./infrastructure/adapters/GitHubAdapter.js";
import { GitHubProjectAdapter } from "./infrastructure/adapters/GitHubProjectAdapter.js";
import { MockAIAdapter } from "./infrastructure/adapters/MockAIAdapter.js";
import { MockGitCliAdapter } from "./infrastructure/adapters/MockGitCliAdapter.js";
import { MockGitHubAdapter } from "./infrastructure/adapters/MockGitHubAdapter.js";
import { MockProjectManager } from "./infrastructure/adapters/MockProjectManager.js";
import { OpenAIAdapter } from "./infrastructure/adapters/OpenAIAdapter.js";
import { branding } from "./domain/branding.js";
import {
  extractRecommendedModel,
  extractTaskComplexity,
  getAvailableModelProviders,
  selectBestModel,
} from "./infrastructure/config.js";
import { FileExecutor } from "./infrastructure/services/FileExecutor.js";
import { DeveloperWorkflow } from "./use-cases/implement-issue/DeveloperWorkflow.js";
import { OrchestratorWorkflow } from "./use-cases/orchestrate/OrchestratorWorkflow.js";
import { PlannerWorkflow } from "./use-cases/plan-issue/PlannerWorkflow.js";
import { ReviewerWorkflow } from "./use-cases/review-pr/ReviewerWorkflow.js";

/**
 * Main orchestrator logic, decoupled from specific CI or Git CLI implementations.
 *
 * @param {import('./domain/ports/ICIProvider.js').ICIProvider} ciProvider
 * @param {import('./domain/ports/IGitClient.js').IGitClient} gitClient
 */
export async function runOrchestrator(ciProvider, gitClient) {
  try {
    const role = ciProvider.getInput("agent_role", { required: true });
    const token = ciProvider.getInput("gh_token") || process.env.GITHUB_TOKEN;
    const gitAuthorName = ciProvider.getInput("git_author_name");

    if (gitAuthorName) {
      branding.setName(gitAuthorName);
    }

    if (!token) {
      throw new Error(
        "GitHub token is required. Please provide 'gh_token' input or GITHUB_TOKEN env var.",
      );
    }

    const eventContext = ciProvider.getEventContext();
    let { owner, repo } = eventContext;
    const { payload, eventName } = eventContext;

    // isTest is strictly for the automated test suite (NODE_ENV=test)
    const isTest = process.env.NODE_ENV === "test";

    // Local Auto-detection fallback if we still have default placeholders
    if ((owner === "owner" || !owner) && !isTest) {
      try {
        const remoteUrl = gitClient.getRemoteUrl();
        if (remoteUrl) {
          // Parse SSH or HTTPS urls:
          // git@github.com:jorgecasar/legacy-s-end-2.git
          // https://github.com/jorgecasar/legacy-s-end-2.git
          const match = remoteUrl.match(/[:/]([^/]+)\/([^/.]+)(\.git)?$/);
          if (match) {
            owner = match[1];
            repo = match[2];
            ciProvider.info(`[Config] Auto-detected repository from git remote: ${owner}/${repo}`);
          }
        }
      } catch {
        // Ignore detection errors
      }
    }

    // Detect available keys from inputs first, then env vars
    const geminiKey = ciProvider.getInput("gemini_api_key") || process.env.GEMINI_API_KEY;
    const anthropicKey = ciProvider.getInput("anthropic_api_key") || process.env.ANTHROPIC_API_KEY;
    const openaiKey = ciProvider.getInput("openai_api_key") || process.env.OPENAI_API_KEY;
    const ghMcpPat = ciProvider.getInput("gh_mcp_pat") || process.env.GH_MCP_PAT;

    if (!isTest) {
      const detected = [];
      if (geminiKey) detected.push("Gemini");
      if (anthropicKey) detected.push("Anthropic");
      if (openaiKey) detected.push("OpenAI");
      if (detected.length > 0) {
        ciProvider.info(`[Config] Detected API Keys for: ${detected.join(", ")}`);
      } else {
        ciProvider.warning("[Config] No API Keys detected in environment or inputs.");
      }
    }

    const maxInputTokens = parseInt(ciProvider.getInput("max_input_tokens") || "200000", 10);
    const maxOutputTokens = parseInt(ciProvider.getInput("max_output_tokens") || "200000", 10);

    // Check for explicit simulation mode input
    const simulationMode = ciProvider.getInput("simulation_mode") === "true";
    const debugMode = ciProvider.getInput("debug") === "true";
    const interactiveMode = ciProvider.getInput("interactive") === "true";

    if (!isTest) {
      ciProvider.info(`[Config] Target Repository: ${owner}/${repo}`);
      ciProvider.info(`[Config] NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
      ciProvider.info(`[Config] isTest: ${isTest}`);
      if (debugMode) ciProvider.info("[Config] Debug mode enabled.");
      if (interactiveMode) ciProvider.info("[Config] Interactive mode enabled (TUI).");
    }

    let gitProvider;
    if (isTest) {
      ciProvider.info("Using MockGitHubAdapter (Test Mode)");
      gitProvider = new MockGitHubAdapter();
    } else {
      ciProvider.info("Using GitHubAdapter");
      gitProvider = new GitHubAdapter(token);
    }

    let recommendedModel = null;
    let taskComplexity = null;
    // Early context fetch ONLY for Developer to detect model/complexity recommendations from the Planner
    if (role.toLowerCase() === "developer") {
      const issueNumberInput = ciProvider.getInput("issue_number");
      const issueNumber = issueNumberInput
        ? parseInt(issueNumberInput, 10)
        : payload.issue?.number ||
          payload.pull_request?.number ||
          payload.workflow_run?.pull_requests?.[0]?.number;

      if (issueNumber) {
        try {
          const issue = await gitProvider.getIssue(owner, repo, issueNumber);
          recommendedModel = extractRecommendedModel(issue.body);
          taskComplexity = extractTaskComplexity(issue.body);

          if (!recommendedModel || !taskComplexity) {
            const comments = await gitProvider.listComments(owner, repo, issueNumber);
            for (const c of comments) {
              if (!recommendedModel) recommendedModel = extractRecommendedModel(c.body);
              if (!taskComplexity) taskComplexity = extractTaskComplexity(c.body);
              if (recommendedModel && taskComplexity) break;
            }
          }

          if (recommendedModel) {
            ciProvider.info(`[Config] Planner recommended model: ${recommendedModel}`);
          }
          if (taskComplexity) {
            ciProvider.info(`[Config] Planner determined complexity: ${taskComplexity}`);
          }
        } catch (err) {
          ciProvider.warning(`Failed early context fetch for model selection: ${err.message}`);
        }
      }
    }

    // Model Selection logic based on available keys & preferences (including recommendations)
    const { provider, model } = selectBestModel(
      role.toLowerCase(),
      recommendedModel ? [recommendedModel] : null,
      {
        gemini: geminiKey,
        anthropic: anthropicKey,
        openai: openaiKey,
      },
      taskComplexity,
    );

    let aiProvider;
    let finalModel = model;

    const finalSimulationMode = isTest || simulationMode;

    if (!provider && !finalSimulationMode) {
      throw new Error(
        "No API keys found for any supported models. Please provide a valid API key (GEMINI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY) or enable 'simulation_mode' in the workflow inputs.",
      );
    }

    if (finalSimulationMode || provider === "mock") {
      finalModel = "simulation";
      ciProvider.info(`Using Mock AI Provider (${finalModel})...`);
      aiProvider = new MockAIAdapter();
    } else {
      // Real AI Adapters
      if (provider === "gemini") {
        aiProvider = new GeminiAdapter(geminiKey, {
          simulationMode: finalSimulationMode,
          role: role.toLowerCase(),
          githubToken: token,
          ghMcpPat,
          debug: debugMode,
          interactive: interactiveMode,
        });
      } else if (provider === "anthropic") {
        aiProvider = new AnthropicAdapter(anthropicKey);
      } else if (provider === "openai") {
        aiProvider = new OpenAIAdapter(openaiKey);
      } else {
        throw new Error(`Unsupported AI provider determined: ${provider}`);
      }
    }

    const availableProviders = isTest
      ? ["gemini", "anthropic", "openai"]
      : getAvailableModelProviders({
          gemini: geminiKey,
          anthropic: anthropicKey,
          openai: openaiKey,
        });

    const workflows = {
      planner: (params) => PlannerWorkflow({ ...params, availableProviders }),
      developer: (params) =>
        DeveloperWorkflow({
          ...params,
          fileExecutor: new FileExecutor(process.cwd()),
          privilegedGitProvider: ghMcpPat ? new GitHubAdapter(ghMcpPat) : null,
        }),
      reviewer: ReviewerWorkflow,
      orchestrate: (params) => {
        const pm =
          isTest || finalSimulationMode
            ? new MockProjectManager()
            : new GitHubProjectAdapter(token);

        const inputProjectId = ciProvider.getInput("project_id");
        const envProjectId = process.env.PROJECT_ID;
        const finalProjectId = inputProjectId || envProjectId;

        if (inputProjectId) ciProvider.info("[Config] Using projectId from input.");
        else if (envProjectId)
          ciProvider.info("[Config] Using projectId from environment variable.");
        else ciProvider.warning("[Config] No projectId detected in inputs or environment.");

        return OrchestratorWorkflow({
          ...params,
          projectManager: pm,
          projectId: finalProjectId,
          wipLimit: parseInt(ciProvider.getInput("wip_limit") || "5", 10),
        });
      },
    };

    const workflow = workflows[role.toLowerCase()];
    if (!workflow) {
      throw new Error(
        `Unknown agent_role: ${role}. Valid roles are: ${Object.keys(workflows).join(", ")}.`,
      );
    }

    const workflowResult = await workflow({
      ciProvider,
      gitProvider,
      aiProvider,
      gitClient,
      model: finalModel,
      owner,
      repo,
      payload,
      eventName,
      maxInputTokens,
      maxOutputTokens,
      simulationMode: finalSimulationMode,
      useMock: isTest,
    });

    if (workflowResult && !workflowResult.success) {
      throw new Error(workflowResult.error);
    }
  } catch (error) {
    ciProvider.setFailed(error.message);
  }
}

// Entry point execution
export async function main() {
  const isTest = process.env.NODE_ENV === "test";

  // Bootstrap the CI provider first
  const ciProvider = new GitHubActionsAdapter();

  // Instantiate git client. Only use Mock if explicitly in test mode.
  const gitClient = isTest ? new MockGitCliAdapter() : new GitCliAdapter();

  try {
    await runOrchestrator(ciProvider, gitClient);
    process.exit(0);
  } catch (err) {
    ciProvider.setFailed(err.message);
    process.exit(1);
  }
}
