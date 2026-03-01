import assert from "node:assert";
import { describe, test } from "node:test";
import {
  extractRecommendedModel,
  extractTaskComplexity,
  selectBestModel,
} from "../src/infrastructure/config.js";

describe("Infrastructure: Config", () => {
  describe("extractRecommendedModel", () => {
    test("should extract model from issue report format", () => {
      const text = `
🤖 **AI Triage & Planning Report**:

<!-- ai-triage-start -->
### 📋 Triage
- **Type**: \`type: task\`
- **Priority**: \`priority: standard\`
- **Recommended Model**: \`gemini-2.0-flash\` (Optimized for speed/cost)
<!-- ai-triage-end -->
      `;
      const model = extractRecommendedModel(text);
      assert.strictEqual(model, "gemini-2.0-flash");
    });

    test("should return null if no model is recommended", () => {
      const text = "Some random text without recommendation";
      const model = extractRecommendedModel(text);
      assert.strictEqual(model, null);
    });

    test("should be case-insensitive", () => {
      const text = "- **recommended model**: `claude-3-5-sonnet-latest`";
      const model = extractRecommendedModel(text);
      assert.strictEqual(model, "claude-3-5-sonnet-latest");
    });
  });

  describe("extractTaskComplexity", () => {
    test("should extract complexity from issue report format", () => {
      const text = "- **Complexity**: `medium` (Logic intensive)";
      const complexity = extractTaskComplexity(text);
      assert.strictEqual(complexity, "medium");
    });

    test("should handle missing backticks", () => {
      const text = "- **Complexity**: high";
      const complexity = extractTaskComplexity(text);
      assert.strictEqual(complexity, "high");
    });

    test("should return null if no complexity is found", () => {
      const text = "Normal text";
      const complexity = extractTaskComplexity(text);
      assert.strictEqual(complexity, null);
    });
  });

  describe("selectBestModel", () => {
    const mockKeys = { gemini: "key1", anthropic: "key2" };

    test("should prioritize customPreferences if provided", () => {
      const { model } = selectBestModel("developer", ["claude-3-5-sonnet-latest"], mockKeys);
      assert.strictEqual(model, "claude-3-5-sonnet-latest");
    });

    test("should select model based on complexity for developer", () => {
      const { model } = selectBestModel("developer", null, mockKeys, "high");
      // high complexity preference is gemini-1.5-pro
      assert.strictEqual(model, "gemini-1.5-pro");
    });

    test("should fallback to DEFAULT_PREFERENCES if custom is null and no complexity", () => {
      const { model } = selectBestModel("planner", null, mockKeys);
      // planner default is gemini-2.0-flash first
      assert.strictEqual(model, "gemini-2.0-flash");
    });

    test("should skip models without keys", () => {
      const { model } = selectBestModel("developer", ["gpt-4o", "gemini-2.0-flash"], {
        gemini: "key",
      });
      assert.strictEqual(model, "gemini-2.0-flash");
    });

    test("should return simulation if no keys match", () => {
      const { model } = selectBestModel("developer", ["gpt-4o"], {});
      assert.strictEqual(model, "simulation");
    });
  });
});
