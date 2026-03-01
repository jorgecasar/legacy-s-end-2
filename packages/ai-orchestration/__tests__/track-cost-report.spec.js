import assert from "node:assert";
import { describe, it } from "node:test";
import { removeCostReport } from "../src/use-cases/track-cost-report/main.js";

describe("removeCostReport", () => {
  it("should remove the cost report block with markers", () => {
    const input =
      "Original text\n<!-- ai-cost-report-start -->\n## 💰 AI Usage & Cost Report\n| Row |\n_Updated automatically by AI Orchestration_\n<!-- ai-cost-report-end -->\nFollowing text";
    const expected = "Original text\nFollowing text";
    assert.strictEqual(removeCostReport(input), expected);
  });

  it("should remove multiple report blocks", () => {
    const input =
      "A\n<!-- ai-cost-report-start -->...<!-- ai-cost-report-end -->\nB\n<!-- ai-cost-report-start -->...<!-- ai-cost-report-end -->\nC";
    const expected = "A\nB\nC";
    assert.strictEqual(removeCostReport(input), expected);
  });

  it("should remove report content based on header and signature if markers are missing", () => {
    const input =
      "A\n## 💰 AI Usage & Cost Report\nSomething\n_Updated automatically by AI Orchestration_\nB";
    const expected = "A\nB";
    assert.strictEqual(removeCostReport(input), expected);
  });

  it("should remove rogue markers", () => {
    const input = "A<!-- ai-usage-report -->B<!-- ai-triage-end -->C";
    const expected = "ABC";
    assert.strictEqual(removeCostReport(input), expected);
  });

  it("should handle empty or null input", () => {
    assert.strictEqual(removeCostReport(""), "");
    assert.strictEqual(removeCostReport(null), "");
  });
});
