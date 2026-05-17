import { describe, it } from "node:test";
import assert from "node:assert";
import { GenerateSyntheticLocale } from "../src/use-cases/GenerateSyntheticLocale.js";
import { Result } from "../src/domain/Result.js";

describe("Use Case: GenerateSyntheticLocale", () => {
  it("should translate all templates to target locale", async () => {
    const sourceTemplates = {
      s1: "Hello",
      s2: "World",
    };

    const mockTranslatorPort = {
      translate: async (text, _options) => {
        if (text === "Hello") return Result.success("Bonjour");
        if (text === "World") return Result.success("Monde");
        return Result.failure("Unknown");
      },
    };

    const result = await GenerateSyntheticLocale.execute({
      sourceTemplates,
      targetLocale: "fr",
      translatorPort: mockTranslatorPort,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.s1, "Bonjour");
    assert.strictEqual(result.value.s2, "Monde");
  });

  it("should fallback to source value if translation fails", async () => {
    const sourceTemplates = { s1: "Hello" };
    const mockTranslatorPort = {
      translate: async () => Result.failure("API Down"),
    };

    const result = await GenerateSyntheticLocale.execute({
      sourceTemplates,
      targetLocale: "fr",
      translatorPort: mockTranslatorPort,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.s1, "Hello");
  });

  it("should handle non-string values in templates", async () => {
    const sourceTemplates = { s1: "Hello", s2: () => "Function" };
    const mockTranslatorPort = {
      translate: async (text) => Result.success(`tr-${text}`),
    };

    const result = await GenerateSyntheticLocale.execute({
      sourceTemplates,
      targetLocale: "fr",
      translatorPort: mockTranslatorPort,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.value.s1, "tr-Hello");
    assert.strictEqual(typeof result.value.s2, "function");
  });

  it("should catch unexpected errors", async () => {
    const sourceTemplates = { s1: "Hello" };
    const mockTranslatorPort = {
      translate: () => {
        throw new Error("Fatal Crash");
      },
    };

    const result = await GenerateSyntheticLocale.execute({
      sourceTemplates,
      targetLocale: "fr",
      translatorPort: mockTranslatorPort,
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes("Failed to generate synthetic locale: Fatal Crash"));
  });
});
