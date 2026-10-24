import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const {
    usuario,
    igrejas,
    equipeMembros,
    solicitacoesLideres,
    totalSolicitacoesLideresPendentes,
    totalIgrejasAtivas,
    totalLideresAprovados,
    totalIntegrantesCadastrados,
    aprovarSolicitacaoLider,
    recusarSolicitacaoLider,
    criarIgreja,
    editarIgreja,
    alternarStatusIgreja,
    revogarLiderancaIgreja,
    excluirPerfilUsuario,
    logout
  } = useAppContext()

  // Aba ativa de navegação do ADMIN
  const [abaAtiva, setAbaAtiva] = useState('dashboard') // 'dashboard' | 'igrejas' | 'lideres' | 'integrantes'

  // Filtros de solicitações na tela inicial
  const [filtroSolicitacoes, setFiltroSolicitacoes] = useState('pendente') // 'pendente' | 'aprovado' | 'todos'

  // Modais de Ação do ADMIN
  const [modalAprovacao, setModalAprovacao] = useState(null) // solicitacao selecionada para aprovação
  const [tipoVinculoIgreja, setTipoVinculoIgreja] = useState('nova') // 'nova' | 'existente'
  const [igrejaExistenteId, setIgrejaExistenteId] = useState(igrejas[0]?.id || '')

  const [modalRecusa, setModalRecusa] = useState(null) // solicitacao selecionada para recusa
  const [motivoRecusa, setMotivoRecusa] = useState('')

  const [modalNovaIgreja, setModalNovaIgreja] = useState(false)
  const [novaIgrejaNome, setNovaIgrejaNome] = useState('')
  const [novaIgrejaCidade, setNovaIgrejaCidade] = useState('')
  const [novaIgrejaLider, setNovaIgrejaLider] = useState('')

  const [igrejaEditando, setIgrejaEditando] = useState(null)
  const [buscaIgreja, setBuscaIgreja] = useState('')
  const [buscaIntegrante, setBuscaIntegrante] = useState('')

  // Modal para exclusão permanente de perfil do usuário
  const [modalExcluirUsuario, setModalExcluirUsuario] = useState(null)
  const [excluindoUsuario, setExcluindoUsuario] = useState(false)

  // Toast / Feedback rápido
  const [feedback, setFeedback] = useState('')

  function mostrarFeedback(msg) {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 3000)
  }

  // Filtragem de solicitações
  const solicitacoesFiltradas = useMemo(() => {
    if (filtroSolicitacoes === 'todos') return solicitacoesLideres
    return solicitacoesLideres.filter(s => s.status === filtroSolicitacoes)
  }, [solicitacoesLideres, filtroSolicitacoes])

  // Filtragem de igrejas
  const igrejasFiltradas = useMemo(() => {
    return igrejas.filter(i =>
      i.nome.toLowerCase().includes(buscaIgreja.toLowerCase()) ||
      i.cidade.toLowerCase().includes(buscaIgreja.toLowerCase()) ||
      (i.lider && i.lider.toLowerCase().includes(buscaIgreja.toLowerCase()))
    )
  }, [igrejas, buscaIgreja])

  // Filtragem de integrantes / usuários
  const integrantesFiltrados = useMemo(() => {
    return equipeMembros.filter(m =>
      m.nome.toLowerCase().includes(buscaIntegrante.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(buscaIntegrante.toLowerCase())) ||
      (m.funcao && m.funcao.toLowerCase().includes(buscaIntegrante.toLowerCase())) ||
      (m.tipoConta && m.tipoConta.toLowerCase().includes(buscaIntegrante.toLowerCase()))
    )
  }, [equipeMembros, buscaIntegrante])

  // Confirmar exclusão permanente de perfil do usuário
  async function handleConfirmarExclusaoUsuario() {
    if (!modalExcluirUsuario) return
    setExcluindoUsuario(true)
    try {
      await excluirPerfilUsuario(modalExcluirUsuario.id)
      mostrarFeedback(`Perfil de "${modalExcluirUsuario.nome}" foi excluído com sucesso do banco de dados!`)
      setModalExcluirUsuario(null)
    } catch (err) {
      alert('Erro ao excluir usuário: ' + (err.message || 'Falha na operação.'))
    } finally {
      setExcluindoUsuario(false)
    }
  }

  // Confirmar Aprovação de Líder e Homologação
  async function handleConfirmarAprovacao() {
    if (!modalAprovacao) return

    try {
      await aprovarSolicitacaoLider(modalAprovacao.id, {
        vincularIgrejaExistente: tipoVinculoIgreja === 'existente',
        igrejaIdExistente: tipoVinculoIgreja === 'existente' ? igrejaExistenteId : null
      })

      mostrarFeedback(`Líder ${modalAprovacao.nome} aprovado e congregação homologada com sucesso!`)
      setModalAprovacao(null)
    } catch (err) {
      alert('Erro ao aprovar líder: ' + (err.message || 'Falha na operação.'))
    }
  }

  // Confirmar Recusa de Solicitação
  function handleConfirmarRecusa() {
    if (!modalRecusa) return

    recusarSolicitacaoLider(modalRecusa.id, motivoRecusa)
    mostrarFeedback(`Solicitação de ${modalRecusa.nome} foi recusada.`)
    setModalRecusa(null)
    setMotivoRecusa('')
  }

  // Criar Nova Igreja Diretamente
  function handleCriarIgrejaSubmit(e) {
    e.preventDefault()
    if (!novaIgrejaNome.trim()) return

    criarIgreja({
      nome: novaIgrejaNome,
      cidade: novaIgrejaCidade,
      lider: novaIgrejaLider
    })

    setModalNovaIgreja(false)
    setNovaIgrejaNome('')
    setNovaIgrejaCidade('')
    setNovaIgrejaLider('')
    mostrarFeedback('Nova congregação cadastrada com sucesso!')
  }

  // Salvar Edição de Igreja
  function handleSalvarEdicaoIgreja(e) {
    e.preventDefault()
    if (!igrejaEditando) return

    editarIgreja(igrejaEditando.id, {
      nome: igrejaEditando.nome,
      cidade: igrejaEditando.cidade,
      lider: igrejaEditando.lider
    })

    setIgrejaEditando(null)
    mostrarFeedback('Dados da congregação atualizados!')
  }

  return (
    <div id="tela-admin-dashboard">
      {/* ====================================================================
          1. TOPO / HEADER DA ÁREA ADMIN
          ==================================================================== */}
      <header className="admin-header-topo">
        <div className="admin-header-container">
          <div className="admin-header-top-row">
            {/* Logo e Identificação */}
            <div className="admin-marca-box">
              <div className="admin-logo-simbolo">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#2563eb" />
                  <rect x="14" y="6" width="4" height="20" rx="1.5" fill="#ffffff" />
                  <rect x="8" y="11" width="16" height="4" rx="1.5" fill="#ffffff" />
                </svg>
              </div>
              <div className="admin-marca-texto">
                <div className="admin-marca-linha">
                  <span className="marca-nome">LouvorApp</span>
                  <span className="badge-admin-tag">ADMIN GERAL</span>
                </div>
                <span className="admin-marca-sub">Painel de Gestão e Homologação</span>
              </div>
            </div>

            {/* Usuário e Ações à Direita */}
            <div className="admin-usuario-bloco">
              <div className="admin-perfil-chip">
                <div className="avatar-admin-circulo">
                  {usuario?.avatar || (usuario?.nome ? usuario.nome.substring(0, 2).toUpperCase() : 'AN')}
                </div>
                <div className="admin-perfil-dados">
                  <strong>{usuario?.nome || 'Admin Geral'}</strong>
                  <span className="email-chip-sub">{usuario?.email || 'admin@louvorapp.com'}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-sair-admin"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                title="Encerrar sessão"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navegação Principal em Tema Claro */}
          <nav className="admin-nav-menu">
            <button
              type="button"
              className={`btn-nav-item ${abaAtiva === 'dashboard' ? 'ativo' : ''}`}
              onClick={() => setAbaAtiva('dashboard')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              <span>Dashboard & Homologações</span>
              {totalSolicitacoesLideresPendentes > 0 && (
                <span className="pill-alerta-nav">{totalSolicitacoesLideresPendentes}</span>
              )}
            </button>

            <button
              type="button"
              className={`btn-nav-item ${abaAtiva === 'igrejas' ? 'ativo' : ''}`}
              onClick={() => setAbaAtiva('igrejas')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 7v14M21 7v14M6 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
                <path d="M10 11v4M14 11v4" />
              </svg>
              <span>Igrejas ({igrejas.length})</span>
            </button>

            <button
              type="button"
              className={`btn-nav-item ${abaAtiva === 'lideres' ? 'ativo' : ''}`}
              onClick={() => setAbaAtiva('lideres')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
              <span>Líderes Aprovados</span>
            </button>

            <button
              type="button"
              className={`btn-nav-item ${abaAtiva === 'integrantes' ? 'ativo' : ''}`}
              onClick={() => setAbaAtiva('integrantes')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Integrantes da Base</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Alerta de Feedback Flutuante */}
      {feedback && (
        <div className="toast-feedback-admin">
          <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{feedback}</span>
        </div>
      )}

      {/* ====================================================================
          2. CONTEÚDO PRINCIPAL
          ==================================================================== */}
      <main className="admin-corpo-conteudo">
        {/* ================================================================
            ABA: DASHBOARD & SOLICITAÇÕES
            ================================================================ */}
        {abaAtiva === 'dashboard' && (
          <div className="painel-dashboard-secao">
            {/* Linha de 4 Cards de Indicadores */}
            <section className="grid-indicadores-admin">
              {/* Card 1: Igrejas Ativas */}
              <div className="card-metrica-admin">
                <div className="metrica-header">
                  <span className="metrica-titulo">Igrejas Ativas</span>
                  <div className="metrica-icone blue">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18M3 7v14M21 7v14M6 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
                    </svg>
                  </div>
                </div>
                <div className="metrica-valor">{totalIgrejasAtivas}</div>
                <div className="metrica-rodape">
                  <span className="destaque-verde">100% operacionais</span>
                  <span>no sistema</span>
                </div>
              </div>

              {/* Card 2: Líderes Aprovados */}
              <div className="card-metrica-admin">
                <div className="metrica-header">
                  <span className="metrica-titulo">Líderes Aprovados</span>
                  <div className="metrica-icone green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <polyline points="16 11 18 13 22 9" />
                    </svg>
                  </div>
                </div>
                <div className="metrica-valor">{totalLideresAprovados}</div>
                <div className="metrica-rodape">
                  <span>Gestores de ministérios cadastrados</span>
                </div>
              </div>

              {/* Card 3: Integrantes Cadastrados */}
              <div className="card-metrica-admin">
                <div className="metrica-header">
                  <span className="metrica-titulo">Integrantes na Base</span>
                  <div className="metrica-icone purple">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                </div>
                <div className="metrica-valor">{totalIntegrantesCadastrados}</div>
                <div className="metrica-rodape">
                  <span>Músicos e equipe técnica</span>
                </div>
              </div>

              {/* Card 4: Solicitações Pendentes (Destaque Amarelo/Laranja) */}
              <div className="card-metrica-admin card-pendentes-destaque">
                <div className="metrica-header">
                  <span className="metrica-titulo">Solicitações Pendentes</span>
                  <div className="metrica-icone orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                </div>
                <div className="metrica-valor texto-laranja">{totalSolicitacoesLideresPendentes}</div>
                <div className="metrica-rodape">
                  <span className="destaque-laranja">Aguardando homologação</span>
                </div>
              </div>
            </section>

            {/* SEÇÃO PRINCIPAL DE DESTAQUE: ANÁLISE E APROVAÇÃO DE NOVOS LÍDERES E IGREJAS */}
            <section className="secao-solicitacoes-destaque">
              <div className="secao-cabecalho-linha">
                <div className="secao-cabecalho-texto">
                  <div className="titulo-com-tag">
                    <h2>Análise e Aprovação de Novos Líderes & Igrejas</h2>
                    {totalSolicitacoesLideresPendentes > 0 && (
                      <span className="badge-tag-alerta">
                        {totalSolicitacoesLideresPendentes} pendente{totalSolicitacoesLideresPendentes > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="secao-subtitulo">
                    Controle de admissão de novas congregações. Avalie os pedidos e evite duplicidades no sistema.
                  </p>
                </div>

                {/* Filtros em Pill */}
                <div className="filtros-solicitacao-pills">
                  <button
                    type="button"
                    className={`btn-pill-filtro ${filtroSolicitacoes === 'pendente' ? 'ativo' : ''}`}
                    onClick={() => setFiltroSolicitacoes('pendente')}
                  >
                    <span>Pendentes</span>
                    <span className="contador-mini">{solicitacoesLideres.filter(s => s.status === 'pendente').length}</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-pill-filtro ${filtroSolicitacoes === 'aprovado' ? 'ativo' : ''}`}
                    onClick={() => setFiltroSolicitacoes('aprovado')}
                  >
                    <span>Aprovadas</span>
                    <span className="contador-mini">{solicitacoesLideres.filter(s => s.status === 'aprovado').length}</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-pill-filtro ${filtroSolicitacoes === 'todos' ? 'ativo' : ''}`}
                    onClick={() => setFiltroSolicitacoes('todos')}
                  >
                    <span>Todas ({solicitacoesLideres.length})</span>
                  </button>
                </div>
              </div>

              {/* Lista / Tabela das Solicitações */}
              {solicitacoesFiltradas.length === 0 ? (
                <div className="card-estado-vazio">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <h3>Nenhuma solicitação encontrada</h3>
                  <p>Não há pedidos no filtro selecionado no momento.</p>
                </div>
              ) : (
                <div className="grade-cards-solicitacoes">
                  {solicitacoesFiltradas.map((sol) => (
                    <div key={sol.id} className={`card-solicitacao-admin ${sol.status}`}>
                      <div className="card-sol-topo">
                        <div className="sol-dados-principais">
                          <div className="sol-avatar-lider">
                            {sol.nome.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="sol-nome-solicitante">{sol.nome}</h3>
                            <span className="sol-contato-linha">
                              {sol.email} • {sol.telefone || 'Sem telefone'}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="sol-status-badge-wrapper">
                          {sol.status === 'pendente' && (
                            <span className="tag-status-sol pendente">Aguardando Análise</span>
                          )}
                          {sol.status === 'aprovado' && (
                            <span className="tag-status-sol aprovado">Homologado</span>
                          )}
                          {sol.status === 'recusado' && (
                            <span className="tag-status-sol recusado">Recusado</span>
                          )}
                        </div>
                      </div>

                      {/* Dados da Congregação Solicitada */}
                      <div className="sol-box-igreja">
                        <div className="linha-info-igreja">
                          <span className="rotulo-campo">Congregação Solicitada:</span>
                          <strong className="valor-campo">{sol.nomeIgreja}</strong>
                        </div>
                        <div className="linha-info-igreja">
                          <span className="rotulo-campo">Cidade / Estado:</span>
                          <span className="valor-campo">{sol.cidadeIgreja || 'Não especificada'}</span>
                        </div>
                        {sol.observacao && (
                          <div className="linha-observacao">
                            <span className="rotulo-campo">Mensagem do Solicitante:</span>
                            <p>"{sol.observacao}"</p>
                          </div>
                        )}
                        <span className="data-solicitacao-texto">Solicitado em: {sol.dataSolicitacao}</span>
                      </div>

                      {/* Ações do Administrador */}
                      {sol.status === 'pendente' ? (
                        <div className="sol-acoes-admin">
                          <button
                            type="button"
                            className="btn-acao-admin aprovar"
                            onClick={() => {
                              setModalAprovacao(sol)
                              setTipoVinculoIgreja('nova')
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Aprovar & Homologar</span>
                          </button>

                          <button
                            type="button"
                            className="btn-acao-admin recusar"
                            onClick={() => setModalRecusa(sol)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            <span>Recusar</span>
                          </button>
                        </div>
                      ) : (
                        <div className="sol-rodape-concluido">
                          {sol.status === 'aprovado' ? (
                            <span className="info-concluida aprovada">
                              ✓ Líder homologado e congregação vinculada.
                            </span>
                          ) : (
                            <span className="info-concluida recusada">
                              ✕ Pedido arquivado sem liberação de acesso.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ================================================================
            ABA: IGREJAS CADASTRADAS
            ================================================================ */}
        {abaAtiva === 'igrejas' && (
          <div className="painel-igrejas-secao">
            <div className="secao-topo-controles">
              <div>
                <h2>Congregações Cadastradas ({igrejas.length})</h2>
                <p className="secao-subtitulo">Gerencie as igrejas que utilizam a plataforma LouvorApp.</p>
              </div>

              <div className="controles-direita">
                <div className="input-busca-igreja">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={buscaIgreja}
                    onChange={(e) => setBuscaIgreja(e.target.value)}
                    placeholder="Pesquisar congregação, cidade ou líder..."
                  />
                </div>

                <button
                  type="button"
                  className="btn-adicionar-igreja"
                  onClick={() => setModalNovaIgreja(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Nova Congregação</span>
                </button>
              </div>
            </div>

            {/* Tabela de Igrejas */}
            <div className="tabela-container-card">
              <table className="tabela-admin">
                <thead>
                  <tr>
                    <th>Congregação</th>
                    <th>Cidade / UF</th>
                    <th>Líder de Louvor Responsável</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {igrejasFiltradas.map((igreja) => (
                    <tr key={igreja.id}>
                      <td>
                        <div className="celula-igreja-nome">
                          <div className="icone-igreja-mini">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 21h18M3 7v14M21 7v14M6 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
                            </svg>
                          </div>
                          <strong>{igreja.nome}</strong>
                        </div>
                      </td>
                      <td>{igreja.cidade}</td>
                      <td>
                        <span className="celula-lider">
                          {igreja.lider || 'Sem líder atribuído'}
                        </span>
                      </td>
                      <td>
                        {igreja.ativa !== false ? (
                          <span className="badge-status-tabela ativa">Ativa</span>
                        ) : (
                          <span className="badge-status-tabela inativa">Inativa / Suspensa</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="botoes-tabela-acoes">
                          <button
                            type="button"
                            className="btn-tabela-acao editar"
                            title="Editar dados"
                            onClick={() => setIgrejaEditando({ ...igreja })}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className={`btn-tabela-acao ${igreja.ativa !== false ? 'desativar' : 'ativar'}`}
                            title={igreja.ativa !== false ? 'Suspender congregação' : 'Reativar congregação'}
                            onClick={() => alternarStatusIgreja(igreja.id)}
                          >
                            {igreja.ativa !== false ? 'Desativar' : 'Ativar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================================================================
            ABA: LÍDERES APROVADOS
            ================================================================ */}
        {abaAtiva === 'lideres' && (
          <div className="painel-lideres-secao">
            <div className="secao-cabecalho-texto">
              <h2>Líderes de Louvor Aprovados</h2>
              <p className="secao-subtitulo">
                Ministros com permissão para gerenciar equipes musicais e escalas nas suas respectivas igrejas.
              </p>
            </div>

            <div className="grade-cards-lideres">
              {igrejas.map((igreja) => (
                <div key={igreja.id} className="card-lider-gestor">
                  <div className="lider-card-topo">
                    <div className="avatar-lider-circulo">
                      {(igreja.lider || 'LD').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="lider-card-info">
                      <strong>{igreja.lider || 'Sem líder atribuído'}</strong>
                      <span className="cargo-lider-tag">Líder Homologado</span>
                    </div>
                  </div>

                  <div className="lider-vinculo-box">
                    <span className="rotulo-campo">Igreja Vinculada:</span>
                    <strong>{igreja.nome}</strong>
                    <span className="sub-cidade">{igreja.cidade}</span>
                  </div>

                  <div className="lider-acoes-rodape">
                    <button
                      type="button"
                      className="btn-revogar-lideranca"
                      onClick={() => {
                        revogarLiderancaIgreja(igreja.id)
                        mostrarFeedback(`Liderança da ${igreja.nome} foi desvinculada.`)
                      }}
                    >
                      Revogar Liderança
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            ABA: INTEGRANTES DA BASE
            ================================================================ */}
        {abaAtiva === 'integrantes' && (
          <div className="painel-integrantes-secao">
            <div className="secao-topo-controles">
              <div>
                <h2>Base Geral de Usuários & Integrantes ({integrantesFiltrados.length})</h2>
                <p className="secao-subtitulo">
                  Visualização consolidada de todos os usuários cadastrados. Você pode pesquisar e excluir perfis permanentemente do banco de dados.
                </p>
              </div>

              <div className="controles-direita">
                <div className="input-busca-igreja">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={buscaIntegrante}
                    onChange={(e) => setBuscaIntegrante(e.target.value)}
                    placeholder="Pesquisar por nome, e-mail ou função..."
                  />
                </div>
              </div>
            </div>

            <div className="tabela-container-card">
              <table className="tabela-admin">
                <thead>
                  <tr>
                    <th>Nome do Usuário</th>
                    <th>E-mail</th>
                    <th>Função Musical</th>
                    <th>Naipe</th>
                    <th>Tipo de Conta</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {integrantesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                        Nenhum usuário encontrado para a busca informada.
                      </td>
                    </tr>
                  ) : (
                    integrantesFiltrados.map((membro) => (
                      <tr key={membro.id}>
                        <td>
                          <strong>{membro.nome}</strong>
                        </td>
                        <td>{membro.email || 'Não informado'}</td>
                        <td>{membro.funcao}</td>
                        <td>
                          <span className="badge-naipe-tabela">{membro.naipe}</span>
                        </td>
                        <td>
                          <span className={`badge-tipo-conta ${membro.tipoConta || 'voluntario'}`}>
                            {membro.tipoConta === 'admin' ? 'Administrador' : membro.tipoConta === 'lider' ? 'Líder' : 'Voluntário'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-status-tabela ${membro.status === 'confirmado' || membro.status === 'aprovado' ? 'ativa' : 'inativa'}`}>
                            {membro.status === 'confirmado' || membro.status === 'aprovado' ? 'Ativo' : membro.status || 'Pendente'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {membro.id === usuario?.id ? (
                            <span className="badge-admin-atual" title="Sua conta atual de administrador">
                              Você (Admin)
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-tabela-acao excluir-usuario"
                              title={`Excluir perfil de ${membro.nome} do banco de dados`}
                              onClick={() => setModalExcluirUsuario(membro)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '13px', height: '13px' }}>
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                              <span>Excluir Perfil</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          MODAL: APROVAÇÃO & HOMOLOGAÇÃO DE NOVO LÍDER
          ==================================================================== */}
      {modalAprovacao && (
        <div className="modal-admin-backdrop" onClick={() => setModalAprovacao(null)}>
          <div className="modal-admin-caixa" onClick={(e) => e.stopPropagation()}>
            <div className="modal-admin-header">
              <div>
                <h3>Aprovar Solicitação de Liderança</h3>
                <p className="modal-admin-sub">Homologação de <strong>{modalAprovacao.nome}</strong></p>
              </div>
              <button className="btn-fechar-admin" onClick={() => setModalAprovacao(null)}>✕</button>
            </div>

            <div className="corpo-modal-aprovacao">
              <div className="resumo-solicitante-box">
                <div className="item-resumo">
                  <span className="resumo-rotulo">Líder Solicitante:</span>
                  <strong>{modalAprovacao.nome}</strong>
                </div>
                <div className="item-resumo">
                  <span className="resumo-rotulo">E-mail:</span>
                  <span>{modalAprovacao.email}</span>
                </div>
                <div className="item-resumo">
                  <span className="resumo-rotulo">Telefone / WhatsApp:</span>
                  <span>{modalAprovacao.telefone || 'Não informado'}</span>
                </div>
              </div>

              {/* Escolha: Nova Igreja vs Igreja Existente (Regra Anti-Duplicação) */}
              <div className="secao-escolha-vinculo">
                <label className="label-destaque">Defina o vínculo da congregação:</label>
                
                <div className="opcoes-vinculo-grid">
                  <label className={`card-radio-vinculo ${tipoVinculoIgreja === 'nova' ? 'selecionado' : ''}`}>
                    <input
                      type="radio"
                      name="tipoVinculo"
                      value="nova"
                      checked={tipoVinculoIgreja === 'nova'}
                      onChange={() => setTipoVinculoIgreja('nova')}
                    />
                    <div className="radio-texto">
                      <strong>Cadastrar como Nova Igreja</strong>
                      <span>{modalAprovacao.nomeIgreja} ({modalAprovacao.cidadeIgreja})</span>
                    </div>
                  </label>

                  <label className={`card-radio-vinculo ${tipoVinculoIgreja === 'existente' ? 'selecionado' : ''}`}>
                    <input
                      type="radio"
                      name="tipoVinculo"
                      value="existente"
                      checked={tipoVinculoIgreja === 'existente'}
                      onChange={() => setTipoVinculoIgreja('existente')}
                    />
                    <div className="radio-texto">
                      <strong>Vincular a uma Igreja Já Existente</strong>
                      <span>Evita criar cadastros duplicados no sistema</span>
                    </div>
                  </label>
                </div>

                {tipoVinculoIgreja === 'existente' && (
                  <div className="select-igreja-wrapper">
                    <label htmlFor="select-igreja-admin">Selecione a congregação existente:</label>
                    <select
                      id="select-igreja-admin"
                      value={igrejaExistenteId}
                      onChange={(e) => setIgrejaExistenteId(e.target.value)}
                      className="select-admin-custom"
                    >
                      {igrejas.map((ig) => (
                        <option key={ig.id} value={ig.id}>
                          {ig.nome} — {ig.cidade} (Atual: {ig.lider})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-admin-rodape">
              <button
                type="button"
                className="btn-confirmar-aprovacao"
                onClick={handleConfirmarAprovacao}
              >
                Conceder Acesso de Líder & Homologar
              </button>
              <button
                type="button"
                className="btn-cancelar-admin"
                onClick={() => setModalAprovacao(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: RECUSAR SOLICITAÇÃO
          ==================================================================== */}
      {modalRecusa && (
        <div className="modal-admin-backdrop" onClick={() => setModalRecusa(null)}>
          <div className="modal-admin-caixa" onClick={(e) => e.stopPropagation()}>
            <div className="modal-admin-header">
              <h3>Recusar Solicitação de Líder</h3>
              <button className="btn-fechar-admin" onClick={() => setModalRecusa(null)}>✕</button>
            </div>

            <p className="texto-aviso-recusa">
              Você está prestes a recusar a solicitação de liderança de <strong>{modalRecusa.nome}</strong> para a igreja <strong>{modalRecusa.nomeIgreja}</strong>.
            </p>

            <div className="form-campo-admin">
              <label htmlFor="motivo-recusa-input">Motivo da recusa (opcional):</label>
              <textarea
                id="motivo-recusa-input"
                value={motivoRecusa}
                onChange={(e) => setMotivoRecusa(e.target.value)}
                placeholder="Ex: Dados cadastrais inconsistentes ou congregação não autorizada..."
                rows={3}
                className="textarea-admin-custom"
              />
            </div>

            <div className="modal-admin-rodape">
              <button
                type="button"
                className="btn-confirmar-recusa"
                onClick={handleConfirmarRecusa}
              >
                Confirmar Recusa
              </button>
              <button
                type="button"
                className="btn-cancelar-admin"
                onClick={() => setModalRecusa(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: CADASTRAR NOVA IGREJA DIRETAMENTE
          ==================================================================== */}
      {modalNovaIgreja && (
        <div className="modal-admin-backdrop" onClick={() => setModalNovaIgreja(false)}>
          <div className="modal-admin-caixa" onClick={(e) => e.stopPropagation()}>
            <div className="modal-admin-header">
              <h3>Cadastrar Nova Congregação</h3>
              <button className="btn-fechar-admin" onClick={() => setModalNovaIgreja(false)}>✕</button>
            </div>

            <form onSubmit={handleCriarIgrejaSubmit} className="form-modal-admin">
              <div className="form-campo-admin">
                <label htmlFor="nome-igreja-novo">Nome da Congregação / Campus *</label>
                <input
                  id="nome-igreja-novo"
                  type="text"
                  value={novaIgrejaNome}
                  onChange={(e) => setNovaIgrejaNome(e.target.value)}
                  placeholder="Ex: Cruz Church — Campus Oeste"
                  required
                />
              </div>

              <div className="form-campo-admin">
                <label htmlFor="cidade-igreja-novo">Cidade / Estado *</label>
                <input
                  id="cidade-igreja-novo"
                  type="text"
                  value={novaIgrejaCidade}
                  onChange={(e) => setNovaIgrejaCidade(e.target.value)}
                  placeholder="Ex: Bauru - SP"
                  required
                />
              </div>

              <div className="form-campo-admin">
                <label htmlFor="lider-igreja-novo">Líder de Louvor Responsável</label>
                <input
                  id="lider-igreja-novo"
                  type="text"
                  value={novaIgrejaLider}
                  onChange={(e) => setNovaIgrejaLider(e.target.value)}
                  placeholder="Ex: Pr. Daniel Souza (ou deixe em branco)"
                />
              </div>

              <div className="modal-admin-rodape">
                <button type="submit" className="btn-confirmar-aprovacao">
                  Cadastrar Congregação
                </button>
                <button
                  type="button"
                  className="btn-cancelar-admin"
                  onClick={() => setModalNovaIgreja(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EDITAR DADOS DA IGREJA
          ==================================================================== */}
      {igrejaEditando && (
        <div className="modal-admin-backdrop" onClick={() => setIgrejaEditando(null)}>
          <div className="modal-admin-caixa" onClick={(e) => e.stopPropagation()}>
            <div className="modal-admin-header">
              <h3>Editar Dados da Congregação</h3>
              <button className="btn-fechar-admin" onClick={() => setIgrejaEditando(null)}>✕</button>
            </div>

            <form onSubmit={handleSalvarEdicaoIgreja} className="form-modal-admin">
              <div className="form-campo-admin">
                <label htmlFor="edit-igreja-nome">Nome da Congregação *</label>
                <input
                  id="edit-igreja-nome"
                  type="text"
                  value={igrejaEditando.nome}
                  onChange={(e) => setIgrejaEditando({ ...igrejaEditando, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-campo-admin">
                <label htmlFor="edit-igreja-cidade">Cidade / Estado *</label>
                <input
                  id="edit-igreja-cidade"
                  type="text"
                  value={igrejaEditando.cidade}
                  onChange={(e) => setIgrejaEditando({ ...igrejaEditando, cidade: e.target.value })}
                  required
                />
              </div>

              <div className="form-campo-admin">
                <label htmlFor="edit-igreja-lider">Líder Responsável</label>
                <input
                  id="edit-igreja-lider"
                  type="text"
                  value={igrejaEditando.lider}
                  onChange={(e) => setIgrejaEditando({ ...igrejaEditando, lider: e.target.value })}
                />
              </div>

              <div className="modal-admin-rodape">
                <button type="submit" className="btn-confirmar-aprovacao">
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  className="btn-cancelar-admin"
                  onClick={() => setIgrejaEditando(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EXCLUSÃO PERMANENTE DE PERFIL DO BANCO DE DADOS
          ==================================================================== */}
      {modalExcluirUsuario && (
        <div className="modal-admin-backdrop" onClick={() => !excluindoUsuario && setModalExcluirUsuario(null)}>
          <div className="modal-admin-caixa modal-exclusao-usuario" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-admin-header" style={{ borderBottomColor: '#fecaca' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626'
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#991b1b', fontSize: '1.05rem' }}>Excluir Perfil de Usuário</h3>
                  <p className="modal-admin-sub" style={{ margin: '2px 0 0 0' }}>Exclusão permanente do banco de dados</p>
                </div>
              </div>
              <button className="btn-fechar-admin" disabled={excluindoUsuario} onClick={() => setModalExcluirUsuario(null)}>✕</button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ margin: '0 0 14px 0', fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                Tem certeza que deseja excluir o perfil de <strong>{modalExcluirUsuario.nome}</strong>?
              </p>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '0.84rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>E-mail:</span>
                  <strong style={{ color: '#0f172a' }}>{modalExcluirUsuario.email || 'Não informado'}</strong>
                </div>
                {modalExcluirUsuario.funcao && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Função:</span>
                    <strong style={{ color: '#0f172a' }}>{modalExcluirUsuario.funcao}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Identificador (ID):</span>
                  <code style={{ fontSize: '0.75rem', color: '#475569' }}>
                    {typeof modalExcluirUsuario.id === 'string' ? modalExcluirUsuario.id.substring(0, 13) + '...' : modalExcluirUsuario.id}
                  </code>
                </div>
              </div>

              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '0.82rem',
                color: '#991b1b',
                lineHeight: 1.45
              }}>
                <strong>Atenção:</strong> Esta ação é irreversível. O perfil será apagado automaticamente da tabela de perfis do Supabase e removerá todas as solicitações e vínculos deste usuário.
              </div>
            </div>

            <div className="modal-admin-rodape" style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                className="btn-cancelar-admin"
                disabled={excluindoUsuario}
                onClick={() => setModalExcluirUsuario(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={excluindoUsuario}
                onClick={handleConfirmarExclusaoUsuario}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: excluindoUsuario ? 'not-allowed' : 'pointer',
                  opacity: excluindoUsuario ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {excluindoUsuario ? (
                  <>
                    <span className="spinner-aguardando" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }}></span>
                    <span>Excluindo do banco...</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
