import { describe, it, expect } from "vitest";
import { appRouter } from "./trpc.js";

describe("appRouter", () => {
  it("ping returns ok + ts", async () => {
    const res = await appRouter.createCaller({}).ping();
    expect(res.ok).toBe(true);
    expect(typeof res.ts).toBe("number");
  });
});
