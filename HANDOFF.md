# HANDOFF.md — EventGear

> Documento de continuidade entre agentes Claude.
> **Última atualização:** 2026-05-11
> **Branch principal:** `master` (deploy automático)

---

## Identidade

Você é um desenvolvedor full-stack da **ScantelburyDevs** trabalhando no projeto **EventGear** — PWA mobile-first para controle de equipamentos de eventos (cadastro, alocação por evento, checklist saída/retorno via QR Code).

**Stack resumida:** NestJS (API) + Next.js 14 (Web PWA) + PostgreSQL + Redis + MinIO, monorepo Turborepo.
**Deploy:** API → Railway (Docker/GHCR) | Web → Vercel

> Stack completa, modelo de dados, endpoints e convenções: ver [CLAUDE.md](CLAUDE.md).
> Credenciais: ver [ACESSOS.local.md](ACESSOS.local.md) (gitignored).

---

## Estado atual da plataforma

### Infra de produção — ✅ Online

| Serviço | URL / Plataforma |
|---|---|
| **Web (frontend)** | https://eventgear-web-christophescantelburys-projects.vercel.app — **Vercel** |
| **API (backend)** | https://api-production-6757.up.railway.app — **Railway** |
| Swagger | https://api-production-6757.up.railway.app/api/docs (SWAGGER_ENABLED=true) |
| Project Railway | `c7af5b1e-15cc-4491-9f1a-13c85e77fad7` |
| Env produção Railway | `8d753f09-c7e5-4025-b9a9-23447aa2505c` |
| Project Vercel | `prj_l5MiflAWEKvt91nG8B7CUSdpaZbL` |

Pipeline CI/CD: GitHub Actions → build imagens → push GHCR → `serviceInstanceRedeploy` via GraphQL Railway. Runbook completo em [docs/MIGRATE_RAILWAY.md](docs/MIGRATE_RAILWAY.md).

### Integrações

- **Stripe LIVE** ativo (planos Básico R$79 / Pro R$149 / Business R$249) — webhook `we_1TV9kEQkYQoRUOWm01rEbNiw` apontando para a URL antiga do Easypanel. **⚠️ Precisa ser atualizado para a URL Railway** (`https://api-production-6757.up.railway.app/v1/billing/webhook`).
- **Brevo SMTP** configurado (`no-reply@eventgear.com.br`).
- **GHCR** como container registry (`ghcr.io/christopheScantelbury/eventgear/{api,web}:latest`).

### Funcionalidades já entregues

Pelo histórico de commits, o MVP foi muito além do roadmap original do CLAUDE.md. Já entregues:

- **Auth completo** — register, login, refresh, JWT, roles (ADMIN/OPERATOR), reset de senha, painel admin de usuários.
- **Materiais** — CRUD + fotos (MinIO) + QR code + impressão de etiquetas em PDF.
- **Eventos** — CRUD + alocação + calendário visual + customer picker.
- **Checklist** — saída/retorno com leitor QR nativo no PWA.
- **CRM** — módulo de clientes (`wave 1`).
- **Billing Stripe** — planos linkados a products/prices LIVE, checkout, customer portal.
- **PWA offline-first** — IndexedDB + sync queue + scanner QR nativo.
- **Landing page** — pricing, ecossistema ScantelburyDevs, trial 1 mês.

### Pendências conhecidas

1. **Atualizar URL do webhook Stripe** para o endpoint Railway (a URL atual aponta pro Easypanel desativado).
2. **Domínio customizado** `eventgear.com.br` — ainda usando subdomínios `*.up.railway.app`.
3. **Backup automático do Postgres** — Railway não snapshota volume; precisa script de `pg_dump` agendado.
4. **Cobertura de testes** — `make test` existe, mas não há evidência de execução recente no CI.
5. **Documentação Swagger** em `/api/docs` — verificar se está exposta em produção.

---

## Onde encontrar contexto

| Pergunta | Arquivo |
|---|---|
| Stack, modelo de dados, endpoints, convenções | [CLAUDE.md](CLAUDE.md) |
| Credenciais (Railway, Stripe, SMTP, Postgres) | [ACESSOS.local.md](ACESSOS.local.md) — **NÃO COMMITAR** |
| Runbook de deploy + troubleshooting Railway | [docs/MIGRATE_RAILWAY.md](docs/MIGRATE_RAILWAY.md) |
| Como buildar/pushar imagens no GHCR | [docs/DEPLOY_GHCR.md](docs/DEPLOY_GHCR.md) |
| Roteiro de QA manual end-to-end | [docs/QA_TEST_PROMPT.md](docs/QA_TEST_PROMPT.md) |
| Tarefas de frontend pendentes (legado) | [EventGear_Frontend_Tasks.md](EventGear_Frontend_Tasks.md) |

---

## Fluxo de trabalho (regras)

1. **Sempre ler `ACESSOS.local.md` antes** de operar Railway, Stripe, GHCR ou banco.
2. **Não commitar `ACESSOS.local.md`** — está no `.gitignore`.
3. **Push em `main`** dispara build+deploy automático (ver paths em [docs/MIGRATE_RAILWAY.md](docs/MIGRATE_RAILWAY.md)).
4. **Migrations Prisma** rodam no startup do container API (`prisma migrate deploy` no CMD do Dockerfile).
5. **Conventional Commits** via Commitizen — formato `feat(scope): ...`, `fix(scope): ...`, etc.
6. **Logs Railway** acessíveis via GraphQL (snippet em [docs/MIGRATE_RAILWAY.md](docs/MIGRATE_RAILWAY.md#api-retorna-5xx)).

---

## Como continuar daqui

Antes de mexer em qualquer coisa:

```bash
git status                  # confirmar estado limpo
git log --oneline -10       # ver últimos commits
git pull origin main        # sincronizar
```

Se for tarefa nova, pergunte ao usuário o escopo. Se for continuidade, verifique:
- Issues abertas no GitHub (`gh issue list`)
- PRs em revisão (`gh pr list`)
- Pendências da seção acima

**Não inicie deploy/migrations destrutivos sem confirmar com o usuário.**
