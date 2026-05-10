# Migração Railway — concluída em 2026-05-10

> EventGear migrado da VPS Hostinger (Easypanel) para Railway com pipeline
> CI/CD totalmente automatizada via GitHub Actions + GHCR.

## URLs de produção

| Serviço | URL |
|---|---|
| API | https://api-production-6757.up.railway.app |
| Web | https://web-production-d5d96.up.railway.app |
| Stripe webhook | `we_1TV9kEQkYQoRUOWm01rEbNiw` (LIVE) |

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub: christopheScantelbury/eventgear (master)           │
└─────────────┬───────────────────────────────────────────────┘
              │ push
              ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions: build-images.yml                           │
│  ─ build-api  → ghcr.io/.../eventgear/api:latest            │
│  ─ build-web  → ghcr.io/.../eventgear/web:latest            │
│  ─ deploy-railway: serviceInstanceRedeploy via GraphQL      │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  Railway project: eventgear (c7af5b1e-...)                  │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │postgres │ │ redis    │ │ api      │ │ web      │         │
│  │16-alpine│ │7-alpine  │ │ GHCR pull│ │ GHCR pull│         │
│  │+ volume │ │+requirepass│         │ │          │         │
│  └─────────┘ └──────────┘ └─────┬────┘ └─────┬────┘         │
│                                 │            │              │
│                                 ▼            ▼              │
│            *.up.railway.app:    api          web            │
└─────────────────────────────────────────────────────────────┘
```

## IDs de referência

```
Project:                c7af5b1e-15cc-4491-9f1a-13c85e77fad7
Environment (prod):     8d753f09-c7e5-4025-b9a9-23447aa2505c
Service postgres:       7044d13d-56fd-4200-bf4d-b81ae655dc7d
Service redis:          49d18efb-ccb0-45ae-a5dd-d7a62eea720c
Service api:            21f30db8-8727-4e9b-93f4-f5e38b47b053
Service web:            6343397c-6844-4cdc-bf1a-e57f37cde83a
Volume postgres:        40e3a135-515f-4c95-a1ad-441f55eb7bfb
GHCR digest (current):  sha256:45ffed84...
```

## Comparação Easypanel → Railway

| Métrica | Easypanel/VPS | Railway |
|---|---|---|
| Build time | 30+ min (travava) | 1.5 min com cache |
| Pull + restart | 7-15 min | 16 segundos |
| Daemon stability | 502 frequente | sem problemas |
| RAM disponível | 2-4 GB total | escalonável |
| Custo | ~€5-10/mês | $5-8/mês (créditos) |

## Pipeline CI/CD

Push em `master` que mude qualquer um dos paths:

- `apps/api/**`
- `apps/web/**`
- `packages/**`
- `package.json`
- `package-lock.json`
- `.github/workflows/build-images.yml`

→ dispara `Build Images (GHCR) + Deploy Railway` automaticamente:

1. `build-api` (Ubuntu runner): build Docker → push `ghcr.io/.../eventgear/api:{latest,sha}`
2. `build-web` (paralelo): build Docker com `NEXT_PUBLIC_API_URL` correto → push `ghcr.io/.../eventgear/web:{latest,sha}`
3. `deploy-railway`:
   - `serviceInstanceRedeploy` no api (puxa nova imagem)
   - `serviceInstanceRedeploy` no web

Tempo total: **~2 min** (com cache GHA), **~7 min** (sem cache).

## Secrets do GitHub Actions

| Secret | Valor (referência em ACESSOS.local.md) |
|---|---|
| `RAILWAY_TOKEN` | account token Railway (UUID) |
| `RAILWAY_ENV_ID` | id do environment de produção |
| `RAILWAY_API_SERVICE_ID` | id do serviço api |
| `RAILWAY_WEB_SERVICE_ID` | id do serviço web |

## Como adicionar dependência ou env var

**Nova env var no API:**
```bash
TOKEN="$RAILWAY_TOKEN"
PROJECT="c7af5b1e-15cc-4491-9f1a-13c85e77fad7"
ENV_ID="8d753f09-c7e5-4025-b9a9-23447aa2505c"
SVC="21f30db8-8727-4e9b-93f4-f5e38b47b053"

curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation V(\$i:VariableUpsertInput!){variableUpsert(input:\$i)}\",
    \"variables\": {
      \"i\": {
        \"projectId\": \"$PROJECT\",
        \"environmentId\": \"$ENV_ID\",
        \"serviceId\": \"$SVC\",
        \"name\": \"NOVA_VAR\",
        \"value\": \"valor\"
      }
    }
  }"
```

Depois disso, dispara redeploy:
```bash
curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation R(\$s:String!,\$e:String!){serviceInstanceRedeploy(serviceId:\$s,environmentId:\$e)}\",\"variables\":{\"s\":\"$SVC\",\"e\":\"$ENV_ID\"}}"
```

## Migrations Prisma

Rodam automaticamente no startup do container API:
```dockerfile
CMD ["sh", "-c", "node node_modules/.bin/prisma migrate deploy && node dist/main"]
```

Para rodar manualmente (ex: durante debug):
1. Ir no Railway → projeto eventgear → service api → tab "Deployments"
2. Clicar nos 3 pontinhos → "Run command" → `npx prisma migrate deploy`

## Backup do Postgres

Railway não faz snapshot automático do volume. Configurar backup manual:

```bash
# A partir de qualquer máquina com pg_dump
PGPASSWORD="EventGearPg2026Secure" pg_dump \
  -h postgres-production-XXXX.up.railway.app \
  -p 5432 \
  -U eventgear \
  -d eventgear \
  --no-owner --no-acl \
  -F c -f eventgear-backup-$(date +%Y%m%d).dump
```

(precisa expor TCP proxy do postgres no Railway primeiro — Settings → Networking)

## Troubleshooting

### API retorna 5xx

```bash
TOKEN="$RAILWAY_TOKEN"
SVC="21f30db8-8727-4e9b-93f4-f5e38b47b053"
DEPLOY=$(curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"query\":\"query D(\$s:String!){deployments(input:{serviceId:\$s},first:1){edges{node{id status}}}}\",\"variables\":{\"s\":\"$SVC\"}}" \
  | grep -oE '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"$//')

curl -s -X POST "https://backboard.railway.app/graphql/v2" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"query\":\"query L(\$d:String!){deploymentLogs(deploymentId:\$d,limit:50){message severity}}\",\"variables\":{\"d\":\"$DEPLOY\"}}" \
  | grep -oE '"message":"[^"]*"' | head -30
```

### Imagem antiga sendo servida

Forçar pull novo trocando tag pra SHA explícito:
```bash
# ghcr.io/.../api:sha-<commit> em vez de :latest
```

(via Railway UI: Service → Settings → Source → Deploy)

### Build falhando

Workflow `Build Images (GHCR) + Deploy Railway` no GitHub Actions tab.
