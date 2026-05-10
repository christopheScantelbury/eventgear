# ── Stage 1: deps ──────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# instala dependências nativas necessárias (bcrypt, sharp)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/ ./packages/

# Reduz pressão de memória/CPU na VPS pequena:
# --maxsockets=2 limita downloads paralelos; --no-audit/--no-fund evita HTTP extra;
# NODE_OPTIONS limita heap do Node durante o install.
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm ci --ignore-scripts --maxsockets=2 --no-audit --no-fund --prefer-offline
# rebuild nativos (bcrypt, sharp) para o ambiente Alpine
RUN npm rebuild bcrypt --prefix apps/api || true
RUN npm rebuild sharp --prefix apps/api || true

# ── Stage 2: builder ────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN npx --prefix /app prisma generate
RUN npx --prefix /app nest build

# ── Stage 3: runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# dumb-init: graceful shutdown
# openssl: Prisma engine precisa de libssl no runtime (linux-musl-openssl-3.0.x)
RUN apk add --no-cache dumb-init openssl

# apenas o runtime mínimo necessário
COPY --from=builder /app/apps/api/dist               ./dist
COPY --from=builder /app/apps/api/prisma             ./prisma
COPY --from=builder /app/apps/api/package*.json      ./
COPY --from=builder /app/node_modules                ./node_modules

EXPOSE 3001

# dumb-init garante tratamento correto de sinais (SIGTERM → graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "node node_modules/.bin/prisma migrate deploy && node dist/main"]
