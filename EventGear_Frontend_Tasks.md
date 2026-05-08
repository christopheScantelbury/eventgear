# EventGear — Tarefas de Frontend
**Para:** Desenvolvedor Frontend  
**Stack:** Next.js 14 · Tailwind CSS · shadcn/ui · TypeScript  
**Versão:** 1.0 — MVP  
**Data:** Maio 2026

---

> **Convenções gerais antes de começar**
> - Todas as telas são **mobile-first** — projetar para 375px e garantir que funcione em até 1280px
> - Paleta principal: `#1B4F8A` (azul escuro), `#2E86C1` (azul médio), `#D6E4F0` (azul claro), `#1C1C1E` (texto)
> - Tipografia: **Inter** (Google Fonts) — weights 400, 500, 600, 700
> - Componentes base via **shadcn/ui** — não reinventar botões, inputs, modais e toasts
> - Ícones via **lucide-react** — sem outras lib de ícones
> - Todas as telas com **loading skeleton** enquanto carregam dados da API
> - Mensagens de erro e sucesso via **toast** (shadcn/ui)
> - Formulários validados com **React Hook Form + Zod**
> - Nenhuma lógica de negócio no frontend — apenas apresentação e chamadas de API
> - Área autenticada protegida por middleware Next.js — redirecionar para `/login` se sem token

---

## ESTRUTURA DE ROTAS

```
/                          → Redireciona para /login ou /dashboard
/login                     → Tela de login
/register                  → Tela de cadastro da empresa
/forgot-password           → Recuperar senha

/dashboard                 → Painel principal (home autenticada)
/materiais                 → Listagem de materiais
/materiais/novo            → Cadastrar novo material
/materiais/[id]            → Detalhe do material
/materiais/[id]/editar     → Editar material
/materiais/etiquetas       → Imprimir etiquetas em lote

/eventos                   → Listagem de eventos
/eventos/novo              → Criar novo evento
/eventos/[id]              → Detalhe do evento
/eventos/[id]/alocar       → Alocar materiais ao evento
/eventos/[id]/checklist    → Tela de checklist (saída ou retorno)

/relatorios                → Lista de relatórios disponíveis
/relatorios/[eventId]      → Relatório de um evento específico

/configuracoes             → Configurações da empresa e usuário
/configuracoes/usuarios    → Gestão de usuários e convites
```

---

## COMPONENTES GLOBAIS (criar antes das telas)

### COMP-01 — Layout autenticado (`AppLayout`)
**Arquivo:** `components/layout/AppLayout.tsx`

Estrutura:
- **Header fixo** no topo (altura 56px)
  - Logo "EventGear" à esquerda (texto bold, cor `#1B4F8A`)
  - Nome da empresa no centro (truncar se longo)
  - Avatar/menu do usuário à direita — ao clicar: dropdown com "Configurações" e "Sair"
- **Bottom Navigation** fixo no rodapé (mobile) com 4 itens:
  - 🏠 Dashboard (`/dashboard`)
  - 📦 Materiais (`/materiais`)
  - 📅 Eventos (`/eventos`)
  - 📊 Relatórios (`/relatorios`)
  - Ícone ativo destacado em `#2E86C1` com fundo `#D6E4F0` arredondado
- **Sidebar** lateral (apenas desktop, largura 220px, oculta em mobile)
  - Mesmos itens do bottom nav
  - Item ativo com barra lateral esquerda azul + fundo suave
- `{children}` renderizados em área de scroll central com `padding: 16px`

---

### COMP-02 — Card de Material (`MaterialCard`)
**Arquivo:** `components/materiais/MaterialCard.tsx`

Props: `{ id, nome, categoria, quantidade, status, fotoUrl? }`

Layout:
- Card com `rounded-xl shadow-sm border`
- Linha superior: foto (40x40, `rounded-lg`, placeholder se sem foto) + nome em bold + categoria em texto muted
- Linha inferior: badge de status (`Disponível` verde / `Alocado` amarelo / `Manutenção` laranja / `Extraviado` vermelho) + quantidade à direita
- Tap no card navega para `/materiais/[id]`

---

### COMP-03 — Card de Evento (`EventCard`)
**Arquivo:** `components/eventos/EventCard.tsx`

