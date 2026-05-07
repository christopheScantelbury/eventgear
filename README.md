# EventGear

Sistema web mobile-first (PWA) para controle de equipamentos de eventos.

**ScantelburyDevs** · Build · Migrate · Innovate

---

## Stack

- **Frontend:** Next.js 14 + Tailwind CSS + shadcn/ui (PWA)
- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL 16
- **Cache/Filas:** Redis + BullMQ
- **Storage:** MinIO self-hosted
- **Deploy:** Easypanel (VPS) + GitHub Actions

## Setup local

```bash
# 1. Clonar e instalar
git clone https://github.com/christopheScantelbury/eventgear.git
cd eventgear
npm install

# 2. Variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 3. Subir serviços e iniciar dev
make dev

# 4. Migrations
make db:migrate
```

## Documentação

- API Swagger: http://localhost:3001/api/docs
- CLAUDE.md: manifesto completo do projeto
- docs/: architecture, API contracts, test reports
