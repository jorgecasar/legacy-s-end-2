import { calculateCost } from "../../domain/pricing.js";
import prompts from "../../prompts.json" with { type: "json" };

/**
 * AI Developer logic to implement a task.
 */
export async function implementIssue({
  repo,
  issueNumber,
  context,
  aiProvider,
  model,
  customSystemPrompt,
  customUserPrompt,
  maxInputTokens = 200000,
  maxOutputTokens = 200000,
  onStart = (_args) => {},
}) {
  const system = customSystemPrompt || prompts.developer.system;
  const userTemplate = customUserPrompt || prompts.developer.userTemplate;

  const systemPrompt = system.replace("{{repo}}", repo);
  const userPrompt = userTemplate.replace("{{context}}", context);

  onStart({ systemPrompt, userPrompt });

  // Input Safety Check
  const estimatedInputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
  if (estimatedInputTokens > maxInputTokens) {
    return {
      success: false,
      error: `Input context too large: ${estimatedInputTokens} tokens (limit: ${maxInputTokens}).`,
    };
  }

  // Call AI
  const generatedResponse = await aiProvider.generateContent(
    model,
    systemPrompt,
    userPrompt,
    maxOutputTokens,
  );

  const response = generatedResponse.text;
  const usage = generatedResponse.usage;

  const costs = calculateCost(model, usage);

  return {
    success: true,
    value: {
      branch: `feat/issue-${issueNumber}`,
      response,
      systemPrompt,
      userPrompt,
      usage,
      costs,
    },
  };
}
