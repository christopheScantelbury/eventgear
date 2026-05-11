# QA — Plano de Testes EventGear

> **Para o agente de QA:** Você é um engenheiro de QA da ScantelburyDevs responsável por
> validar o EventGear em produção. Use as ferramentas de browser disponíveis (Chrome MCP ou
> computer-use) para acessar o app, executar cada cenário na ordem indicada e entregar ao
> final um relatório estruturado com: ✅ passou / ⚠️ passou com observação / ❌ falhou.
> Para cada falha inclua: URL, o que esperava, o que aconteceu, e screenshot se possível.

---

## 🌐 Ambiente de produção (Railway)

| | URL |
|---|---|
| **Web (frontend)** | https://web-production-d5d96.up.railway.app |
| **API (backend)** | https://api-production-6757.up.railway.app |
| **API Health** | https://api-production-6757.up.railway.app/v1/health |
| **API Docs (Swagger)** | https://api-production-6757.up.railway.app/api/docs |

---

## 🔑 Credenciais de teste

```
Email:    qa@eventgear.test
Senha:    QaTester2026!
Empresa:  QA Eventos
```

Se a conta **ainda não existir**, registre em `/register` com esses mesmos dados —
o primeiro usuário de uma empresa vira automaticamente **ADMIN**.

---

## ⚙️ Pré-checagens obrigatórias

Executar antes de qualquer cenário:

1. `GET https://api-production-6757.up.railway.app/v1/health` → deve retornar `{"status":"ok","db":"ok"}`
2. `GET https://api-production-6757.up.railway.app/v1/billing/plans` → deve retornar 3 planos: `basico`, `pro`, `business` com `priceMonthlyBrl` preenchidos
3. Landing `https://web-production-d5d96.up.railway.app/` carrega sem erros de console?
4. Favicon (engrenagem âmbar) aparece na aba do navegador?

Se qualquer pré-checagem falhar, **parar e reportar** antes de continuar.

---

## 🧪 Cenários de teste

### 1. Autenticação

- [ ] **1.1** Acessar `/login` → fazer login com `qa@eventgear.test` / `QaTester2026!` → redireciona para `/dashboard`
- [ ] **1.2** Fazer logout → volta para `/login`
- [ ] **1.3** Login com senha errada → mensagem de erro genérica (não revelar "user not found")
- [ ] **1.4** Acessar `/dashboard` deslogado → redireciona para `/login`
- [ ] **1.5** Botão "Esqueci minha senha" abre `/forgot-password`
- [ ] **1.6** Enviar e-mail de recuperação → toast de confirmação aparece

### 2. Perfil e usuários

- [ ] **2.1** Em `/configuracoes` → editar nome → toast "Nome atualizado"
- [ ] **2.2** Em `/configuracoes` → "Alterar senha" → modal aparece → trocar senha → confirmar → relogar com nova senha
- [ ] **2.3** Restaurar senha original (`QaTester2026!`) para o restante dos testes
- [ ] **2.4** Em `/configuracoes/usuarios` → criar novo usuário Operador:
      - Email: `op@eventgear.test` / Senha: `OpTeste123!` / Role: `OPERATOR`
- [ ] **2.5** Editar role do operador inline → mudar para `ADMIN` → confirmar
- [ ] **2.6** Reverter role de volta para `OPERATOR`
- [ ] **2.7** Tentar deletar o próprio usuário logado → botão de delete não deve aparecer
- [ ] **2.8** Logout → login como `op@eventgear.test` → item "Configurações" **não** aparece no sidebar

### 3. Clientes (CRM)

- [ ] **3.1** Em `/clientes` → "Novo cliente" → cadastrar PJ:
      - Nome: `Empresa Cliente LTDA` | CNPJ: `12.345.678/0001-90`
      - Email: `contato@cliente.com` | Telefone: `(11) 99999-1111`
      - Cidade: `São Paulo` / UF: `SP` | Tags: `vip`, `recorrente`
