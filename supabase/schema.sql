-- ==============================================================================
-- SISTEMA DE GESTÃO DO MINISTÉRIO DE LOUVOR (LouvorApp / Cruz Church)
-- BANCO DE DADOS COMPLETO E SEGURO NO SUPABASE (PostgreSQL + RLS)
-- ==============================================================================
-- Instruções de Execução:
-- 1. Acesse o painel do Supabase (https://app.supabase.com)
-- 2. Selecione o seu projeto e vá em "SQL Editor" (ícone de terminal)
-- 3. Cole todo o conteúdo deste arquivo e clique em "RUN"
-- ==============================================================================

-- 0. Extensões essenciais
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABELA: IGREJAS (Congregações / Campus)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.igrejas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL,
  lider TEXT DEFAULT 'Sem Líder Atribuído',
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. TABELA: PERFIS (Vinculada ao auth.users do Supabase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  funcao TEXT DEFAULT 'Voluntário',
  naipe TEXT DEFAULT 'Vocal',
  igreja_id BIGINT REFERENCES public.igrejas(id) ON DELETE SET NULL,
  cargo TEXT DEFAULT 'Voluntário',
  tipo_conta TEXT NOT NULL DEFAULT 'voluntario' CHECK (tipo_conta IN ('lider', 'voluntario', 'admin')),
  status_acesso TEXT NOT NULL DEFAULT 'pendente' CHECK (status_acesso IN ('aprovado', 'pendente', 'pendente_lider', 'recusado', 'revogado')),
  avatar TEXT,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  notificacoes BOOLEAN NOT NULL DEFAULT true,
  tema_escuro BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. TABELA: SOLICITACOES_LIDERES (Homologação pelo Administrador Geral)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.solicitacoes_lideres (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  nome_igreja TEXT NOT NULL,
  cidade_igreja TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado')),
  observacao TEXT,
  motivo_recusa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. TABELA: SOLICITACOES_VOLUNTARIOS (Aprovação pelo Líder da Igreja)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.solicitacoes_voluntarios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  igreja_id BIGINT NOT NULL REFERENCES public.igrejas(id) ON DELETE CASCADE,
  funcao TEXT NOT NULL DEFAULT 'Vocal',
  naipe TEXT NOT NULL DEFAULT 'Vocal',
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado', 'revogado')),
  motivo_recusa TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. TABELA: MUSICAS (Repertório e Biblioteca Musical)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.musicas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  igreja_id BIGINT REFERENCES public.igrejas(id) ON DELETE CASCADE, -- NULL se for repertório geral/compartilhado
  titulo TEXT NOT NULL,
  artista TEXT NOT NULL,
  tom TEXT,
  tom_original TEXT,
  bpm TEXT,
  tag TEXT DEFAULT 'Culto de Celebração',
  tipo TEXT DEFAULT 'Culto',
  capa_texto TEXT,
  cifra_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  letra TEXT,
  favorita BOOLEAN NOT NULL DEFAULT false,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. TABELA: AGENDA_EVENTOS (Cultos, Ensaios, Imersões e Reuniões)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.agenda_eventos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  igreja_id BIGINT NOT NULL REFERENCES public.igrejas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'Culto' CHECK (tipo IN ('Culto', 'Ensaio', 'Conferência', 'Imersão', 'Outro')),
  data DATE NOT NULL,
  hora TIME NOT NULL,
  data_formatada TEXT, -- Ex: '26 de Outubro de 2026'
  data_curta TEXT,      -- Ex: '26/10'
  local TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. TABELA: ESCALAS (Compromissos Ministeriais)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.escalas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  igreja_id BIGINT NOT NULL REFERENCES public.igrejas(id) ON DELETE CASCADE,
  evento_id BIGINT REFERENCES public.agenda_eventos(id) ON DELETE SET NULL,
  evento_nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'Culto',
  data DATE NOT NULL,
  data_formatada TEXT,
  data_curta TEXT,
  hora TEXT NOT NULL,
  local TEXT NOT NULL,
  observacoes TEXT,
  status_geral TEXT NOT NULL DEFAULT 'publicada' CHECK (status_geral IN ('rascunho', 'publicada', 'concluida', 'cancelada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. TABELA: ESCALA_INTEGRANTES (Membros Escalados em cada Serviço)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.escala_integrantes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  escala_id BIGINT NOT NULL REFERENCES public.escalas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  funcao TEXT NOT NULL,
  naipe TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('confirmado', 'pendente', 'recusado', 'substituicao')),
  motivo_recusa TEXT,
  confirmado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(escala_id, user_id, funcao)
);

-- ==============================================================================
-- 9. TABELA: ESCALA_REPERTORIO (Setlist / Ordem das Músicas no Culto)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.escala_repertorio (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  escala_id BIGINT NOT NULL REFERENCES public.escalas(id) ON DELETE CASCADE,
  musica_id BIGINT NOT NULL REFERENCES public.musicas(id) ON DELETE CASCADE,
  ordem INT NOT NULL DEFAULT 1,
  tom_escolhido TEXT,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 10. TABELA: PEDIDOS_TROCA (Solicitação de Substituição entre Ministros)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pedidos_troca (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  escala_id BIGINT REFERENCES public.escalas(id) ON DELETE CASCADE,
  solicitante_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  substituto_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
  instrumento TEXT NOT NULL,
  data_culto TEXT NOT NULL,
  hora_culto TEXT NOT NULL,
  motivo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceito', 'recusado', 'cancelado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 11. TABELA: DEVOCIONAIS (Edificação e Crescimento Espiritual da Equipe)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.devocionais (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  igreja_id BIGINT REFERENCES public.igrejas(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  versiculo_referencia TEXT NOT NULL,
  versiculo_texto TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  autor TEXT NOT NULL DEFAULT 'Ministério Pastoral',
  data_publicacao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 12. TABELA: DEVOCIONAL_LEITURAS (Progresso de Leitura dos Integrantes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.devocional_leituras (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  devocional_id BIGINT NOT NULL REFERENCES public.devocionais(id) ON DELETE CASCADE,
  favorito BOOLEAN NOT NULL DEFAULT false,
  lido_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, devocional_id)
);

-- ==============================================================================
-- 13. TABELA: COMUNICADOS (Mural de Avisos da Liderança)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.comunicados (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  igreja_id BIGINT NOT NULL REFERENCES public.igrejas(id) ON DELETE CASCADE,
  autor_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  prioridade TEXT NOT NULL DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'urgente')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ÍNDICES PARA ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_perfis_igreja_id ON public.perfis(igreja_id);
CREATE INDEX IF NOT EXISTS idx_perfis_tipo_conta ON public.perfis(tipo_conta);
CREATE INDEX IF NOT EXISTS idx_perfis_status_acesso ON public.perfis(status_acesso);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_voluntarios_igreja ON public.solicitacoes_voluntarios(igreja_id, status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_lideres_status ON public.solicitacoes_lideres(status);
CREATE INDEX IF NOT EXISTS idx_musicas_igreja ON public.musicas(igreja_id);
CREATE INDEX IF NOT EXISTS idx_agenda_eventos_igreja_data ON public.agenda_eventos(igreja_id, data);
CREATE INDEX IF NOT EXISTS idx_escalas_igreja_data ON public.escalas(igreja_id, data);
CREATE INDEX IF NOT EXISTS idx_escala_integrantes_escala ON public.escala_integrantes(escala_id);
CREATE INDEX IF NOT EXISTS idx_escala_integrantes_user ON public.escala_integrantes(user_id);
CREATE INDEX IF NOT EXISTS idx_escala_repertorio_escala ON public.escala_repertorio(escala_id);

-- ==============================================================================
-- FUNÇÕES DE SEGURANÇA E HELPERS PARA RLS
-- ==============================================================================

-- 1. Verifica se o usuário atual é Administrador Geral
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = auth.uid()
      AND tipo_conta = 'admin'
      AND status_acesso = 'aprovado'
  );
$$;

-- 2. Obtém o igreja_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_minha_igreja_id()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT igreja_id FROM public.perfis
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- 3. Verifica se o usuário logado é Líder da congregação especificada (ou Administrador Geral)
CREATE OR REPLACE FUNCTION public.is_lider_da_igreja(check_igreja_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid()
        AND igreja_id = check_igreja_id
        AND tipo_conta = 'lider'
        AND status_acesso = 'aprovado'
    )
  );
$$;

-- 4. Função RPC: Aprovação de solicitação de liderança com Security Definer
CREATE OR REPLACE FUNCTION public.aprovar_solicitacao_lider_admin(
  p_solicitacao_id BIGINT,
  p_vincular_existente BOOLEAN DEFAULT false,
  p_igreja_existente_id BIGINT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_solicitacao public.solicitacoes_lideres%ROWTYPE;
  v_igreja_id BIGINT;
  v_user_id UUID;
BEGIN
  SELECT * INTO v_solicitacao FROM public.solicitacoes_lideres WHERE id = p_solicitacao_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitação de líder não encontrada com ID %', p_solicitacao_id;
  END IF;

  v_user_id := v_solicitacao.user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_solicitacao.email;
    IF v_user_id IS NULL THEN
      SELECT id INTO v_user_id FROM public.perfis WHERE email = v_solicitacao.email;
    END IF;
  END IF;

  IF p_vincular_existente AND p_igreja_existente_id IS NOT NULL THEN
    v_igreja_id := p_igreja_existente_id;
    UPDATE public.igrejas
    SET lider = v_solicitacao.nome, ativa = true, updated_at = timezone('utc'::text, now())
    WHERE id = v_igreja_id;
  ELSE
    INSERT INTO public.igrejas (nome, cidade, lider, ativa)
    VALUES (
      COALESCE(v_solicitacao.nome_igreja, 'Nova Congregação'),
      COALESCE(v_solicitacao.cidade_igreja, 'Brasil'),
      v_solicitacao.nome,
      true
    )
    RETURNING id INTO v_igreja_id;
  END IF;

  UPDATE public.solicitacoes_lideres
  SET status = 'aprovado', updated_at = timezone('utc'::text, now())
  WHERE id = p_solicitacao_id;

  IF v_user_id IS NOT NULL THEN
    UPDATE public.perfis
    SET
      status_acesso = 'aprovado',
      tipo_conta = 'lider',
      cargo = 'Líder',
      igreja_id = v_igreja_id,
      updated_at = timezone('utc'::text, now())
    WHERE id = v_user_id;

    IF NOT FOUND THEN
      INSERT INTO public.perfis (
        id, nome, email, telefone, funcao, naipe, igreja_id, cargo, tipo_conta, status_acesso, avatar
      ) VALUES (
        v_user_id,
        v_solicitacao.nome,
        v_solicitacao.email,
        v_solicitacao.telefone,
        'Líder de Louvor',
        'Vocal',
        v_igreja_id,
        'Líder',
        'lider',
        'aprovado',
        UPPER(SUBSTRING(v_solicitacao.nome FROM 1 FOR 2))
      );
    END IF;
  ELSE
    UPDATE public.perfis
    SET
      status_acesso = 'aprovado',
      tipo_conta = 'lider',
      cargo = 'Líder',
      igreja_id = v_igreja_id,
      updated_at = timezone('utc'::text, now())
    WHERE email = v_solicitacao.email;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'solicitacao_id', p_solicitacao_id,
    'user_id', v_user_id,
    'igreja_id', v_igreja_id,
    'status', 'aprovado'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.aprovar_solicitacao_lider_admin(BIGINT, BOOLEAN, BIGINT) TO authenticated, anon, service_role;


-- ==============================================================================
-- TRIGGER: SINCRONIZAÇÃO AUTOMÁTICA DE NOVOS USUÁRIOS (AUTH -> PERFIS)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_nome TEXT;
  v_telefone TEXT;
  v_tipo_conta TEXT;
  v_status_acesso TEXT;
  v_funcao TEXT;
  v_naipe TEXT;
  v_igreja_id BIGINT;
  v_nome_igreja TEXT;
  v_cidade_igreja TEXT;
BEGIN
  -- Extrai metadados enviados no cadastro pelo Supabase Auth
  v_nome := COALESCE(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1));
  v_telefone := new.raw_user_meta_data->>'telefone';
  v_tipo_conta := COALESCE(new.raw_user_meta_data->>'tipoConta', 'voluntario');
  v_funcao := COALESCE(new.raw_user_meta_data->>'funcao', 'Voluntário');
  v_naipe := COALESCE(new.raw_user_meta_data->>'naipe', 'Vocal');
  v_igreja_id := (new.raw_user_meta_data->>'igrejaId')::BIGINT;
  v_nome_igreja := new.raw_user_meta_data->>'nomeIgreja';
  v_cidade_igreja := new.raw_user_meta_data->>'cidadeIgreja';

  -- Define o status inicial conforme o tipo de cadastro
  IF v_tipo_conta = 'admin' THEN
    v_status_acesso := 'aprovado';
  ELSIF v_tipo_conta = 'lider' THEN
    v_status_acesso := 'pendente_lider';
  ELSE
    v_status_acesso := 'pendente';
  END IF;

  -- 1. Insere o registro na tabela de perfis
  INSERT INTO public.perfis (
    id,
    nome,
    email,
    telefone,
    funcao,
    naipe,
    igreja_id,
    cargo,
    tipo_conta,
    status_acesso,
    avatar
  ) VALUES (
    new.id,
    v_nome,
    new.email,
    v_telefone,
    v_funcao,
    v_naipe,
    v_igreja_id,
    CASE WHEN v_tipo_conta = 'admin' THEN 'ADMIN' WHEN v_tipo_conta = 'lider' THEN 'Líder' ELSE 'Voluntário' END,
    v_tipo_conta,
    v_status_acesso,
    UPPER(SUBSTRING(v_nome FROM 1 FOR 2))
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = COALESCE(NULLIF(EXCLUDED.nome, ''), perfis.nome),
    email = COALESCE(NULLIF(EXCLUDED.email, ''), perfis.email),
    telefone = COALESCE(NULLIF(EXCLUDED.telefone, ''), perfis.telefone),
    funcao = COALESCE(NULLIF(EXCLUDED.funcao, ''), perfis.funcao),
    naipe = COALESCE(NULLIF(EXCLUDED.naipe, ''), perfis.naipe),
    status_acesso = CASE WHEN perfis.status_acesso = 'aprovado' THEN 'aprovado' ELSE EXCLUDED.status_acesso END,
    igreja_id = COALESCE(perfis.igreja_id, EXCLUDED.igreja_id),
    updated_at = timezone('utc'::text, now());

  -- 2. Se for líder solicitante, insere automaticamente na fila de solicitações de líderes
  IF v_tipo_conta = 'lider' AND v_nome_igreja IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.solicitacoes_lideres WHERE user_id = new.id AND status IN ('pendente', 'aprovada')) THEN
      INSERT INTO public.solicitacoes_lideres (
        user_id,
        nome,
        email,
        telefone,
        nome_igreja,
        cidade_igreja,
        status
      ) VALUES (
        new.id,
        v_nome,
        new.email,
        v_telefone,
        v_nome_igreja,
        v_cidade_igreja,
        'pendente'
      );
    END IF;
  END IF;

  -- 3. Se for voluntário, insere automaticamente na fila de aprovação da congregação
  IF v_tipo_conta = 'voluntario' AND v_igreja_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.solicitacoes_voluntarios WHERE user_id = new.id AND status IN ('pendente', 'aprovada')) THEN
      INSERT INTO public.solicitacoes_voluntarios (
        user_id,
        nome,
        email,
        telefone,
        igreja_id,
        funcao,
        naipe,
        status
      ) VALUES (
        new.id,
        v_nome,
        new.email,
        v_telefone,
        v_igreja_id,
        v_funcao,
        v_naipe,
        'pendente'
      );
    END IF;
  END IF;

  RETURN new;
END;
$$;

-- Ativa o trigger após inserção de novos usuários em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- HABILITAÇÃO DO ROW LEVEL SECURITY (RLS) EM 100% DAS TABELAS
-- ==============================================================================
ALTER TABLE public.igrejas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_lideres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala_integrantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala_repertorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos_troca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devocionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devocional_leituras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicados ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS POLICIES)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- IGREJAS
-- ------------------------------------------------------------------------------
-- Todos os autenticados podem ver as igrejas ativas (necessário para o cadastro e seleção)
CREATE POLICY "Igrejas visíveis por usuários autenticados"
  ON public.igrejas FOR SELECT
  TO authenticated, anon
  USING (ativa = true OR public.is_admin());

-- Somente o Administrador Geral pode inserir, editar ou desativar congregações
CREATE POLICY "Igrejas gerenciadas apenas pelo Admin"
  ON public.igrejas FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- PERFIS
-- ------------------------------------------------------------------------------
-- Leitura: O usuário pode ver seu próprio perfil, membros da mesma igreja ou Admin vê todos
CREATE POLICY "Perfis visíveis por membros da congregação e admin"
  ON public.perfis FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.is_admin()
    OR (
      status_acesso = 'aprovado'
      AND igreja_id IS NOT NULL
      AND igreja_id = public.get_minha_igreja_id()
    )
  );

-- Atualização: Usuário atualiza seus dados pessoais; Líder atualiza membros da sua igreja; Admin atualiza qualquer
CREATE POLICY "Perfis atualizáveis pelos proprietários, líderes ou admin"
  ON public.perfis FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR public.is_lider_da_igreja(igreja_id)
    OR public.is_admin()
  )
  WITH CHECK (
    id = auth.uid()
    OR public.is_lider_da_igreja(igreja_id)
    OR public.is_admin()
  );

-- Exclusão: Administrador Geral pode excluir perfis permanentemente
CREATE POLICY "Perfis deletáveis por admin"
  ON public.perfis FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- SOLICITACOES_LIDERES
-- ------------------------------------------------------------------------------
CREATE POLICY "Solicitações de líderes visíveis pelo próprio solicitante ou admin"
  ON public.solicitacoes_lideres FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Usuário pode criar sua solicitação de liderança"
  ON public.solicitacoes_lideres FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Apenas admin pode aprovar ou recusar solicitações de líderes"
  ON public.solicitacoes_lideres FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- SOLICITACOES_VOLUNTARIOS
-- ------------------------------------------------------------------------------
CREATE POLICY "Solicitações de voluntários visíveis pelo solicitante, líder ou admin"
  ON public.solicitacoes_voluntarios FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_lider_da_igreja(igreja_id)
  );

CREATE POLICY "Usuário pode enviar solicitação para ser voluntário"
  ON public.solicitacoes_voluntarios FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Líder da igreja ou admin pode gerenciar solicitação de voluntário"
  ON public.solicitacoes_voluntarios FOR UPDATE
  TO authenticated
  USING (public.is_lider_da_igreja(igreja_id))
  WITH CHECK (public.is_lider_da_igreja(igreja_id));

-- ------------------------------------------------------------------------------
-- MUSICAS
-- ------------------------------------------------------------------------------
CREATE POLICY "Músicas visíveis por membros aprovados ou repertório geral"
  ON public.musicas FOR SELECT
  TO authenticated
  USING (
    igreja_id IS NULL
    OR igreja_id = public.get_minha_igreja_id()
    OR public.is_admin()
  );

CREATE POLICY "Líderes e admin podem cadastrar músicas"
  ON public.musicas FOR INSERT
  TO authenticated
  WITH CHECK (public.is_lider_da_igreja(igreja_id));

CREATE POLICY "Líderes e admin podem atualizar músicas"
  ON public.musicas FOR UPDATE
  TO authenticated
  USING (public.is_lider_da_igreja(igreja_id))
  WITH CHECK (public.is_lider_da_igreja(igreja_id));

CREATE POLICY "Líderes e admin podem excluir músicas"
  ON public.musicas FOR DELETE
  TO authenticated
  USING (public.is_lider_da_igreja(igreja_id));

-- ------------------------------------------------------------------------------
-- AGENDA_EVENTOS & ESCALAS
-- ------------------------------------------------------------------------------
CREATE POLICY "Agenda visível por integrantes aprovados da igreja"
  ON public.agenda_eventos FOR SELECT
  TO authenticated
  USING (igreja_id = public.get_minha_igreja_id() OR public.is_admin());

CREATE POLICY "Líderes e admin gerenciam agenda"
  ON public.agenda_eventos FOR ALL
  TO authenticated
  USING (public.is_lider_da_igreja(igreja_id))
  WITH CHECK (public.is_lider_da_igreja(igreja_id));

CREATE POLICY "Escalas visíveis por integrantes da congregação"
  ON public.escalas FOR SELECT
  TO authenticated
  USING (igreja_id = public.get_minha_igreja_id() OR public.is_admin());

CREATE POLICY "Líderes e admin gerenciam escalas"
  ON public.escalas FOR ALL
  TO authenticated
  USING (public.is_lider_da_igreja(igreja_id))
  WITH CHECK (public.is_lider_da_igreja(igreja_id));

-- ------------------------------------------------------------------------------
-- ESCALA_INTEGRANTES
-- ------------------------------------------------------------------------------
CREATE POLICY "Escalação visível por membros da congregação"
  ON public.escala_integrantes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.escalas e
      WHERE e.id = escala_id
        AND (e.igreja_id = public.get_minha_igreja_id() OR public.is_admin())
    )
  );

