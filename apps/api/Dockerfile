# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# workspace metadata
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc tsconfig.base.json ./

# app sources
COPY apps/api/package.json apps/api/tsconfig.json apps/api/ apps/api/

# install + build only the API
RUN pnpm install --frozen-lockfile
RUN pnpm --filter ./apps/api run build

# produce pruned prod-only tree for API
RUN pnpm --filter ./apps/api... deploy --prod /prod/api

# generate Prisma client inside the pruned tree (so node_modules contains .prisma)
RUN cd /prod/api \
 && pnpm dlx prisma@6.17.1 generate --schema=./prisma/schema.prisma

# --- run ---
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=8080

# Optional but recommended for Prisma engines on Alpine
RUN apk add --no-cache libc6-compat

# Install Prisma CLI globally so we don't "npx" at runtime
RUN npm i -g prisma@6.17.1

# Bring pruned app (already has generated client in node_modules)
COPY --from=build /prod/api/ ./

EXPOSE 8080
# Run migrations against $DATABASE_URL (from Fly secrets), then start
CMD ["sh", "-lc", "prisma migrate deploy --schema=./prisma/schema.prisma && node dist/index.js"]
