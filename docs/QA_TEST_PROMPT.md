# QA — Plano de Testes EventGear (v2 — 2026-05-11)

> **Para o agente de QA:** Você é um engenheiro de QA da ScantelburyDevs responsável por
> validar o EventGear em produção. Use as ferramentas de browser disponíveis (Chrome MCP ou
> computer-use) para acessar o app, executar cada cenário na ordem indicada e entregar ao
> final um relatório estruturado com: ✅ passou / ⚠️ passou com observação / ❌ falhou.
> Para cada falha inclua: URL, o que esperava, o que aconteceu, e screenshot se possível.
>
> **Atenção:** Esta é a v2 do plano. Os bugs do relatório anterior (QA_REPORT_2026-05-11.md)
> foram corrigidos. Os cenários 4.3, 7.x e 8.x foram atualizados para refletir os fixes.

---

## 🌐 Ambiente de produção

| | URL |
|---|---|
| **Web (frontend)** | https://eventgear-web-christophescantelburys-projects.vercel.app |
| **API (backend)** | https://api-production-6757.up.railway.app |
| **API Health** | https://api-production-6757.up.railway.app/v1/health |
| **API Docs (Swagger)** | https://api-production-6757.up.railway.app/api/docs |

> ⚠️ O frontend agora está no **Vercel** (não mais no Railway). Não usar URLs antigas do Railway para o web.

---

## 🔑 Credenciais de teste

```
Email:    qa@eventgear.test
Senha:    QaTester2026!
Empresa:  QA Eventos
```

Se a conta **ainda não existir**, registre em `/register` com esses dados —
o primeiro usuário da empresa vira automaticamente **ADMIN**.

---

## ⚙️ Pré-checagens obrigatórias

Executar antes de qualquer cenário:

1. `GET https://api-production-6757.up.railway.app/v1/health` → deve retornar `{"status":"ok","db":"ok"}`
2. `GET https://api-production-6757.up.railway.app/v1/billing/plans` → 3 planos com `priceMonthlyBrl` preenchidos
3. `https://eventgear-web-christophescantelburys-projects.vercel.app/` carrega sem erros de console?
4. Favicon (engrenagem âmbar) aparece na aba do navegador?

Se qualquer pré-checagem falhar, **parar e reportar** antes de continuar.

---

## 🧪 Cenários de teste

### 1. Autenticação

- [ ] **1.1** Login com `qa@eventgear.test` / `QaTester2026!` → redireciona para `/dashboard`
- [ ] **1.2** Logout → volta para `/login`
- [ ] **1.3** Login com senha errada → mensagem de erro genérica (não revelar "user not found")
- [ ] **1.4** Acessar `/dashboard` deslogado → redireciona para `/login`
- [ ] **1.5** Botão "Esqueci minha senha" abre `/forgot-password`
- [ ] **1.6** Enviar e-mail de recuperação → tela/toast de confirmação aparece

### 2. Perfil e usuários

- [ ] **2.1** Em `/configuracoes` → editar nome → toast "Nome atualizado"
- [ ] **2.2** "Alterar senha" → modal → trocar senha → relogar com nova senha
- [ ] **2.3** Restaurar senha original (`QaTester2026!`) para o restante dos testes
- [ ] **2.4** Em `/configuracoes/usuarios` → criar usuário:
      - Email: `op@eventgear.test` | Senha: `OpTeste123!` | Role: `OPERATOR`
- [ ] **2.5** Editar role inline → `ADMIN` → toast confirmado
- [ ] **2.6** Reverter role de volta para `OPERATOR`
- [ ] **2.7** Botão de delete do próprio usuário logado **não** aparece
- [ ] **2.8** Logout → login como `op@eventgear.test` → "Configurações" **não** aparece no sidebar

### 3. Clientes (CRM)

- [ ] **3.1** Em `/clientes` → "Novo cliente" → cadastrar PJ:
      - Nome: `Empresa Cliente LTDA` | CNPJ: `12.345.678/0001-90`
      - Email: `contato@cliente.com` | Telefone: `(11) 99999-1111`
      - Cidade: `São Paulo` / UF: `SP` | Tags: `vip`, `recorrente`
- [ ] **3.2** Cadastrar PF: `João Silva` | CPF: `123.456.789-00`
- [ ] **3.3** Lista mostra 2 clientes com badges PJ/PF e tags coloridas
- [ ] **3.4** Buscar `Empresa` → filtra para 1 resultado
- [ ] **3.5** Buscar `12345` → encontra por fragmento de CPF/CNPJ
- [ ] **3.6** Clicar no cliente PJ → página de detalhes com stats e histórico
- [ ] **3.7** Editar cliente → adicionar tag `teste-qa` → salvar → tag aparece no detalhe
- [ ] **3.8** Deletar cliente PF → confirmar modal → some da lista

