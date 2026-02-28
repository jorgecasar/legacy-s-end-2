import assert from "node:assert";
import { describe, it } from "node:test";
import { GitHubAdapter } from "./GitHubAdapter.js";
import { MockGitHubAdapter } from "./MockGitHubAdapter.js";

/**
 * Contract Tests:
 * Ensure MockGitHubAdapter and GitHubAdapter adhere to the same Port interface.
 * This prevents the fake from drifting out of sync with the real adapter.
 */
describe("Contract: IGitProvider Interface", () => {
  it("should guarantee both adapters implement exactly the same methods", () => {
    const realAdapter = new GitHubAdapter("fake-token");
    const mockAdapter = new MockGitHubAdapter();

    const getMethods = (obj) => {
      const properties = new Set();
      let currentObj = obj;

      // Traverse prototype chain to get methods (excluding Object.prototype)
      while (currentObj && currentObj !== Object.prototype) {
        // Use standard Object.getOwnPropertyNames to get functions
        Object.getOwnPropertyNames(currentObj).forEach((item) => {
          if (typeof obj[item] === "function" && item !== "constructor") {
            properties.add(item);
          }
        });
        currentObj = Object.getPrototypeOf(currentObj);
      }

      return Array.from(properties).sort();
    };

    const realMethods = getMethods(realAdapter);
    const mockMethods = getMethods(mockAdapter);

    assert.deepStrictEqual(
      mockMethods,
      realMethods,
      "MockGitHubAdapter must have the exact same methods as GitHubAdapter",
    );
  });
});
