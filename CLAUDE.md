# The Ritual Dataset — Project Reference

> A participatory study of presence, pattern, and collective anomaly.

## 🎯 Project Goal

Build an MVP web app where users can:

1. **Select and perform a ritual** — a sequence of short videos with audio + subtitles
2. **Record 30 seconds of silence** during the ritual's silence phase
3. **Submit a survey** rating their sense of "presence" (0–5)
4. **Unlock new rituals** on "The Path" as they complete more sessions (future gamification)

The app is **fun, spooky, and cheeky**. For the MVP, we aren't actually saving audio — we'll "pretend" the recording succeeded if the environment was quiet enough.

### Future Goals

- **Audio dataset collection**: Real audio recording during silence phase for analysis by researchers
- **Gamification / "The Path"**: Users unlock rituals as they progress
- **Admin panel**: Non-technical admins can add/edit rituals via UI (CRUD + video upload + markdown editor)
- **Research dashboard**: Public or authenticated view of aggregate data

---

## 🛠 Tech Stack

### Monorepo Structure

```
the-ritual-dataset/
├── apps/
│   ├── api/          # Fastify + tRPC + Prisma
│   └── web/          # React + Vite + TailwindCSS
├── packages/
│   ├── domain/       # Pure TypeScript domain logic (no infra deps)
│   ├── application/  # (planned) Use cases / orchestration
│   ├── infrastructure/  # (planned) Adapters (storage, email, etc.)
│   └── ui/           # (planned) Shared UI components
└── pnpm-workspace.yaml
```

### Frontend (`apps/web`)

| Layer | Tech | Notes |
|-------|------|-------|
| Framework | **React 18** | Strict mode enabled |
| Bundler | **Vite 5** | Fast HMR, ESM-first |
| Styling | **TailwindCSS v4** | Utility-first, CSS variables for theming |
| Routing | **React Router v7** | `createBrowserRouter` with nested layouts |
| Data Fetching | **TanStack Query v5** + **tRPC React v11** | Type-safe, cached, declarative |
| Forms | (TBD) | Consider React Hook Form or native |
| State | React Context + TanStack Query cache | No Redux needed |

### Backend (`apps/api`)

| Layer | Tech | Notes |
|-------|------|-------|
| Framework | **Fastify 5** | Fast, plugin-based |
| API | **tRPC v11** | End-to-end type safety |
| Database | **PostgreSQL** via **Prisma 6** | Migrations, type-safe queries |
| Auth | **JWT** (HttpOnly cookies) | `@fastify/jwt` + `@fastify/cookie` |
| Password Hashing | **bcryptjs** | (argon2 also installed) |
| Validation | **Zod** | Shared with tRPC inputs |

### Domain (`packages/domain`)

Pure TypeScript with no framework dependencies:
- Branded types (`UUID`, `ISODateTime`)
- Entities: `Ritual`, `Session`, `Witness`
- State machine functions for session progression
- Tested with Vitest

### Hosting (Production)

- **Fly.io** (Dockerized API + Web)
- Database: Fly Postgres or external (Supabase, Neon)
- Storage: (TBD) S3, Cloudflare R2, or Supabase Storage for videos/audio

---

## 📐 Conventions & Best Practices

### TanStack Query / tRPC

```typescript
// ✅ Good: Configure QueryClient with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // 1 min — don't refetch if fresh
      gcTime: 1000 * 60 * 10,     // 10 min — keep in cache
      retry: 1,                    // Retry once on failure
      refetchOnWindowFocus: false, // Explicit refetches preferred
    },
    mutations: {
      retry: 0,                    // Don't retry mutations
    },
  },
});

// ✅ Good: Use query hooks with explicit options
const { data, isLoading, error } = trpc.rituals.list.useQuery(undefined, {
  staleTime: 5 * 60 * 1000,  // Override default if needed
});

// ✅ Good: Use utils for cache invalidation after mutations
const utils = trpc.useUtils();
const mutation = trpc.sessions.start.useMutation({
  onSuccess: () => {
    utils.sessions.list.invalidate();  // Invalidate related queries
  },
});

// ✅ Good: Optimistic updates for snappy UX
const updateProfile = trpc.auth.updateProfile.useMutation({
  onMutate: async (newData) => {
    await utils.auth.me.cancel();
    const prev = utils.auth.me.getData();
    utils.auth.me.setData(undefined, (old) => ({ ...old!, ...newData }));
    return { prev };
  },
  onError: (err, newData, ctx) => {
    utils.auth.me.setData(undefined, ctx?.prev);
  },
  onSettled: () => {
    utils.auth.me.invalidate();
  },
});
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `SessionRunner.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`)
- Utilities: `camelCase.ts` (e.g., `cookies.ts`)
- Routes: `kebab-case` in URLs (e.g., `/app/rituals/start`)

### TypeScript

- **Never use `any`** — always use proper types or `unknown` with type guards
- For Fastify plugin types (JWT, cookies), extend the base types:

```typescript
// ✅ Good: Extend Fastify types for JWT
type RequestWithJwt = FastifyRequest & {
  jwtVerify: <T = unknown>() => Promise<T>;
};

