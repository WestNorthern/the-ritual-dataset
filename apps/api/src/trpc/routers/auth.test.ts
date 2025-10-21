import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { authRouter } from "./auth.js";

// --- Mocks -----------------------------------------------------------------------------

// Match the EXACT import specifiers used in auth.ts
vi.mock("../../prisma.js", () => ({
  prisma: {
    authIdentity: { findUnique: vi.fn() },
    witness: { findUnique: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("../../utils/cookies.js", () => ({
  setSessionCookie: vi.fn(),
  clearSessionCookie: vi.fn(),
}));

// bcrypt is dynamically imported in the router; we still mock the module
vi.mock("bcryptjs", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    hash: vi.fn(),
    compare: vi.fn(),
  };
});

// Pull mocked things for convenience
import { prisma } from "../../prisma.js";
import { setSessionCookie, clearSessionCookie } from "../../utils/cookies.js";
import { hash as bcryptHash, compare as bcryptCompare } from "bcryptjs";

// --- Helpers ----------------------------------------------------------------------------

type PartialCtx = {
  req?: any;
  reply?: any;
};

function makeCtx(overrides: PartialCtx = {}) {
  return {
    req: { ...overrides.req },
    reply: {
      jwtSign: vi.fn().mockResolvedValue("jwt-token"),
      setCookie: vi.fn(),
      clearCookie: vi.fn(),
      header: vi.fn(),
      ...overrides.reply,
    },
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

// --- Tests ------------------------------------------------------------------------------

describe("auth.registerLocal", () => {
  it("returns existing witness and sets cookie when identity already exists", async () => {
    (prisma.authIdentity.findUnique as any).mockResolvedValue({ witnessId: "W1" });
    (prisma.witness.findUnique as any).mockResolvedValue({
      id: "W1",
      alias: "Alice",
      fullName: null,
    });

    const ctx = makeCtx();
    const input = {
      email: "a@b.com",
      password: "123456789012",
      alias: "Alice",
      fullName: undefined,
    };

    const res = await authRouter.createCaller(ctx as any).registerLocal(input);

    expect(ctx.reply.jwtSign).toHaveBeenCalledWith({ wid: "W1" });
    expect(setSessionCookie).toHaveBeenCalledWith(ctx.reply, "jwt-token");
    expect(res).toEqual({
      witness: { id: "W1", alias: "Alice", fullName: null },
      already: true,
    });
  });

  it("creates a new witness, hashes password, sets cookie, and returns witness", async () => {
    (prisma.authIdentity.findUnique as any).mockResolvedValue(null);
    (bcryptHash as any).mockResolvedValue("hashed");
    (prisma.witness.create as any).mockResolvedValue({
      id: "W2",
      alias: "Bob",
      fullName: "Bob B",
    });

    const ctx = makeCtx();
    const input = {
      email: "bob@example.com",
      password: "123456789012",
      alias: "Bob",
      fullName: "Bob B",
    };

    const res = await authRouter.createCaller(ctx as any).registerLocal(input);

    expect(bcryptHash).toHaveBeenCalledWith("123456789012", 10);
    expect(ctx.reply.jwtSign).toHaveBeenCalledWith({ wid: "W2" });
    expect(setSessionCookie).toHaveBeenCalledWith(ctx.reply, "jwt-token");
    expect(res).toEqual({
      witness: { id: "W2", alias: "Bob", fullName: "Bob B" },
    });

    // Ensure witness.create was called with expected shape (roughly)
    const args = (prisma.witness.create as any).mock.calls[0][0];
    expect(args.data.alias).toBe("Bob");
    expect(args.data.identities.create.email).toBe("bob@example.com");
    expect(args.data.identities.create.passwordHash).toBe("hashed");
  });
});

describe("auth.loginLocal", () => {
  it("throws UNAUTHORIZED if identity not found or no passwordHash", async () => {
    (prisma.authIdentity.findUnique as any).mockResolvedValue(null);

    await expect(
      authRouter.createCaller(makeCtx() as any).loginLocal({
        email: "nope@example.com",
        password: "123456789012",
      }),
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("throws UNAUTHORIZED if bcrypt.compare fails", async () => {
    (prisma.authIdentity.findUnique as any).mockResolvedValue({
      passwordHash: "hash",
      witness: { id: "W1", alias: "Alice", fullName: null },
    });
    (bcryptCompare as any).mockResolvedValue(false);

    await expect(
      authRouter.createCaller(makeCtx() as any).loginLocal({
        email: "a@b.com",
        password: "wrongwrongwrong",
      }),
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("sets cookie and returns witness on success", async () => {
    (prisma.authIdentity.findUnique as any).mockResolvedValue({
      passwordHash: "hash",
      witness: { id: "W1", alias: "Alice", fullName: null },
    });
    (bcryptCompare as any).mockResolvedValue(true);

    const ctx = makeCtx();
    const res = await authRouter.createCaller(ctx as any).loginLocal({
      email: "a@b.com",
      password: "123456789012",
    });

    expect(ctx.reply.jwtSign).toHaveBeenCalledWith({ wid: "W1" });
    expect(setSessionCookie).toHaveBeenCalledWith(ctx.reply, "jwt-token");
    expect(res).toEqual({
      ok: true,
      witness: { id: "W1", alias: "Alice", fullName: null },
    });
  });
});

describe("auth.me", () => {
  it("returns null if jwtVerify is not available", async () => {
    const ctx = makeCtx({ req: {} }); // no jwtVerify
    const res = await authRouter.createCaller(ctx as any).me();
    expect(res).toBeNull();
  });

  it("returns null if jwtVerify throws", async () => {
    const ctx = makeCtx({
      req: { jwtVerify: vi.fn().mockRejectedValue(new Error("bad token")) },
    });
    const res = await authRouter.createCaller(ctx as any).me();
    expect(res).toBeNull();
  });

  it("returns witness summary if token is valid and witness exists", async () => {
    const ctx = makeCtx({
      req: { jwtVerify: vi.fn().mockResolvedValue({ wid: "W9" }) },
    });
    (prisma.witness.findUnique as any).mockResolvedValue({
      id: "W9",
      alias: "Nine",
      fullName: "Nina Nine",
    });

    const res = await authRouter.createCaller(ctx as any).me();

    expect(prisma.witness.findUnique).toHaveBeenCalledWith({
      where: { id: "W9" },
      select: { id: true, alias: true, fullName: true },
    });
    expect(res).toEqual({ id: "W9", alias: "Nine", fullName: "Nina Nine" });
  });

  it("returns null if token is valid but witness not found", async () => {
    const ctx = makeCtx({
      req: { jwtVerify: vi.fn().mockResolvedValue({ wid: "W404" }) },
    });
    (prisma.witness.findUnique as any).mockResolvedValue(null);

    const res = await authRouter.createCaller(ctx as any).me();
    expect(res).toBeNull();
  });
});

describe("auth.logout", () => {
  it("clears session cookie", async () => {
    const ctx = makeCtx();
    const res = await authRouter.createCaller(ctx as any).logout();
    expect(res).toEqual({ ok: true });
    expect(clearSessionCookie).toHaveBeenCalledWith(ctx.reply);
  });
});
