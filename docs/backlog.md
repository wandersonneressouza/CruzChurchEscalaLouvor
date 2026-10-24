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

### [FEAT-005] Estado Global (Context API + LocalStorage) e PWA Nativo
- **Status:** Concluída
- **Data:** 2026-10-23
- **Arquivos Criados/Alterados:**
  - `src/context/AppContext.jsx` (Centralizador de dados do usuário, escalas, repertório, devocional e trocas com persistência em localStorage)
  - `src/App.jsx` (Envolvimento das rotas no `<AppProvider>`)
  - `src/pages/Inicio/Inicio.jsx` (Card de confirmações dinâmico em tempo real, saudação e badge de pendências)
  - `src/pages/Agenda/Agenda.jsx` (Confirmação de presença reativa, solicitação de troca e cálculo de escalas pendentes)
  - `src/pages/Repertorio/Repertorio.jsx` (Adição e persistência de novas músicas via modal FAB, filtragem reativa e favoritos)
  - `src/pages/Devocional/Devocional.jsx` (Marcar lido sincronizado com progresso semanal e card da Home)
  - `src/pages/Mais/Mais.jsx` (Toggles de disponibilidade, notificações, tema escuro e resposta de pedidos de substituição)
  - `public/manifest.json` (Configuração PWA com tema `#1e5ec8`, display standalone e orientação)
  - `public/icon-192.svg` e `public/icon-512.svg` (Ícones vetoriais de alta resolução com gradiente e cruz central)
  - `public/sw.js` (Service Worker nativo para cache offline dos assets)
  - `index.html` (Metatags PWA para Safari/iOS e Android, link do manifesto e ícones)
  - `src/main.jsx` (Registro seguro do Service Worker em ambiente web)
- **Funcionalidades Validadas:**
  - Ao confirmar uma convocação na Agenda, o status passa para "✓ Confirmado" e a contagem de pendências no card da Home é reduzida instantaneamente.
  - Ao cadastrar uma nova música no Repertório, os dados persistem em LocalStorage e o louvor aparece imediatamente no topo da listagem.
  - Ao marcar leitura devocional como lida, o status sincroniza com o cronograma semanal e a Home.
  - Responder a pedidos de substituição no menu Mais atualiza o contador e remove o alerta de pendência.
  - O aplicativo agora pode ser instalado como PWA em smartphones Android e iOS (Adicionar à Tela de Início).
- **Validação de Build:** `npm run build` executado com sucesso (zero erros).
- **Validação de Navegador:** Testado via subagente com sucesso.

---

### [FEAT-006] Tela de Autenticação / Login (/login) e Proteção de Rotas por Perfil
- **Status:** Concluída
- **Data:** 2026-10-23
- **Arquivos Criados/Alterados:**
  - `src/pages/Login/Login.jsx` (Tela monobloco com formulário direto de e-mail e senha e modal de recuperação de senha)
  - `src/pages/Login/Login.css` (CSS puro 100% escopado sob `#tela-login`)
  - `src/context/AppContext.jsx` (Estado `estaAutenticado` e métodos `login` e `logout` integrados)
  - `src/pages/Mais/Mais.jsx` (Botão "Encerrar Sessão" conectado ao `logout()` e navegação para `/login`)
  - `src/App.jsx` (Rotas protegidas com `RotaPrivada` e `RotaPublica` via React Router Dom)
- **Identificador de Escopo CSS:** `#tela-login`
- **Funcionalidades da Tela de Login:**
  - Logotipo em relevo com a cruz da Cruz Church e tipografia de acolhimento.
  - Formulário limpo com e-mail ministerial, senha, botão de alternar visibilidade (olho), checkbox customizado para lembrar login.
  - Modal Bottom Sheet para recuperação de senha com simulação de envio de link.
- **Ajuste Global de Layout:** Remoção completa do componente visual simulado `div.status-bar` de todas as páginas (`Inicio`, `Agenda`, `Repertorio`, `Devocional`, `Mais` e `Login`) para uma experiência web mais limpa e fluida.
- **Validação de Build:** `npm run build` executado com sucesso (zero erros).