Props: `{ id, nome, dataInicio, dataRetorno, status, totalMateriais, materiaisConfirmados? }`

Layout:
- Card com `rounded-xl shadow-sm border`
- Linha 1: nome do evento em bold + badge de status (cores: Planejado=cinza / Em andamento=azul / Concluído=verde / Cancelado=vermelho)
- Linha 2: 📅 data início → 📅 data retorno (formato: DD/MM/AAAA)
- Linha 3 (só se Em andamento): barra de progresso do checklist — `X de Y materiais confirmados`
- Tap navega para `/eventos/[id]`

---

### COMP-04 — Status Badge (`StatusBadge`)
**Arquivo:** `components/ui/StatusBadge.tsx`

Props: `{ status, type: 'material' | 'evento' | 'checklist' }`

Mapeamento de cores por tipo e status — usar `pill` pequeno com cor de fundo suave e texto escuro.

---

### COMP-05 — QR Scanner (`QRScanner`)
**Arquivo:** `components/qr/QRScanner.tsx`

- Usa a lib `html5-qrcode` para acessar a câmera do dispositivo
- Exibe viewfinder com borda animada (CSS) para indicar área de leitura
- Ao detectar QR Code: emite callback `onScan(qrCodeValue: string)`
- Exibe botão "Inserir manualmente" abaixo do scanner (abre input de texto)
- Exibe botão "Cancelar" no topo direito
- Pedir permissão de câmera: se negada, mostrar mensagem explicativa com instrução de como liberar no celular

---

### COMP-06 — Empty State (`EmptyState`)
**Arquivo:** `components/ui/EmptyState.tsx`

Props: `{ icone, titulo, descricao, labelBotao?, onBotao? }`

- Ícone centralizado (lucide) em cinza claro
- Título e descrição centralizados
- Botão de ação opcional (ex: "Cadastrar primeiro material")
- Usar em todas as listas vazias

---

### COMP-07 — Skeleton de Lista (`ListSkeleton`)
**Arquivo:** `components/ui/ListSkeleton.tsx`

Props: `{ linhas?: number }` (padrão 4)

- Renderiza N retângulos cinza animados (`animate-pulse`) simulando cards
- Usar enquanto dados da API carregam

---

## TELAS — AUTENTICAÇÃO

### TELA-01 — Login
**Rota:** `/login`  
**Arquivo:** `app/(auth)/login/page.tsx`

**Conteúdo da tela:**
- Logo "EventGear" centralizado no topo (grande, bold, azul)
- Subtítulo: *"Controle seus equipamentos com inteligência"*
- Formulário:
  - Campo: **E-mail** (type email, placeholder "seu@email.com")
  - Campo: **Senha** (type password, com ícone de olho para mostrar/ocultar)
  - Link: "Esqueci minha senha" (alinha à direita, acima do botão)
  - Botão primário: **"Entrar"** (largura total, loading state)
- Separador "ou"
- Link: **"Criar conta gratuita"** → `/register`
- Rodapé: `© 2026 EventGear · ScantelburyDevs`

**Validações:**
- E-mail: obrigatório, formato válido
- Senha: obrigatório, mínimo 8 caracteres
- Erro de credenciais: toast vermelho "E-mail ou senha incorretos"

---

### TELA-02 — Cadastro
**Rota:** `/register`  
**Arquivo:** `app/(auth)/register/page.tsx`

**Conteúdo:**

Formulário em **2 etapas** (step indicator no topo: "1 Empresa → 2 Acesso"):

*Etapa 1 — Dados da empresa:*
- Campo: **Nome da empresa** (ex: "Sonora Eventos Ltda")
- Campo: **Telefone/WhatsApp** (máscara brasileira)
- Campo: **Cidade / Estado** (texto livre)
- Botão: "Continuar →"

*Etapa 2 — Dados de acesso:*
- Campo: **Seu nome**
- Campo: **E-mail**
- Campo: **Senha** (com indicador de força: fraca/média/forte)
- Campo: **Confirmar senha**
- Checkbox: aceite dos Termos de Uso
- Botão: "Criar conta gratuita"
- Link: "← Voltar"

**Pós-cadastro:** redirecionar para `/dashboard` com toast "Bem-vindo ao EventGear! 🎉"

---

