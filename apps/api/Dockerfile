# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/
COPY tsconfig.base.json ./
RUN pnpm install --frozen-lockfile --filter trd-api...
COPY apps/api/src ./apps/api/src
RUN pnpm --filter trd-api build

# --- run ---
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/dist ./dist
RUN pnpm install --prod --frozen-lockfile
CMD ["node", "dist/index.js"]