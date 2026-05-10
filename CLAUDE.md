# CLAUDE.md — EventGear
> Manifesto de desenvolvimento para Claude Code · ScantelburyDevs

---

## 1. IDENTIDADE DO PROJETO

**Produto:** EventGear
**Empresa:** ScantelburyDevs
**Tagline:** Build · Migrate · Innovate
**Slogan:** Seu código. Nossa precisão.
**Descrição:** Sistema web mobile-first (PWA) para controle de equipamentos de eventos — cadastro de materiais, alocação por evento e checklist de saída/retorno via QR Code.
**Público-alvo:** Produtores de eventos (empresas de som, iluminação, tendas, palcos e similares)

---

## 2. STACK TÉCNICA — DECISÕES FINAIS

### Frontend (PWA)
| Componente | Tecnologia | Versão |
|---|---|---|
| Framework | **Next.js** (App Router) | 14.x |
| UI Components | **shadcn/ui** + **Tailwind CSS** | latest / 3.x |
| Formulários | **React Hook Form** + **Zod** | 7.x / 3.x |
| Estado global | **Zustand** | 4.x |
| Server state | **TanStack Query** | 5.x |
| HTTP client | **Axios** | 1.x |
| QR Code leitura | **html5-qrcode** | 2.x |
| QR Code geração | **qrcode** | 1.x |
| Impressão | **react-to-print** | latest |

### Backend (API REST)
| Componente | Tecnologia | Versão |
|---|---|---|
| Runtime | **Node.js** | 20 LTS |
| Framework | **NestJS** | 10.x |
| Linguagem | **TypeScript** | 5.x |
| ORM | **Prisma** | 5.x |
| Banco | **PostgreSQL** | 16 |
| Cache/Filas | **Redis** + **BullMQ** | 7.x / 5.x |
| Auth | **Passport.js** (JWT strategy) | latest |
| Validação | **class-validator** + **class-transformer** | latest |
| Upload | **Multer** | latest |
| Imagens | **Sharp** | latest |
| PDF | **PDFKit** | latest |
| E-mail | **Nodemailer** | latest |
| Storage | **MinIO SDK** | latest |

### Infra / DevOps
| Serviço | Plataforma | Custo estimado |
|---|---|---|
| API (NestJS) | **Railway** — serviço Docker GHCR | ~$5-10/mês |
| Frontend (Next.js PWA) | **Railway** — serviço Docker GHCR | ~$3-5/mês |
| Banco de dados | **Railway** — PostgreSQL plugin | ~$5/mês |
| Cache / Filas | **Railway** — Redis plugin | ~$3/mês |
| Storage de arquivos | **Railway** — MinIO Docker + Volume | ~$3/mês |
| Container Registry | **GHCR** (GitHub Container Registry) | $0 |
| CI/CD | **GitHub Actions** + Railway deploy hooks | $0 |
| Proxy / HTTPS | Railway domains + Let's Encrypt | $0 |
| Monitoramento | Railway health checks + metrics | $0 |
| **Total estimado** | | **~$19-26/mês** |

### Qualidade
| Ferramenta | Finalidade |
|---|---|
| ESLint + Prettier | Padronização em todo o monorepo |
| Husky + lint-staged | Git hooks pre-commit |
| Vitest | Testes unitários (backend) |
| Playwright | Testes E2E |
| Commitizen | Conventional Commits |
| Turborepo | Monorepo + cache de builds |

---

## 3. ESTRUTURA DO MONOREPO