### [FEAT-007] Sistema de Cadastro e Gerenciamento de Integrantes por Igreja
- **Status:** Concluída
- **Data:** 2026-10-23
- **Arquivos Criados/Alterados:**
  - `src/constants/categoriasMusicais.js`: Base oficial unificada de categorias e funções musicais (`Vocal`, `Harmonia`, `Ritmo`, `Áudio & Som`, `Mídia & Transmissão`).
  - `src/pages/Cadastro/Cadastro.jsx` e `src/pages/Cadastro/Cadastro.css` (`#tela-cadastro`): Formulário de registro distinguindo Integrante Voluntário (pesquisa e vinculação à congregação) e Líder de Louvor (solicitação de homologação de igreja).
  - `src/pages/AguardandoAprovacao/AguardandoAprovacao.jsx` e `AguardandoAprovacao.css` (`#tela-aguardando`): Tela com tratamento dos 4 estados (`pendente`, `pendente_lider`, `recusado`, `revogado`), explicações claras e simulador de perfis para homologação rápida.
  - `src/pages/Login/Login.jsx` e `Login.css`: Botão e link "Cadastrar-se / Solicitar Acesso" encaminhando para `/cadastro`.
  - `src/App.jsx`: Guarda de rotas `RotaPrivada` verificando `statusAcesso === 'aprovado'`; rota `/aguardando-aprovacao` com `RotaAguardando`; rotas públicas em `/login` e `/cadastro`.
  - `src/context/AppContext.jsx`: Gerenciamento reativo de congregações (`igrejas`), membros da equipe (`equipeMembros`), solicitações de voluntários (`solicitacoesVoluntarios`), e métodos `cadastrarVoluntario`, `cadastrarSolicitacaoLider`, `aprovarVoluntario`, `recusarVoluntario`, `alterarCategoriaIntegrante`, `revogarAcessoIntegrante`, `atualizarMinhaFuncao` e `alternarPerfilVisual`.
  - `src/pages/Mais/Mais.jsx` e `Mais.css`: Gestão de integrantes pelo líder com abas "Membros Ativos" e "Solicitações Pendentes", botões para Aprovar/Recusar novos voluntários, Ajustar Categoria/Função Musical do membro, Revogar Acesso à congregação (sem apagar conta nem histórico) e modal de edição da própria função musical pelo voluntário.
  - `src/pages/Inicio/Inicio.jsx` e `Inicio.css`: Notificação destacada para o líder quando há novos voluntários aguardando homologação na equipe.
- **Validação de Build:** `npm run build` executado com código 0 (zero erros).

### [FEAT-008] Painel do Administrador Geral (ADMIN) — LouvorApp
- **Status:** Concluída
- **Data:** 2026-10-23
- **Arquivos Criados/Alterados:**
  - `src/pages/Admin/AdminDashboard.jsx` e `src/pages/Admin/AdminDashboard.css` (`#tela-admin-dashboard`): Painel completo do ADMIN em tema 100% claro, limpo e profissional, responsivo para desktop, tablet e mobile.
  - `src/App.jsx`: Rota `/admin` conectada ao `AdminDashboard`.
  - `src/context/AppContext.jsx`: Indicadores globais (`totalIgrejasAtivas`, `totalLideresAprovados`, `totalIntegrantesCadastrados`, `totalSolicitacoesLideresPendentes`), mock inicial de solicitações (`SOLICITACOES_LIDERES_INICIAIS`), e métodos de administração (`aprovarSolicitacaoLider`, `recusarSolicitacaoLider`, `criarIgreja`, `editarIgreja`, `alternarStatusIgreja`, `revogarLiderancaIgreja`).
  - `src/pages/Mais/Mais.jsx` e `src/pages/AguardandoAprovacao/AguardandoAprovacao.jsx`: Atalhos de acesso rápido ao Painel ADMIN e opção no simulador de papéis.