const req = ctx.req as Partial<RequestWithJwt>;
if (typeof req.jwtVerify !== "function") return null;

// ❌ Bad: Using any
const req: any = ctx.req;
```

- Use branded types for domain IDs: `UUID`, `ISODateTime`
- Prefer `unknown` over `any` for external data, then narrow with type guards

### Styling

- Use Tailwind utility classes directly
- Extract to components, not CSS files
- CSS variables in `:root` for theme tokens
- "Immersive mode" toggles `html.immersive` class

### Domain Logic

- Keep `packages/domain` pure — no Prisma, no HTTP, no React
- Domain functions are pure and return new state (immutable style)
- Validation happens at domain boundaries (create/update functions)

### API Patterns

- Routers are small and focused (auth, rituals, sessions)
- Use Zod schemas for input validation
- Return minimal data needed by client
- Protected routes extract `wid` from JWT

---

## 🗺 Current State & Known Gaps

### ✅ Working

- [x] User registration/login (local email + password)
- [x] JWT auth with HttpOnly cookies
- [x] Ritual listing and selection
- [x] Session creation
- [x] Video playback in immersive mode
- [x] Ritual overview with markdown (purpose, history, requirements)
- [x] Protected routes

### 🔴 Not Yet Implemented

- [ ] Audio recording during silence phase
- [ ] Post-ritual survey UI + API
- [ ] Server-side step progression tracking
- [ ] Session history page (`/app/sessions`)
- [ ] Profile page (`/app/profile`)
- [ ] Research/data page (`/research`)
- [ ] Admin panel for ritual management
- [ ] Gamification / unlocking rituals

### 🟡 Needs Improvement

- [ ] Domain ↔ Prisma type alignment
- [ ] Remove hardcoded `META_BY_SLUG` in rituals router
- [ ] Add skeleton loaders and error boundaries
- [ ] Complete Enochian ritual steps (only has Preparation)
- [ ] Silence phase countdown timer + recording indicator
- [ ] Mobile responsiveness polish
- [ ] Spookier UI aesthetic

---

## 🎨 Design Direction

**Vibe**: Spooky, cheeky, mysterious — like a séance run by someone with good taste.

- **Colors**: Black + white primary, with a "volt" accent (`#ceff00`) for emphasis
- **Typography**: Consider display fonts for headings (Cinzel, Playfair Display, EB Garamond)
- **Textures**: Subtle grain/noise, candle flicker effects
- **Motion**: Smooth fades, staggered reveals, auto-hiding controls
- **Immersive mode**: Full black background, video fills viewport, nav hides

---

## 📁 Key Files

| Path | Purpose |
|------|---------|
| `apps/web/src/client/main.tsx` | React entrypoint, providers setup |
| `apps/web/src/lib/trpc.ts` | tRPC client factory |
| `apps/web/src/routes.tsx` | React Router config |
| `apps/web/src/pages/SessionRunner.tsx` | Main ritual playback UI |
| `apps/api/src/trpc/root.ts` | tRPC router aggregation |
| `apps/api/src/trpc/routers/` | Individual routers (auth, rituals, sessions) |
| `apps/api/prisma/schema.prisma` | Database schema |
| `packages/domain/src/` | Pure domain logic |

---

## 🧪 Testing

- **Unit tests**: Vitest for domain logic and utilities
- **Integration tests**: Vitest for API routers
- **E2E tests**: (TBD) Consider Playwright for critical flows

Run tests:
```bash
pnpm test          # Run all tests
pnpm dev:test      # Watch mode
pnpm test:ci       # Exclude e2e tests
```

---

## 🚀 Development

```bash
# Install dependencies
pnpm install

# Start database (if local)
docker compose up -d postgres

# Run migrations
pnpm --filter api prisma:migrate

# Seed data
pnpm --filter api db:seed

# Start dev servers
pnpm dev           # Runs all apps in parallel
# Or individually:
pnpm --filter api dev
pnpm --filter web dev
```

API runs on `http://localhost:3000`
Web runs on `http://localhost:5173` (proxies `/trpc` to API)

