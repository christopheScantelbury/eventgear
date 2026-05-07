.PHONY: install dev build lint test test:unit test:e2e \
        db:migrate db:studio db:reset db:generate \
        up down logs build:docker secrets

# ── Setup ──────────────────────────────────────────────────────────
install:
	npm install

dev:
	docker-compose up -d postgres redis minio
	turbo run dev

# ── Qualidade ──────────────────────────────────────────────────────
lint:
	turbo run lint

test:
	turbo run test

test\:unit:
	cd apps/api && npx vitest run

test\:e2e:
	turbo run test:e2e

# ── Banco ──────────────────────────────────────────────────────────
db\:migrate:
	cd apps/api && npx prisma migrate dev

db\:studio:
	cd apps/api && npx prisma studio

db\:reset:
	cd apps/api && npx prisma migrate reset --force && npx prisma db seed

db\:generate:
	cd apps/api && npx prisma generate

# ── Docker ─────────────────────────────────────────────────────────
up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

build\:docker:
	docker build -t ghcr.io/christophescantelbury/eventgear-api:latest apps/api
	docker build -t ghcr.io/christophescantelbury/eventgear-web:latest apps/web

# ── Secrets ────────────────────────────────────────────────────────
secrets:
	@echo "JWT_SECRET=$$(openssl rand -hex 32)"
	@echo "JWT_REFRESH_SECRET=$$(openssl rand -hex 32)"
	@echo "POSTGRES_PASSWORD=$$(openssl rand -hex 16)"
	@echo "REDIS_PASSWORD=$$(openssl rand -hex 16)"
	@echo "MINIO_ROOT_USER=eventgear"
	@echo "MINIO_ROOT_PASSWORD=$$(openssl rand -hex 16)"
