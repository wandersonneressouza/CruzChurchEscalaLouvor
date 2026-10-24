# BACKLOG DO SISTEMA — CRUZ CHURCH ESCALA DE LOUVOR

> **Nota para IAs:** Este arquivo é de uso exclusivo dos agentes de IA para registrar estado de implementação, contexto técnico, decisões arquiteturais e pendências. Atualize sempre que finalizar ou planejar uma nova funcionalidade.

---

## 1. Contexto e Diretrizes Gerais
- **Tecnologias:** React 18, Vite 5, React Router Dom 6, CSS Puro.
- **Etapa Atual do Projeto:** **Etapa 1: Front-end e Design** (Apenas JSX estrutural e CSS puro, sem lógica de APIs ou chamadas de banco).
- **Regra de Estilização:** 
  - `src/globals.css` para estilos globais e variáveis de tema.
  - Cada tela possui seu próprio arquivo CSS encapsulado por ID único (ex.: `#tela-inicio`, `#tela-agenda`, `#tela-repertorio`) para evitar vazamento de estilos.
  - Não utilizar frameworks de CSS ou styled-components.
- **Regra de Componentização:**
  - Telas estruturadas como **monoblocos**. Criação de subcomponentes somente sob demanda ou necessidade técnica justificada.
- **Regra de Dependências:**
  - Proibida a instalação de novos pacotes sem autorização expressa do usuário.

---

## 2. Funcionalidades e Telas Implementadas

### [FEAT-001] Setup Inicial e Tela de Início (Home Dashboard)
- **Status:** Concluída
- **Data:** 2026-10-23
- **Arquivos Criados:**
  - `package.json` (React 18.3, Vite 5.4, React Router Dom 6.26)
  - `vite.config.js` (Porta 3000)
  - `index.html` (Fonte Plus Jakarta Sans, viewport responsiva)
  - `src/main.jsx`
  - `src/App.jsx` (BrowserRouter com rota `/` para `Inicio`)
  - `src/globals.css` (Variáveis CSS de cores, fontes, sombras, container mobile-first)
  - `src/pages/Inicio/Inicio.jsx` (Tela monobloco)
  - `src/pages/Inicio/Inicio.css` (CSS puro 100% escopado sob `#tela-inicio`)
- **Identificador de Escopo CSS:** `#tela-inicio`
- **Validação de Build:** `npm run build` executado com sucesso (zero erros).
- **Servidor Dev:** Rodando em `http://localhost:3000/`.

### [FEAT-002] Tela Agenda e Escalas
- **Status:** Concluída
- **Data:** 2026-10-23
- **Arquivos Criados/Alterados:**
  - `src/pages/Agenda/Agenda.jsx` (Tela monobloco com suporte a abas interativas 'calendario' e 'escalas')
  - `src/pages/Agenda/Agenda.css` (CSS puro 100% escopado sob `#tela-agenda`)
  - `src/App.jsx` (Adição da rota `/agenda`)
  - `src/pages/Inicio/Inicio.jsx` (Links diretos para `/agenda` a partir do botão 'Ver minha escala' e card 'Confirmações')
- **Identificador de Escopo CSS:** `#tela-agenda`
- **Funcionalidades da Tela:**
  - Seletor segmented control em pill: `[ Calendário ]` / `[ Escalas ]`.
  - Navegador mensal (`Outubro 2026`) com grade de dias, seleção ativa (`26`) e dots de status (`green` e `orange`).
  - Lista de próximos compromissos (Cultos e Ensaios com data badge lateral, horários e locais).
  - Card de alerta de convocações pendentes com atalho para a aba de escalas.
  - Aba de Escalas detalhada por áreas ministeriais (Vocal, Instrumentistas, Som & Mídia), badges de confirmação e ações de confirmação/substituição.
  - Barra de navegação inferior ativa no item Agenda.
- **Validação de Build:** `npm run build` executado com sucesso (zero erros).

### [FEAT-003] Tela de Repertório Musical
- **Status:** Concluída
- **Data:** 2026-10-23
- **Arquivos Criados/Alterados:**
  - `src/pages/Repertorio/Repertorio.jsx` (Tela monobloco com lista de músicas, busca, filtros e modal)
  - `src/pages/Repertorio/Repertorio.css` (CSS puro 100% escopado sob `#tela-repertorio`)
  - `src/App.jsx` (Adição da rota `/musicas`)
