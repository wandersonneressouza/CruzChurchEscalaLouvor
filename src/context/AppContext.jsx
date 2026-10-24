import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { obterNaipePorFuncao } from '../constants/categoriasMusicais'
import {
  supabase,
  supabaseConfigurado,
  loginComSupabase,
  cadastrarComSupabase,
  logoutSupabase,
  obterPerfilUsuario,
  excluirPerfilDoBanco,
  sincronizarPerfilSeAusente
} from '../services/supabase'

const AppContext = createContext()

function calcularTempoRelativo(dataStr) {
  if (!dataStr) return 'Recente'
  const diffMs = Date.now() - new Date(dataStr).getTime()
  const diffMin = Math.floor(diffMs / (1000 * 60))
  if (diffMin < 1) return 'Agora mesmo'
  if (diffMin < 60) return `Há ${diffMin} min`
  const diffHoras = Math.floor(diffMin / 60)
  if (diffHoras < 24) return `Há ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`
  const diffDias = Math.floor(diffHoras / 24)
  if (diffDias < 30) return `Há ${diffDias} dia${diffDias > 1 ? 's' : ''}`
  return new Date(dataStr).toLocaleDateString('pt-BR')
}

export function AppProvider({ children }) {
  // 0. Autenticação e Sessão
  const [estaAutenticado, setEstaAutenticado] = useState(false)
  const [carregandoDados, setCarregandoDados] = useState(true)

  // 1. Dados do Usuário Ativo
  const [usuario, setUsuario] = useState(null)

  // 2. Entidades Reais do Banco de Dados
  const [igrejas, setIgrejas] = useState([])
  const [musicas, setMusicas] = useState([])
  const [escalas, setEscalas] = useState([])
  const [agendaEventos, setAgendaEventos] = useState([])
  const [comunicados, setComunicados] = useState([])
  const [equipeMembros, setEquipeMembros] = useState([])
  const [solicitacoesVoluntarios, setSolicitacoesVoluntarios] = useState([])
  const [solicitacoesLideres, setSolicitacoesLideres] = useState([])
  const [pedidosTroca, setPedidosTroca] = useState([])
  const [devocional, setDevocional] = useState({
    id: null,
    titulo: 'Adoração em Comunhão',
    versiculoReferencia: 'Salmos 100:2',
    versiculoTexto: 'Servi ao Senhor com alegria e apresentai-vos a ele com cânticos.',
    conteudo: 'A adoração verdadeira nasce de um coração rendido ao propósito de Deus.',
    autor: 'Ministério Pastoral',
    lidoHoje: false,
    favorito: false,
    diasLidos: [],
    totalSemana: 7
  })

  // Limpa resquícios antigos do localStorage que continham dados falsos
  useEffect(() => {
    try {
      localStorage.removeItem('cruz_church_igrejas')
      localStorage.removeItem('cruz_church_equipe')
      localStorage.removeItem('cruz_church_solicitacoes_voluntarios')
      localStorage.removeItem('cruz_church_solicitacoes_lideres')
      localStorage.removeItem('cruz_church_escalas')
      localStorage.removeItem('cruz_church_musicas')
      localStorage.removeItem('cruz_church_trocas')
    } catch (e) {
      /* ignore */
    }
  }, [])

  // ============================================================================
  // FUNÇÃO DE CARREGAMENTO CENTRALIZADO DO SUPABASE
  // ============================================================================
  const carregarDadosDoBanco = useCallback(async (userAtual = usuario) => {
    if (!supabaseConfigurado || !supabase) {
      setCarregandoDados(false)
      return
    }

    try {
      // 1. Congregações / Igrejas
      const { data: dataIgrejas, error: errIgrejas } = await supabase
        .from('igrejas')
        .select('*')
        .order('nome')

      if (dataIgrejas && !errIgrejas) {
        setIgrejas(dataIgrejas)
      }

      // 2. Músicas do Repertório
      const { data: dataMusicas, error: errMusicas } = await supabase
        .from('musicas')
        .select('*')
        .order('titulo')

      if (dataMusicas && !errMusicas) {
        setMusicas(
          dataMusicas.map(m => ({
            id: m.id,
            titulo: m.titulo,
            artista: m.artista,
            tom: m.tom || 'G',
            bpm: m.bpm || '70',
            tag: m.tag || 'Culto de Celebração',
            tipo: m.tipo || 'Culto',
            capaTexto: m.capa_texto || (m.titulo || 'LOUVOR').substring(0, 10).toUpperCase(),
            favorita: Boolean(m.favorita),
            igrejaId: m.igreja_id,
            cifraUrl: m.cifra_url,
            videoUrl: m.video_url,
            audioUrl: m.audio_url,
            letra: m.letra
          }))
        )
      }

      // 3. Agenda de Eventos (Cultos e Ensaios)
      try {
        const { data: dataAgenda, error: errAgenda } = await supabase
          .from('agenda_eventos')
          .select('*')
          .order('data', { ascending: true })

        if (dataAgenda && !errAgenda) {
          setAgendaEventos(
            dataAgenda.map(ev => ({
              id: ev.id,
              igrejaId: ev.igreja_id,
              titulo: ev.titulo,
              tipo: ev.tipo || 'Culto',
              data: ev.data,
              hora: ev.hora ? (ev.hora.length > 5 ? ev.hora.substring(0, 5) : ev.hora) : '19:00',
              dataFormatada: ev.data_formatada || ev.data,
              dataCurta: ev.data_curta || (ev.data ? `${ev.data.substring(8, 10)}/${ev.data.substring(5, 7)}` : ''),
              local: ev.local,
              descricao: ev.descricao || ''
            }))
          )
        }
      } catch (eAg) {
        console.warn('Aviso ao consultar agenda_eventos:', eAg)
      }

      // 4. Escalas com Integrantes e Repertório
      try {
        let { data: dataEscalas, error: errEscalas } = await supabase
          .from('escalas')
          .select(`
            *,
            escala_integrantes(*, perfis(id, nome, email, funcao, naipe, avatar)),
            escala_repertorio(*, musicas(*))
          `)
          .order('data', { ascending: true })

        // Se falhar a junção de perfis, tenta consulta direta
        if (errEscalas) {
          const resFallback = await supabase
            .from('escalas')
            .select(`
              *,
              escala_integrantes(*),
              escala_repertorio(*, musicas(*))
            `)
            .order('data', { ascending: true })
          dataEscalas = resFallback.data
          errEscalas = resFallback.error
        }

        if (dataEscalas && !errEscalas) {
          setEscalas(
            dataEscalas.map(e => ({
              id: e.id,
              igrejaId: e.igreja_id,
              evento: e.evento_nome || e.titulo || 'Culto de Celebração',
              tipo: e.tipo || 'Culto',
              data: e.data_formatada || e.data,
              dataRaw: e.data,
              dataCurta: e.data_curta || (e.data ? `${e.data.substring(8, 10)}/${e.data.substring(5, 7)}` : ''),
              hora: e.hora ? (e.hora.length > 5 ? e.hora.substring(0, 5) : e.hora) : '19:00',
              local: e.local,
              observacoes: e.observacoes || '',
              status: e.status_geral || 'publicada',
              integrantes: (e.escala_integrantes || []).map(i => ({
                id: i.id,
                userId: i.user_id,
                nome: i.perfis?.nome || 'Integrante',
                funcao: i.funcao,
                naipe: i.naipe || i.perfis?.naipe || 'Geral',
                status: i.status || 'pendente',
                avatar: i.perfis?.avatar || (i.perfis?.nome ? i.perfis.nome.substring(0, 2).toUpperCase() : 'MB'),
                email: i.perfis?.email
              })),
              repertorio: (e.escala_repertorio || []).map(r => ({
                id: r.id,
                ordem: r.ordem,
                tom: r.tom_escolhido || r.musicas?.tom,
                musica: r.musicas
              }))
            }))
          )
        }
      } catch (eEsc) {
        console.warn('Aviso ao consultar escalas:', eEsc)
      }

      // 5. Devocional Atual da Igreja
      const { data: dataDevocionais, error: errDevocionais } = await supabase
        .from('devocionais')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (dataDevocionais && dataDevocionais.length > 0 && !errDevocionais) {
        const d = dataDevocionais[0]
        setDevocional(prev => ({
          ...prev,
          id: d.id,
          titulo: d.titulo,
          versiculoReferencia: d.versiculo_referencia,
          versiculoTexto: d.versiculo_texto,
          conteudo: d.conteudo,
          autor: d.autor || 'Ministério Pastoral'
        }))
      }

      // 6. Perfis da Equipe de Integrantes
      const { data: dataPerfis, error: errPerfis } = await supabase
        .from('perfis')
        .select('*')
        .order('nome')

      if (dataPerfis && !errPerfis) {
        setEquipeMembros(
          dataPerfis.map(p => ({
            id: p.id,
            nome: p.nome,
            email: p.email,
            funcao: p.funcao || 'Voluntário',
            naipe: p.naipe || 'Vocal',
            status: p.status_acesso === 'aprovado' ? 'confirmado' : p.status_acesso,
            avatar: p.avatar || (p.nome ? p.nome.substring(0, 2).toUpperCase() : 'MB'),
            igrejaId: p.igreja_id,
            cargo: p.cargo,
            tipoConta: p.tipo_conta
          }))
        )
      }

      // 7. Solicitações de Novos Voluntários (Visão do Líder)
      const { data: dataSolVol, error: errSolVol } = await supabase
        .from('solicitacoes_voluntarios')
        .select('*')
        .order('created_at', { ascending: false })

      if (dataSolVol && !errSolVol) {
        setSolicitacoesVoluntarios(
          dataSolVol.map(s => ({
            id: s.id,
            userId: s.user_id,
            nome: s.nome,
            email: s.email,
            telefone: s.telefone || '',
            igrejaId: s.igreja_id,
            funcao: s.funcao,
            naipe: s.naipe,
            status: s.status,
            dataSolicitacao: new Date(s.created_at).toLocaleDateString('pt-BR')
          }))
        )
      }

      // 8. Solicitações de Novos Líderes (Visão do Admin Geral)
      const { data: dataSolLid, error: errSolLid } = await supabase
        .from('solicitacoes_lideres')
        .select('*')
        .order('created_at', { ascending: false })

      if (dataSolLid && !errSolLid) {
        setSolicitacoesLideres(
          dataSolLid.map(l => ({
            id: l.id,
            userId: l.user_id,
            user_id: l.user_id,
            nome: l.nome,
            email: l.email,
            telefone: l.telefone || '',
            nomeIgreja: l.nome_igreja,
            cidadeIgreja: l.cidade_igreja || '',
            status: l.status,
            observacao: l.observacao || '',
            dataSolicitacao: new Date(l.created_at).toLocaleDateString('pt-BR')
          }))
        )
      }

      // 9. Pedidos de Troca entre Músicos
      const { data: dataTrocas, error: errTrocas } = await supabase
        .from('pedidos_troca')
        .select('*')
        .order('created_at', { ascending: false })

      if (dataTrocas && !errTrocas) {
        setPedidosTroca(dataTrocas)
      }

      // 10. Comunicados e Avisos da Liderança
      try {
        const { data: dataComunicados, error: errComunicados } = await supabase
          .from('comunicados')
          .select('*')
          .order('created_at', { ascending: false })

        if (dataComunicados && !errComunicados) {
          setComunicados(
            dataComunicados.map(c => ({
              id: c.id,
              igrejaId: c.igreja_id,
              titulo: c.titulo,
              conteudo: c.conteudo,
              prioridade: c.prioridade || 'normal',
              tempoRelativo: calcularTempoRelativo(c.created_at),
              createdAt: c.created_at
            }))
          )
        }
      } catch (eCom) {
        console.warn('Aviso ao consultar comunicados:', eCom)
      }
    } catch (err) {
      console.error('Erro ao consultar dados no Supabase:', err)
    } finally {
      setCarregandoDados(false)
    }
  }, [usuario])

  // ============================================================================
  // INICIALIZAÇÃO DA SESSÃO AO ABRIR O APP
  // ============================================================================
  useEffect(() => {
    async function inicializarSessao() {
      if (!supabaseConfigurado || !supabase) {
        setCarregandoDados(false)
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          const perfil = await obterPerfilUsuario(session.user.id)
          if (perfil) {
            const meta = session.user.user_metadata || {}
            let nomeIgrejaLider = meta.nomeIgreja || meta.nome_igreja || perfil.nome_igreja || ''
            let nomeCampus = 'Cruz Church'

            if (perfil.igreja_id) {
              const { data: igData } = await supabase
                .from('igrejas')
                .select('nome')
                .eq('id', perfil.igreja_id)
                .maybeSingle()
              if (igData?.nome) {
                nomeCampus = igData.nome
              }
            } else if (nomeIgrejaLider) {
              nomeCampus = nomeIgrejaLider
            } else {
              const { data: solLider } = await supabase
                .from('solicitacoes_lideres')
                .select('nome_igreja')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()
              if (solLider?.nome_igreja) {
                nomeIgrejaLider = solLider.nome_igreja
                nomeCampus = solLider.nome_igreja
              }
            }

            const userObj = {
              id: perfil.id,
              nome: perfil.nome,
              email: perfil.email,
              telefone: perfil.telefone || '',
              funcao: perfil.funcao || 'Voluntário',
              naipe: perfil.naipe || 'Vocal',
              campus: nomeCampus,
              nomeIgreja: nomeIgrejaLider || nomeCampus,
              igrejaId: perfil.igreja_id || null,
              cargo: perfil.cargo || (perfil.tipo_conta === 'lider' ? 'Líder' : 'Voluntário'),
              tipoConta: perfil.tipo_conta || 'voluntario',
              statusAcesso: perfil.status_acesso || 'pendente',
              disponivel: perfil.disponivel !== false,
              notificacoes: perfil.notificacoes !== false,
              temaEscuro: Boolean(perfil.tema_escuro)
            }
            setUsuario(userObj)
            setEstaAutenticado(true)
            await carregarDadosDoBanco(userObj)
          } else {
            setEstaAutenticado(false)
          }
        } else {
          setEstaAutenticado(false)
          // Carrega lista de congregações ativas para o dropdown do cadastro
          const { data: dataIgrejas } = await supabase
            .from('igrejas')
            .select('*')
            .order('nome')
          if (dataIgrejas) setIgrejas(dataIgrejas)
        }
      } catch (e) {
        console.error('Erro na checagem de sessão inicial:', e)
      } finally {
        setCarregandoDados(false)
      }
    }

    inicializarSessao()

    // Ouvinte em tempo real de mudanças de sessão do Supabase Auth
    const { data: authListener } = supabase?.auth?.onAuthStateChange?.(async (event, session) => {
      if (session?.user) {
        const perfil = await obterPerfilUsuario(session.user.id)
        if (perfil) {
          const meta = session.user.user_metadata || {}
          let nomeIgrejaLider = meta.nomeIgreja || meta.nome_igreja || perfil.nome_igreja || ''
          let nomeCampus = 'Cruz Church'

          if (perfil.igreja_id) {
            const { data: igData } = await supabase
              .from('igrejas')
              .select('nome')
              .eq('id', perfil.igreja_id)
              .maybeSingle()
            if (igData?.nome) {
              nomeCampus = igData.nome
            }
          } else if (nomeIgrejaLider) {
            nomeCampus = nomeIgrejaLider
          } else {
            const { data: solLider } = await supabase
              .from('solicitacoes_lideres')
              .select('nome_igreja')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()
            if (solLider?.nome_igreja) {
              nomeIgrejaLider = solLider.nome_igreja
              nomeCampus = solLider.nome_igreja
            }
          }

          const userObj = {
            id: perfil.id,
            nome: perfil.nome,
            email: perfil.email,
            telefone: perfil.telefone || '',
            funcao: perfil.funcao || 'Voluntário',
            naipe: perfil.naipe || 'Vocal',
            campus: nomeCampus,
            nomeIgreja: nomeIgrejaLider || nomeCampus,
            igrejaId: perfil.igreja_id || null,
            cargo: perfil.cargo || (perfil.tipo_conta === 'lider' ? 'Líder' : 'Voluntário'),
            tipoConta: perfil.tipo_conta || 'voluntario',
            statusAcesso: perfil.status_acesso || 'pendente',
            disponivel: perfil.disponivel !== false,
            notificacoes: perfil.notificacoes !== false,
            temaEscuro: Boolean(perfil.tema_escuro)
          }
          setUsuario(userObj)
          setEstaAutenticado(true)
          await carregarDadosDoBanco(userObj)
        }
      } else if (event === 'SIGNED_OUT') {
        setUsuario(null)
        setEstaAutenticado(false)
      }
    }) || { data: { subscription: null } }

    return () => {
      authListener?.subscription?.unsubscribe?.()
    }
  }, [carregarDadosDoBanco])

  // ============================================================================
  // CONTADORES REATIVOS
  // ============================================================================
  const totalEscalasPendentes = escalas.filter(e => e.status === 'pendente').length
  const totalTrocasPendentes = pedidosTroca.filter(t => t.status === 'pendente').length
  const totalSolicitacoesPendentes = solicitacoesVoluntarios.filter(
    s => s.status === 'pendente' && (!usuario?.igrejaId || s.igrejaId === usuario.igrejaId)
  ).length
  const totalSolicitacoesLideresPendentes = solicitacoesLideres.filter(s => s.status === 'pendente').length
  const totalIgrejasAtivas = igrejas.filter(i => i.ativa !== false).length
  const totalLideresAprovados = igrejas.filter(i => i.lider && !i.lider.includes('Sem Líder')).length
  const totalIntegrantesCadastrados = equipeMembros.length

  // ============================================================================
  // OPERAÇÕES: CADASTRO E AUTENTICAÇÃO REAL NO SUPABASE
  // ============================================================================

  // 1. Cadastro de Voluntário no Supabase Auth
  async function cadastrarVoluntario({ nome, email, senha, telefone, igrejaId, funcao }) {
    const igreja = igrejas.find(i => i.id === Number(igrejaId)) || igrejas[0]
    const naipe = obterNaipePorFuncao(funcao)

    const data = await cadastrarComSupabase({
      email,
      senha,
      nome,
      telefone,
      tipoConta: 'voluntario',
      igrejaId: igreja ? igreja.id : 1,
      funcao: funcao || 'Vocal',
      naipe
    })

    const novoUsuario = {
      id: data.user?.id || Date.now(),
      nome,
      email,
      telefone: telefone || '',
      funcao: funcao || 'Voluntário',
      naipe,
      campus: igreja ? igreja.nome : 'Cruz Church',
      igrejaId: igreja ? igreja.id : 1,
      cargo: 'Voluntário',
      tipoConta: 'voluntario',
      statusAcesso: 'pendente',
      disponivel: true,
      notificacoes: true,
      temaEscuro: false
    }

    setUsuario(novoUsuario)
    setEstaAutenticado(true)
    return novoUsuario
  }

  // 2. Cadastro de Solicitação para Novo Líder de Louvor no Supabase Auth
  async function cadastrarSolicitacaoLider({ nome, email, senha, telefone, nomeIgreja, cidadeIgreja }) {
    const data = await cadastrarComSupabase({
      email,
      senha,
      nome,
      telefone,
      tipoConta: 'lider',
      nomeIgreja,
      cidadeIgreja
    })

    const novoUsuario = {
      id: data.user?.id || Date.now(),
      nome,
      email,
      telefone: telefone || '',
      funcao: 'Líder Ministerial (Pendente)',
      campus: nomeIgreja,
      nomeIgreja: nomeIgreja,
      cidadeIgreja: cidadeIgreja || '',
      cargo: 'Líder Solicitante',
      tipoConta: 'lider',
      statusAcesso: 'pendente_lider',
      disponivel: true,
      notificacoes: true,
      temaEscuro: false
    }

    setUsuario(novoUsuario)
    setEstaAutenticado(true)
    return novoUsuario
  }

  // 3. Login com Supabase Auth
  async function login(dadosUsuario) {
    if (!dadosUsuario?.senha) {
      throw new Error('Informe sua senha para efetuar o login.')
    }

    const { user, perfil } = await loginComSupabase(dadosUsuario.email, dadosUsuario.senha)

    if (perfil) {
      const meta = user?.user_metadata || {}
      const nomeIgrejaMeta = meta.nomeIgreja || meta.nome_igreja || perfil.nome_igreja || ''
      const igrejaAssociada = igrejas.find(i => i.id === perfil.igreja_id)
      const nomeCampus = igrejaAssociada?.nome || nomeIgrejaMeta || (perfil.igreja_id ? 'Cruz Church' : nomeIgrejaMeta || 'Cruz Church')

      const userObj = {
        id: perfil.id,
        nome: perfil.nome,
        email: perfil.email,
        telefone: perfil.telefone || '',
        funcao: perfil.funcao || 'Voluntário',
        naipe: perfil.naipe || 'Vocal',
        campus: nomeCampus,
        nomeIgreja: nomeIgrejaMeta || nomeCampus,
        igrejaId: perfil.igreja_id || null,
        cargo: perfil.cargo || (perfil.tipo_conta === 'lider' ? 'Líder' : 'Voluntário'),
        tipoConta: perfil.tipo_conta || 'voluntario',
        statusAcesso: perfil.status_acesso || 'pendente',
        disponivel: perfil.disponivel !== false,
        notificacoes: perfil.notificacoes !== false,
        temaEscuro: Boolean(perfil.tema_escuro)
      }
      setUsuario(userObj)
      setEstaAutenticado(true)
      await carregarDadosDoBanco(userObj)
      return { sucesso: true, perfil: userObj }
    }

    setEstaAutenticado(true)
    return { sucesso: true }
  }

  // 4. Logout do Supabase
  async function logout() {
    try {
      await logoutSupabase()
    } catch (e) {
      console.error('Erro ao efetuar logout:', e)
    }
    setUsuario(null)
    setEstaAutenticado(false)
  }

  // ============================================================================
  // OPERAÇÕES: HOMOLOGAÇÃO E GESTÃO NO SUPABASE (ADMIN & LÍDER)
  // ============================================================================

  // Aprovar solicitação de líder (Admin)
  async function aprovarSolicitacaoLider(solicitacaoId, { vincularIgrejaExistente = false, igrejaIdExistente = null } = {}) {
    const solicitacao = solicitacoesLideres.find(s => Number(s.id) === Number(solicitacaoId))
    if (!solicitacao) return

    setSolicitacoesLideres(prev =>
      prev.map(s => Number(s.id) === Number(solicitacaoId) ? { ...s, status: 'aprovado' } : s)
    )

    if (supabaseConfigurado && supabase) {
      // 1. Tenta via RPC no Postgres com SECURITY DEFINER se disponível
      let rpcSucesso = false
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc('aprovar_solicitacao_lider_admin', {
          p_solicitacao_id: Number(solicitacaoId),
          p_vincular_existente: Boolean(vincularIgrejaExistente),
          p_igreja_existente_id: igrejaIdExistente ? Number(igrejaIdExistente) : null
        })
        if (!rpcErr) {
          rpcSucesso = true
        } else {
          console.warn('RPC aprovar_solicitacao_lider_admin não disponível, usando atualização direta:', rpcErr)
        }
      } catch (eRpc) {
        console.warn('Aviso ao chamar RPC aprovar_solicitacao_lider_admin:', eRpc)
      }

      let idIgreja = igrejaIdExistente ? Number(igrejaIdExistente) : null

      // 2. Se a RPC não foi executada, executa atualização direta nas tabelas
      if (!rpcSucesso) {
        await supabase
          .from('solicitacoes_lideres')
          .update({ status: 'aprovado' })
          .eq('id', solicitacaoId)

        if (vincularIgrejaExistente && idIgreja) {
          await supabase
            .from('igrejas')
            .update({ lider: solicitacao.nome, ativa: true })
            .eq('id', idIgreja)
        } else {
          const nomeNovaIgreja = solicitacao.nomeIgreja || solicitacao.nome_igreja || 'Nova Igreja'
          const cidadeNovaIgreja = solicitacao.cidadeIgreja || solicitacao.cidade_igreja || 'Brasil'

          const { data: novaIg } = await supabase
            .from('igrejas')
            .insert({
              nome: nomeNovaIgreja,
              cidade: cidadeNovaIgreja,
              lider: solicitacao.nome,
              ativa: true
            })
            .select()
            .maybeSingle()

          if (novaIg) {
            idIgreja = novaIg.id
            setIgrejas(prev => [...prev, novaIg])
          }
        }

        const targetUserId = solicitacao.userId || solicitacao.user_id

        const dadosAtualizacao = {
          status_acesso: 'aprovado',
          tipo_conta: 'lider',
          cargo: 'Líder'
        }
        if (idIgreja) {
          dadosAtualizacao.igreja_id = idIgreja
        }

        // Atualiza por ID e também por e-mail para cobrir qualquer caso
        if (targetUserId) {
          const { error: errUpPerfis } = await supabase
            .from('perfis')
            .update(dadosAtualizacao)
            .eq('id', targetUserId)

          if (errUpPerfis && solicitacao.email) {
            await supabase
              .from('perfis')
              .update(dadosAtualizacao)
              .eq('email', solicitacao.email)
          }
        } else if (solicitacao.email) {
          await supabase
            .from('perfis')
            .update(dadosAtualizacao)
            .eq('email', solicitacao.email)
        }
      }

      const targetUserId = solicitacao.userId || solicitacao.user_id

      // 3. Atualiza na lista local de equipeMembros
      setEquipeMembros(prev =>
        prev.map(m =>
          (m.id === targetUserId || m.email === solicitacao.email)
            ? { ...m, status: 'confirmado', tipoConta: 'lider', cargo: 'Líder', igrejaId: idIgreja }
            : m
        )
      )

      // 4. Se o usuário aprovado for a sessão atual, atualiza instantaneamente
      if (usuario && (usuario.id === targetUserId || usuario.email === solicitacao.email)) {
        setUsuario(prev => ({
          ...prev,
          statusAcesso: 'aprovado',
          tipoConta: 'lider',
          cargo: 'Líder',
          igrejaId: idIgreja,
          campus: solicitacao.nomeIgreja || solicitacao.nome_igreja || prev.campus,
          nomeIgreja: solicitacao.nomeIgreja || solicitacao.nome_igreja || prev.campus
        }))
      }

      // Recarrega os dados do banco para sincronizar tudo
      await carregarDadosDoBanco()
    }
  }

  // Recusar solicitação de líder (Admin)
  async function recusarSolicitacaoLider(solicitacaoId, motivoRecusa = '') {
    setSolicitacoesLideres(prev =>
      prev.map(s => s.id === solicitacaoId ? { ...s, status: 'recusado', motivoRecusa } : s)
    )

    if (supabaseConfigurado && supabase) {
      await supabase
        .from('solicitacoes_lideres')
        .update({ status: 'recusado', motivo_recusa: motivoRecusa })
        .eq('id', solicitacaoId)
    }
  }

  // Criar nova congregação diretamente (Admin)
  async function criarIgreja({ nome, cidade, lider }) {
    if (supabaseConfigurado && supabase) {
      const { data, error } = await supabase
        .from('igrejas')
        .insert({
          nome,
          cidade: cidade || 'Brasil',
          lider: lider || 'Sem Líder Atribuído',
          ativa: true
        })
        .select()
        .single()

      if (!error && data) {
        setIgrejas(prev => [...prev, data])
        return data
      }
    }
  }

  // Editar congregação (Admin)
  async function editarIgreja(id, dadosAtualizados) {
    setIgrejas(prev =>
      prev.map(ig => ig.id === id ? { ...ig, ...dadosAtualizados } : ig)
    )

    if (supabaseConfigurado && supabase) {
      await supabase
        .from('igrejas')
        .update(dadosAtualizados)
        .eq('id', id)
    }
  }

  // Alternar ativação de congregação (Admin)
  async function alternarStatusIgreja(id) {
    const igAtual = igrejas.find(i => i.id === id)
    if (!igAtual) return
    const novoStatus = igAtual.ativa === false ? true : false

    setIgrejas(prev =>
      prev.map(ig => ig.id === id ? { ...ig, ativa: novoStatus } : ig)
    )

    if (supabaseConfigurado && supabase) {
      await supabase
        .from('igrejas')
        .update({ ativa: novoStatus })
        .eq('id', id)
    }
  }

  // Revogar liderança de congregação (Admin)
  async function revogarLiderancaIgreja(igrejaId) {
    setIgrejas(prev =>
      prev.map(ig => ig.id === igrejaId ? { ...ig, lider: 'Sem Líder Atribuído' } : ig)
    )

    if (supabaseConfigurado && supabase) {
      await supabase
        .from('igrejas')
        .update({ lider: 'Sem Líder Atribuído' })
        .eq('id', igrejaId)
    }
  }

  // Aprovar voluntário (Líder)
  async function aprovarVoluntario(solicitacaoId) {
    const solicitacao = solicitacoesVoluntarios.find(s => s.id === solicitacaoId)
    if (!solicitacao) return

    setSolicitacoesVoluntarios(prev =>
      prev.map(s => s.id === solicitacaoId ? { ...s, status: 'aprovado' } : s)
    )

    if (supabaseConfigurado && supabase) {
      await supabase
        .from('solicitacoes_voluntarios')
        .update({ status: 'aprovado' })
        .eq('id', solicitacaoId)

      if (solicitacao.user_id) {
        await supabase
          .from('perfis')
          .update({ status_acesso: 'aprovado' })
          .eq('id', solicitacao.user_id)
      }
    }
  }

  // Recusar voluntário (Líder)
  async function recusarVoluntario(solicitacaoId) {
    setSolicitacoesVoluntarios(prev =>
      prev.map(s => s.id === solicitacaoId ? { ...s, status: 'recusado' } : s)
    )

    if (supabaseConfigurado && supabase) {
      await supabase
        .from('solicitacoes_voluntarios')
        .update({ status: 'recusado' })
        .eq('id', solicitacaoId)
    }
  }

  // Alterar categoria musical do integrante (Líder)
  async function alterarCategoriaIntegrante(integranteId, novaFuncao, novoNaipe) {
    setEquipeMembros(prev =>
      prev.map(m =>
        m.id === integranteId
          ? { ...m, funcao: novaFuncao, naipe: novoNaipe || obterNaipePorFuncao(novaFuncao) }
          : m
      )
    )

    if (supabaseConfigurado && supabase) {
      await supabase
        .from('perfis')
        .update({
          funcao: novaFuncao,
          naipe: novoNaipe || obterNaipePorFuncao(novaFuncao)
        })
        .eq('id', integranteId)
    }
  }

  // Revogar acesso de integrante da igreja (Líder)
  async function revogarAcessoIntegrante(integranteId) {
    setEquipeMembros(prev => prev.filter(m => m.id !== integranteId))

    if (supabaseConfigurado && supabase) {
      await supabase
        .from('perfis')
        .update({ status_acesso: 'revogado' })
        .eq('id', integranteId)
    }
  }

  // Excluir permanentemente o perfil de um usuário do banco de dados (Admin)
  async function excluirPerfilUsuario(userId) {
    if (!userId) return

    // Remove do estado local imediatamente para feedback visual instantâneo
    setEquipeMembros(prev => prev.filter(m => m.id !== userId))
    setSolicitacoesLideres(prev => prev.filter(s => s.userId !== userId && s.id !== userId))
    setSolicitacoesVoluntarios(prev => prev.filter(s => s.userId !== userId && s.id !== userId))

    // Se o usuário excluído era líder de alguma igreja no estado local, remove a atribuição
    setIgrejas(prev =>
      prev.map(ig => {
        return ig
      })
    )

    // Exclui permanentemente do banco de dados (Supabase)
    if (supabaseConfigurado && supabase) {
      await excluirPerfilDoBanco(userId)
    }
  }

  // Verifica em tempo real o status de aprovação do usuário no Supabase
  async function verificarStatusAcesso() {
    if (!usuario?.id || !supabaseConfigurado || !supabase) {
      return usuario?.statusAcesso || 'pendente'
    }

    try {
      let perfil = await obterPerfilUsuario(usuario.id)
      if (!perfil && usuario.email) {
        const { data: pEmail } = await supabase.from('perfis').select('*').eq('email', usuario.email).maybeSingle()
        perfil = pEmail
      }

      if (!perfil) {
        // Se o perfil estava ausente, sincroniza e recria no banco
        perfil = await sincronizarPerfilSeAusente(usuario)
      }

      if (perfil) {
        const statusNovo = perfil.status_acesso || perfil.statusAcesso || 'pendente'
        const meta = usuario.user_metadata || {}
        let nomeIgrejaMeta = usuario.nomeIgreja || meta.nomeIgreja || perfil.nome_igreja || ''
        let nomeCampus = ''

        if (perfil.igreja_id) {
          const { data: igData } = await supabase
            .from('igrejas')
            .select('nome')
            .eq('id', perfil.igreja_id)
            .maybeSingle()
          if (igData?.nome) {
            nomeCampus = igData.nome
          }
        }

        if (!nomeCampus && !nomeIgrejaMeta) {
          const { data: solLider } = await supabase
            .from('solicitacoes_lideres')
            .select('nome_igreja')
            .eq('user_id', perfil.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          if (solLider?.nome_igreja) {
            nomeIgrejaMeta = solLider.nome_igreja
          }
        }

        const campusFinal = nomeCampus || nomeIgrejaMeta || (usuario.campus !== 'Cruz Church' ? usuario.campus : '') || 'Cruz Church'

        const userAtualizado = {
          ...usuario,
          id: perfil.id,
          statusAcesso: statusNovo,
          cargo: perfil.cargo || (perfil.tipo_conta === 'lider' ? 'Líder' : (usuario.cargo || 'Voluntário')),
          tipoConta: perfil.tipo_conta || usuario.tipoConta || 'voluntario',
          igrejaId: perfil.igreja_id || usuario.igrejaId || null,
          campus: campusFinal,
          nomeIgreja: nomeIgrejaMeta || campusFinal
        }
        setUsuario(userAtualizado)

        // Se foi aprovado, recarrega os dados do ministério
        if (statusNovo === 'aprovado') {
          await carregarDadosDoBanco(userAtualizado)
        }
        return statusNovo
      }
    } catch (e) {
      console.warn('Erro ao checar status de acesso no Supabase:', e)
    }

    return usuario?.statusAcesso || 'pendente'
  }

  // Atualizar função no perfil pessoal (Usuário)
  async function atualizarMinhaFuncao(novaFuncao) {
    const naipe = obterNaipePorFuncao(novaFuncao)
    setUsuario(prev => ({
      ...prev,
      funcao: novaFuncao,
      naipe
    }))

    if (supabaseConfigurado && supabase && usuario?.id) {
      await supabase
        .from('perfis')
        .update({ funcao: novaFuncao, naipe })
        .eq('id', usuario.id)
    }
  }

  // ============================================================================
  // OPERAÇÕES: MÚSICAS, ESCALAS E DEVOCIONAL
  // ============================================================================

  // Adicionar música ao repertório (Persistência real no Supabase)
  async function adicionarMusica(novaMusica) {
    const tag = novaMusica.tag || 'Culto de Celebração'
    const tipo = tag.includes('Tema') ? 'Tema' : 'Culto'
    const capaTexto = (novaMusica.titulo || 'LOUVOR').substring(0, 10).toUpperCase()

    if (supabaseConfigurado && supabase) {
      const { data, error } = await supabase
        .from('musicas')
        .insert({
          titulo: novaMusica.titulo,
          artista: novaMusica.artista,
          tom: novaMusica.tom || 'G',
          bpm: novaMusica.bpm || '70',
          tag,
          tipo,
          capa_texto: capaTexto,
          favorita: false,
          igreja_id: usuario?.igrejaId || null
        })
        .select()
        .single()

      if (!error && data) {
        const musicaFormatada = {
          id: data.id,
          titulo: data.titulo,
          artista: data.artista,
          tom: data.tom,
          bpm: data.bpm,
          tag: data.tag,
          tipo: data.tipo,
          capaTexto: data.capa_texto || capaTexto,
          favorita: false,
          igrejaId: data.igreja_id
        }
        setMusicas(prev => [musicaFormatada, ...prev])
        return musicaFormatada
      }
    }
  }

  // Remover música
  async function removerMusica(id) {
    setMusicas(prev => prev.filter(m => m.id !== id))
    if (supabaseConfigurado && supabase) {
      await supabase.from('musicas').delete().eq('id', id)
    }
  }

  // Alternar favorita
  async function toggleFavoritoMusica(id) {
    const musicaAtual = musicas.find(m => m.id === id)
    if (!musicaAtual) return
    const novoFavorita = !musicaAtual.favorita

    setMusicas(prev =>
      prev.map(m => m.id === id ? { ...m, favorita: novoFavorita } : m)
    )

    if (supabaseConfigurado && supabase) {
      await supabase
        .from('musicas')
        .update({ favorita: novoFavorita })
        .eq('id', id)
    }
  }

  // Confirmação de presença na escala
  async function confirmarPresenca(escalaId) {
    setEscalas(prev =>
      prev.map(item => {
        if (item.id === escalaId) {
          const novosIntegrantes = (item.integrantes || []).map(i =>
            (i.userId === usuario?.id || i.user_id === usuario?.id || i.email === usuario?.email)
              ? { ...i, status: 'confirmado' }
              : i
          )
          return { ...item, status: 'confirmado', integrantes: novosIntegrantes }
        }
        return item
      })
    )

    if (supabaseConfigurado && supabase && usuario?.id) {
      await supabase
        .from('escala_integrantes')
        .update({ status: 'confirmado', confirmado_em: new Date().toISOString() })
        .match({ escala_id: escalaId, user_id: usuario.id })
    }
  }

  // Recusar presença na escala
  async function recusarPresenca(escalaId) {
    setEscalas(prev =>
      prev.map(item => {
        if (item.id === escalaId) {
          const novosIntegrantes = (item.integrantes || []).map(i =>
            (i.userId === usuario?.id || i.user_id === usuario?.id || i.email === usuario?.email)
              ? { ...i, status: 'recusado' }
              : i
          )
          return { ...item, status: 'recusado', integrantes: novosIntegrantes }
        }
        return item
      })
    )

    if (supabaseConfigurado && supabase && usuario?.id) {
      await supabase
        .from('escala_integrantes')
        .update({ status: 'recusado' })
        .match({ escala_id: escalaId, user_id: usuario.id })
    }
  }

  // Solicitar substituição na escala
  async function solicitarSubstituicao(escalaId) {
    setEscalas(prev =>
      prev.map(item => {
        if (item.id === escalaId) {
          const novosIntegrantes = (item.integrantes || []).map(i =>
            (i.userId === usuario?.id || i.user_id === usuario?.id || i.email === usuario?.email)
              ? { ...i, status: 'substituicao' }
              : i
          )
          return { ...item, status: 'substituicao', integrantes: novosIntegrantes }
        }
        return item
      })
    )

    if (supabaseConfigurado && supabase && usuario?.id) {
      await supabase
        .from('escala_integrantes')
        .update({ status: 'substituicao' })
        .match({ escala_id: escalaId, user_id: usuario.id })
    }
  }

  // Criar novo evento na agenda (Cultos, Ensaios)
  async function criarEventoAgenda({ titulo, tipo, data, hora, local, descricao }) {
    if (supabaseConfigurado && supabase) {
      const dataCurta = data ? `${data.substring(8, 10)}/${data.substring(5, 7)}` : ''

      const { data: novoEv, error } = await supabase
        .from('agenda_eventos')
        .insert({
          igreja_id: usuario?.igrejaId || 1,
          titulo,
          tipo: tipo || 'Culto',
          data,
          hora: hora ? (hora.length === 5 ? `${hora}:00` : hora) : '19:00:00',
          data_formatada: data,
          data_curta: dataCurta,
          local: local || usuario?.campus || 'Templo Principal',
          descricao: descricao || ''
        })
        .select()
        .single()

      if (!error && novoEv) {
        await carregarDadosDoBanco()
        return novoEv
      }
    }
  }

  // Excluir evento da agenda
  async function excluirEventoAgenda(id) {
    setAgendaEventos(prev => prev.filter(e => e.id !== id))
    if (supabaseConfigurado && supabase) {
      await supabase.from('agenda_eventos').delete().eq('id', id)
    }
  }

  // Criar novo comunicado (Líder / Admin)
  async function criarComunicado({ titulo, conteudo, prioridade = 'normal' }) {
    if (supabaseConfigurado && supabase) {
      const { data, error } = await supabase
        .from('comunicados')
        .insert({
          igreja_id: usuario?.igrejaId || 1,
          autor_id: usuario?.id || null,
          titulo,
          conteudo,
          prioridade
        })
        .select()
        .single()

      if (!error && data) {
        await carregarDadosDoBanco()
        return data
      }
    }
  }

  // Devocional: marcar como lido
  function toggleDevocionalLido() {
    setDevocional(prev => ({
      ...prev,
      lidoHoje: !prev.lidoHoje
    }))
  }

  // Devocional: marcar favorito
  function toggleDevocionalFavorito() {
    setDevocional(prev => ({
      ...prev,
      favorito: !prev.favorito
    }))
  }

  // Preferências do perfil
  function toggleDisponibilidade() {
    setUsuario(prev => ({ ...prev, disponivel: !prev?.disponivel }))
  }

  function toggleNotificacoes() {
    setUsuario(prev => ({ ...prev, notificacoes: !prev?.notificacoes }))
  }

  function toggleTemaEscuro() {
    setUsuario(prev => ({ ...prev, temaEscuro: !prev?.temaEscuro }))
  }

  // Responder pedido de troca
  async function responderPedidoTroca(pedidoId, aceitou) {
    const novoStatus = aceitou ? 'aceito' : 'recusado'
    setPedidosTroca(prev =>
      prev.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p)
    )

    if (supabaseConfigurado && supabase) {
      await supabase
        .from('pedidos_troca')
        .update({ status: novoStatus })
        .eq('id', pedidoId)
    }
  }

  // Simulador visual (mantido para testes pontuais de UI)
  function alternarPerfilVisual(tipoPerfil) {
    if (tipoPerfil === 'admin') {
      setUsuario({
        id: 'admin-mock-id',
        nome: 'Administrador Geral',
        email: 'admin@louvorapp.com',
        funcao: 'Administrador da Plataforma',
        campus: 'LouvorApp — Painel Geral',
        cargo: 'ADMIN',
        tipoConta: 'admin',
        statusAcesso: 'aprovado',
        disponivel: true,
        notificacoes: true,
        temaEscuro: false
      })
      setEstaAutenticado(true)
    }
  }

  return (
    <AppContext.Provider
      value={{
        usuario,
        estaAutenticado,
        carregandoDados,
        supabaseConfigurado,
        igrejas,
        equipeMembros,
        solicitacoesVoluntarios,
        solicitacoesLideres,
        agendaEventos,
        escalas,
        musicas,
        devocional,
        pedidosTroca,
        totalEscalasPendentes,
        totalTrocasPendentes,
        totalSolicitacoesPendentes,
        totalSolicitacoesLideresPendentes,
        totalIgrejasAtivas,
        totalLideresAprovados,
        totalIntegrantesCadastrados,
        cadastrarVoluntario,
        cadastrarSolicitacaoLider,
        aprovarSolicitacaoLider,
        recusarSolicitacaoLider,
        criarIgreja,
        editarIgreja,
        alternarStatusIgreja,
        revogarLiderancaIgreja,
        criarEventoAgenda,
        excluirEventoAgenda,
        comunicados,
        criarComunicado,
        aprovarVoluntario,
        recusarVoluntario,
        alterarCategoriaIntegrante,
        revogarAcessoIntegrante,
        excluirPerfilUsuario,
        verificarStatusAcesso,
        atualizarMinhaFuncao,
        alternarPerfilVisual,
        login,
        logout,
        confirmarPresenca,
        recusarPresenca,
        solicitarSubstituicao,
        adicionarMusica,
        removerMusica,
        toggleFavoritoMusica,
        toggleDevocionalLido,
        toggleDevocionalFavorito,
        toggleDisponibilidade,
        toggleNotificacoes,
        toggleTemaEscuro,
        responderPedidoTroca,
        carregarDadosDoBanco
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider')
  }
  return context
}
