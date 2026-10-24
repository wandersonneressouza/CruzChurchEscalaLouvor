import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { CATEGORIAS_MUSICAIS } from '../../constants/categoriasMusicais'
import './Mais.css'

function Mais() {
  const navigate = useNavigate()
  const {
    usuario,
    equipeMembros,
    solicitacoesVoluntarios,
    totalSolicitacoesPendentes,
    totalSolicitacoesLideresPendentes,
    aprovarVoluntario,
    recusarVoluntario,
    alterarCategoriaIntegrante,
    revogarAcessoIntegrante,
    atualizarMinhaFuncao,
    alternarPerfilVisual,
    logout,
    toggleDisponibilidade,
    toggleNotificacoes,
    toggleTemaEscuro,
    pedidosTroca,
    totalTrocasPendentes,
    responderPedidoTroca
  } = useAppContext()

  const [modalAtivo, setModalAtivo] = useState(null) // 'equipe' | 'trocas' | 'equipamentos' | 'manual' | 'meu_perfil' | 'simulador' | 'sair' | null
  const [abaEquipe, setAbaEquipe] = useState('membros') // 'membros' | 'solicitacoes'

  // Edição de categoria musical de um membro pelo líder
  const [membroEditando, setMembroEditando] = useState(null)
  const [novaFuncaoMembro, setNovaFuncaoMembro] = useState('')

  // Confirmação de revogação de acesso
  const [membroRevogando, setMembroRevogando] = useState(null)

  // Edição de função no próprio perfil
  const [minhaFuncao, setMinhaFuncao] = useState(usuario?.funcao || 'Vocal Líder')
  const [feedbackPerfil, setFeedbackPerfil] = useState(false)

  // Filtro de solicitações pendentes da igreja do líder
  const solicitacoesPendentesIgreja = solicitacoesVoluntarios.filter(
    s => s.status === 'pendente' && s.igrejaId === (usuario?.igrejaId || 1)
  )

  const pedidoLucas = pedidosTroca[0] || { status: 'pendente' }
  const pedidoRespondido = pedidoLucas.status !== 'pendente'

  const ehLider = usuario?.tipoConta === 'lider' || usuario?.cargo?.toLowerCase().includes('líder')
  const iniciaisAvatar = usuario?.nome
    ? usuario.nome.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'AN'

  // Checklist de Equipamentos do Altar
  const checklistEquipamentos = [
    { item: 'Mesa Behringer X32', setor: 'Som', status: 'OK' },
    { item: '4 Fones In-Ear KZ Pro (Banda)', setor: 'Retorno', status: 'OK' },
    { item: 'Microfones Sem Fio Shure SM58 (3x)', setor: 'Vocal', status: 'OK' },
    { item: 'Direct Boxes Passivos (5x)', setor: 'Palco', status: 'OK' },
    { item: 'Teclado Roland Juno DS + Fonte', setor: 'Teclado', status: 'OK' },
    { item: 'Cabos XLR Balanceados de Reserva (4x)', setor: 'Acessórios', status: 'Verificar' }
  ]

  // Salvar alteração de categoria feita pelo líder
  function handleSalvarFuncaoMembro(e) {
    e.preventDefault()
    if (!membroEditando || !novaFuncaoMembro) return
    alterarCategoriaIntegrante(membroEditando.id, novaFuncaoMembro)
    setMembroEditando(null)
    setNovaFuncaoMembro('')
  }

  // Executar revogação de acesso
  function handleConfirmarRevogacao() {
    if (!membroRevogando) return
    revogarAcessoIntegrante(membroRevogando.id)
    setMembroRevogando(null)
  }

  // Salvar função no perfil pessoal do próprio integrante
  function handleSalvarMinhaFuncao(e) {
    e.preventDefault()
    atualizarMinhaFuncao(minhaFuncao)
    setFeedbackPerfil(true)
    setTimeout(() => {
      setFeedbackPerfil(false)
      setModalAtivo(null)
    }, 1500)
  }

  return (
    <div id="tela-mais">
      {/* Conteúdo com rolagem */}
      <div className="mais-scroll-content">
        {/* Topo / Header */}
        <header className="mais-header">
          <Link to="/" className="btn-voltar" aria-label="Voltar para o Início">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h2>Mais Opções</h2>
          <div className="placeholder-btn"></div>
        </header>

        {/* Card do Perfil do Ministro */}
        <section className="card-perfil-usuario" onClick={() => setModalAtivo('meu_perfil')}>
          <div className="perfil-avatar-wrapper">
            <div className="avatar-circulo">
              <span>{iniciaisAvatar}</span>
            </div>
            <span className="badge-online"></span>
          </div>
          <div className="perfil-info">
            <div className="perfil-nome-row">
              <h3>{usuario?.nome || 'Anderson Neres'}</h3>
              <span className="badge-cargo">{usuario?.cargo || (ehLider ? 'Líder' : 'Voluntário')}</span>
            </div>
            <p className="perfil-funcao">{usuario?.funcao || 'Ministro de Louvor'}</p>
            <span className="perfil-campus">{usuario?.campus || 'Cruz Church • Campus Central'}</span>
          </div>
          <button type="button" className="btn-editar-perfil-atalho" title="Editar Perfil">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </section>

        {/* Card de Minha Disponibilidade */}
        <section className="card-disponibilidade">
          <div className="disponibilidade-texto">
            <div className="disp-titulo-row">
              <svg viewBox="0 0 24 24" fill="none" stroke={usuario?.disponivel ? '#10b981' : '#f59e0b'} strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <h4>Disponível para escalas</h4>
            </div>
            <p className="disp-sub">
              {usuario?.disponivel
                ? 'Você está elegível para escalas de cultos e ensaios.'
                : 'Você marcou indisponibilidade temporária neste mês.'}
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={!!usuario?.disponivel}
              onChange={toggleDisponibilidade}
            />
            <span className="slider"></span>
          </label>
        </section>

        {/* GRUPO 1: GESTÃO DO MINISTÉRIO */}
        <section className="grupo-menu">
          <h4 className="grupo-titulo">Gestão do Ministério</h4>
          <div className="cards-lista-menu">
            {/* Painel do Administrador Geral (Exibido para Admin) */}
            {(usuario?.tipoConta === 'admin' || usuario?.cargo === 'ADMIN') && (
              <Link to="/admin" className="menu-item-card" style={{ borderLeft: '4px solid #2563eb', background: '#f8fafc' }}>
                <div className="menu-icon-wrapper" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="9" />
                    <rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="12" width="7" height="9" />
                    <rect x="3" y="16" width="7" height="5" />
                  </svg>
                </div>
                <div className="menu-item-info">
                  <div className="menu-item-titulo-row">
                    <span className="menu-item-titulo" style={{ color: '#1e40af', fontWeight: 700 }}>Painel ADMIN Geral</span>
                    <span className="badge-alerta-menu" style={{ backgroundColor: '#2563eb' }}>ADMIN</span>
                  </div>
                  <span className="menu-item-sub">Homologações, congregações e líderes</span>
                </div>
                <svg className="menu-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            )}

            {/* Equipe e Voluntários */}
            <button
              className="menu-item-card"
              onClick={() => {
                setAbaEquipe(solicitacoesPendentesIgreja.length > 0 && ehLider ? 'solicitacoes' : 'membros')
                setModalAtivo('equipe')
              }}
            >
              <div className="menu-icon-wrapper blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="menu-item-info">
                <div className="menu-item-titulo-row">
                  <span className="menu-item-titulo">Equipe & Integrantes</span>
                  {solicitacoesPendentesIgreja.length > 0 && ehLider && (
                    <span className="badge-alerta-menu">{solicitacoesPendentesIgreja.length} novo(s)</span>
                  )}
                </div>
                <span className="menu-item-sub">
                  {equipeMembros.length} membros ativos
                  {solicitacoesPendentesIgreja.length > 0 ? ` • ${solicitacoesPendentesIgreja.length} solicitação pendente` : ''}
                </span>
              </div>
              <svg className="menu-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Trocas e Substituições */}
            <button
              className="menu-item-card"
              onClick={() => setModalAtivo('trocas')}
            >
              <div className="menu-icon-wrapper orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <polyline points="23 20 23 14 17 14" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </div>
              <div className="menu-item-info">
                <div className="menu-item-titulo-row">
                  <span className="menu-item-titulo">Trocas de Escala</span>
                  {totalTrocasPendentes > 0 && (
                    <span className="badge-alerta-menu">{totalTrocasPendentes} pendente</span>
                  )}
                </div>
                <span className="menu-item-sub">Solicitações de substituição</span>
              </div>
              <svg className="menu-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Área Técnica e Equipamentos */}
            <button
              className="menu-item-card"
              onClick={() => setModalAtivo('equipamentos')}
            >
              <div className="menu-icon-wrapper purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <div className="menu-item-info">
                <span className="menu-item-titulo">Área Técnica & Palco</span>
                <span className="menu-item-sub">Checklist de mesa, fones e cabos</span>
              </div>
              <svg className="menu-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Painel do Administrador Geral */}
            <Link to="/admin" className="menu-item-card">
              <div className="menu-icon-wrapper blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="menu-item-info">
                <div className="menu-item-titulo-row">
                  <span className="menu-item-titulo">Painel ADMIN Geral</span>
                  {totalSolicitacoesLideresPendentes > 0 && (
                    <span className="badge-alerta-menu">{totalSolicitacoesLideresPendentes} pendente(s)</span>
                  )}
                </div>
                <span className="menu-item-sub">Homologação de líderes e congregações</span>
              </div>
              <svg className="menu-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* GRUPO 2: RECURSOS E MATERIAIS */}
        <section className="grupo-menu">
          <h4 className="grupo-titulo">Recursos & Apoio</h4>
          <div className="cards-lista-menu">
            {/* Manual do Louvor */}
            <button
              className="menu-item-card"
              onClick={() => setModalAtivo('manual')}
            >
              <div className="menu-icon-wrapper teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="menu-item-info">
                <span className="menu-item-titulo">Manual & Regimento</span>
                <span className="menu-item-sub">Pontualidade, vestimenta e ensaios</span>
              </div>
              <svg className="menu-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Cifras e Links */}
            <Link to="/musicas" className="menu-item-card">
              <div className="menu-icon-wrapper green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div className="menu-item-info">
                <span className="menu-item-titulo">Repertório & Cifras</span>
                <span className="menu-item-sub">Acesso rápido aos tons e letras</span>
              </div>
              <svg className="menu-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* GRUPO 3: CONFIGURAÇÕES E SISTEMA */}
        <section className="grupo-menu">
          <h4 className="grupo-titulo">Configurações & Perfil</h4>
          <div className="cards-lista-menu">
            {/* Meu Perfil & Função Musical */}
            <button
              className="menu-item-card"
              onClick={() => {
                setMinhaFuncao(usuario?.funcao || 'Vocal Líder')
                setModalAtivo('meu_perfil')
              }}
            >
              <div className="menu-icon-wrapper blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="menu-item-info">
                <span className="menu-item-titulo">Minha Função Musical</span>
                <span className="menu-item-sub">{usuario?.funcao || 'Definir instrumento/voz'}</span>
              </div>
              <svg className="menu-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Alternar Perfil de Teste (Simulador) */}
            <button
              className="menu-item-card"
              onClick={() => setModalAtivo('simulador')}
            >
              <div className="menu-icon-wrapper purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
              </div>
              <div className="menu-item-info">
                <span className="menu-item-titulo">Simulador de Permissões</span>
                <span className="menu-item-sub">Testar como Líder ou Voluntário</span>
              </div>
              <svg className="menu-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Notificações */}
            <div className="menu-item-card item-toggle">
              <div className="menu-icon-wrapper blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div className="menu-item-info">
                <span className="menu-item-titulo">Lembretes de Escala</span>
                <span className="menu-item-sub">Avisos 24h antes dos cultos</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={!!usuario?.notificacoes}
                  onChange={toggleNotificacoes}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Tema Escuro */}
            <div className="menu-item-card item-toggle">
              <div className="menu-icon-wrapper gray">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
              <div className="menu-item-info">
                <span className="menu-item-titulo">Modo Noturno</span>
                <span className="menu-item-sub">Ajuste de contraste escuro</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={!!usuario?.temaEscuro}
                  onChange={toggleTemaEscuro}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* Sair da Conta */}
            <button
              className="menu-item-card card-sair"
              onClick={() => setModalAtivo('sair')}
            >
              <div className="menu-icon-wrapper red">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <div className="menu-item-info">
                <span className="menu-item-titulo text-danger">Encerrar Sessão</span>
                <span className="menu-item-sub">Sair da conta neste dispositivo</span>
              </div>
            </button>
          </div>
        </section>

        {/* Rodapé Informativo */}
        <div className="mais-rodape-versao">
          <span>Cruz Church • Sistema de Escalas de Louvor</span>
          <span className="versao-texto">Versão 1.1.0 • Gestão de Acessos & Integrantes</span>
        </div>
      </div>

      {/* ====================================================================
          MODAL: EQUIPE & GERENCIAMENTO DE INTEGRANTES (COM ABAS E CONTROLE)
          ==================================================================== */}
      {modalAtivo === 'equipe' && (
        <div className="modal-backdrop" onClick={() => setModalAtivo(null)}>
          <div className="modal-sheet modal-equipe-expandido" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator"></div>
            <div className="modal-header">
              <div>
                <h3>Gestão de Integrantes</h3>
                <span className="modal-sub-campus">{usuario?.campus || 'Cruz Church — Campus Central'}</span>
              </div>
              <button className="btn-fechar-modal" onClick={() => setModalAtivo(null)}>✕</button>
            </div>

            {/* Seletor de Abas: Membros Ativos vs Solicitações Pendentes */}
            <div className="modal-abas-equipe">
              <button
                type="button"
                className={`btn-aba-equipe ${abaEquipe === 'membros' ? 'ativo' : ''}`}
                onClick={() => setAbaEquipe('membros')}
              >
                <span>Membros Ativos ({equipeMembros.length})</span>
              </button>
              <button
                type="button"
                className={`btn-aba-equipe ${abaEquipe === 'solicitacoes' ? 'ativo' : ''}`}
                onClick={() => setAbaEquipe('solicitacoes')}
              >
                <span>Solicitações Pendentes</span>
                {solicitacoesPendentesIgreja.length > 0 && (
                  <span className="badge-aba-contador">{solicitacoesPendentesIgreja.length}</span>
                )}
              </button>
            </div>

            {/* ABA 1: MEMBROS ATIVOS */}
            {abaEquipe === 'membros' && (
              <div className="conteudo-aba-equipe">
                <div className="equipe-lista-modal">
                  {equipeMembros.map((membro) => (
                    <div key={membro.id} className="equipe-item-card-gerenciamento">
                      <div className="equipe-avatar">
                        <span>{membro.avatar || membro.nome.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <div className="equipe-dados">
                        <span className="equipe-nome">{membro.nome}</span>
                        <div className="equipe-funcao-linha">
                          <span className="equipe-cargo">{membro.funcao}</span>
                          <span className="badge-naipe">{membro.naipe}</span>
                        </div>
                        {membro.email && (
                          <span className="equipe-email-sub">{membro.email}</span>
                        )}
                      </div>

                      {/* Ações do Líder para cada membro */}
                      {ehLider && (
                        <div className="equipe-acoes-lider">
                          <button
                            type="button"
                            className="btn-acao-membro editar"
                            title="Alterar Função Musical"
                            onClick={() => {
                              setMembroEditando(membro)
                              setNovaFuncaoMembro(membro.funcao)
                            }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                            <span>Função</span>
                          </button>

                          {membro.id !== usuario?.id && (
                            <button
                              type="button"
                              className="btn-acao-membro revogar"
                              title="Revogar Acesso à Igreja"
                              onClick={() => setMembroRevogando(membro)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                              </svg>
                              <span>Revogar</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABA 2: PEDIDOS PENDENTES DE VOLUNTÁRIOS */}
            {abaEquipe === 'solicitacoes' && (
              <div className="conteudo-aba-equipe">
                {solicitacoesPendentesIgreja.length === 0 ? (
                  <div className="estado-vazio-solicitacoes">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <h4>Tudo em dia!</h4>
                    <p>Não há novas solicitações de voluntários aguardando aprovação para sua igreja.</p>
                  </div>
                ) : (
                  <div className="solicitacoes-lista-cards">
                    {solicitacoesPendentesIgreja.map((sol) => (
                      <div key={sol.id} className="card-solicitacao-voluntario">
                        <div className="sol-cabecalho">
                          <div className="sol-avatar">
                            {sol.nome.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="sol-info-pessoal">
                            <strong className="sol-nome">{sol.nome}</strong>
                            <span className="sol-email">{sol.email}</span>
                            {sol.telefone && (
                              <span className="sol-telefone">{sol.telefone}</span>
                            )}
                          </div>
                          <span className="tag-aguardando-mini">Aguardando</span>
                        </div>

                        <div className="sol-detalhe-funcao">
                          <div className="sol-funcao-box">
                            <span className="rotulo-sol">Função Solicitada:</span>
                            <span className="valor-sol">{sol.funcao}</span>
                          </div>
                          <span className="badge-naipe-sol">{sol.naipe}</span>
                        </div>

                        {ehLider ? (
                          <div className="sol-botoes-decisao">
                            <button
                              type="button"
                              className="btn-aprovar-sol"
                              onClick={() => aprovarVoluntario(sol.id)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>Aprovar Integrante</span>
                            </button>

                            <button
                              type="button"
                              className="btn-recusar-sol"
                              onClick={() => recusarVoluntario(sol.id)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                              <span>Recusar</span>
                            </button>
                          </div>
                        ) : (
                          <span className="aviso-somente-lider">
                            Apenas o líder de louvor desta igreja pode aprovar ou recusar pedidos.
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          SUB-MODAL: AJUSTAR CATEGORIA MUSICAL PELO LÍDER
          ==================================================================== */}
      {membroEditando && (
        <div className="modal-backdrop submodal" onClick={() => setMembroEditando(null)}>
          <div className="modal-sheet submodal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator"></div>
            <div className="modal-header">
              <h3>Ajustar Categoria Musical</h3>
              <button className="btn-fechar-modal" onClick={() => setMembroEditando(null)}>✕</button>
            </div>
            <p className="modal-sub">
              Definir função ministerial de <strong>{membroEditando.nome}</strong> na equipe:
            </p>

            <form onSubmit={handleSalvarFuncaoMembro} className="form-ajuste-funcao">
              <label htmlFor="select-funcao-lider">Selecione a nova função:</label>
              <select
                id="select-funcao-lider"
                value={novaFuncaoMembro}
                onChange={(e) => setNovaFuncaoMembro(e.target.value)}
                className="select-custom-funcao"
                required
              >
                {CATEGORIAS_MUSICAIS.map(cat => (
                  <optgroup key={cat.naipe} label={`— ${cat.naipe} —`}>
                    {cat.funcoes.map(f => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <div className="botoes-form-funcao">
                <button type="submit" className="btn-salvar-funcao">
                  Salvar Alteração
                </button>
                <button type="button" className="btn-cancelar-modal" onClick={() => setMembroEditando(null)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          SUB-MODAL: CONFIRMAR REVOGAÇÃO DE ACESSO DE INTEGRANTE
          ==================================================================== */}
      {membroRevogando && (
        <div className="modal-backdrop submodal" onClick={() => setMembroRevogando(null)}>
          <div className="modal-sheet sheet-alerta" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator"></div>
            <div className="icone-alerta-revogar">
              <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3>Revogar Acesso à Igreja?</h3>
            <p className="modal-sub">
              Deseja desvincular <strong>{membroRevogando.nome}</strong> da equipe desta igreja?
            </p>
            <div className="box-regra-seguranca">
              <strong>Regra de Segurança:</strong> O acesso às escalas e áreas internas desta igreja será imediatamente revogado, sem excluir a conta do usuário nem o histórico anterior de eventos.
            </div>

            <div className="modal-alerta-acoes">
              <button
                type="button"
                className="btn-confirmar-sair"
                onClick={handleConfirmarRevogacao}
              >
                Sim, revogar acesso
              </button>
              <button
                type="button"
                className="btn-cancelar-sair"
                onClick={() => setMembroRevogando(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: MEU PERFIL & MINHA FUNÇÃO MUSICAL
          ==================================================================== */}
      {modalAtivo === 'meu_perfil' && (
        <div className="modal-backdrop" onClick={() => setModalAtivo(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator"></div>
            <div className="modal-header">
              <h3>Meu Perfil Ministerial</h3>
              <button className="btn-fechar-modal" onClick={() => setModalAtivo(null)}>✕</button>
            </div>

            <div className="card-perfil-resumo">
              <div className="resumo-avatar">{iniciaisAvatar}</div>
              <div className="resumo-info">
                <strong>{usuario?.nome}</strong>
                <span>{usuario?.email || 'email@cruzchurch.com'}</span>
                <span className="badge-cargo-mini">{usuario?.cargo || (ehLider ? 'Líder' : 'Voluntário')}</span>
              </div>
            </div>

            <form onSubmit={handleSalvarMinhaFuncao} className="form-meu-perfil">
              <label htmlFor="select-minha-funcao">
                Minha Função Musical Principal
              </label>
              <select
                id="select-minha-funcao"
                value={minhaFuncao}
                onChange={(e) => setMinhaFuncao(e.target.value)}
                className="select-custom-funcao"
              >
                {CATEGORIAS_MUSICAIS.map(cat => (
                  <optgroup key={cat.naipe} label={`— ${cat.naipe} —`}>
                    {cat.funcoes.map(f => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="ajuda-perfil">
                Utilize as categorias musicais oficiais para manter seu cadastro atualizado.
              </span>

              {feedbackPerfil && (
                <div className="feedback-sucesso-perfil">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Função atualizada com sucesso!</span>
                </div>
              )}

              <button type="submit" className="btn-salvar-funcao">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: SIMULADOR DE PERFIS (TESTES DE PERMISSÕES)
          ==================================================================== */}
      {modalAtivo === 'simulador' && (
        <div className="modal-backdrop" onClick={() => setModalAtivo(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator"></div>
            <div className="modal-header">
              <h3>Simulador de Perfis</h3>
              <button className="btn-fechar-modal" onClick={() => setModalAtivo(null)}>✕</button>
            </div>
            <p className="modal-sub">
              Alterne de perfil para testar permissões de líder vs voluntário:
            </p>

            <div className="simulador-grid-modal">
              <button
                type="button"
                className={`btn-simulador-opcao ${usuario?.tipoConta === 'lider' ? 'ativo' : ''}`}
                onClick={() => {
                  alternarPerfilVisual('lider')
                  setModalAtivo(null)
                }}
              >
                <div className="sim-icone blue">👑</div>
                <div className="sim-texto">
                  <strong>Líder de Louvor (Anderson Neres)</strong>
                  <span>Aprova voluntários, altera funções e gerencia escalas</span>
                </div>
              </button>

              <button
                type="button"
                className={`btn-simulador-opcao ${usuario?.tipoConta === 'voluntario' && usuario?.statusAcesso === 'aprovado' ? 'ativo' : ''}`}
                onClick={() => {
                  alternarPerfilVisual('voluntario_aprovado')
                  setModalAtivo(null)
                }}
              >
                <div className="sim-icone green">🎤</div>
                <div className="sim-texto">
                  <strong>Voluntária Aprovada (Sarah Menezes)</strong>
                  <span>Acessa escalas, repertório e edita função própria</span>
                </div>
              </button>

              <button
                type="button"
                className="btn-simulador-opcao"
                onClick={() => {
                  alternarPerfilVisual('voluntario_pendente')
                  setModalAtivo(null)
                  navigate('/aguardando-aprovacao')
                }}
              >
                <div className="sim-icone orange">⏳</div>
                <div className="sim-texto">
                  <strong>Voluntário Pendente (Carlos Eduardo)</strong>
                  <span>Simula tela de bloqueio e aguardo de aprovação</span>
                </div>
              </button>

              <button
                type="button"
                className={`btn-simulador-opcao ${usuario?.tipoConta === 'admin' ? 'ativo' : ''}`}
                onClick={() => {
                  alternarPerfilVisual('admin')
                  setModalAtivo(null)
                  navigate('/admin')
                }}
              >
                <div className="sim-icone blue">👑</div>
                <div className="sim-texto">
                  <strong>Administrador Geral (LouvorApp ADMIN)</strong>
                  <span>Homologa novos líderes, congregações e acessa painel geral</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TROCAS DE ESCALA */}
      {modalAtivo === 'trocas' && (
        <div className="modal-backdrop" onClick={() => setModalAtivo(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator"></div>
            <div className="modal-header">
              <h3>Trocas de Escala</h3>
              <button className="btn-fechar-modal" onClick={() => setModalAtivo(null)}>✕</button>
            </div>
            <p className="modal-sub">Pedidos de cobertura de escala entre ministros</p>

            {!pedidoRespondido ? (
              <div className="card-pedido-troca">
                <div className="pedido-origem">
                  <div className="pedido-avatar">LS</div>
                  <div>
                    <h4 className="pedido-solicitante">Lucas Silva</h4>
                    <span className="pedido-detalhe">Violão • Domingo, 01 de Novembro</span>
                  </div>
                </div>
                <div className="pedido-motivo">
                  <p>"Olá Anderson, terei viagem de trabalho no dia 01/11. Poderia me cobrir no culto das 19h? Posso assumir sua escala na semana seguinte!"</p>
                </div>
                <div className="pedido-acoes">
                  <button
                    className="btn-aceitar-troca"
                    onClick={() => responderPedidoTroca(pedidoLucas.id, true)}
                  >
                    Aceitar Troca
                  </button>
                  <button
                    className="btn-recusar-troca"
                    onClick={() => responderPedidoTroca(pedidoLucas.id, false)}
                  >
                    Não posso
                  </button>
                </div>
              </div>
            ) : (
              <div className="feedback-respondido">
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p>Pedido respondido com sucesso!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: EQUIPAMENTOS DO PALCO */}
      {modalAtivo === 'equipamentos' && (
        <div className="modal-backdrop" onClick={() => setModalAtivo(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator"></div>
            <div className="modal-header">
              <h3>Checklist de Equipamentos</h3>
              <button className="btn-fechar-modal" onClick={() => setModalAtivo(null)}>✕</button>
            </div>
            <p className="modal-sub">Status dos instrumentos e periféricos do altar</p>

            <div className="equipamentos-lista-modal">
              {checklistEquipamentos.map((eq, idx) => (
                <div key={idx} className="equip-item-card">
                  <div className="equip-info">
                    <span className="equip-nome">{eq.item}</span>
                    <span className="equip-setor">{eq.setor}</span>
                  </div>
                  <span className={`badge-status-equip ${eq.status === 'OK' ? 'ok' : 'atencao'}`}>
                    {eq.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL DO LOUVOR */}
      {modalAtivo === 'manual' && (
        <div className="modal-backdrop" onClick={() => setModalAtivo(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator"></div>
            <div className="modal-header">
              <h3>Regimento & Boas Práticas</h3>
              <button className="btn-fechar-modal" onClick={() => setModalAtivo(null)}>✕</button>
            </div>
            <div className="manual-conteudo">
              <div className="manual-item">
                <h4>1. Pontualidade</h4>
                <p>Chegar com 45 minutos de antecedência ao culto para passagem de som e oração da equipe.</p>
              </div>
              <div className="manual-item">
                <h4>2. Ensaio Geral</h4>
                <p>A presença no ensaio de quarta-feira (19:30) é indispensável para ministrar no domingo.</p>
              </div>
              <div className="manual-item">
                <h4>3. Postura e Consagração</h4>
                <p>Oração individual prévia, vestimenta sóbria conforme alinhamento com a liderança pastoral.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR SAIR */}
      {modalAtivo === 'sair' && (
        <div className="modal-backdrop" onClick={() => setModalAtivo(null)}>
          <div className="modal-sheet sheet-alerta" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator"></div>
            <h3>Deseja realmente sair?</h3>
            <p className="modal-sub">Você precisará fazer login novamente para acessar suas escalas.</p>
            <div className="modal-alerta-acoes">
              <button
                className="btn-confirmar-sair"
                onClick={() => {
                  setModalAtivo(null)
                  logout()
                  navigate('/login')
                }}
              >
                Sim, sair
              </button>
              <button className="btn-cancelar-sair" onClick={() => setModalAtivo(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Inferior Fixo (Bottom Navigation) */}
      <nav className="bottom-nav">
        <Link to="/" className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Início</span>
        </Link>

        <Link to="/agenda" className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Agenda</span>
        </Link>

        <Link to="/musicas" className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span>Músicas</span>
        </Link>

        <Link to="/devocional" className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>Devocional</span>
        </Link>

        <Link to="/mais" className="nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>Mais</span>
        </Link>
      </nav>
    </div>
  )
}

export default Mais