- [ ] **3.2** Cadastrar PF:
      - Nome: `João Silva` | CPF: `123.456.789-00`
- [ ] **3.3** Lista mostra os 2 clientes com badges PJ/PF e tags coloridas
- [ ] **3.4** Buscar `Empresa` → filtra para 1 resultado
- [ ] **3.5** Buscar `12345` → encontra por fragmento de CPF/CNPJ
- [ ] **3.6** Clicar no cliente PJ → página de detalhes com cards de stats e histórico de eventos
- [ ] **3.7** Editar cliente → adicionar tag `teste-qa` → salvar → tag aparece no detalhe
- [ ] **3.8** Deletar cliente PF → modal de confirmação → confirmar → some da lista

### 4. Materiais

- [ ] **4.1** Em `/materiais` → criar 3 materiais:
      - `Caixa de Som JBL` | Categoria: `Áudio` | Qtd: 4 | Preço diário: R$ 150
      - `Cabo XLR 10m`    | Categoria: `Cabos` | Qtd: 20 | Preço diário: R$ 15
      - `Mesa de Som Yamaha` | Categoria: `Áudio` | Qtd: 1 | Preço diário: R$ 300
- [ ] **4.2** Materiais aparecem na lista com placeholder de foto
- [ ] **4.3** Em detalhes de um material → upload de foto (JPG qualquer) → aparece como foto principal
- [ ] **4.4** QR Code gerado e legível na página de detalhes do material
- [ ] **4.5** Buscar por nome → filtra corretamente
- [ ] **4.6** Filtrar por categoria `Áudio` → retorna 2 resultados

### 5. Eventos e alocação

- [ ] **5.1** Em `/eventos/novo` → preencher:
      - Nome: `Festival QA 2026`
      - Datas: amanhã até daqui 3 dias
      - Local: `Centro de Convenções SP`
- [ ] **5.2** Campo Cliente → digitar `Empresa` → autocomplete exibe `Empresa Cliente LTDA` → selecionar → fica fixado com ícone PJ
- [ ] **5.3** Campo `totalAmount` → `5000.00` → criar evento
- [ ] **5.4** Em detalhes do evento → aba "Materiais" → adicionar `Caixa de Som JBL` qty 2 e `Cabo XLR 10m` qty 5
- [ ] **5.5** Voltar para detalhes do cliente `Empresa Cliente LTDA` → histórico mostra `Festival QA 2026` com R$ 5.000,00
- [ ] **5.6** Alterar status do evento para `IN_PROGRESS` → badge muda de cor

### 6. Calendário

- [ ] **6.1** Em `/calendario` → view "Mês" → `Festival QA 2026` aparece nas datas corretas
- [ ] **6.2** Clicar no evento do calendário → navega para `/eventos/{id}`
- [ ] **6.3** Voltar → toggle "Semana" → mesmo evento em layout semanal
- [ ] **6.4** Botões `<` `>` navegam entre períodos
- [ ] **6.5** Botão "Hoje" volta para o dia atual
- [ ] **6.6** Evento com status `IN_PROGRESS` tem cor diferente de `PLANNED`

### 7. Checklist com QR Scanner

- [ ] **7.1** Em detalhes do evento → "Iniciar Checklist de Saída" (DEPARTURE)
- [ ] **7.2** Página de checklist lista os materiais alocados (Caixa de Som + Cabo XLR)
- [ ] **7.3** Botão de scanner abre câmera (autorizar permissão se necessário)
- [ ] **7.4** Apontar câmera para o QR Code de `Caixa de Som JBL` → item marcado como CONFIRMED
- [ ] **7.5** Em dispositivo mobile: vibração haptic ao detectar QR
- [ ] **7.6** Apontar para QR Code inválido (aleatório) → mensagem de erro "Material não encontrado"
- [ ] **7.7** Confirmar item manualmente (sem scanner) clicando no checkbox
- [ ] **7.8** Finalizar checklist → status do evento atualiza

### 8. Planos (UI apenas — sem Stripe)

