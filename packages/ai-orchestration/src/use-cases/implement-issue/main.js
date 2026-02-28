import { calculateCost } from "../../domain/pricing.js";

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

  const systemPrompt = system.replace("{{repo}}", repo);
  const userPrompt = userTemplate.replace("{{context}}", context);

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

  return {
    success: true,
    branch: `feat/issue-${issueNumber}`,
    systemPrompt,
    userPrompt,
    usage,
  };
}
