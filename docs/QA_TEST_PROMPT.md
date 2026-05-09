# QA — Plano de testes EventGear (smoke + regressão)

> **Para o agente de QA:** Você é um QA responsável por validar o EventGear em produção.
> Acesse o app, execute cada cenário abaixo na ordem, e ao final entregue um relatório
> com: ✅ passou / ⚠️ passou com observação / ❌ falhou. Para cada falha, inclua URL,
> o que esperava, o que aconteceu, e screenshot se possível.

---

## 🌐 Ambiente

| | URL |
|---|---|
| Web (frontend) | https://eventgear-web.h1dq2d.easypanel.host |
| API (backend) | https://eventgear-api.h1dq2d.easypanel.host |
| API Health | https://eventgear-api.h1dq2d.easypanel.host/v1/health |
| API Docs (Swagger) | https://eventgear-api.h1dq2d.easypanel.host/api/docs |

## 🔑 Credenciais de teste

```
Email:    qa@eventgear.test
Senha:    QaTester2026!
Empresa:  QA Eventos
```

Se a conta **ainda não existir**, registre na página `/register` com esses mesmos dados —
o primeiro usuário da empresa vira automaticamente **ADMIN**.

---

## ⚙️ Pré-checagens (antes de testar)

1. `GET /v1/health` retorna 200 OK?
2. `GET /v1/billing/plans` retorna 3 planos: `basico`, `pro`, `business`?
   Cada plano tem `priceMonthlyBrl` preenchido?
3. Landing pública `https://eventgear-web.h1dq2d.easypanel.host/` carrega?
   Tem ícone (favicon âmbar de engrenagem) na aba do navegador?

---

## 🧪 Cenários de teste

### 1. Autenticação
- [ ] **1.1** Login com `qa@eventgear.test` / `QaTester2026!` → redireciona para `/dashboard`
- [ ] **1.2** Logout → volta para `/login`
- [ ] **1.3** Login com senha errada → mensagem de erro (sem expor "user not found")
- [ ] **1.4** Acessar `/dashboard` deslogado → redireciona para `/login`
- [ ] **1.5** Botão "Esqueci senha" abre `/forgot-password`

### 2. Perfil e usuários
- [ ] **2.1** Em `/configuracoes` → editar nome → toast "Nome atualizado"
- [ ] **2.2** Em `/configuracoes` → "Alterar senha" abre modal → trocar senha → relogar
- [ ] **2.3** Restaurar senha original (`QaTester2026!`) para os próximos testes
- [ ] **2.4** Em `/configuracoes/usuarios` → criar Operador
      `Email: op@eventgear.test  Senha: OpTeste123` `Role: OPERATOR`
- [ ] **2.5** Editar role do Operador → mudar para ADMIN inline → ✓
- [ ] **2.6** Voltar para OPERATOR
- [ ] **2.7** Tentar deletar a si mesmo → botão não aparece para o próprio usuário
- [ ] **2.8** Logout, login como `op@eventgear.test` → não vê item "Configurações" no sidebar

### 3. Clientes (CRM)
- [ ] **3.1** Em `/clientes` → "Novo cliente" → cadastrar **PJ**
      Nome: `Empresa Cliente LTDA`  CNPJ: `12345678000190`
      Email: `contato@cliente.com`  Telefone: `(11) 99999-1111`
      Cidade: `São Paulo / SP`  Tags: `vip`, `recorrente`
- [ ] **3.2** Cadastrar **PF**: `João Silva`  CPF: `12345678900`
- [ ] **3.3** Lista mostra os 2 clientes com badges PJ/PF e tags
- [ ] **3.4** Buscar `Empresa` na busca → filtra
- [ ] **3.5** Buscar `12345` → encontra ambos (CPF e CNPJ)
- [ ] **3.6** Clicar num cliente → ver detalhes (cards de stats + histórico vazio)
- [ ] **3.7** Editar cliente → adicionar tag `teste-qa`
- [ ] **3.8** Remover cliente PF → modal de confirmação → ✓ → some da lista

### 4. Materiais (com BillingGuard)
- [ ] **4.1** Em `/materiais` → criar 3 materiais com QR Code automático
      Ex: `Caixa de Som JBL`, `Cabo XLR 10m`, `Mesa de Som Yamaha`
      Cada um com `dailyRentPrice` (preço diário)
- [ ] **4.2** Material aparece na lista com foto placeholder
- [ ] **4.3** Em detalhes do material → upload de foto (qualquer JPG)
- [ ] **4.4** Verificar QR Code legível na detail page
- [ ] **4.5** Buscar por nome → filtra

### 5. Eventos (com Customer Picker)
- [ ] **5.1** `/eventos/novo` → preencher:
      Nome: `Festival QA 2026`  Datas: hoje + 2 dias depois
      Local: `Centro de Convenções`
- [ ] **5.2** Campo Cliente → digitar `Empresa` → autocomplete mostra
      `Empresa Cliente LTDA` → selecionar → fica fixado com ícone PJ
- [ ] **5.3** Campo `totalAmount` = `5000.00` → criar evento
- [ ] **5.4** Em detalhes do evento → adicionar 2 materiais com qty
- [ ] **5.5** Voltar para `/clientes/{id}` da empresa → histórico mostra
      o evento `Festival QA 2026` com R$ 5.000,00