> ℹ️ Testar apenas a UI da página de planos. Não clicar em nenhum botão
> que redirecione para o Stripe Checkout — o redirecionamento externo
> trava o agente de QA.

- [ ] **8.1** `/planos` exibe 3 cards: Básico (R$ 79), Pro (R$ 149 — "MAIS POPULAR"), Business (R$ 249)
- [ ] **8.2** Status atual mostra `Trial Gratuito` (se não tiver plano ativo)
- [ ] **8.3** Barras de uso (Materiais / Eventos / Usuários) refletem o uso real dos testes acima
- [ ] **8.4** Botão "Assinar com 30 dias grátis" existe e está visível no card Pro
- [ ] **8.5** Botão "Gerenciar pagamento" existe no card do plano atual (se assinado)
- [ ] **8.6** ⛔ **NÃO clicar** em nenhum botão que redirecione para checkout.stripe.com

### 9. PWA + Offline

- [ ] **9.1** No Chrome desktop → ícone de instalar PWA aparece na barra de endereço
- [ ] **9.2** Instalar → app abre em janela própria (sem chrome do browser)
- [ ] **9.3** DevTools → Application → Service Worker: status `activated and running`
- [ ] **9.4** Application → Manifest → exibe nome `EventGear`, ícones e shortcuts
- [ ] **9.5** Ativar "Offline" no DevTools → recarregar `/dashboard` → app continua navegável
- [ ] **9.6** Tentar confirmar item do checklist offline → indicador "1 pendente" aparece
- [ ] **9.7** Desativar "Offline" → pendência sincroniza automaticamente (ou via botão)

### 10. Limites de plano (BillingGuard)

> Trial tem limite de 3 usuários. Já temos `qa@` + `op@` = 2. Criar mais 1 para testar o limite.

- [ ] **10.1** Criar 3º usuário → funciona
- [ ] **10.2** Tentar criar 4º usuário → API retorna erro `403` com mensagem orientando upgrade
- [ ] **10.3** Mensagem no frontend é clara e tem botão de upgrade para `/planos`

### 11. Mobile / responsividade

- [ ] **11.1** Abrir em viewport 390×844 (iPhone 14) via DevTools ou dispositivo real
- [ ] **11.2** Bottom navigation aparece: Início | Calendário | Eventos | Materiais | Clientes
- [ ] **11.3** Sidebar desktop fica oculta
- [ ] **11.4** Formulários sem overflow horizontal
- [ ] **11.5** Calendário mensal com 7 colunas → datas pequenas mas clicáveis
- [ ] **11.6** Scanner QR abre e usa câmera traseira por padrão no mobile

### 12. Segurança (smoke)

- [ ] **12.1** `GET /v1/customers` sem token → `401 Unauthorized`
- [ ] **12.2** `GET /v1/customers` com token válido de empresa diferente → retorna lista vazia ou 403 (isolamento multi-tenant)
- [ ] **12.3** Login como `op@eventgear.test` → tentar `POST /v1/users` via Swagger → `403 Forbidden`
- [ ] **12.4** Campos de senha não são visíveis em logs do console do browser

---

## 📋 Formato do relatório final

```markdown
# QA Report — EventGear — {YYYY-MM-DD}

## Resumo executivo
| | Qtd |
|---|---|
| Total de cenários | 60 |
| ✅ Passaram | XX |
| ⚠️ Com observação | XX |
| ❌ Falharam | XX |

## ❌ Falhas críticas
### [5.2] Customer picker autocomplete não funciona
- **URL:** /eventos/novo
- **Esperado:** dropdown de clientes ao digitar "Empresa"
- **Aconteceu:** dropdown vazio, nenhum resultado
- **Console:** TypeError: Cannot read properties of undefined...
- **Screenshot:** [anexo]

## ⚠️ Observações
### [6.5] Botão "Hoje" demora ~2s para responder
- Funcional, mas lento. Possível re-render desnecessário.

## ✅ Cenários OK
1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1 ...
```

---

Boa caça aos bugs.
