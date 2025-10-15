# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY apps/web/package.json apps/web/tsconfig.json apps/web/vite.config.ts apps/web/index.html ./apps/web/
COPY tsconfig.base.json ./
RUN pnpm install --frozen-lockfile --filter trd-web...
COPY apps/web/src ./apps/web/src
RUN pnpm --filter trd-web build

# --- run ---
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# production deps for the tiny server
COPY --from=build /app/apps/web/package.json ./package.json
RUN pnpm install --prod --frozen-lockfile

# built client (from build stage)
COPY --from=build /app/apps/web/dist/client ./dist/client

# runtime server (no TS compile needed)
COPY apps/web/server.mjs ./server.mjs

# boot
CMD ["node", "server.mjs"]
