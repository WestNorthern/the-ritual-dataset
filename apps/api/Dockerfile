# --- build ---
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc tsconfig.base.json ./
COPY apps/api/package.json apps/api/tsconfig.json apps/api/ apps/api/

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm install --frozen-lockfile
RUN pnpm --filter ./apps/api run build

# produce prod-only tree
RUN pnpm --filter ./apps/api... deploy --prod /prod/api

# IMPORTANT: generate client inside the pruned tree (prisma CLI via dlx)
# assumes your schema is at apps/api/prisma/schema.prisma; adjust if needed
RUN cd /prod/api \
 && pnpm dlx prisma@6.17.1 generate --schema=./prisma/schema.prisma

# --- run ---
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production PORT=8080

COPY --from=build /prod/api/ ./

EXPOSE 8080
CMD ["node", "dist/index.js"]