```
eventgear/
├── apps/
│   ├── web/                    # Next.js 14 PWA → Easypanel
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, registro
│   │   │   ├── (dashboard)/    # Área autenticada
│   │   │   │   ├── materials/  # Inventário de equipamentos
│   │   │   │   ├── events/     # Eventos e alocação
│   │   │   │   └── checklist/  # Checklist saída/retorno
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui base
│   │   │   └── qr/             # Leitor e gerador QR Code
│   │   ├── lib/
│   │   │   ├── api.ts          # Axios instance
│   │   │   └── auth.ts         # Helpers JWT
│   │   ├── public/
│   │   │   └── manifest.json   # PWA manifest
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   └── tailwind.config.ts
│   └── api/                    # NestJS → Easypanel
│       ├── src/
│       │   ├── auth/           # Módulo Auth (JWT, refresh, register)
│       │   ├── materials/      # Módulo Materiais
│       │   ├── events/         # Módulo Eventos
│       │   ├── checklist/      # Módulo Checklist
│       │   ├── reports/        # Módulo Relatórios
│       │   ├── storage/        # Módulo MinIO
│       │   ├── mail/           # Módulo e-mail
│       │   ├── common/         # Guards, decorators, filters
│       │   └── main.ts
│       ├── prisma/
│       │   └── schema.prisma
│       ├── package.json
│       ├── tsconfig.json
│       ├── nest-cli.json
│       └── Dockerfile
├── packages/
│   ├── shared/                 # Tipos TS + schemas Zod compartilhados
│   └── ui/                     # Design system (componentes React)
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint + test (todo PR)
│       └── deploy.yml          # Build Docker + push GHCR + Easypanel webhook
├── docker-compose.yml          # Dev local: postgres, redis, minio
├── turbo.json
├── package.json                # Workspace raiz
├── Makefile                    # Comandos unificados
├── .env.example
├── ACESSOS.local.md            # NÃO COMMITADO — credenciais locais
└── CLAUDE.md                   # Este arquivo
```

---

## 4. MODELO DE DADOS (Prisma)

```prisma
model Company {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?
  createdAt DateTime @default(now())
  users     User[]
  materials Material[]
  events    Event[]
}

model User {
  id           String   @id @default(cuid())
  companyId    String
  company      Company  @relation(fields: [companyId], references: [id])
  name         String
  email        String   @unique
  passwordHash String
  role         UserRole @default(OPERATOR)
  createdAt    DateTime @default(now())
}

enum UserRole { ADMIN OPERATOR }

model Material {
  id            String         @id @default(cuid())
  companyId     String
  company       Company        @relation(fields: [companyId], references: [id])
  name          String
  category      String
  totalQty      Int
  description   String?
  serialNumber  String?
  brand         String?
  model         String?
  replaceCost   Decimal?
  qrCode        String         @unique
  status        MaterialStatus @default(AVAILABLE)
  deletedAt     DateTime?
  createdAt     DateTime       @default(now())
  photos        MaterialPhoto[]
  allocations   EventMaterial[]
}

enum MaterialStatus { AVAILABLE ALLOCATED MAINTENANCE LOST }

model MaterialPhoto {
  id         String   @id @default(cuid())
  materialId String
  material   Material @relation(fields: [materialId], references: [id])
  storageUrl String
  isPrimary  Boolean  @default(false)
}

model Event {
  id          String      @id @default(cuid())
  companyId   String
  company     Company     @relation(fields: [companyId], references: [id])
  name        String
  startDate   DateTime
  returnDate  DateTime
  location    String?
  client      String?
  notes       String?
  status      EventStatus @default(PLANNED)
  createdAt   DateTime    @default(now())
  materials   EventMaterial[]
}

enum EventStatus { PLANNED IN_PROGRESS COMPLETED CANCELLED }

model EventMaterial {
  id           String          @id @default(cuid())
  eventId      String
  event        Event           @relation(fields: [eventId], references: [id])
  materialId   String
  material     Material        @relation(fields: [materialId], references: [id])
  qtyAllocated Int
  checklist    ChecklistItem[]
}

model ChecklistItem {
  id              String              @id @default(cuid())
  eventMaterialId String
  eventMaterial   EventMaterial       @relation(fields: [eventMaterialId], references: [id])
  type            ChecklistType
  status          ChecklistItemStatus @default(PENDING)
  confirmedById   String?
  scannedAt       DateTime?
  notes           String?
  createdAt       DateTime            @default(now())
}

enum ChecklistType       { DEPARTURE RETURN }
enum ChecklistItemStatus { PENDING CONFIRMED MISSING DAMAGED }

model AuditLog {
  id        String   @id @default(cuid())
  companyId String
  userId    String
  action    String
  entity    String
  entityId  String
  createdAt DateTime @default(now())
}
```