### 4. Materiais (inclui fix de upload de foto — 4.3 é novo)

- [ ] **4.1** Em `/materiais` → criar 3 materiais:
      - `Caixa de Som JBL` | Categoria: `Áudio` | Qtd: 4 | Preço diário: R$ 150
      - `Cabo XLR 10m` | Categoria: `Cabos` | Qtd: 20 | Preço diário: R$ 15
      - `Mesa de Som Yamaha` | Categoria: `Áudio` | Qtd: 1 | Preço diário: R$ 300
- [ ] **4.2** Materiais aparecem na lista com placeholder de foto (ícone âmbar)
- [ ] **4.3** 🆕 Em detalhes de um material → seção "Fotos" aparece abaixo dos detalhes
      - Clicar "Adicionar foto" → abre seletor de arquivo
      - Selecionar um JPG qualquer → foto aparece na grade com badge ⭐ (foto principal)
      - Upload de segunda foto → aparece na grade sem ⭐
- [ ] **4.4** QR Code gerado e legível na página de detalhes
- [ ] **4.5** Buscar por nome → filtra corretamente
- [ ] **4.6** Filtrar por categoria `Áudio` → retorna 2 resultados

### 5. Eventos e alocação

- [ ] **5.1** Em `/eventos/novo` → preencher:
      - Nome: `Festival QA 2026`
      - Datas: amanhã até daqui 3 dias
      - Local: `Centro de Convenções SP`
- [ ] **5.2** Campo Cliente → digitar `Empresa` → autocomplete exibe `Empresa Cliente LTDA` → selecionar → ícone PJ fixado
- [ ] **5.3** Campo `totalAmount` → `5000.00` → criar evento
- [ ] **5.4** Em detalhes do evento → adicionar `Caixa de Som JBL` qty 2 e `Cabo XLR 10m` qty 5
- [ ] **5.5** Detalhes do cliente PJ → histórico mostra `Festival QA 2026` com R$ 5.000,00
- [ ] **5.6** Alterar status do evento para `IN_PROGRESS` → badge muda de cor

### 6. Calendário (fix de toggle aplicado — 6.3 deve funcionar no 1º clique)

- [ ] **6.1** Em `/calendario` → view "Mês" → `Festival QA 2026` aparece nas datas corretas
- [ ] **6.2** Clicar no evento → navega para `/eventos/{id}`
- [ ] **6.3** 🔧 Voltar → clicar "SEMANA" **uma única vez** → layout semanal aparece imediatamente
      (sem precisar de segundo clique; grade fica com leve opacidade durante transição)
- [ ] **6.4** Botões `<` `>` navegam entre semanas/meses
- [ ] **6.5** Botão "Hoje" volta para o período atual
- [ ] **6.6** Evento `IN_PROGRESS` tem cor âmbar (diferente do azul de `PLANNED`)

### 7. Checklist (fix de sincronização aplicado — cenários 7.1/7.2 são os principais a revalidar)

> 🔧 **Bug anterior corrigido:** a página de checklist não carregava itens já existentes,
> mostrando sempre "Checklist não gerado" e causando erro 409 ao clicar em "Gerar".
> Esse loop foi corrigido. Revalidar que o fluxo funciona do início ao fim.

- [ ] **7.1** Em detalhes do evento → botão "Checklist de Saída" → navega para `/eventos/{id}/checklist?tipo=saida`
- [ ] **7.2** 🔧 Página lista imediatamente os materiais alocados (Caixa de Som JBL + Cabo XLR 10m)
      **NÃO deve** exibir "Checklist não gerado" se os materiais estiverem alocados
- [ ] **7.3** Se checklist ainda não existir: botão "Gerar checklist" aparece → clicar → itens aparecem
      Se já existir: itens aparecem diretamente (sem tela de geração)
- [ ] **7.4** Confirmar um item manualmente clicando no checkbox → status muda para CONFIRMED
- [ ] **7.5** Barra de progresso atualiza (ex: 1/2 = 50%)
- [ ] **7.6** Scanner QR → botão "Escanear QR Code" abre leitor de câmera
      (câmera requer hardware; se não disponível no ambiente, pular para 7.7)
