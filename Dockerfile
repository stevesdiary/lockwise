# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
COPY migrations ./migrations
COPY seeders ./seeders
COPY scripts ./scripts

RUN pnpm run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output and runtime assets
COPY --from=builder /app/build ./build
COPY migrations ./migrations
COPY seeders ./seeders
COPY scripts ./scripts

ENV NODE_ENV=production

EXPOSE 3002

CMD ["node", "./build/src/main.js"]