---

## 5. API — CONTRATOS PRINCIPAIS

**Base URL:** `https://api.eventgear.com.br/v1`
**Auth:** `Authorization: Bearer <access_token>`
**Erros:** RFC 7807 Problem Details
**Paginação:** `?page=1&limit=20`

### Endpoints MVP

| Método | Path | Auth | Módulo |
|---|---|---|---|
| POST | /auth/register | ❌ | Auth |
| POST | /auth/login | ❌ | Auth |
| POST | /auth/refresh | ❌ | Auth |
| POST | /auth/forgot-password | ❌ | Auth |
| POST | /auth/reset-password | ❌ | Auth |
| GET | /materials | OPERATOR+ | Materiais |
| POST | /materials | ADMIN | Materiais |
| GET | /materials/:id | OPERATOR+ | Materiais |
| PATCH | /materials/:id | ADMIN | Materiais |
| POST | /materials/:id/photos | ADMIN | Materiais |
| GET | /materials/:id/qrcode | OPERATOR+ | Materiais |
| GET | /materials/labels/pdf | ADMIN | Materiais |
| GET | /events | OPERATOR+ | Eventos |
| POST | /events | ADMIN | Eventos |
| GET | /events/:id | OPERATOR+ | Eventos |
| PATCH | /events/:id | ADMIN | Eventos |
| POST | /events/:id/materials | ADMIN | Eventos |
| DELETE | /events/:id/materials/:mid | ADMIN | Eventos |
| POST | /events/:id/checklist/departure | OPERATOR+ | Checklist |
| POST | /events/:id/checklist/return | OPERATOR+ | Checklist |
| PATCH | /checklist-items/:id | OPERATOR+ | Checklist |
| GET | /events/:id/report | OPERATOR+ | Relatórios |
| GET | /events/:id/report/pdf | OPERATOR+ | Relatórios |
| GET | /health | ❌ | Sistema |

---

## 6. VARIÁVEIS DE AMBIENTE

### API (apps/api)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://eventgear:<pwd>@postgres:5432/eventgear
REDIS_URL=redis://:<pwd>@redis:6379
JWT_SECRET=<random-64-hex>
JWT_REFRESH_SECRET=<random-64-hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=<key>
MINIO_SECRET_KEY=<secret>
MINIO_BUCKET=eventgear
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<user>
SMTP_PASS=<pass>
SMTP_FROM=no-reply@eventgear.com.br
APP_URL=https://eventgear.com.br
```

### Frontend (apps/web)
```bash
NEXT_PUBLIC_API_URL=https://api.eventgear.com.br/v1
NEXT_PUBLIC_APP_URL=https://eventgear.com.br
```

---

## 7. ORDEM DE EXECUÇÃO (Roadmap MVP — 4 semanas)

```
Semana 1
  INFRA-01  Setup monorepo, Docker local, CI esqueleto
  INFRA-02  Prisma schema + migrations iniciais
  AUTH-01   Módulo Auth: register, login, refresh, JWT guard
  AUTH-02   Módulo Users: convite, perfis, isolamento por empresa
  MAT-01    CRUD de Materiais + upload de fotos + MinIO

Semana 2
  MAT-02    Geração de QR Code + endpoint /qrcode
  MAT-03    Impressão de etiquetas em PDF (individual + lote)
  EVT-01    CRUD de Eventos
  EVT-02    Alocação de materiais ao evento (com validação de estoque)

Semana 3
  CKL-01    Checklist de Saída: listar itens, confirmar via QR/manual
  CKL-02    Checklist de Retorno: mesmo fluxo + observações/avarias
  CKL-03    Leitor QR Code no PWA (html5-qrcode)

Semana 4
  REL-01    Relatório de evento (JSON + PDF)
  REL-02    Relatório de inventário
  QA-01     Testes unitários (≥70% cobertura nas regras de negócio)
  QA-02     Testes E2E Playwright nos fluxos críticos
  DEPLOY-01 Setup Railway (PostgreSQL + Redis + MinIO + API + Web)
  DEPLOY-02 Domínio eventgear.com.br + SSL via Railway
