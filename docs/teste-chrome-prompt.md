# EventGear — Prompt de Teste Completo para Claude in Chrome

---

## CONTEXTO

Você é um QA automatizado testando o **EventGear**, um sistema de controle de equipamentos para eventos. Seu objetivo é testar todas as telas, funcionalidades e o layout visual da aplicação de forma sistemática.

**URL da aplicação:** https://eventgear-web.h1dq2d.easypanel.host

**Credenciais de acesso:**
- **E-mail:** admin@eventgear.com
- **Senha:** Admin@2026!!
- **Papel:** Administrador (acesso total)

---

## INSTRUÇÕES GERAIS

- Navegue em cada rota listada abaixo em ordem
- Em cada tela: tire um screenshot, descreva o que vê e aponte qualquer problema
- Verifique: layout responsivo, textos truncados, botões clicáveis, erros no console
- Se uma tela exibir erro 404, página em branco ou spinner eterno → registrar como **FALHA**
- Se o layout estiver quebrado (elementos sobrepostos, texto ilegível) → registrar como **VISUAL**
- Se a funcionalidade não funcionar → registrar como **FUNCIONAL**
- Ao final, gere um relatório resumido com todos os problemas encontrados

---

## ROTEIRO DE TESTES

### 1. LANDING PAGE (sem login)

**Rota:** `/`

Verificar:
- [ ] A página de landing carrega corretamente
- [ ] Navbar com links "Funcionalidades", "Preços", botões "Entrar" e "Começar grátis"
- [ ] Seção Hero com headline e mockup
- [ ] Seção de features com 4 cards
- [ ] Seção de preços com 3 planos (Starter, Profissional, Business)
- [ ] FAQ colapsável funcionando
- [ ] Seção de ecossistema (Nota Fácil / EventGear / Agenda Inteligente)
- [ ] Footer com "Build · Migrate · Innovate"
- [ ] Botão "Entrar" navega para `/login`

---

### 2. AUTENTICAÇÃO

#### 2a. Login
**Rota:** `/login`

Verificar:
- [ ] Formulário com campos E-mail e Senha
- [ ] Link "Esqueci minha senha" visível acima do botão Entrar
- [ ] Link "Criar conta gratuita" no rodapé
- [ ] Tentar logar com senha errada → deve aparecer mensagem de erro
- [ ] Logar com as credenciais corretas:
  - E-mail: `admin@eventgear.com`
  - Senha: `Admin@2026!!`
- [ ] Após login bem-sucedido: deve redirecionar para `/dashboard`

#### 2b. Recuperar senha
**Rota:** `/forgot-password`

Verificar:
- [ ] Ícone de cadeado centralizado
- [ ] Campo de e-mail presente
- [ ] Botão "Enviar instruções"
- [ ] Após enviar: formulário muda para mensagem de sucesso com ícone de e-mail
- [ ] Link "Voltar para o login" funciona

#### 2c. Cadastro
**Rota:** `/register`

Verificar:
- [ ] Step indicator "1 Empresa → 2 Acesso" no topo
- [ ] Etapa 1: campos Nome da empresa, Telefone, Cidade/Estado
- [ ] Botão "Continuar →" avança para etapa 2
- [ ] Etapa 2: campos Nome, E-mail, Senha, Confirmar senha, checkbox Termos
- [ ] Link "← Voltar" retorna para etapa 1

---

### 3. DASHBOARD

**Rota:** `/dashboard`

Verificar:
- [ ] Saudação com nome do usuário ("Olá, Administrador")
- [ ] 4 cards de resumo: Materiais / Disponíveis / Eventos / Em andamento
- [ ] Sidebar visível em desktop com: Dashboard / Materiais / Eventos / Relatórios + seção Sistema > Configurações
- [ ] Bottom navigation em mobile com 4 itens: Início / Materiais / Eventos / Relatórios
- [ ] Botões "Novo Material" e "Novo Evento" clicáveis
- [ ] Clicar "Novo Material" → navega para `/materiais/novo`
- [ ] Voltar e clicar "Novo Evento" → navega para `/eventos/novo`

---

### 4. MATERIAIS