### 6. Calendário
- [ ] **6.1** `/calendario` → view "Mês" → ver `Festival QA 2026` no dia certo
- [ ] **6.2** Clicar no evento → vai para `/eventos/{id}`
- [ ] **6.3** Voltar → toggle "Semana" → ver mesma info em layout semanal
- [ ] **6.4** Botões `<` `>` navegam entre meses/semanas
- [ ] **6.5** Botão "Hoje" volta para o dia atual
- [ ] **6.6** Status do evento muda a cor do card no calendário

### 7. Checklist com QR Scanner
- [ ] **7.1** Em detalhes do evento → "Gerar Checklist" → tipo "DEPARTURE"
- [ ] **7.2** Página de checklist lista os materiais alocados
- [ ] **7.3** Scanner de QR abre câmera (pode autorizar permissão)
- [ ] **7.4** Apontar para QR de um material cadastrado → marca como CONFIRMED
- [ ] **7.5** Vibração no celular (se mobile) ao detectar
- [ ] **7.6** QR de material **inválido** → mensagem de erro adequada

### 8. Planos & Stripe (LIVE)
> ⚠️ **NÃO concluir o pagamento** — esses são prices LIVE de verdade.
> Apenas validar que o fluxo abre corretamente o Checkout do Stripe.

- [ ] **8.1** `/planos` mostra 3 cards: Básico (R$ 79), Pro (R$ 149, "MAIS POPULAR"), Business (R$ 249)
- [ ] **8.2** "Status atual" mostra "Trial Gratuito" (ou plano se já assinou)
- [ ] **8.3** Barras de uso (Materiais / Eventos / Usuários) refletem o uso real
- [ ] **8.4** Clicar "Assinar com 30 dias grátis" no Pro → redireciona para `checkout.stripe.com`
- [ ] **8.5** No Stripe Checkout, verificar:
      - Empresa: "EventGear" no topo
      - Produto: "EventGear Pro"
      - Valor: R$ 149,00 / mês
      - "Hoje você paga R$ 0,00 (30 dias grátis)"
      - Domínio é `checkout.stripe.com`
- [ ] **8.6** **NÃO finalizar.** Voltar (botão back) → URL deve voltar para `/planos`
- [ ] **8.7** Se já tiver plano: botão "Gerenciar pagamento" abre Customer Portal Stripe

### 9. PWA + Offline
- [ ] **9.1** No Chrome, ícone de instalar PWA aparece na barra de URL
- [ ] **9.2** Instalar → app abre em janela própria sem chrome do navegador
- [ ] **9.3** No menu do navegador → "DevTools" → "Application" → Service Worker registrado
- [ ] **9.4** Application → Manifest → exibe nome "EventGear", ícones, shortcuts
- [ ] **9.5** Ativar "Offline" no DevTools → recarregar `/dashboard`
      → app continua navegável (cache)
- [ ] **9.6** Tentar fazer um scan de checklist offline
      → indicador no canto inferior aparece: "1 pendente"
- [ ] **9.7** Desativar "Offline" → indicador muda para "Sincronizado" automaticamente
      ou clicar manualmente → `flushSyncQueue` envia para a API

### 10. Limites de plano (BillingGuard)
> Para testar limites: como estamos no trial, os limites são do plano Básico
> (200 materiais / 20 eventos por mês / 3 usuários). Não criar 200 materiais —
> testar apenas usuário, que tem limite menor.

- [ ] **10.1** Tentar criar 4º usuário → erro 403 com mensagem
      "Limite do trial atingido" ou similar
- [ ] **10.2** Mensagem orienta usuário a fazer upgrade

### 11. Mobile / responsividade
- [ ] **11.1** Abrir `/dashboard` em viewport mobile (390x844 — iPhone)
- [ ] **11.2** Bottom nav aparece (Início | Calendário | Eventos | Materiais | Clientes)
- [ ] **11.3** Sidebar desktop esconde
- [ ] **11.4** Forms continuam usáveis (sem overflow horizontal)
- [ ] **11.5** Calendário com 7 colunas continua legível (datas pequenas mas clicáveis)

### 12. Segurança rápida
- [ ] **12.1** Sem token: `GET /v1/customers` → 401
- [ ] **12.2** Token de outra empresa não vê dados desta empresa (multi-tenant)
- [ ] **12.3** Operador tenta `POST /v1/users` → 403 (apenas ADMIN)

---

## 📋 Formato do relatório final

```markdown
# QA Report — EventGear — {data}

## Resumo
- Total cenários: 60+
- Passaram:    XX
- Observações: XX
- Falharam:    XX

## Falhas críticas
1. [Cenário 5.2] ❌ Customer picker autocomplete não funciona
   - URL: /eventos/novo
   - Esperado: lista de clientes ao digitar
   - Aconteceu: dropdown vazio
   - Console: TypeError ...
   - Screenshot: ...

## Observações (⚠️)
1. [Cenário 6.5] Botão "Hoje" funciona mas demora 2s para responder
   ...

## Cenários OK ✅
- 1.1, 1.2, 1.3 ...
```

Boa caça aos bugs.