### TELA-03 — Recuperar Senha
**Rota:** `/forgot-password`  
**Arquivo:** `app/(auth)/forgot-password/page.tsx`

**Conteúdo:**
- Ícone de cadeado centralizado
- Título: "Recuperar senha"
- Descrição: "Digite seu e-mail e enviaremos as instruções de recuperação."
- Campo: **E-mail**
- Botão: "Enviar instruções"
- Link: "← Voltar para o login"
- Após envio: trocar formulário por mensagem de sucesso com ícone de e-mail

---

## TELAS — ÁREA AUTENTICADA

### TELA-04 — Dashboard
**Rota:** `/dashboard`  
**Arquivo:** `app/(app)/dashboard/page.tsx`

**Conteúdo:**

Saudação no topo:
> "Boa tarde, [Nome]! 👋"  
> "[Nome da empresa]"

**Cards de resumo** (2x2 grid em mobile, 4 colunas em desktop):
- 📦 **Total de materiais** — número grande + "itens cadastrados" abaixo
- ✅ **Disponíveis** — número + barra verde (% do total)
- 📅 **Eventos este mês** — número + "realizados"
- ⚠️ **Pendências** — número + "itens não retornados" (vermelho se > 0)

**Seção: Eventos em andamento**
- Título "Eventos ativos" + botão "Ver todos →"
- Lista de até 3 `EventCard` com status "Em andamento"
- Se vazio: `EmptyState` com "Nenhum evento ativo no momento" + botão "Criar evento"

**Seção: Atividade recente**
- Lista de até 5 ações recentes (ex: "João confirmou 12 itens no evento Rock Fest — há 2h")
- Cada item: ícone de ação + texto + timestamp relativo

---

### TELA-05 — Listagem de Materiais
**Rota:** `/materiais`  
**Arquivo:** `app/(app)/materiais/page.tsx`

**Conteúdo:**

Header da página:
- Título: "Materiais"
- Botão primário à direita: **"+ Novo material"** → `/materiais/novo`

Barra de busca e filtros:
- Input de busca com ícone de lupa (placeholder: "Buscar por nome...")
- Chips de filtro por categoria (ex: "Todos", "Som", "Iluminação", "Estrutura", "Outros") — scroll horizontal em mobile
- Chip de filtro por status: "Todos", "Disponível", "Alocado"

Lista de resultados:
- Grid de `MaterialCard` (1 coluna mobile, 2 colunas tablet, 3 desktop)
- Paginação ou infinite scroll (escolha do dev)
- Se lista vazia: `EmptyState` "Nenhum material encontrado" + botão "Cadastrar material"
- Skeleton enquanto carrega

Fab (floating action button) em mobile: `+` azul, fixo no canto inferior direito, abre `/materiais/novo`

---

### TELA-06 — Cadastrar Material
**Rota:** `/materiais/novo`  
**Arquivo:** `app/(app)/materiais/novo/page.tsx`

**Conteúdo:**

Header: "← Novo material"

Formulário em scroll único (não usar steps aqui):

*Identificação:*
- Campo: **Nome do material** * (ex: "Caixa JBL SRX 835P")
- Campo: **Categoria** * — select com opções: Som / Iluminação / Estrutura / Elétrico / Transporte / Outros
- Campo: **Quantidade total** * (input numérico, mínimo 1)
- Campo: **Número de série / código interno** (opcional)

*Detalhes:*
- Campo: **Marca** (texto livre)
- Campo: **Modelo** (texto livre)
- Campo: **Valor de reposição** (R$, moeda, opcional)
- Campo: **Observações** (textarea, máx 300 chars, contador)

*Fotos:*
- Área de upload com texto "Toque para adicionar fotos" e ícone de câmera
- Aceita até 3 fotos (JPEG/PNG)
- Preview das fotos adicionadas com botão de remover (X) em cada
- Indicar qual é a foto principal (estrela)

Botão sticky no fundo: **"Salvar material"** (loading state enquanto salva)

Após salvar: navegar para `/materiais/[id]` com toast "Material cadastrado com sucesso!"

---

### TELA-07 — Detalhe do Material
**Rota:** `/materiais/[id]`  
**Arquivo:** `app/(app)/materiais/[id]/page.tsx`

**Conteúdo:**