#### 4a. Listagem
**Rota:** `/materiais`

Verificar:
- [ ] Título "Materiais", botão "+ Novo" à direita
- [ ] Campo de busca funciona (digitar algo e ver resultado filtrar)
- [ ] Cards de materiais listados (ou EmptyState se vazio)
- [ ] FAB "+" visível em mobile (canto inferior direito)
- [ ] Clicar em um material navega para `/materiais/[id]`

#### 4b. Cadastrar material
**Rota:** `/materiais/novo`

Verificar:
- [ ] Formulário com campos: Nome, Categoria (select), Quantidade, Nº Série, Marca, Modelo, Custo de reposição, Descrição
- [ ] Campos obrigatórios com asterisco
- [ ] Tentar salvar sem nome → deve mostrar erro de validação inline
- [ ] Preencher todos os campos obrigatórios e salvar:
  - Nome: `Caixa JBL SRX 835P`
  - Categoria: `AUDIO`
  - Quantidade: `4`
  - Marca: `JBL`
- [ ] Após salvar: redireciona para `/materiais/[id]` com toast de sucesso

#### 4c. Detalhe do material
**Rota:** `/materiais/[id]` (usar o ID criado acima)

Verificar:
- [ ] QR Code gerado e visível
- [ ] Informações do material exibidas (nome, categoria, quantidade, marca)
- [ ] Badge de status (Disponível)
- [ ] Botão "Editar" visível para admin
- [ ] Botão "Remover" na zona de perigo

#### 4d. Editar material
**Rota:** `/materiais/[id]/editar`

Verificar:
- [ ] Formulário pré-preenchido com dados do material
- [ ] Alterar a quantidade para `6` e salvar
- [ ] Toast de sucesso aparece
- [ ] Redireciona de volta para `/materiais/[id]`

#### 4e. Etiquetas
**Rota:** `/materiais/etiquetas`

Verificar:
- [ ] Campo de busca presente
- [ ] Lista de materiais com checkboxes
- [ ] Botão "Selecionar todos"
- [ ] Contador "X materiais selecionados" atualiza
- [ ] Opções de tamanho (radio buttons)
- [ ] Toggles "Incluir nome" / "Incluir categoria"
- [ ] Botão "Gerar PDF" visível (pode estar desabilitado se nada selecionado)

---

### 5. EVENTOS

#### 5a. Listagem
**Rota:** `/eventos`

Verificar:
- [ ] Título "Eventos", botão "+ Novo" à direita
- [ ] Filtro de status (select) funciona
- [ ] Campo de busca funciona
- [ ] FAB "+" em mobile
- [ ] Clicar em evento navega para `/eventos/[id]`

#### 5b. Criar evento
**Rota:** `/eventos/novo`

Verificar:
- [ ] Formulário com campos: Nome, Data início, Data retorno, Local, Cliente, Observações
- [ ] Tentar datas em que retorno < início → deve mostrar erro
- [ ] Preencher e criar:
  - Nome: `Show Rock Fest 2026`
  - Data início: amanhã
  - Data retorno: depois de amanhã
  - Local: `Arena São Paulo`
  - Cliente: `Produtora XYZ`
- [ ] Após criar: redireciona para `/eventos/[id]` com toast

#### 5c. Detalhe do evento
**Rota:** `/eventos/[id]`

Verificar:
- [ ] Badge de status (Planejado)
- [ ] Datas, local, cliente exibidos
- [ ] Seção "Materiais alocados" com botão "Adicionar"
- [ ] Adicionar um material via modal (selecionar Caixa JBL, quantidade 2)
- [ ] Material aparece na lista após adicionar
- [ ] Botão "Checklist Saída" visível
- [ ] Botão "Cancelar" na zona de perigo (não clicar)

#### 5d. Alocar materiais
**Rota:** `/eventos/[id]/alocar`

Verificar:
- [ ] Materiais já alocados listados no topo
- [ ] Busca de materiais disponíveis
- [ ] Clicar "+" em um material abre inline com input de quantidade
- [ ] Botão "Adicionar" funciona
- [ ] Botão "Concluir alocação" no rodapé navega de volta

