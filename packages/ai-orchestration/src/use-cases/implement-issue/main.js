import fs from "node:fs/promises";
import path from "node:path";
import { calculateCost } from "../../domain/pricing.js";
import { FileExecutor } from "../../domain/services/FileExecutor.js";
import prompts from "../../prompts.json" with { type: "json" };

/**
 * AI Developer logic to implement a task.
 */
export async function implementIssue({
	owner,
	repo,
	issueNumber,
	context,
	aiProvider,
	model,
	customSystemPrompt,
	customUserPrompt,
	maxInputTokens = 200000,
	maxOutputTokens = 200000,
}) {
	const system = customSystemPrompt || prompts.developer.system;
	const userTemplate = customUserPrompt || prompts.developer.userTemplate;

	// Gather workspace context (simple structure)
	let workspaceFiles = "";
	try {
		const cwd = process.cwd();
		// basic fast directory list ignoring node_modules and .git
		const getAllFiles = async (dir, fileList = []) => {
			const files = await fs.readdir(dir, { withFileTypes: true });
			for (const file of files) {
				if (file.name === "node_modules" || file.name === ".git" || file.name === "dist") continue;
				const filepath = path.join(dir, file.name);
				if (file.isDirectory()) {
					await getAllFiles(filepath, fileList);
				} else {
					fileList.push(path.relative(process.cwd(), filepath));
				}
			}
			return fileList;
		};
		workspaceFiles = (await getAllFiles(cwd)).join("\n");
	} catch (err) {
		workspaceFiles = "Unable to read workspace.";
	}

	const systemPrompt = system.replace("{{repo}}", repo);
	const userPrompt = userTemplate
		.replace("{{context}}", context)
		.replace("{{workspace}}", workspaceFiles);

	// Input Safety Check
	const estimatedInputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
	if (estimatedInputTokens > maxInputTokens) {
		throw new Error(
			`Input context too large: ${estimatedInputTokens} tokens (limit: ${maxInputTokens}).`,
		);
	}

	console.log("--- AI CALL SIMULATION (DEVELOPER) ---");
	console.log(`Issue/PR: #${issueNumber} in ${owner}/${repo}`);
	console.log("SYSTEM PROMPT:\n", systemPrompt);
	console.log("USER PROMPT:\n", userPrompt);
	console.log("---------------------------------------");

	// Call AI
	const generatedResponse = await aiProvider.generateContent(
		model,
		systemPrompt,
		userPrompt,
		maxOutputTokens,
	);

	const response = generatedResponse.text;
	const usage = generatedResponse.usage;

	const costs = calculateCost("mock", usage);

	console.log("RESPONSE:\n", response);
	console.log("USAGE:", JSON.stringify(usage, null, 2));
	console.log(`ESTIMATED API COST: $${costs.total_cost} ${costs.currency}`);
	console.log("---------------------------------------");

	// Execute resulting file changes
	const executor = new FileExecutor(process.cwd());
	const changesCount = await executor.execute(response);

	return {
		success: true,
		branch: `feat/issue-${issueNumber}`,
		systemPrompt,
		userPrompt,
		usage,
	};
}
