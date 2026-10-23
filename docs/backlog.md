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

---

## 3. Próximas Telas e Features Planejadas (Etapa 1 - Front-end)

1. **[FEAT-003] Tela de Repertório**
   - **ID CSS Alvo:** `#tela-repertorio`
   - **Elementos:** Filtros de categoria ([Todas], [Culto], [Tema], [Minhas listas]), campo de busca, lista de louvores com tags, tom, BPM e Floating Action Button (FAB) para cadastrar música.

2. **[FEAT-004] Tela Devocional e Mais**
   - **ID CSS Alvo:** `#tela-devocional`, `#tela-mais`
   - **Elementos:** Leitura devocional detalhada e menu expandido de módulos ministeriais.
