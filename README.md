# The Ritual Dataset

> A participatory study of presence, pattern, and collective anomaly.

Users perform rituals (video-guided sequences), record 30 seconds of silence, and rate their sense of "presence." Fun, spooky, cheeky.

---

## Quick Start (Local Development)

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)
- **Docker** (for PostgreSQL) or a local Postgres instance

### 1. Clone & Install

```bash
git clone <repo-url>
cd the-ritual-dataset
pnpm install
```

### 2. Start PostgreSQL

Using Docker Compose (recommended):

```bash
docker compose up -d
```

Or use your own Postgres and update the connection string.

### 3. Configure Environment

Create `apps/api/.env`:

```bash
cat > apps/api/.env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:55432/trd?schema=public"
JWT_SECRET="change-this-to-a-long-random-string"
EOF
```

Or manually create the file with those values.

### 4. Run Migrations & Seed

```bash
cd apps/api
pnpm prisma migrate deploy
pnpm db:seed
```

### 5. Start Dev Servers

From the project root:

```bash
pnpm dev
```

This starts both:
- **API** → http://localhost:3000
- **Web** → http://localhost:5173

### 6. Open the App

Visit **http://localhost:5173** in your browser.

1. Click **Register** to create an account
2. Go to **Rituals** → select **Bloody Mary**
3. Click **Begin Ritual** and watch it play

---

## Useful Commands

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start all dev servers |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | Lint all packages |
| `pnpm --filter api dev` | Start only the API |
| `pnpm --filter web dev` | Start only the web app |

### Database Commands

```bash
cd apps/api

pnpm prisma studio      # Visual database browser
pnpm prisma migrate dev # Create new migration
pnpm db:seed            # Seed rituals
pnpm db:reset           # Reset DB (destructive!)
```

---

## Project Structure

```
the-ritual-dataset/
├── apps/
│   ├── api/            # Fastify + tRPC + Prisma
│   └── web/            # React + Vite + Tailwind
├── packages/
│   └── domain/         # Pure TypeScript domain logic
├── CLAUDE.md           # Full project reference
├── BATTLEPLAN.md       # Implementation roadmap
└── README.md           # You are here
```

---

## Troubleshooting

### "Database does not exist"
```bash
docker compose up -d    # Make sure Postgres is running
pnpm prisma migrate deploy
```

### "Port already in use"
```bash
lsof -i :3000   # Find what's using the port
kill -9 <PID>   # Kill it
```

### "Prisma schema out of sync"
```bash
cd apps/api
pnpm prisma generate
pnpm prisma migrate deploy
```

### Tests failing
```bash
pnpm test   # Should show 77 passing tests
```

---

## What's Working

- ✅ User registration & login
- ✅ Ritual selection
- ✅ Video playback in immersive mode
- ✅ Ritual overview (purpose, history, requirements)
- ✅ Server-side session & step tracking (API ready)

## What's Next (Phase 1)

- 🔴 Hook up frontend to step tracking API
- 🔴 Audio recording during silence phase
- 🔴 Post-ritual survey UI
- 🔴 Session history page

See `BATTLEPLAN.md` for the full roadmap.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TailwindCSS v4, React Router v7 |
| Data | TanStack Query v5, tRPC v11 |
| Backend | Fastify 5, tRPC, Prisma 6 |
| Database | PostgreSQL |
| Auth | JWT (HttpOnly cookies) |
| Monorepo | pnpm workspaces |

---

Let's ritual. 🕯️

