import fs from "node:fs";
import path from "node:path";
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

  // Rule Discovery
  let projectRules = "Follow standard Clean Architecture and project conventions.";
  const rulePaths = [
    ".agent/RULES.md",
    "RULES.md",
    "GEMINI.md",
    ".serena/memories/serena-workflow.md",
  ];
  for (const rulePath of rulePaths) {
    const fullPath = path.resolve(process.cwd(), rulePath);
    if (fs.existsSync(fullPath)) {
      projectRules = fs.readFileSync(fullPath, "utf-8");
      break;
    }
  }

  const systemPrompt = system.replace("{{repo}}", repo).replace("{{project_rules}}", projectRules);
  let userPrompt = userTemplate.replace("{{context}}", context);

  // Ensure AI follows the response structure with markers
  if (prompts.developer.responseTemplate) {
    userPrompt += `\n\n### RESPONSE STRUCTURE (STRICT):\n${prompts.developer.responseTemplate}`;
  }

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

  const costResult = calculateCost(model, usage);
  const costs = costResult.value;

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
