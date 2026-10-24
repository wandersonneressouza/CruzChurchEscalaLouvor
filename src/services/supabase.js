import { createClient } from '@supabase/supabase-js'

// Carrega as credenciais a partir do arquivo .env via Vite (import.meta.env)
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  ''

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  ''

// Verifica se o Supabase está configurado com credenciais válidas
export const supabaseConfigurado = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('sua-url-aqui') &&
  !supabaseAnonKey.includes('sua-anon-key-aqui')
)

// Cria a instância do cliente Supabase caso configurado
export const supabase = supabaseConfigurado
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

// ==============================================================================
// 1. AUTENTICAÇÃO
// ==============================================================================

/**
 * Realiza login utilizando Supabase Auth (e-mail e senha)
 */
export async function loginComSupabase(email, senha) {
  if (!supabaseConfigurado || !supabase) {
    throw new Error('Supabase não configurado no .env')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  })

  if (error) {
    if (error.message?.toLowerCase().includes('email not confirmed')) {
      throw new Error(
        'Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada e a pasta de spam (ou entre em contato com o administrador).'
      )
    }
    if (error.message?.includes('Invalid login credentials')) {
      throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.')
    }
    throw error
  }

  // Busca o perfil correspondente na tabela public.perfis (por ID ou por e-mail)
  let { data: perfil } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!perfil && data.user.email) {
    const { data: pEmail } = await supabase
      .from('perfis')
      .select('*')
      .eq('email', data.user.email)
      .maybeSingle()
    if (pEmail) perfil = pEmail
  }

  // Se o perfil realmente não foi encontrado, executa sincronização segura
  if (!perfil) {
    try {
      perfil = await sincronizarPerfilSeAusente(data.user)
    } catch (eSync) {
      console.warn('Aviso na sincronização de perfil ausente:', eSync)
    }
  }

  return {
    user: data.user,
    session: data.session,
    perfil: perfil || {
      id: data.user.id,
      email: data.user.email,
      nome: data.user.user_metadata?.nome || splitEmail(data.user.email),
      tipoConta: data.user.user_metadata?.tipoConta || 'voluntario',
      statusAcesso: data.user.user_metadata?.statusAcesso || 'pendente'
    }
  }
}

/**
 * Realiza cadastro no Supabase Auth e repassa os metadados para o trigger do PostgreSQL
 */
export async function cadastrarComSupabase({
  email,
  senha,
  nome,
  telefone,
  tipoConta,
  igrejaId,
  funcao,
  naipe,
  nomeIgreja,
  cidadeIgreja
}) {
  if (!supabaseConfigurado || !supabase) {
    throw new Error('Supabase não configurado no .env')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        nome,
        telefone,
        tipoConta, // 'voluntario' | 'lider'
        igrejaId: igrejaId ? Number(igrejaId) : null,
        funcao,
        naipe,
        nomeIgreja,
        cidadeIgreja
      }
    }
  })

  // Se o e-mail já constava no auth.users (porque foi apagado apenas da tabela de perfis)
  if (error) {
    if (error.message?.includes('User already registered') || error.message?.includes('already registered')) {
      try {
        const loginRes = await supabase.auth.signInWithPassword({
          email,
          password: senha
        })
        if (loginRes?.data?.user) {
          const perfilRecriado = await sincronizarPerfilSeAusente(loginRes.data.user, {
            nome,
            telefone,
            tipoConta,
            igrejaId,
            funcao,
            naipe,
            nomeIgreja,
            cidadeIgreja
          })
          return { user: loginRes.data.user, session: loginRes.data.session, perfil: perfilRecriado }
        }
      } catch (eLogin) {
        throw new Error(
          'Este e-mail já possui cadastro anterior no sistema de autenticação. Efetue login com sua senha para reativar seu pedido, ou solicite ao administrador para liberar seu e-mail.'
        )
      }
    }
    throw error
  }

  // Garante que o perfil e a solicitação existam no banco mesmo se o trigger não tiver disparado
  if (data?.user?.id) {
    try {
      await sincronizarPerfilSeAusente(data.user, {
        nome,
        telefone,
        tipoConta,
        igrejaId,
        funcao,
        naipe,
        nomeIgreja,
        cidadeIgreja
      })
    } catch (errSync) {
      console.warn('Aviso ao sincronizar perfil pós-cadastro:', errSync)
    }
  }

  return data
}

/**
 * Encerra a sessão atual no Supabase
 */
export async function logoutSupabase() {
  if (!supabaseConfigurado || !supabase) return
  await supabase.auth.signOut()
}

/**
 * Recuperação de senha via e-mail
 */
