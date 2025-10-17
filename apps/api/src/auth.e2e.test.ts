import { beforeAll, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import { buildServer } from "./server";

let app: Awaited<ReturnType<typeof buildServer>>;

describe("auth flow", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET ||= "test-secret-change-me";
    process.env.DATABASE_URL ||= "postgresql://postgres:postgres@localhost:55432/trd";
    app = buildServer();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("register → login → me → logout", async () => {
    const email = "smoke@example.com";
    const password = "longpassword123";
    const alias = "smoky";
    const fullName = "Smoke Test";

    const agent = request.agent(app.server); // 👈 persist cookies

    // Register (idempotent)
    const reg = await agent
      .post("/trpc/auth.registerLocal")
      .set("content-type", "application/json")
      .send({ email, password, alias, fullName });

    if (![200, 409].includes(reg.status)) {
      throw new Error(`Register failed: ${reg.status} ${reg.text}`);
    }

    // Login (agent keeps cookies after this, too)
    const login = await agent
      .post("/trpc/auth.loginLocal")
      .set("content-type", "application/json")
      .send({ email, password });

    if (login.status !== 200) {
      throw new Error(`Login failed: ${login.status} ${login.text}`);
    }

    // Me (no manual cookie handling needed)
    const me = await agent.get('/trpc/auth.me').expect(200);
    // Useful when debugging:
    expect(me.body).toHaveProperty('result.data'); // helps catch null vs undefined
    expect(me.body.result.data).toMatchObject({ alias }); // now should pass

    // Logout
    const out = await agent
      .post("/trpc/auth.logout")
      .set("content-type", "application/json")
      .send({})
      .expect(200);

    expect(out.body?.result?.data?.ok).toBe(true);
  });
});