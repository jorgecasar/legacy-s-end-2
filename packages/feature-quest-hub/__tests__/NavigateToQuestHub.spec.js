import assert from "node:assert";
import { describe, it } from "node:test";
import { NavigateToQuestHub } from "../src/use-cases/NavigateToQuestHub.js";
import { Result } from "@legacys-end/core/domain/Result.js";

describe("Use Case: NavigateToQuestHub", () => {
  it("should successfully execute navigation logic", () => {
    const useCase = new NavigateToQuestHub();
    const result = useCase.execute();

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.error, undefined);
  });

  it("should catch unexpected errors", () => {
    // Force an error by mocking Result.success to throw
    const originalSuccess = Result.success;
    // @ts-ignore
    Result.success = () => {
      throw new Error("Unexpected error");
    };

    try {
      const useCase = new NavigateToQuestHub();
      const result = useCase.execute();
      assert.strictEqual(result.success, false);
      assert.match(result.error, /Failed to navigate to quest hub: Unexpected error/);
    } finally {
      // Restore the original function
      Result.success = originalSuccess;
    }
  });
});