export async function redefinirSenhaSupabase(email) {
  if (!supabaseConfigurado || !supabase) {
    throw new Error('Supabase não configurado no .env')
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/redefinir-senha`
  })

  if (error) throw error
  return data
}

/**
 * Atualiza a senha da conta atualmente autenticada (usado no fluxo de redefinição de senha)
 */
export async function atualizarSenhaSupabase(novaSenha) {
  if (!supabaseConfigurado || !supabase) {
    throw new Error('Supabase não configurado no .env')
  }

  const { data, error } = await supabase.auth.updateUser({
    password: novaSenha
  })

  if (error) throw error
  return data
}

/**
 * Reenvia o e-mail de confirmação de cadastro
 */
export async function reenviarConfirmacaoEmail(email) {
  if (!supabaseConfigurado || !supabase) {
    throw new Error('Supabase não configurado no .env')
  }

  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim()
  })

  if (error) throw error
  return data
}

/**
 * Busca o perfil do usuário logado na tabela perfis
 */
export async function obterPerfilUsuario(userId) {
  if (!supabaseConfigurado || !supabase || !userId) return null

  const { data, error } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Erro ao buscar perfil do usuário:', error)
    return null
  }

  return data
}

/**
 * Sincroniza e recria o perfil e solicitações no banco se estiverem ausentes
 * (Resolve o caso de usuários apagados e re-cadastrados ou trigger desincronizado)
 */
export async function sincronizarPerfilSeAusente(user, dadosExtras = {}) {
  if (!supabaseConfigurado || !supabase || !user?.id) return null

  // 1. PRIMEIRO: Verifica se o perfil já existe na tabela perfis (por ID ou por e-mail)
  try {
    let { data: existente } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (!existente && user.email) {
      const { data: pEmail } = await supabase
        .from('perfis')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()
      if (pEmail) existente = pEmail
    }

    // Se o perfil já existe, garante que se for voluntário pendente ele também esteja na fila de solicitações
    if (existente) {
      if (existente.tipo_conta === 'voluntario' && existente.status_acesso === 'pendente') {
        const idIgrejaVol = dadosExtras.igrejaId ? Number(dadosExtras.igrejaId) : (existente.igreja_id ? Number(existente.igreja_id) : null)
        if (idIgrejaVol) {
          const { data: jaTemSol } = await supabase
            .from('solicitacoes_voluntarios')
            .select('id')
            .or(`user_id.eq.${user.id},email.eq.${user.email}`)
            .limit(1)
            .maybeSingle()

          if (!jaTemSol) {
            await supabase.from('solicitacoes_voluntarios').insert({
              user_id: user.id,
              nome: existente.nome,
              email: user.email,
              telefone: existente.telefone || '',
              igreja_id: idIgrejaVol,
              funcao: existente.funcao || 'Voluntário',
              naipe: existente.naipe || 'Vocal',
              status: 'pendente'
            })
          }
        }
      }
      return existente
    }
  } catch (errCheck) {
    console.warn('Aviso ao checar perfil existente:', errCheck)
  }

  // 2. Extrai dados para criação segura
  const meta = user.user_metadata || {}
  const nome = dadosExtras.nome || meta.nome || splitEmail(user.email)
  const telefone = dadosExtras.telefone || meta.telefone || ''
  const tipoConta = dadosExtras.tipoConta || meta.tipoConta || 'voluntario'
  const funcao = dadosExtras.funcao || meta.funcao || 'Voluntário'
  const naipe = dadosExtras.naipe || meta.naipe || 'Vocal'
  const igrejaId = dadosExtras.igrejaId ? Number(dadosExtras.igrejaId) : (meta.igrejaId ? Number(meta.igrejaId) : null)
  const nomeIgreja = dadosExtras.nomeIgreja || meta.nomeIgreja || ''
  const cidadeIgreja = dadosExtras.cidadeIgreja || meta.cidadeIgreja || ''

  let statusAcesso = 'pendente'
  if (tipoConta === 'admin' || user.email === 'djandersonneres@hotmail.com') {
    statusAcesso = 'aprovado'
  } else if (tipoConta === 'lider') {
    statusAcesso = 'pendente_lider'
    // Checa se já havia sido aprovado em solicitacoes_lideres
    try {
      const { data: solAnterior } = await supabase
        .from('solicitacoes_lideres')
        .select('status, id')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (solAnterior?.status === 'aprovado') {
        statusAcesso = 'aprovado'
      }
    } catch (eSol) {
      console.warn('Aviso ao consultar solicitação anterior de líder:', eSol)
    }
  }

  const novoPerfil = {
    id: user.id,
    nome,
    email: user.email,
    telefone,
    funcao,
    naipe,
    igreja_id: igrejaId,
    cargo: (tipoConta === 'admin' || user.email === 'djandersonneres@hotmail.com') ? 'ADMIN' : (tipoConta === 'lider' ? 'Líder' : 'Voluntário'),
    tipo_conta: (user.email === 'djandersonneres@hotmail.com') ? 'admin' : tipoConta,
    status_acesso: statusAcesso,
    avatar: nome ? nome.substring(0, 2).toUpperCase() : 'MB'
  }

  try {
    const { data: inserido } = await supabase
      .from('perfis')
      .upsert(novoPerfil, { onConflict: 'id' })
      .select()
      .maybeSingle()

    // Insere na fila de solicitações SOMENTE SE NÃO HOUVER NENHUMA SOLICITAÇÃO PRÉVIA (evita duplicatas!)
    if (tipoConta === 'lider' && nomeIgreja) {
      const { data: solExistente } = await supabase
        .from('solicitacoes_lideres')
        .select('id')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .limit(1)
        .maybeSingle()

      if (!solExistente) {
        await supabase.from('solicitacoes_lideres').insert({
          user_id: user.id,
          nome,
          email: user.email,
          telefone,
          nome_igreja: nomeIgreja,
          cidade_igreja: cidadeIgreja,
          status: 'pendente'
        })
      }
    } else if (tipoConta === 'voluntario' && igrejaId) {
      const { data: solVolExistente } = await supabase
        .from('solicitacoes_voluntarios')
        .select('id')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .limit(1)
        .maybeSingle()

      if (!solVolExistente) {
        await supabase.from('solicitacoes_voluntarios').insert({
          user_id: user.id,
          nome,
          email: user.email,
          telefone,
          igreja_id: igrejaId,
          funcao,
          naipe,
          status: 'pendente'
        })
      }
    }

    return inserido || novoPerfil
  } catch (errFallback) {
    console.warn('Aviso na recuperação direta de perfil:', errFallback)
    return null
  }
}

/**
 * Exclui permanentemente um perfil e seus dados associados do banco de dados (Ação de Administrador)
 */
export async function excluirPerfilDoBanco(userId) {
  if (!supabaseConfigurado || !supabase || !userId) {
    throw new Error('Supabase não configurado ou ID de usuário inválido.')
  }

  // 1. Tenta via RPC excluir_usuario_completo (apaga de auth.users e perfis em cascata)
  try {
    const { error: rpcError } = await supabase.rpc('excluir_usuario_completo', {
      target_user_id: userId
    })
    if (!rpcError) {
      return true
    }
    console.warn('Aviso RPC excluir_usuario_completo:', rpcError)
  } catch (errRpc) {
    console.warn('Aviso ao tentar RPC excluir_usuario_completo:', errRpc)
  }

  // 2. Tenta via RPC excluir_usuario_admin alternativa
  try {
    const { error: rpcError2 } = await supabase.rpc('excluir_usuario_admin', {
      target_user_id: userId
    })
    if (!rpcError2) {
      return true
    }
  } catch (errRpc2) {
    console.warn('Aviso ao tentar RPC excluir_usuario_admin:', errRpc2)
  }

  // 3. Fallback de remoção em tabelas públicas dependentes
  try {
    await supabase.from('solicitacoes_lideres').delete().eq('user_id', userId)
  } catch (e) {
    console.warn('Erro ao remover de solicitacoes_lideres:', e)
  }

  try {
    await supabase.from('solicitacoes_voluntarios').delete().eq('user_id', userId)
  } catch (e) {
    console.warn('Erro ao remover de solicitacoes_voluntarios:', e)
  }

  try {
    await supabase.from('escala_integrantes').delete().eq('user_id', userId)
  } catch (e) {
    console.warn('Erro ao remover de escala_integrantes:', e)
  }

  try {
    await supabase.from('pedidos_troca').delete().eq('solicitante_id', userId)
  } catch (e) {
    console.warn('Erro ao remover de pedidos_troca (solicitante):', e)
  }

  try {
    await supabase.from('pedidos_troca').delete().eq('substituto_id', userId)
  } catch (e) {
    console.warn('Erro ao remover de pedidos_troca (substituto):', e)
  }

  // 4. Exclui da tabela perfis
  const { error: errPerfis } = await supabase
    .from('perfis')
    .delete()
    .eq('id', userId)

  if (errPerfis) {
    console.error('Erro ao excluir de perfis:', errPerfis)
    throw errPerfis
  }

  return true
}

function splitEmail(email) {
  return email ? email.split('@')[0] : 'Usuário'
}


