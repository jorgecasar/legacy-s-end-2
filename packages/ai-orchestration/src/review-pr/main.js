import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Octokit } from "octokit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const promptsPath = path.join(__dirname, "../prompts.json");

/**
 * AI Reviewer logic to review a PR.
 */
export async function reviewPR(
	{ token, owner, repo, pullNumber, diff, customSystemPrompt, customUserPrompt },
	deps = {},
) {
	const OctokitClass = deps.Octokit || Octokit;
	const _octokit = new OctokitClass({ auth: token });

	const prompts = JSON.parse(fs.readFileSync(promptsPath, "utf8"));
	const system = customSystemPrompt || prompts.reviewer.system;
	const userTemplate = customUserPrompt || prompts.reviewer.userTemplate;

	const systemPrompt = system.replace("{{repo}}", repo);
	const userPrompt = userTemplate.replace("{{diff}}", diff || "No diff provided");

	console.log(`Reviewing PR #${pullNumber} in ${owner}/${repo}`);
	console.log(`Using System Prompt: ${system.substring(0, 50)}...`);

	// Simulation of successful review
	return {
		success: true,
		approved: true,
		systemPrompt,
		userPrompt,
	};
}