CREATE POLICY "Líder pode inserir e remover integrantes da escala"
  ON public.escala_integrantes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.escalas e
      WHERE e.id = escala_id
        AND public.is_lider_da_igreja(e.igreja_id)
    )
  );

CREATE POLICY "Líder pode excluir integrantes da escala"
  ON public.escala_integrantes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.escalas e
      WHERE e.id = escala_id
        AND public.is_lider_da_igreja(e.igreja_id)
    )
  );

-- O próprio integrante pode atualizar seu status de confirmação/recusa/substituição
CREATE POLICY "Integrante atualiza sua própria confirmação de presença"
  ON public.escala_integrantes FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.escalas e
      WHERE e.id = escala_id
        AND public.is_lider_da_igreja(e.igreja_id)
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.escalas e
      WHERE e.id = escala_id
        AND public.is_lider_da_igreja(e.igreja_id)
    )
  );

-- ------------------------------------------------------------------------------
-- ESCALA_REPERTORIO
-- ------------------------------------------------------------------------------
CREATE POLICY "Setlist de culto visível por membros da congregação"
  ON public.escala_repertorio FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.escalas e
      WHERE e.id = escala_id
        AND (e.igreja_id = public.get_minha_igreja_id() OR public.is_admin())
    )
  );

CREATE POLICY "Líder gerencia setlist da escala"
  ON public.escala_repertorio FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.escalas e
      WHERE e.id = escala_id
        AND public.is_lider_da_igreja(e.igreja_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.escalas e
      WHERE e.id = escala_id
        AND public.is_lider_da_igreja(e.igreja_id)
    )
  );

