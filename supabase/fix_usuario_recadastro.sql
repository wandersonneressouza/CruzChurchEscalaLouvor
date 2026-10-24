-- ==============================================================================
-- CORREÇÃO DEFINITIVA: EXCLUSÃO TOTAL & RECADASTRO DE USUÁRIOS
-- Execute este script no SQL Editor do Supabase (https://app.supabase.com)
-- ==============================================================================

-- 1. FUNÇÃO: EXCLUIR USUÁRIO COMPLETO (PUBLIC + AUTH.USERS)
-- Esta função apaga o usuário de auth.users liberando o e-mail para novo cadastro
CREATE OR REPLACE FUNCTION public.excluir_usuario_completo(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Remove dependências nas tabelas públicas
  DELETE FROM public.solicitacoes_lideres WHERE user_id = target_user_id;
  DELETE FROM public.solicitacoes_voluntarios WHERE user_id = target_user_id;
  DELETE FROM public.escala_integrantes WHERE user_id = target_user_id;
  DELETE FROM public.pedidos_troca WHERE solicitante_id = target_user_id OR substituto_id = target_user_id;
  DELETE FROM public.perfis WHERE id = target_user_id;

  -- Remove o usuário da autenticação do Supabase (auth.users)
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.excluir_usuario_completo(UUID) TO authenticated, anon, service_role;

-- 2. FUNÇÃO: RECRIAR / SINCRONIZAR PERFIL E SOLICITAÇÃO SE AUSENTE
-- Se o usuário recadastrou um e-mail pré-existente ou o trigger falhou, esta função recupera instantaneamente
CREATE OR REPLACE FUNCTION public.recriar_perfil_se_ausente(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user auth.users%ROWTYPE;
  v_perfil public.perfis%ROWTYPE;
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
  -- Busca dados em auth.users
  SELECT * INTO v_user FROM auth.users WHERE id = target_user_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- 0. Se o perfil já existe na tabela public.perfis, NUNCA sobrescreva seu status!
  SELECT * INTO v_perfil FROM public.perfis WHERE id = target_user_id;
  IF FOUND THEN
    RETURN to_jsonb(v_perfil);
  END IF;

  -- Extrai metadados cadastrados
  v_nome := COALESCE(v_user.raw_user_meta_data->>'nome', split_part(v_user.email, '@', 1));
  v_telefone := v_user.raw_user_meta_data->>'telefone';
  v_tipo_conta := COALESCE(v_user.raw_user_meta_data->>'tipoConta', 'voluntario');
  v_funcao := COALESCE(v_user.raw_user_meta_data->>'funcao', 'Voluntário');
  v_naipe := COALESCE(v_user.raw_user_meta_data->>'naipe', 'Vocal');
  v_igreja_id := (v_user.raw_user_meta_data->>'igrejaId')::BIGINT;
  v_nome_igreja := v_user.raw_user_meta_data->>'nomeIgreja';
  v_cidade_igreja := v_user.raw_user_meta_data->>'cidadeIgreja';

  IF v_tipo_conta = 'admin' OR v_user.email = 'djandersonneres@hotmail.com' THEN
    v_status_acesso := 'aprovado';
  ELSIF v_tipo_conta = 'lider' THEN
    -- Checa se já havia sido aprovado anteriormente pelo Admin
    IF EXISTS (SELECT 1 FROM public.solicitacoes_lideres WHERE (user_id = target_user_id OR email = v_user.email) AND status = 'aprovado') THEN
      v_status_acesso := 'aprovado';
    ELSE
      v_status_acesso := 'pendente_lider';
    END IF;
  ELSE
    IF EXISTS (SELECT 1 FROM public.solicitacoes_voluntarios WHERE (user_id = target_user_id OR email = v_user.email) AND status = 'aprovado') THEN
      v_status_acesso := 'aprovado';
    ELSE
      v_status_acesso := 'pendente';
    END IF;
  END IF;

  -- Insere na tabela public.perfis
  INSERT INTO public.perfis (
    id, nome, email, telefone, funcao, naipe, igreja_id, cargo, tipo_conta, status_acesso, avatar
  ) VALUES (
    v_user.id, v_nome, v_user.email, v_telefone, v_funcao, v_naipe, v_igreja_id,
    CASE WHEN v_tipo_conta = 'admin' OR v_user.email = 'djandersonneres@hotmail.com' THEN 'ADMIN' WHEN v_tipo_conta = 'lider' THEN 'Líder' ELSE 'Voluntário' END,
    CASE WHEN v_user.email = 'djandersonneres@hotmail.com' THEN 'admin' ELSE v_tipo_conta END,
    v_status_acesso,
    UPPER(SUBSTRING(v_nome FROM 1 FOR 2))
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING * INTO v_perfil;

  IF v_perfil IS NULL THEN
    SELECT * INTO v_perfil FROM public.perfis WHERE id = target_user_id;
  END IF;

  -- Se for líder, recria a solicitação na fila do Admin APENAS se não houver NENHUMA solicitação prévia (evita duplicatas!)
  IF v_tipo_conta = 'lider' AND v_nome_igreja IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.solicitacoes_lideres WHERE user_id = target_user_id OR email = v_user.email) THEN
      INSERT INTO public.solicitacoes_lideres (
        user_id, nome, email, telefone, nome_igreja, cidade_igreja, status
      ) VALUES (
        v_user.id, v_nome, v_user.email, v_telefone, v_nome_igreja, v_cidade_igreja, 'pendente'
      );
    END IF;
  END IF;

  -- Se for voluntário, recria a solicitação na fila da igreja APENAS se não houver solicitação prévia
  IF v_tipo_conta = 'voluntario' AND v_igreja_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.solicitacoes_voluntarios WHERE user_id = target_user_id OR email = v_user.email) THEN
      INSERT INTO public.solicitacoes_voluntarios (
        user_id, nome, email, telefone, igreja_id, funcao, naipe, status
      ) VALUES (
        v_user.id, v_nome, v_user.email, v_telefone, v_igreja_id, v_funcao, v_naipe, 'pendente'
      );
    END IF;
  END IF;

  RETURN to_jsonb(v_perfil);
END;
$$;

GRANT EXECUTE ON FUNCTION public.recriar_perfil_se_ausente(UUID) TO authenticated, anon, service_role;

-- 3. ATUALIZAÇÃO DO TRIGGER HANDLE_NEW_USER
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
  v_nome := COALESCE(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1));
  v_telefone := new.raw_user_meta_data->>'telefone';
  v_tipo_conta := COALESCE(new.raw_user_meta_data->>'tipoConta', 'voluntario');
  v_funcao := COALESCE(new.raw_user_meta_data->>'funcao', 'Voluntário');
  v_naipe := COALESCE(new.raw_user_meta_data->>'naipe', 'Vocal');
  v_igreja_id := (new.raw_user_meta_data->>'igrejaId')::BIGINT;
  v_nome_igreja := new.raw_user_meta_data->>'nomeIgreja';
  v_cidade_igreja := new.raw_user_meta_data->>'cidadeIgreja';

  IF v_tipo_conta = 'admin' THEN
    v_status_acesso := 'aprovado';
  ELSIF v_tipo_conta = 'lider' THEN
    v_status_acesso := 'pendente_lider';
  ELSE
    v_status_acesso := 'pendente';
  END IF;

  INSERT INTO public.perfis (
    id, nome, email, telefone, funcao, naipe, igreja_id, cargo, tipo_conta, status_acesso, avatar
  ) VALUES (
    new.id, v_nome, new.email, v_telefone, v_funcao, v_naipe, v_igreja_id,
    CASE WHEN v_tipo_conta = 'admin' THEN 'ADMIN' WHEN v_tipo_conta = 'lider' THEN 'Líder' ELSE 'Voluntário' END,
    v_tipo_conta, v_status_acesso, UPPER(SUBSTRING(v_nome FROM 1 FOR 2))
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

  IF v_tipo_conta = 'lider' AND v_nome_igreja IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.solicitacoes_lideres WHERE user_id = new.id AND status IN ('pendente', 'aprovada')) THEN
      INSERT INTO public.solicitacoes_lideres (
        user_id, nome, email, telefone, nome_igreja, cidade_igreja, status
      ) VALUES (
        new.id, v_nome, new.email, v_telefone, v_nome_igreja, v_cidade_igreja, 'pendente'
      );
    END IF;
  END IF;

  IF v_tipo_conta = 'voluntario' AND v_igreja_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.solicitacoes_voluntarios WHERE user_id = new.id AND status IN ('pendente', 'aprovada')) THEN
      INSERT INTO public.solicitacoes_voluntarios (
        user_id, nome, email, telefone, igreja_id, funcao, naipe, status
      ) VALUES (
        new.id, v_nome, new.email, v_telefone, v_igreja_id, v_funcao, v_naipe, 'pendente'
      );
    END IF;
  END IF;

  RETURN new;