Header: "← [Nome do material]" + botão "⋮" (menu: Editar / Imprimir QR / Desativar)

*Bloco de identidade:*
- Foto principal em destaque (largura total, altura 200px, `object-cover`, `rounded-xl`)
- Row de fotos secundárias (miniaturas 60x60)
- Nome do material em bold grande
- Categoria e código interno
- Badge de status atual

*Bloco de dados:*
- Grid 2x2: Quantidade total / Disponível agora / Marca / Valor de reposição
- Observações (se preenchido)

*QR Code:*
- Título "QR Code do material"
- QR Code gerado inline (100x100px, centralizado)
- Botão: "Imprimir etiqueta" — abre modal de preview de impressão

*Histórico de eventos:*
- Título "Histórico de uso"
- Lista de eventos em que o material foi alocado (nome + data + status do retorno)
- Se vazio: "Nenhum evento registrado ainda"

---

### TELA-08 — Editar Material
**Rota:** `/materiais/[id]/editar`  
**Arquivo:** `app/(app)/materiais/[id]/editar/page.tsx`

Mesmo formulário do TELA-06 com campos pré-preenchidos.

Botão sticky: **"Salvar alterações"**  
Link abaixo: "Cancelar" (volta para o detalhe)

---

### TELA-09 — Imprimir Etiquetas
**Rota:** `/materiais/etiquetas`  
**Arquivo:** `app/(app)/materiais/etiquetas/page.tsx`

**Conteúdo:**

Header: "← Impressão de etiquetas"

*Seleção de materiais:*
- Barra de busca igual ao TELA-05
- Lista de materiais com checkbox à esquerda de cada um
- Botão "Selecionar todos visíveis"
- Contador: "X materiais selecionados"

*Configuração da etiqueta:*
- Opção de tamanho: "50x30mm" / "62x30mm" / "100x50mm" (radio)
- Toggle: "Incluir nome do material"
- Toggle: "Incluir categoria"
- Toggle: "Incluir foto"

Preview ao vivo de como ficará a etiqueta (lado direito em desktop, abaixo em mobile)

Botão: **"Gerar PDF para impressão"** (abre PDF em nova aba via API)

---

### TELA-10 — Listagem de Eventos
**Rota:** `/eventos`  
**Arquivo:** `app/(app)/eventos/page.tsx`

**Conteúdo:**

Header: "Eventos" + botão **"+ Novo evento"** → `/eventos/novo`

Filtros:
- Tabs horizontais em scroll: "Todos" / "Planejados" / "Em andamento" / "Concluídos"
- Input de busca por nome

Lista de `EventCard` agrupados por mês (ex: "Maio 2026")  
Skeleton durante carregamento  
EmptyState por tab se não houver eventos naquela categoria

Fab mobile: `+` azul

---

### TELA-11 — Criar Evento
**Rota:** `/eventos/novo`  
**Arquivo:** `app/(app)/eventos/novo/page.tsx`

**Conteúdo:**

Header: "← Novo evento"

Formulário:

- Campo: **Nome do evento** * (ex: "Show Rock Fest 2026")
- Campo: **Data de início** * — date picker nativo mobile (input type=date)
- Campo: **Data prevista de retorno** * — date picker, não pode ser antes da data de início
- Campo: **Local / Endereço** (texto livre, opcional)
- Campo: **Cliente / Contratante** (texto livre, opcional)
- Campo: **Observações** (textarea, opcional)

Botão sticky: **"Criar evento"**

Após criar: navegar para `/eventos/[id]/alocar` com toast "Evento criado! Agora aloque os materiais."

---

### TELA-12 — Detalhe do Evento
**Rota:** `/eventos/[id]`  
**Arquivo:** `app/(app)/eventos/[id]/page.tsx`

**Conteúdo:**

Header: "← [Nome do evento]" + botão "⋮" (menu: Editar / Cancelar evento)

*Bloco de resumo:*
- Badge de status grande + nome do evento
- 📅 Datas: início → retorno previsto
- 📍 Local (se preenchido)
- 👤 Cliente (se preenchido)

*Bloco de progresso* (visível se status ≠ Planejado):
- Barra de progresso: "Checklist de saída: X/Y confirmados"
- Barra de progresso: "Checklist de retorno: X/Y retornados"