- **Identificador de Escopo CSS:** `#tela-repertorio`
- **Funcionalidades da Tela:**
  - Barra de cabeçalho com retorno e botão de alternância de busca rápida (campo expansível).
  - Chips de filtragem horizontal: `[ Todas ]`, `[ Culto ]`, `[ Tema ]`, `[ Minhas listas ]`.
  - Cards de louvores com miniaturas de capa estilizadas, título, artista, tom, BPM e tags temáticas de culto.
  - Botão de Ação Flutuante (FAB `+`) que abre um modal monobloco para cadastrar novas músicas com título, artista, tom, BPM e classificação.
  - Barra de navegação inferior ativa no item Músicas.
- **Validação de Build:** `npm run build` executado com sucesso (zero erros).

---

### [FEAT-004] Tela Devocional e Tela Mais (Módulos Ministeriais)
- **Status:** Concluída
- **Data:** 2026-10-23
- **Arquivos Criados/Alterados:**
  - `src/pages/Devocional/Devocional.jsx` (Tela monobloco com leitura do dia, áudio player simulado, oração do ministro e plano semanal de 7 dias)
  - `src/pages/Devocional/Devocional.css` (CSS puro 100% escopado sob `#tela-devocional`)
  - `src/pages/Mais/Mais.jsx` (Tela monobloco com perfil de ministro, toggle de disponibilidade, equipe, trocas com solicitação interativa, equipamentos e manuais)
  - `src/pages/Mais/Mais.css` (CSS puro 100% escopado sob `#tela-mais`)
  - `src/App.jsx` (Adição das rotas `/devocional` e `/mais`)
  - `src/pages/Inicio/Inicio.jsx` (Links diretos para `/devocional` no card de Devocional da semana)
- **Identificadores de Escopo CSS:** `#tela-devocional`, `#tela-mais`
- **Funcionalidades da Tela Devocional:**
  - Abas: `[ Leitura do Dia ]` e `[ Plano Semanal ]`.
  - Hero Card com gradiente sofisticado, dados pastorais, tempo estimado de leitura e mini player de áudio interativo (play/pause com barra de progresso animada).
  - Card de versículo chave estilizado (`Atos 16:25-26`) com aspas e tipografia elegante.
  - Reflexão ministerial em 3 partes práticas para o altar.
  - Card de oração guiada para consagração individual do voluntário/ministro.
  - Ação de marcar como lido com estado persistido e badge comemorativo.
  - Barra de progresso semanal com cálculo de leitura, streak de dias seguidos e cronograma dos 7 dias da semana.
  - Ação de favoritar e copiar texto para compartilhamento via Toast alert.
- **Funcionalidades da Tela Mais:**
  - Card de perfil do usuário (Anderson Neres, ministro e tecladista, badge de líder, status online).
  - Card de disponibilidade rápida com switch iOS toggle para marcar presença no mês.
  - Módulos ministeriais com ícones temáticos:
    - *Equipe & Integrantes:* Modal com 9 voluntários detalhados por naipes (Vocal, Harmonia, Ritmo, Áudio & Técnica, Mídia).
    - *Trocas de Escala:* Modal interativo com pedido pendente de substituição e botões de ação ("Aceitar Troca" e "Não posso").
    - *Área Técnica & Palco:* Modal com checklist de 6 equipamentos vitais (Mesa X32, In-Ears, Microfones, DI boxes, etc.) com badges de status ("OK" e "Verificar").
    - *Manual & Regimento:* Modal com diretrizes de pontualidade, ensaio geral e consagração.
    - *Configurações:* Toggles de lembretes de escala e tema noturno, além de confirmação de logout.
- **Validação de Build:** `npm run build` executado com sucesso (zero erros).

---

## 3. Próximas Etapas e Roadmap Planejado

### Conclusão da Etapa 1: Front-end e Design
- **100% do fluxo de navegação implementado:**
  1. `/` — Início (Dashboard de cultos, ensaios, confirmações e avisos)
  2. `/agenda` — Agenda e Escalas (Calendário mensal e detalhamento por ministérios)
  3. `/musicas` — Repertório Musical (Busca, filtros por culto/tema e cadastro com modal FAB)
  4. `/devocional` — Devocional Diário e Plano Semanal (Player áudio, versículo, oração e progresso)
  5. `/mais` — Menu Ministerial e Configurações (Perfil, disponibilidade, equipe, trocas, equipamentos e manual)

### Etapa 2: Integração e Persistência (Futuro / Próximo Passo)
- **Planejamento de Estado Global / Context API:** Centralização de usuário logado, status das escalas confirmadas e músicas do repertório.
- **Camada de Serviços / API Mock ou Supabase/Firebase:** Estruturação para persistência real de dados.
- **PWA (Progressive Web App):** Adição de service worker e manifesto para instalação no celular como aplicativo nativo.
