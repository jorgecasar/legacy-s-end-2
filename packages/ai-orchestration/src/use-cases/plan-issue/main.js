import { calculateCost } from "../../domain/pricing.js";

import prompts from "../../prompts.json" with { type: "json" };

/**
 * AI Planner logic to read a GitHub Issue and post a technical plan.
 */
export async function planIssue({
  gitProvider,
  owner,
  repo,

  issueNumber,
  issueTitle,
  issueBody,
  aiProvider,
  model,
  customSystemPrompt,
  customUserPrompt,
  maxInputTokens = 200000,
  maxOutputTokens = 200000,
}) {
  const system = customSystemPrompt || prompts.planner.system;
  const userTemplate = customUserPrompt || prompts.planner.userTemplate;

  const systemPrompt = system.replace("{{repo}}", repo);
  const userPrompt = userTemplate.replace("{{title}}", issueTitle).replace("{{body}}", issueBody);

  // Input Safety Check (Estimated tokens: char count / 4)
  const estimatedInputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);
  if (estimatedInputTokens > maxInputTokens) {
    throw new Error(
      `Input context too large: ${estimatedInputTokens} tokens (limit: ${maxInputTokens}). Please reduce the issue description or custom prompts.`,
    );
  }

  console.log("--- AI CALL SIMULATION (PLANNER) ---");
  console.log(`Issue: #${issueNumber} in ${owner}/${repo}`);
  console.log("SYSTEM PROMPT:\n", systemPrompt);
  console.log("USER PROMPT:\n", userPrompt);
  console.log("-------------------------------------");

  const generatedResponse = await aiProvider.generateContent(
    model,
    systemPrompt,
    userPrompt,
    maxOutputTokens,
  );

  const plan = generatedResponse.text;
  const usage = generatedResponse.usage;

  // Simulated Blocker Detection logic (Triage)
  const blockerMatch = issueBody.match(/(?:depends on|blocked by) #(\d+)/i);
  const blockers = blockerMatch ? [parseInt(blockerMatch[1])] : [];

  const costs = calculateCost("mock", usage);

  console.log("REAL RESPONSE:\n", plan);
  console.log("REAL USAGE:", JSON.stringify(usage, null, 2));
  console.log(`ESTIMATED API COST: $${costs.total_cost} ${costs.currency}`);
  console.log("-------------------------------------");

  await gitProvider.createComment(
    owner,
    repo,
    issueNumber,
    `<!-- ai-usage: ${JSON.stringify(usage)} -->\n${plan}${blockers.length > 0 ? `\n\n⚠️ **Blockers Detected**: This issue depends on #${blockers.join(", #")}` : ""}`,
  );

  // Simulation of Triage Actions (Labels & Milestone)
  console.log("SIMULATING TRIAGE ACTIONS...");
  const priority =
    issueBody.toLowerCase().includes("urgent") || issueBody.toLowerCase().includes("bug")
      ? "priority: critical"
      : "priority: standard";
  const labels = ["type: task", priority];

  // Smart Milestone Selection: Milestone 1 for critical, 2 for others (Simulation)
  const milestone = priority === "priority: critical" ? 1 : 2;

  if (blockers.length > 0) {
    console.log(`Setting up blocking relationships for issues: ${blockers.join(", ")}`);
    for (const blockerId of blockers) {
      // In a real scenario, we would use the GitHub API to add dependencies
      // POST /repos/{owner}/{repo}/issues/{issueNumber}/dependencies { blocked_by_issue_number: blockerId }
      console.log(
        `[API CALL SIMULATION] POST repos/${owner}/{repo}/issues/${issueNumber}/dependencies { blocked_by_issue_number: ${blockerId} }`,
      );
    }
  }

  console.log(`Applying labels: ${labels.join(", ")}`);
  console.log(`Assigning to Milestone #${milestone}`);

  await gitProvider.addLabels(owner, repo, issueNumber, labels);
  await gitProvider.updateMilestone(owner, repo, issueNumber, milestone);

  return {
    success: true,
    plan,
    systemPrompt,
    userPrompt,
    usage,
    triage: { labels, milestone, blockers },
  };
}
