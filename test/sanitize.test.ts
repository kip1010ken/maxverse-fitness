import { describe, expect, it } from "vitest";
import { sanitize } from "../netlify/functions/_lib/sanitize";

describe("sanitize", () => {
  it("trims whitespace", () => {
    expect(sanitize("  hello  ", 100)).toBe("hello");
  });

  it("truncates to maxLength", () => {
    expect(sanitize("hello world", 5)).toBe("hello");
  });

  it("returns empty string for non-string input", () => {
    expect(sanitize(42, 100)).toBe("");
    expect(sanitize(null, 100)).toBe("");
    expect(sanitize(undefined, 100)).toBe("");
    expect(sanitize({}, 100)).toBe("");
  });

  it("returns empty string for empty or whitespace-only input", () => {
    expect(sanitize("", 100)).toBe("");
    expect(sanitize("   ", 100)).toBe("");
  });
});