*Materiais alocados:*
- Título "Materiais alocados" + contador
- Lista compacta com: nome, quantidade, status de checklist (ícone ✅ / ⏳ / ❌)
- Botão "Gerenciar alocação" → `/eventos/[id]/alocar` (só se Planejado)

*Ações do evento* (botões grandes, sticky no fundo):
- Se Planejado: **"Iniciar checklist de saída"**
- Se Em andamento (saída concluída): **"Iniciar checklist de retorno"**
- Se checklist de retorno concluído: **"Encerrar evento"** + **"Ver relatório"**

---

### TELA-13 — Alocar Materiais
**Rota:** `/eventos/[id]/alocar`  
**Arquivo:** `app/(app)/eventos/[id]/alocar/page.tsx`

**Conteúdo:**

Header: "← Alocar materiais"  
Subtítulo: Nome do evento

*Materiais já alocados:*
- Lista com cada item alocado: nome + quantidade alocada + botão "−" para remover
- Se vazio: mensagem "Nenhum material alocado ainda"

Separador

*Adicionar materiais:*
- Busca de materiais do inventário disponível
- Cada resultado mostra: nome + categoria + `disponível: X unid.`
- Ao tocar: abre bottom sheet/modal com:
  - Nome do material
  - Input numérico: "Quantidade a alocar" (máx = disponível)
  - Botão "Adicionar"

Botão fixo no fundo: **"Salvar alocação"** → volta para `/eventos/[id]`

---

### TELA-14 — Checklist (Saída e Retorno)
**Rota:** `/eventos/[id]/checklist`  
**Arquivo:** `app/(app)/eventos/[id]/checklist/page.tsx`

> Esta é a tela mais importante do sistema. Deve ser extremamente simples e rápida de usar no campo.

**Conteúdo:**

Header fixo:
- "← [Nome do evento]"
- Título grande centralizado: "CHECKLIST DE SAÍDA" ou "CHECKLIST DE RETORNO" (em maiúsculas, bold)
- Contador de progresso: "**8 / 23** confirmados" com barra de progresso colorida

*Botão de scanner* (destaque principal):
- Botão grande, azul, centralizado, altura 56px, ícone de QR Code + "Escanear QR Code"
- Ao tocar: abre o `QRScanner` (COMP-05) em modal/fullscreen

*Lista de materiais do evento:*
- Cada item exibe:
  - Ícone de status: ⏳ pendente (cinza) / ✅ confirmado (verde) / ❌ ausente (vermelho)
  - Nome do material (bold)
  - Quantidade: "X de Y unidades"
  - Ao tocar no item: abre opções: "Confirmar manualmente" / "Marcar como ausente" / "Adicionar observação"
- Itens confirmados ficam abaixo dos pendentes (ordenação automática)

*Observação por item (modal):*
- Ao marcar como ausente ou com avaria: textarea obrigatória de observação
- Ex: "Caixa voltou com alto-falante danificado"

*Botão de conclusão* (sticky no fundo):
- Só ativo quando todos os itens forem tratados (confirmados ou ausentes)
- **"Concluir checklist de saída"** ou **"Concluir checklist de retorno"**
- Ao clicar: modal de confirmação com resumo (X confirmados, Y ausentes)
- Após confirmar: navega para `/eventos/[id]` com toast de sucesso

---

### TELA-15 — Relatório do Evento
**Rota:** `/relatorios/[eventId]`  
**Arquivo:** `app/(app)/relatorios/[eventId]/page.tsx`

**Conteúdo:**

Header: "← Relatório" + botão "⬇️ Baixar PDF"

*Cabeçalho do relatório:*
- Nome do evento, datas, local, cliente

*Cards de resumo:*
- Total de materiais alocados
- Confirmados na saída
- Retornados
- ⚠️ Não retornados (vermelho, destaque se > 0)
- 🔧 Com avarias registradas (laranja)

*Tabela de materiais:*
- Colunas: Material / Qtd. / Saída / Retorno / Observação
- Linhas com problema destacadas em fundo vermelho claro
- Ícones de status em cada célula

*Seção de pendências* (só se houver):
- Título em vermelho: "⚠️ Materiais não retornados"
- Lista com nome + quantidade + última observação

Botão fixo no fundo: **"Baixar PDF completo"**

