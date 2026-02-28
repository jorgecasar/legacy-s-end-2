/**
 * @typedef {import('../../domain/ports/IAIProvider.js').IAIProvider} IAIProvider
 */

/**
 * Mock Adapter for Tests and Simulation Mode.
 * @implements {IAIProvider}
 */
export class MockAIAdapter {
  async generateContent(modelId, systemPrompt, userPrompt, maxOutputTokens) {
    const estimatedInputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);

    let simulatedText = `Detailed implementation simulation for ${modelId}`;
    if (systemPrompt.includes("TRIAGE and PLAN")) {
      simulatedText = `🤖 **AI Triage & Planning Report**:\n\n### 📋 Triage\n- **Type**: \`type: task\`\n- **Priority**: \`priority: critical\`\n- **Milestone**: \`Phase 1: Core\`\n\n### 🎯 Plan Overview\n**Approach**: Domain-Driven Design.\n\n### 🛠️ Technical Checklist\n- [ ] Task 1: Complete simulation.\nIf approved, label this issue \`ready-for-dev\`.`;
    } else if (systemPrompt.includes("Autonomous Developer")) {
      simulatedText = `Detailed implementation simulation for issue using ${modelId}`;
    } else if (systemPrompt.includes("reviewing a Pull Request")) {
      simulatedText = `PR looks good according to Clean Architecture standards.`;
    }

    const estimatedOutputTokens = Math.min(
      Math.ceil(simulatedText.length / 4),
      maxOutputTokens || 200000,
    );

    return {
      text: simulatedText,
      usage: {
        prompt_tokens: estimatedInputTokens,
        completion_tokens: estimatedOutputTokens,
        total_tokens: estimatedInputTokens + estimatedOutputTokens,
      },
    };
  }
}
