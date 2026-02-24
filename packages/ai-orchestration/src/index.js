import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "octokit";
import { planIssue } from "./ai-planner/main.js";
import { implementIssue } from "./implement-issue/main.js";
import { reviewPR } from "./review-pr/main.js";

async function run() {
  try {
    const role = core.getInput("agent_role", { required: true });
    const token = core.getInput("github_token", { required: true });
    const { owner, repo } = github.context.repo;

    switch (role.toLowerCase()) {
      case "planner": {
        const issueNumber = github.context.payload.issue?.number;
        const issueTitle = github.context.payload.issue?.title || "";
        const issueBody = github.context.payload.issue?.body || "";

        if (!issueNumber) {
          throw new Error("Could not determine issue number from GitHub context for planner.");
        }

        const customSystemPrompt = core.getInput("planner_system_prompt");
        const customUserPrompt = core.getInput("planner_user_prompt");
        const customResponseTemplate = core.getInput("planner_response_template");

        await planIssue({
          token,
          owner,
          repo,
          issueNumber,
          issueTitle,
          issueBody,
          customSystemPrompt,
          customUserPrompt,
          customResponseTemplate,
        });
        break;
      }
      case "developer": {
        const issueNumber =
          github.context.payload.issue?.number || github.context.payload.pull_request?.number;
        const context =
          github.context.payload.comment?.body || github.context.payload.issue?.body || "";

        if (!issueNumber) {
          throw new Error(
            "Could not determine issue or PR number from GitHub context for developer.",
          );
        }

        const customSystemPrompt = core.getInput("developer_system_prompt");
        const customUserPrompt = core.getInput("developer_user_prompt");

        await implementIssue({
          token,
          owner,
          repo,
          issueNumber,
          context,
          customSystemPrompt,
          customUserPrompt,
        });
        break;
      }
      case "reviewer": {
        const pullNumber =
          github.context.payload.pull_request?.number || github.context.payload.issue?.number;

        if (!pullNumber) {
          throw new Error(
            "Could not determine Pull Request number from GitHub context for reviewer.",
          );
        }

        const octokit = new Octokit({ auth: token });
        const { data } = await octokit.rest.pulls.get({
          owner,
          repo,
          pull_number: pullNumber,
          mediaType: { format: "diff" },
        });

        const customSystemPrompt = core.getInput("reviewer_system_prompt");
        const customUserPrompt = core.getInput("reviewer_user_prompt");

        await reviewPR({
          token,
          owner,
          repo,
          pullNumber,
          diff: String(data),
          customSystemPrompt,
          customUserPrompt,
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
