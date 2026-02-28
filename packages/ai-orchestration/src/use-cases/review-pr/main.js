import { calculateCost } from "../../domain/pricing.js";

import prompts from "../../prompts.json" with { type: "json" };

/**
 * AI Reviewer logic to review a PR.
 */
export async function reviewPR({
  owner,
  repo,
  pullNumber,
  diff,
  aiProvider,
  model,
  customSystemPrompt,
  customUserPrompt,
  maxInputTokens = 200000,
  maxOutputTokens = 200000,
}) {
  const system = customSystemPrompt || prompts.reviewer.system;
  const userTemplate = customUserPrompt || prompts.reviewer.userTemplate;

  const systemPrompt = system.replace("{{repo}}", repo);
  const userPrompt = userTemplate.replace("{{diff}}", diff || "No diff provided");

  // Input Safety Check
  const estimatedInputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
  if (estimatedInputTokens > maxInputTokens) {
    throw new Error(
      `Input context too large: ${estimatedInputTokens} tokens (limit: ${maxInputTokens}).`,
    );
  }

  console.log("--- AI CALL SIMULATION (REVIEWER) ---");
  console.log(`PR: #${pullNumber} in ${owner}/${repo}`);
  console.log("SYSTEM PROMPT:\n", systemPrompt);
  console.log("USER PROMPT:\n", userPrompt);
  console.log("--------------------------------------");

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

  console.log("REAL RESPONSE:\n", response);
  console.log("REAL USAGE:", JSON.stringify(usage, null, 2));
  console.log(`ESTIMATED API COST: $${costs.total_cost} ${costs.currency}`);
  console.log("--------------------------------------");

  return {
    success: true,
    approved: true,
    systemPrompt,
    userPrompt,
    usage,
  };
}
