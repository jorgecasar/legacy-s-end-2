import assert from "node:assert";
import { describe, test } from "node:test";
import { GeminiAdapter } from "../src/infrastructure/adapters/GeminiAdapter.js";

describe("Infrastructure: GeminiAdapter", () => {
  const apiKey = "fake-api-key";
  const adapter = new GeminiAdapter(apiKey);

  describe("parseUsage", () => {
    test("should parse valid JSON output with single model stats", () => {
      const rawOutput = `
Some random log line
{
  "response": "Hello world",
  "stats": {
    "models": {
      "gemini-2.0-flash": {
        "tokens": {
          "prompt": 100,
          "candidates": 50,
          "total": 150
        }
      }
    }
  }
}
      `;
      const result = adapter.parseUsage(rawOutput, 400);
      assert.strictEqual(result.text, "Hello world");
      assert.strictEqual(result.usage.prompt_tokens, 100);
      assert.strictEqual(result.usage.completion_tokens, 50);
      assert.strictEqual(result.usage.total_tokens, 150);
    });

    test("should aggregate tokens from multiple models", () => {
      const rawOutput = JSON.stringify({
        response: "Aggregated response",
        stats: {
          models: {
            "model-1": { tokens: { prompt: 10, candidates: 5, total: 15 } },
            "model-2": { tokens: { input: 20, candidates: 10, total: 30 } },
          },
        },
      });
      const result = adapter.parseUsage(rawOutput, 0);
      assert.strictEqual(result.usage.prompt_tokens, 30);
      assert.strictEqual(result.usage.completion_tokens, 15);
      assert.strictEqual(result.usage.total_tokens, 45);
    });

    test("should fallback to estimation if JSON is malformed", () => {
      const rawOutput = "This is not JSON but it is a valid response";
      const promptLength = 100; // ~25 tokens
      const result = adapter.parseUsage(rawOutput, promptLength);

      assert.strictEqual(result.text, rawOutput);
      assert.strictEqual(result.usage.prompt_tokens, 25);
      assert.strictEqual(result.usage.completion_tokens, 11); // "This is not JSON..." is 44 chars / 4 = 11
      assert.strictEqual(result.usage.total_tokens, 36);
    });

    test("should fallback to estimation if usage data is missing in JSON", () => {
      const rawOutput = JSON.stringify({ response: "Only text" });
      const promptLength = 40; // 10 tokens
      const result = adapter.parseUsage(rawOutput, promptLength);

      assert.strictEqual(result.text, "Only text");
      assert.strictEqual(result.usage.prompt_tokens, 10);
      assert.strictEqual(result.usage.completion_tokens, 3); // "Only text" is 9 chars / 4 = 3
    });
  });
});