#### 5e. Checklist de saída
**Rota:** `/eventos/[id]/checklist?tipo=saida`

Verificar:
- [ ] Título "Saída" em destaque
- [ ] Contador "X de Y confirmados" e barra de progresso
- [ ] Se checklist não gerado: botão "Gerar checklist" aparece
- [ ] Clicar "Gerar checklist" e aguardar lista aparecer
- [ ] Botão "Escanear QR Code" presente
- [ ] Lista de materiais com ícones de status (pendente/confirmado)

#### 5f. Checklist de retorno
**Rota:** `/eventos/[id]/checklist?tipo=retorno`

Verificar:
- [ ] Mesmo layout do checklist de saída mas com título "Retorno"

---

### 6. RELATÓRIOS

#### 6a. Lista de relatórios
**Rota:** `/relatorios`

Verificar:
- [ ] Título "Relatórios"
- [ ] 6 StatCards com números (Materiais, Disponíveis, Eventos, Em andamento, Concluídos, Este mês)
- [ ] Lista de eventos concluídos (se houver)
- [ ] Links de eventos navegam para `/relatorios/[eventId]`

#### 6b. Relatório de evento
**Rota:** `/relatorios/[eventId]` (usar evento criado)

Verificar:
- [ ] Nome, datas, local, cliente do evento exibidos
- [ ] Badge de status
- [ ] Cards de resumo (total alocados, confirmados, retornados)
- [ ] Lista de materiais
- [ ] Botão "Baixar PDF" visível

---

### 7. CONFIGURAÇÕES

#### 7a. Configurações gerais
**Rota:** `/configuracoes`

Verificar:
- [ ] Seção "Minha conta" com avatar (iniciais), nome, e-mail
- [ ] Seção "Empresa" com campos editáveis
- [ ] Link "Gerenciar →" para `/configuracoes/usuarios`
- [ ] Seção "Plano" com "Plano Grátis" e botão Upgrade
- [ ] Versão do app no rodapé
- [ ] Botão "Sair da conta" vermelho → ao clicar pede confirmação
- [ ] Confirmar → deve fazer logout e redirecionar para `/login`
  - **ATENÇÃO:** Só testar logout por último (precisará logar novamente)

#### 7b. Usuários
**Rota:** `/configuracoes/usuarios`

Verificar:
- [ ] Lista de usuários com nome, e-mail e papel
- [ ] Botão "Convidar" abre modal
- [ ] Modal com campo de e-mail e select de papel
- [ ] Botão "Enviar convite" no modal

---

### 8. TESTES DE LAYOUT RESPONSIVO

Após testar em desktop, redimensionar para mobile (375px) e verificar:

- [ ] `/` — Landing page adapta para mobile, menu hamburger aparece
- [ ] `/dashboard` — Bottom nav visível, sidebar oculta
- [ ] `/materiais` — FAB "+" visível no canto inferior direito
- [ ] `/eventos` — FAB "+" visível
- [ ] `/eventos/[id]/checklist?tipo=saida` — botão scanner grande e acessível

---

### 9. TESTES DE FLUXO COMPLETO

Executar o fluxo ponta a ponta:

1. Login → Dashboard
2. Criar material: `Mesa de som Yamaha CL5` / AUDIO / 1 un.
3. Criar evento: `Festival Junino 2026` / datas futuras
4. No evento: alocar a Mesa de som (1 un.)
5. Ir para checklist de saída → gerar → verificar que a Mesa aparece na lista
6. Voltar ao evento → verificar status ainda Planejado
7. Ir para Relatórios → verificar que os contadores mudaram

---

## FORMATO DO RELATÓRIO FINAL

Ao concluir todos os testes, gerar um relatório neste formato:

```
## Relatório de Testes — EventGear
Data: [data]

### ✅ Funcionando corretamente
- [lista do que passou]

### ❌ Falhas encontradas
| Rota | Tipo | Descrição |
|------|------|-----------|
| /rota | FALHA/VISUAL/FUNCIONAL | Descrição do problema |

### ⚠️ Observações
- [comportamentos suspeitos mas não críticos]

### Resumo
- Total de telas testadas: X
- Passou: X
- Com problema: X
```
