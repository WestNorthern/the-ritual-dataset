# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
ARG GIT_SHA=dev
ENV GIT_SHA=$GIT_SHA
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# workspace metadata (include lockfile)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc tsconfig.base.json ./

# app sources
COPY apps/api/package.json apps/api/tsconfig.json apps/api/ apps/api/

# install + build only the API
RUN pnpm install --frozen-lockfile
RUN pnpm --filter ./apps/api... run build

# create prod-only package tree for API
RUN pnpm --filter ./apps/api... deploy --prod /prod/api


# --- run ---
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=8080
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# bring pruned prod deps (no network install here)
COPY --from=build /prod/api/package.json ./package.json
COPY --from=build /prod/api/node_modules ./node_modules

# bring compiled server
COPY --from=build /app/apps/api/dist ./dist

CMD ["node", "dist/index.js"]
