import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Octokit } from "octokit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const promptsPath = path.join(__dirname, "../prompts.json");

/**
 * AI Developer logic to implement a task.
 */
export async function implementIssue(
  { token, owner, repo, issueNumber, context, customSystemPrompt, customUserPrompt },
  deps = {},
) {
  const OctokitClass = deps.Octokit || Octokit;
  const _octokit = new OctokitClass({ auth: token });

  const prompts = JSON.parse(fs.readFileSync(promptsPath, "utf8"));
  const system = customSystemPrompt || prompts.developer.system;
  const userTemplate = customUserPrompt || prompts.developer.userTemplate;

  const systemPrompt = system.replace("{{repo}}", repo);
  const userPrompt = userTemplate.replace("{{context}}", context);

  console.log(`Implementing issue #${issueNumber} in ${owner}/${repo}`);
  console.log(`Using System Prompt: ${system.substring(0, 50)}...`);

  // Simulation of successful implementation
  return {
    success: true,
    branch: `feat/issue-${issueNumber}`,
    systemPrompt,
    userPrompt,
  };
}