---

### TELA-16 — Configurações
**Rota:** `/configuracoes`  
**Arquivo:** `app/(app)/configuracoes/page.tsx`

**Conteúdo:**

Header: "Configurações"

*Seção: Minha conta*
- Avatar (iniciais do nome, gerado por CSS)
- Nome completo (editável inline)
- E-mail (somente leitura)
- Botão: "Alterar senha"

*Seção: Empresa*
- Nome da empresa (editável)
- Telefone (editável)
- Cidade/Estado (editável)
- Botão: "Salvar alterações"

*Seção: Usuários*
- Lista de usuários ativos com nome, e-mail e papel (Admin/Operador)
- Botão "Convidar usuário" → abre modal com campo de e-mail + select de papel
- Botão "Remover" ao lado de cada usuário (exceto o próprio)

*Seção: Categorias de materiais* (futuro — exibir desabilitado com badge "Em breve")

*Seção: Plano*
- Plano atual: "Grátis" / "Básico" / "Pro" / "Business"
- Botão: "Fazer upgrade" (link externo ou modal de planos)

*Rodapé da página:*
- Versão do app: `v1.0.0`
- Link: Termos de Uso · Política de Privacidade
- Botão destrutivo: "Sair da conta" (vermelho, com confirmação)

---

## FLUXOS DE FEEDBACK (obrigatórios em todas as telas)

| Situação | Componente | Mensagem |
|---|---|---|
| Ação salva com sucesso | Toast verde | "[Ação] realizada com sucesso!" |
| Erro de API genérico | Toast vermelho | "Algo deu errado. Tente novamente." |
| Erro de validação | Inline abaixo do campo | Mensagem específica do campo |
| Carregando dados | Skeleton | — |
| Lista vazia | EmptyState | Mensagem contextual + ação |
| Confirmação de ação destrutiva | Modal confirm | "Tem certeza? Essa ação não pode ser desfeita." |
| Sem internet | Banner fixo no topo | "Sem conexão. Verifique sua internet." |

---

## ORDEM DE ENTREGA SUGERIDA

```
Sprint 1 — Base e autenticação
  [ ] COMP-01 AppLayout (header + bottom nav)
  [ ] TELA-01 Login
  [ ] TELA-02 Cadastro
  [ ] TELA-03 Recuperar senha
  [ ] COMP-06 EmptyState
  [ ] COMP-07 ListSkeleton

Sprint 2 — Materiais
  [ ] COMP-02 MaterialCard
  [ ] COMP-04 StatusBadge
  [ ] TELA-05 Listagem de materiais
  [ ] TELA-06 Cadastrar material
  [ ] TELA-07 Detalhe do material
  [ ] TELA-08 Editar material

Sprint 3 — Eventos e alocação
  [ ] COMP-03 EventCard
  [ ] TELA-04 Dashboard
  [ ] TELA-10 Listagem de eventos
  [ ] TELA-11 Criar evento
  [ ] TELA-12 Detalhe do evento
  [ ] TELA-13 Alocar materiais

Sprint 4 — Checklist e relatórios
  [ ] COMP-05 QR Scanner
  [ ] TELA-14 Checklist (saída e retorno)
  [ ] TELA-15 Relatório do evento
  [ ] TELA-09 Impressão de etiquetas
  [ ] TELA-16 Configurações
```

---

## NOTAS TÉCNICAS PARA O DEV

- **Autenticação:** armazenar `access_token` em memória (Zustand) e `refresh_token` em cookie httpOnly via API route do Next.js. Nunca no localStorage.
- **Câmera QR:** `html5-qrcode` precisa de `https` para funcionar — testar em ambiente com SSL mesmo localmente (usar `ngrok` ou configurar certificado).
- **Impressão:** usar `react-to-print` para etiquetas no browser; PDF completo de relatório gerado pelo backend.
- **Imagens:** usar `next/image` com `priority` nas fotos principais dos materiais.
- **Date picker:** usar `input type="date"` nativo mobile — sem lib de calendário no MVP para manter a leveza.
- **Offline:** implementar service worker básico do Next.js PWA para cachear a shell do app — dados em cache são só leitura.

---

*Documento gerado por ScantelburyDevs.com.br — EventGear MVP v1.0*
