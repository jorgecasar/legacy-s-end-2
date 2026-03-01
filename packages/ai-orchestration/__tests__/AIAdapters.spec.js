import assert from "node:assert";
import { describe, test } from "node:test";
import { AnthropicAdapter } from "../src/infrastructure/adapters/AnthropicAdapter.js";
import { OpenAIAdapter } from "../src/infrastructure/adapters/OpenAIAdapter.js";

describe("Infrastructure: AI Adapters (Mocked)", () => {
  describe("AnthropicAdapter", () => {
    test("should format request and parse response correctly", async () => {
      const mockClient = {
        messages: {
          create: async ({ model, system, messages }) => {
            assert.strictEqual(model, "claude-test");
            assert.strictEqual(system, "sys");
            assert.strictEqual(messages[0].content, "user");
            return {
              content: [{ text: "anthropic response" }],
              usage: { input_tokens: 10, output_tokens: 5 },
            };
          },
        },
      };

      const adapter = new AnthropicAdapter(null, { client: mockClient });
      const result = await adapter.generateContent("claude-test", "sys", "user", 100);

      assert.strictEqual(result.text, "anthropic response");
      assert.strictEqual(result.usage.total_tokens, 15);
    });
  });

  describe("OpenAIAdapter", () => {
    test("should format request and parse response correctly", async () => {
      const mockClient = {
        chat: {
          completions: {
            create: async ({ model, messages }) => {
              assert.strictEqual(model, "gpt-test");
              assert.strictEqual(messages[0].content, "sys");
              assert.strictEqual(messages[1].content, "user");
              return {
                choices: [{ message: { content: "openai response" } }],
                usage: { prompt_tokens: 20, completion_tokens: 10, total_tokens: 30 },
              };
            },
          },
        },
      };

      const adapter = new OpenAIAdapter(null, { client: mockClient });
      const result = await adapter.generateContent("gpt-test", "sys", "user", 100);

      assert.strictEqual(result.text, "openai response");
      assert.strictEqual(result.usage.prompt_tokens, 20);
    });
  });
});
