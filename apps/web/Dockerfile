# --- build: compile client + prepare prod deps ---
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Workspace metadata (include lockfile!)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc tsconfig.base.json ./

# App sources
COPY apps/web/package.json apps/web/tsconfig.json apps/web/vite.config.ts apps/web/index.html apps/web/
COPY apps/web/src apps/web/src
# server entry lives outside src
COPY apps/web/server.mjs apps/web/server.mjs

# Install workspace deps (lockfile-resolved), then build just the web app
RUN pnpm install --frozen-lockfile
RUN pnpm --filter ./apps/web... run build

# Create a prod-only package tree for the web app (no dev deps)
# This outputs a self-contained package.json + node_modules to /prod/web
RUN pnpm --filter ./apps/web... deploy --prod /prod/web


# --- run: minimal image with prod deps only ---
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=8080
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Bring pruned prod deps (no network install in this stage)
COPY --from=build /prod/web/package.json ./package.json
COPY --from=build /prod/web/node_modules ./node_modules

# Bring built client and runtime server
COPY --from=build /app/apps/web/dist/client ./dist/client
COPY --from=build /app/apps/web/server.mjs ./server.mjs

# Health check path is /health (configured in server.mjs)
CMD ["node", "--trace-uncaught", "server.mjs"]
