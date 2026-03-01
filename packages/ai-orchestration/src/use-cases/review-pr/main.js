import { calculateCost } from "../../domain/pricing.js";

import prompts from "../../prompts.json" with { type: "json" };

/**
 * AI Reviewer logic to review a PR.
 */
export async function reviewPR({
  repo,
  diff,
  conversationContext = "", // New parameter
  aiProvider,
  model,
  customSystemPrompt,
  customUserPrompt,
  maxInputTokens = 200000,
  maxOutputTokens = 200000,
  onStart = (_args) => {},
}) {
  const system = customSystemPrompt || prompts.reviewer.system;
  const userTemplate = customUserPrompt || prompts.reviewer.userTemplate;

  const systemPrompt = system.replace("{{repo}}", repo);

  // Enhance user prompt with conversation context if available
  let userPrompt = userTemplate.replace("{{diff}}", diff || "No diff provided");
  if (conversationContext) {
    userPrompt += `\n\n### Existing PR Conversation (Reference):\nThe following comments have already been made in this PR. Use this context to avoid repeating the same feedback and to provide continuity:\n${conversationContext}`;
  }

  onStart({ systemPrompt, userPrompt });

  // Input Safety Check
  const estimatedInputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
  console.log(`[ReviewPR] Estimated input tokens: ${estimatedInputTokens}`);
  if (estimatedInputTokens > maxInputTokens) {
    return {
      success: false,
      error: `Input context too large: ${estimatedInputTokens} tokens (limit: ${maxInputTokens}).`,
    };
  }

  // Call AI
  console.log(`[ReviewPR] Calling AI provider (${model})...`);
  const generatedResponse = await aiProvider.generateContent(
    model,
    systemPrompt,
    userPrompt,
    maxOutputTokens,
  );
  console.log(`[ReviewPR] AI response received.`);

  const response = generatedResponse.text;
  const usage = generatedResponse.usage;

  const costs = calculateCost(model, usage);

  return {
    success: true,
    value: {
      approved: true,
      response,
      systemPrompt,
      userPrompt,
      usage,
      costs,
    },
  };
}