END;
$$;

-- O trigger dispara somente em novos cadastros (INSERT), evitando resetar status aprovado ao logar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. POLÍTICAS RLS: PERMISSÃO DE INSERÇÃO E ATUALIZAÇÃO
DROP POLICY IF EXISTS "Perfis inseríveis por usuários" ON public.perfis;
CREATE POLICY "Perfis inseríveis por usuários"
  ON public.perfis FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Solicitações de líderes inseríveis" ON public.solicitacoes_lideres;
CREATE POLICY "Solicitações de líderes inseríveis"
  ON public.solicitacoes_lideres FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Solicitações de voluntários inseríveis" ON public.solicitacoes_voluntarios;
CREATE POLICY "Solicitações de voluntários inseríveis"
  ON public.solicitacoes_voluntarios FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- 5. POLÍTICA DE ATUALIZAÇÃO DE PERFIS (PERMITINDO ADMIN E PRÓPRIO USUÁRIO)
DROP POLICY IF EXISTS "Perfis atualizáveis pelos proprietários, líderes ou admin" ON public.perfis;
CREATE POLICY "Perfis atualizáveis pelos proprietários, líderes ou admin"
  ON public.perfis FOR UPDATE
  TO authenticated, anon
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

-- 6. FUNÇÃO RPC: APROVAR SOLICITAÇÃO DE LÍDER (ADMIN)
-- Executa com privilégios de SECURITY DEFINER para garantir aprovação atômica e criação da igreja
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
  -- 1. Localiza a solicitação
  SELECT * INTO v_solicitacao FROM public.solicitacoes_lideres WHERE id = p_solicitacao_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitação de líder não encontrada com ID %', p_solicitacao_id;
  END IF;

  v_user_id := v_solicitacao.user_id;

  -- Se v_user_id for nulo, tenta localizar pelo e-mail
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_solicitacao.email;
    IF v_user_id IS NULL THEN
      SELECT id INTO v_user_id FROM public.perfis WHERE email = v_solicitacao.email;
    END IF;
  END IF;

  -- 2. Define a igreja: vincula a congregação existente ou cria nova congregação
  IF p_vincular_existente AND p_igreja_existente_id IS NOT NULL THEN
    v_igreja_id := p_igreja_existente_id;
    UPDATE public.igrejas
    SET lider = v_solicitacao.nome, ativa = true, updated_at = timezone('utc'::text, now())
    WHERE id = v_igreja_id;
  ELSE
    -- Cria nova igreja com o nome solicitado
    INSERT INTO public.igrejas (nome, cidade, lider, ativa)
    VALUES (
      COALESCE(v_solicitacao.nome_igreja, 'Nova Congregação'),
      COALESCE(v_solicitacao.cidade_igreja, 'Brasil'),
      v_solicitacao.nome,
      true
    )
    RETURNING id INTO v_igreja_id;
  END IF;

  -- 3. Atualiza o status da solicitação para aprovado
  UPDATE public.solicitacoes_lideres
  SET status = 'aprovado', updated_at = timezone('utc'::text, now())
  WHERE id = p_solicitacao_id;

  -- 4. Atualiza o perfil do usuário para aprovado como Líder
  IF v_user_id IS NOT NULL THEN
    UPDATE public.perfis
    SET
      status_acesso = 'aprovado',
      tipo_conta = 'lider',
      cargo = 'Líder',
      igreja_id = v_igreja_id,
      updated_at = timezone('utc'::text, now())
    WHERE id = v_user_id;

    -- Se não existia na tabela perfis, insere-o
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
    -- Se por alguma razão o user_id for desconhecido, atualiza pelo e-mail
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