- [ ] **7.7** QR Code inválido/aleatório via scanner → toast de erro "Material não encontrado"

### 8. Planos (fix de UX para trial expirado — verificar novo estado)

> ℹ️ **NÃO clicar** em nenhum botão que redirecione para `checkout.stripe.com`.
> Testar apenas a UI da página `/planos`.

- [ ] **8.1** `/planos` exibe 3 cards: Básico (R$ 79), Pro (R$ 149 — "MAIS POPULAR"), Business (R$ 249)
- [ ] **8.2** 🔧 Verificar o estado do status atual:
      - Se trial **ativo**: exibe "Trial Gratuito" com data de término
      - Se trial **expirado** (conta `qa@eventgear.test`): exibe **banner vermelho** "Seu acesso está limitado" no topo + card "Trial encerrado" + sub-texto orientando a assinar
- [ ] **8.3** Barras de uso refletem o uso real (Materiais, Eventos, Usuários)
- [ ] **8.4** Se trial ativo: botão "Assinar com 30 dias grátis" visível nos cards
      Se trial expirado: botão "Assinar agora" visível nos cards
- [ ] **8.5** ⛔ **NÃO clicar** em nenhum botão de checkout/portal Stripe

### 9. PWA + Offline

- [ ] **9.1** No Chrome desktop → ícone de instalar PWA aparece na barra de endereço
- [ ] **9.2** DevTools → Application → Service Worker: status `activated and running`
- [ ] **9.3** Application → Manifest → nome `EventGear`, ícones e shortcuts
- [ ] **9.4** Ativar "Offline" no DevTools → recarregar `/dashboard` → app continua navegável (cache)
- [ ] **9.5** Tentar confirmar item do checklist offline → indicador "pendente" aparece
- [ ] **9.6** Desativar "Offline" → pendência sincroniza automaticamente

### 10. Limites de plano (BillingGuard)

> Trial tem limite de 3 usuários. Já temos `qa@` + `op@` = 2.

- [ ] **10.1** Criar 3º usuário → funciona normalmente
- [ ] **10.2** Tentar criar 4º usuário → erro `403` com mensagem orientando upgrade
- [ ] **10.3** Frontend exibe a mensagem de erro de forma clara (não apenas console)

### 11. Mobile / responsividade

- [ ] **11.1** Viewport 390×844 (iPhone 14) via DevTools
- [ ] **11.2** Bottom navigation visível: Início | Calendário | Eventos | Materiais | Clientes
- [ ] **11.3** Sidebar desktop oculta
- [ ] **11.4** Formulários sem overflow horizontal
- [ ] **11.5** Calendário mensal com 7 colunas → dias clicáveis

### 12. Segurança (smoke)

- [ ] **12.1** `GET /v1/customers` sem token → `401 Unauthorized`
- [ ] **12.2** Token válido da empresa `QA Eventos` → só retorna clientes dessa empresa
- [ ] **12.3** Login como `op@eventgear.test` → `POST /v1/users` via Swagger → `403 Forbidden`
- [ ] **12.4** Nenhuma senha/token visível nos logs do console do browser

---

## 📋 Formato do relatório final

Salvar o relatório em `docs/QA_REPORT_{YYYY-MM-DD}.md` no repositório.

```markdown
# QA Report — EventGear — {YYYY-MM-DD}

## Resumo executivo
| | Qtd |
|---|---|
| Total de cenários | 58 |
| ✅ Passaram | XX |
| ⚠️ Com observação | XX |
| ❌ Falharam | XX |
| 🚫 Não testável (hardware) | XX |

## ❌ Falhas críticas
### [7.2] Checklist ainda exibe "não gerado"
- **URL:** /eventos/{id}/checklist?tipo=saida
- **Esperado:** lista de materiais
- **Aconteceu:** tela de geração mesmo com itens na API
- **Console:** ...

## ⚠️ Observações
### [6.3] Leve delay visual no toggle de semana
- Funcional, mas demora ~300ms para atualizar a grade.

## 🔧 Regressão — fixes da v1 (obrigatório verificar)
- [ ] 4.3 Upload de foto funciona (era: ausente)
- [ ] 7.2 Checklist carrega existentes (era: sempre vazio → 409)
- [ ] 8.2 Banner de trial expirado aparece (era: "Sem plano" sem contexto)
- [ ] 6.3 Toggle semana funciona no 1º clique (era: exigia 2 cliques)

## ✅ Cenários OK
1.1, 1.2, 1.3 ...
```

---

Boa caça aos bugs.