- **Funcionalidades do Painel ADMIN:**
  - **Identificação e Navegação:** Header com LouvorApp, tag ADMIN GERAL, menu em pills (`Dashboard & Homologações`, `Igrejas`, `Líderes Aprovados`, `Integrantes da Base`), atalho para o App Ministerial e perfil admin.
  - **Indicadores da Tela Inicial (4 Cards):** Total de Igrejas Ativas (100% operacionais), Total de Líderes Aprovados, Total de Integrantes na Base e Solicitações Pendentes (em destaque âmbar/laranja).
  - **Área Central em Destaque:** Lista/cards de Solicitações de Novos Líderes & Congregações com dados de contato, congregação pretendida e notas; botões para "Aprovar & Homologar" (com modal inteligente permitindo cadastrar como nova igreja ou vincular a congregação existente para evitar duplicidades) e "Recusar" (com justificativa).
  - **Gestão de Congregações:** Tabela limpa com busca instantânea, botão "+ Nova Congregação", edição de dados e toggle de ativação/suspensão.
  - **Gestão de Líderes:** Cards com congregações vinculadas e ação de revogação de liderança.
  - **Base de Integrantes:** Listagem de todos os músicos e voluntários cadastrados.
- **Validação de Build:** `npm run build` executado com código 0 (zero erros).

---

## 3. Próximas Etapas e Roadmap Planejado (Etapa 2)

1. **[FEAT-009] Integração com Supabase (Banco de Dados em Nuvem & Auth) — CONCLUÍDO:**
   - **Schema SQL e RLS:** 13 tabelas relacionais em [supabase/schema.sql](file:///c:/Users/Anderson%20Neres/WEB%20CRIADOS/CruzChurchEscalaLouvor/supabase/schema.sql) com RLS ativado em 100%, trigger `handle_new_user` e funções `is_admin()`, `get_minha_igreja_id()` e `is_lider_da_igreja()`.
   - **Remoção de Dados Fantasias:** Eliminados arrays estáticos em mock (`IGREJAS_INICIAIS`, `MUSICAS_INICIAIS`, `ESCALAS_INICIAIS`, `EQUIPE_INICIAL`, `SOLICITACOES_VOLUNTARIOS_INICIAIS`, `SOLICITACOES_LIDERES_INICIAIS`).
   - **Carregamento Real:** [AppContext.jsx](file:///c:/Users/Anderson%20Neres/WEB%20CRIADOS/CruzChurchEscalaLouvor/src/context/AppContext.jsx) agora consulta e persiste dados diretamente nas tabelas `igrejas`, `musicas`, `escalas`, `agenda_eventos`, `perfis`, `solicitacoes_voluntarios`, `solicitacoes_lideres` e `pedidos_troca` do Supabase.
   - **Autenticação Real:** Conexão direta com Supabase Auth (`signUp`, `signInWithPassword`, `signOut`, `onAuthStateChange`) em [Login.jsx](file:///c:/Users/Anderson%20Neres/WEB%20CRIADOS/CruzChurchEscalaLouvor/src/pages/Login/Login.jsx) e [Cadastro.jsx](file:///c:/Users/Anderson%20Neres/WEB%20CRIADOS/CruzChurchEscalaLouvor/src/pages/Cadastro/Cadastro.jsx).
   - **Proteção Estrita de Rota ADMIN (`RotaAdmin`):** [App.jsx](file:///c:/Users/Anderson%20Neres/WEB%20CRIADOS/CruzChurchEscalaLouvor/src/App.jsx) bloqueia acesso direto à rota `/admin`. Apenas usuários autenticados com `tipo_conta === 'admin'` ou `cargo === 'ADMIN'` podem acessar; não autenticados são enviados para o login e outros papéis para `/`.
   - **Atalho Discreto no Login:** [Login.jsx](file:///c:/Users/Anderson%20Neres/WEB%20CRIADOS/CruzChurchEscalaLouvor/src/pages/Login/Login.jsx) inclui botão sutil "Entrar como administrador" que preenche o e-mail do admin e foca o campo de senha.
   - **Validação de Build:** `npm run build` executado com código 0 (zero erros).




