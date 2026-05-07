## Stage 1 — builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm ci --workspace=@eventgear/api --ignore-scripts

COPY apps/api ./apps/api
COPY packages ./packages

WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

## Stage 2 — runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/node_modules/@prisma ./node_modules/@prisma

RUN npm ci --omit=dev --ignore-scripts

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