-- ------------------------------------------------------------------------------
-- PEDIDOS_TROCA
-- ------------------------------------------------------------------------------
CREATE POLICY "Trocas visíveis pelos participantes e pelo líder"
  ON public.pedidos_troca FOR SELECT
  TO authenticated
  USING (
    solicitante_id = auth.uid()
    OR substituto_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "Integrante cria pedido de troca"
  ON public.pedidos_troca FOR INSERT
  TO authenticated
  WITH CHECK (solicitante_id = auth.uid());

CREATE POLICY "Participantes atualizam pedido de troca"
  ON public.pedidos_troca FOR UPDATE
  TO authenticated
  USING (solicitante_id = auth.uid() OR substituto_id = auth.uid() OR public.is_admin())
  WITH CHECK (solicitante_id = auth.uid() OR substituto_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- DEVOCIONAIS & LEITURAS
-- ------------------------------------------------------------------------------
CREATE POLICY "Devocionais visíveis por todos os membros autenticados"
  ON public.devocionais FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Líderes e admin gerenciam devocionais"
  ON public.devocionais FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_lider_da_igreja(igreja_id))
  WITH CHECK (public.is_admin() OR public.is_lider_da_igreja(igreja_id));

CREATE POLICY "Usuário gerencia suas próprias leituras devocionais"
  ON public.devocional_leituras FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- COMUNICADOS
-- ------------------------------------------------------------------------------
CREATE POLICY "Comunicados visíveis por membros da congregação"
  ON public.comunicados FOR SELECT
  TO authenticated
  USING (igreja_id = public.get_minha_igreja_id() OR public.is_admin());

CREATE POLICY "Líderes e admin publicam comunicados"
  ON public.comunicados FOR ALL
  TO authenticated
  USING (public.is_lider_da_igreja(igreja_id))
  WITH CHECK (public.is_lider_da_igreja(igreja_id));

-- ==============================================================================
-- DADOS INICIAIS (SEED) PARA CRIAÇÃO IMEDIATA DO AMBIENTE
-- ==============================================================================

-- 1. Congregações Iniciais
INSERT INTO public.igrejas (id, nome, cidade, lider, ativa)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Cruz Church — Campus Central', 'São Carlos - SP', 'Anderson Neres', true),
  (2, 'Cruz Church — Campus Zona Sul', 'Ribeirão Preto - SP', 'Pr. Marcos Cruz', true),
  (3, 'Cruz Church — Campus Leste', 'Araraquara - SP', 'Pr. Davi Silva', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Músicas Iniciais do Repertório
INSERT INTO public.musicas (id, igreja_id, titulo, artista, tom, bpm, tag, tipo, capa_texto, favorita)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 1, 'Vitorioso És', 'Gabriel Guedes', 'G', '72', 'Culto de Celebração', 'Culto', 'VITORIOSO', true),
  (2, 1, 'A Bênção', 'Gabriel Guedes & Nívea Soares', 'Bb', '70', 'Culto da Família', 'Culto', 'A BÊNÇÃO', false),
  (3, 1, 'Ruja o Leão', 'Talita Catanzaro', 'E', '130', 'Jovens • Celebração', 'Tema', 'RUJA O LEÃO', true),
  (4, 1, 'Lindo És + Só Quero Ver Você', 'Livres para Adorar', 'D', '68', 'Ceia do Senhor', 'Tema', 'LINDO ÉS', false),
  (5, 1, 'Graça', 'Laura Souguellis', 'A', '74', 'Culto de Oração', 'Culto', 'GRAÇA', false),
  (6, 1, 'Yeshua (Ao Único)', 'Fernandinho', 'Em', '128', 'Culto de Celebração', 'Culto', 'YESHUA', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Devocional Inicial
INSERT INTO public.devocionais (id, igreja_id, titulo, versiculo_referencia, versiculo_texto, conteudo, autor)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 1, 'Adoração com Propósito e Santidade', 'Salmos 100:2', 'Servi ao Senhor com alegria e apresentai-vos a ele com cânticos.', 'A adoração verdadeira nasce de um coração rendido. Quando ministramos diante da igreja, nosso chamado prioritário não é a técnica ou o aplauso, mas a entrega sincera e a comunhão fraterna com toda a equipe.', 'Anderson Neres')
ON CONFLICT (id) DO NOTHING;

-- 4. Agenda e Escalas Iniciais
INSERT INTO public.agenda_eventos (id, igreja_id, titulo, tipo, data, hora, data_formatada, data_curta, local, descricao)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 1, 'Culto de Celebração', 'Culto', '2026-10-26', '19:00:00', '26 de Outubro de 2026', '26/10', 'Cruz Church - Central', 'Culto dominical com louvor e palavra de fé.'),
  (2, 1, 'Ensaio Geral da Banda', 'Ensaio', '2026-10-28', '19:30:00', '28 de Outubro de 2026', '28/10', 'Sala de Música • Subsolo', 'Alinhamento dos novos arranjos e dinâmicas vocais.'),
  (3, 1, 'Culto da Família', 'Culto', '2026-11-01', '18:00:00', '01 de Novembro de 2026', '01/11', 'Cruz Church - Central', 'Culto especial da família com ministração temática.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.escalas (id, igreja_id, evento_id, evento_nome, tipo, data, data_formatada, data_curta, hora, local)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 1, 1, 'Culto de Celebração', 'Culto', '2026-10-26', '26 de Outubro de 2026', '26/10', '19:00', 'Cruz Church - Central'),
  (2, 1, 2, 'Ensaio Geral da Banda', 'Ensaio', '2026-10-28', '28 de Outubro de 2026', '28/10', '19:30', 'Sala de Música • Subsolo'),
  (3, 1, 3, 'Culto da Família', 'Culto', '2026-11-01', '01 de Novembro de 2026', '01/11', '18:00', 'Cruz Church - Central')
ON CONFLICT (id) DO NOTHING;
