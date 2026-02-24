import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Octokit } from "octokit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Note: prompts.json is strictly in scripts/ci/, one level up
const promptsPath = path.join(__dirname, "../prompts.json");

/**
 * AI Planner logic to read a GitHub Issue and post a technical plan.
 */
export async function planIssue(
	{
		token,
		owner,
		repo,
		issueNumber,
		issueTitle,
		issueBody,
		customSystemPrompt,
		customUserPrompt,
		customResponseTemplate,
	},
	deps = {},
) {
	const OctokitClass = deps.Octokit || Octokit;
	const octokit = new OctokitClass({ auth: token });

	const prompts = JSON.parse(fs.readFileSync(promptsPath, "utf8"));
	const system = customSystemPrompt || prompts.planner.system;
	const userTemplate = customUserPrompt || prompts.planner.userTemplate;
	const responseTemplate = customResponseTemplate || prompts.planner.responseTemplate;

	const systemPrompt = system.replace("{{repo}}", repo);
	const userPrompt = userTemplate.replace("{{title}}", issueTitle).replace("{{body}}", issueBody);

	console.log(`Planning issue #${issueNumber}: ${owner}/${repo}`);
	console.log(`Using System Prompt: ${system.substring(0, 50)}...`);

	// Simulation of AI Response using the configured prompts
	const plan = responseTemplate;

	await octokit.rest.issues.createComment({
		owner,
		repo,
		issue_number: issueNumber,
		body: plan,
	});

	return { success: true, plan, systemPrompt, userPrompt };
}
