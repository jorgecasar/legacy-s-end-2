import { describe, it, expect } from "vitest";
import { Result } from "../src/result.js";

describe("Result", () => {
  it("should create a success result with ok()", () => {
    const value = { data: "test" };
    const result = Result.ok(value);

    expect(result.success).toBe(true);
    expect(result.value).toBe(value);
    expect(result.error).toBe(null);
  });

  it("should create a fail result with fail()", () => {
    const error = "Something went wrong";
    const result = Result.fail(error);

    expect(result.success).toBe(false);
    expect(result.value).toBe(null);
    expect(result.error).toBe(error);
  });

  it("should correctly serialize to JSON", () => {
    const value = "success";
    const result = Result.ok(value);

    expect(result.toJSON()).toEqual({
      success: true,
      value: "success",
      error: null,
    });
  });
});
