import { describe, it, expect } from "vitest";
import { sanitizeNext } from "./next";

describe("sanitizeNext", () => {
  it("allows internal paths", () => {
    expect(sanitizeNext("/app")).toBe("/app");
    expect(sanitizeNext("/app?x=1#h")).toBe("/app?x=1#h");
  });
  it("blocks protocol-relative or external urls", () => {
    expect(sanitizeNext("//evil.com")).toBe("/app");
    expect(sanitizeNext("https://evil.com")).toBe("/app");
  });
  it("decodes once and keeps it internal", () => {
    expect(sanitizeNext("%2Fapp")).toBe("/app");
  });
  it("falls back safely on parse errors", () => {
    // malformed escape
    expect(sanitizeNext("%")).toBe("/app");
  });
});
