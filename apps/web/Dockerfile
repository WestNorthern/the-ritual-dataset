# --- build: compile client + prepare prod deps ---
FROM node:20-alpine AS build
WORKDIR /app
ARG GIT_SHA=dev
ENV GIT_SHA=$GIT_SHA
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Workspace metadata (include lockfile!)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc tsconfig.base.json ./

# App sources
COPY apps/web/package.json apps/web/tsconfig.json apps/web/vite.config.ts apps/web/index.html apps/web/
COPY apps/web/src apps/web/src
COPY apps/web/server.mjs apps/web/server.mjs

# Install workspace deps (lockfile-resolved), then build just the web app
RUN pnpm install --frozen-lockfile
RUN pnpm --filter ./apps/web... run build

# Produce pruned prod-only tree for web (node_modules + package.json + built files)
RUN pnpm --filter ./apps/web... deploy --prod /prod/web


# --- run: minimal image with prod deps only ---
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=8080

# Bring everything produced by pnpm deploy (includes node_modules, server.mjs, dist/)
COPY --from=build /prod/web/ ./

EXPOSE 8080
CMD ["node", "server.mjs"]