```

---

## 8. CONVENÇÕES DE CÓDIGO

### NestJS
```typescript
// Módulos: sempre encapsulados, nunca dependências circulares
// DTOs: validação com class-validator + Zod schemas em packages/shared
// Serviços: injeção de dependência, sem lógica em controllers
// Guards: JwtAuthGuard + RolesGuard em todo endpoint protegido
// Filtros: HttpExceptionFilter global (RFC 7807)

// Resposta de erro padrão
throw new BadRequestException({
  type: 'https://eventgear.com.br/errors/validation',
  title: 'Validation Error',
  status: 400,
  detail: 'Campo inválido',
  instance: `/v1${req.path}`,
})
```

### Next.js
```typescript
// Server Components por padrão, Client Components apenas com 'use client'
// Axios instance em lib/api.ts com interceptor de token
// TanStack Query para cache e revalidação de dados da API
// Zustand apenas para estado de UI (modal aberto, etc.)
// Nenhuma lógica de negócio no frontend — apenas chamadas de API
```

### Commits (Conventional Commits via Commitizen)
```
feat(materials): add QR code generation on create
fix(auth): correct refresh token expiry header
chore(infra): update docker-compose redis version
test(events): add unit tests for allocation guard
docs(api): update swagger for checklist endpoints
```

---

## 9. SEGURANÇA — REGRAS INEGOCIÁVEIS

1. **Senhas** com bcrypt custo mínimo 12
2. **JWT access token** expira em 15 minutos
3. **Refresh token** armazenado em Redis com TTL de 30 dias
4. **Isolamento multi-tenant** — todo query filtra por `companyId` do JWT
5. **Rate limiting** — 100 req/min por IP via `@nestjs/throttler`
6. **HTTPS** obrigatório em produção (Let's Encrypt via Railway)
7. **Variáveis de ambiente** nunca hardcoded, nunca commitadas
8. **MinIO** não exposto publicamente — URLs pré-assinadas com TTL
9. **Audit log** para: login, checklist confirmado, material deletado, evento encerrado

---

## 10. COMANDOS ÚTEIS

```bash
# Setup inicial
make install        # instala dependências de todo o monorepo
make dev            # sobe postgres + redis + minio + api + web

# Banco
make db:migrate     # prisma migrate dev
make db:studio      # abre Prisma Studio
make db:reset       # reseta e re-aplica migrations + seed

# Qualidade
make lint           # eslint em todo o monorepo
make test           # vitest (backend) + playwright (E2E)
make test:unit      # apenas testes unitários
make test:e2e       # apenas Playwright

# Docker
make build          # build das imagens Docker (api + web)
make up             # docker-compose up -d (todos os serviços)
make down           # docker-compose down
make logs           # logs de todos os containers

# Secrets (gera JWT_SECRET e JWT_REFRESH_SECRET aleatórios)
make secrets
```

---

## 11. LINKS ÚTEIS

| Recurso | URL |
|---|---|
| Repositório | https://github.com/christopheScantelbury/eventgear |
| Railway Dashboard | https://railway.app/dashboard |
| Railway Docs | https://docs.railway.app |
| API Docs (Swagger) | https://api.eventgear.com.br/api/docs |
| Brevo (SMTP) | https://app.brevo.com |
| Prisma Docs | https://www.prisma.io/docs |
| NestJS Docs | https://docs.nestjs.com |
| html5-qrcode | https://github.com/mebjas/html5-qrcode |

---

## 12. ESTADO ATUAL
> Última atualização: 2026-05-07 · branch `main` · Setup inicial

| Épico | Status |
|---|---|
| INFRA | 🔧 Setup em andamento |
| AUTH | ⏳ Pendente |
| MATERIAIS | ⏳ Pendente |
| EVENTOS | ⏳ Pendente |
| CHECKLIST | ⏳ Pendente |
| RELATÓRIOS | ⏳ Pendente |
| QA | ⏳ Pendente |
| DEPLOY | ⏳ Pendente |
