# Deploy via GHCR (GitHub Container Registry)

> A VPS pequena trava ao buildar imagens Docker no Easypanel (npm install
> não termina). Solução: builda no runner do GitHub (7 GB RAM, ~5 min)
> e o Easypanel apenas puxa a imagem pronta.

---

## Como funciona

1. Push para `main` → workflow `Build Images (GHCR)` dispara
2. GHA builda `apps/api/Dockerfile` e `apps/web/Dockerfile` no runner
3. Push para `ghcr.io/christophescantelbury/eventgear/api:latest` (e `:sha`)
4. Push para `ghcr.io/christophescantelbury/eventgear/web:latest`
5. (Opcional) Webhook do Easypanel é triggerado para puxar a nova imagem

## Configuração inicial (uma vez)

### 1. Tornar pacotes GHCR públicos

Na primeira vez que o workflow rodar com sucesso, vai criar dois packages:

- https://github.com/christopheScantelbury/eventgear/pkgs/container/eventgear%2Fapi
- https://github.com/christopheScantelbury/eventgear/pkgs/container/eventgear%2Fweb

Para cada um:

1. Abrir o link
2. Settings → "Change package visibility"
3. Selecionar **Public**
4. Confirmar digitando o nome do package

Isso permite que o Easypanel puxe sem credenciais.

### 2. Configurar Easypanel para usar a imagem

No painel do Easypanel para cada serviço (`api` e `web`):

1. Ir em **Fonte** (Source)
2. Mudar de **App** (build do Git) para **Image**
3. Preencher:
   - Imagem: `ghcr.io/christophescantelbury/eventgear/api:latest` (ou `web:latest`)
   - **Não** preencher username/password (imagem é pública)
4. Salvar
5. Clicar em **Implantar**

A partir daqui, todo deploy é:
- Push para `main` → GHA builda imagem nova → Easypanel puxa

### 3. Webhooks (já existentes)

Os webhooks de redeploy já estão configurados como secrets do repo:

- `EASYPANEL_API_WEBHOOK` — URL do trigger do api
- `EASYPANEL_WEB_WEBHOOK` — URL do trigger do web

Eles foram criados na configuração do `deploy.yml` legacy. O novo workflow
reusa os mesmos secrets.

Se precisar recuperar a URL atual do trigger no Easypanel:
- Easypanel → eventgear / api → Implantações → seção "Gatilho de Implantação"

---

## Tags geradas

| Tag | Quando |
|---|---|
| `:latest` | Sempre, último build do `main` |
| `:sha-<short>` | Sempre, vinculado ao commit (ex: `:sha-112fe6d`) |

Para rollback no Easypanel: trocar `:latest` por `:sha-<sha-anterior>`.

---

## Troubleshooting

**Workflow falhou ao fazer push:**
- Verificar permissões `packages: write` no workflow (já configurado)
- Verificar que o repo permite `GITHUB_TOKEN` ter acesso ao GHCR
  (Settings → Actions → General → Workflow permissions → "Read and write")

**Easypanel não puxa imagem nova:**
- Verificar se o webhook foi triggerado (job `redeploy-easypanel` no GHA)
- Forçar manualmente: Easypanel → Implantar
- Para garantir pull mais recente, limpar cache do Easypanel (botão lixeira do build)

**Imagem ainda privada:**
- Easypanel vai dar erro `unauthorized: authentication required`
- Solução: tornar package público (Settings do package no GitHub)
