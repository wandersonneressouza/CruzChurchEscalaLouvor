import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Mais.css'

function Mais() {
  const [disponivel, setDisponivel] = useState(true)
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true)
  const [temaEscuro, setTemaEscuro] = useState(false)
  const [modalAtivo, setModalAtivo] = useState(null) // 'equipe' | 'trocas' | 'equipamentos' | 'manual' | 'sair' | null
  const [pedidoRespondido, setPedidoRespondido] = useState(false)

  // Lista da Equipe Ministerial de Louvor
  const equipeMembros = [
    { id: 1, nome: 'Anderson Neres', funcao: 'Teclado / Ministro', naipe: 'Harmonia', status: 'confirmado', avatar: 'AN' },
    { id: 2, nome: 'Sarah Menezes', funcao: 'Vocal Líder (Soprano)', naipe: 'Vocal', status: 'confirmado', avatar: 'SM' },
    { id: 3, nome: 'Lucas Silva', funcao: 'Violão Aço', naipe: 'Harmonia', status: 'pendente', avatar: 'LS' },
    { id: 4, nome: 'Matheus Costa', funcao: 'Guitarra Solo', naipe: 'Harmonia', status: 'confirmado', avatar: 'MC' },
    { id: 5, nome: 'Gabriel Rocha', funcao: 'Contrabaixo 5C', naipe: 'Ritmo', status: 'confirmado', avatar: 'GR' },
    { id: 6, nome: 'Thiago Martins', funcao: 'Bateria', naipe: 'Ritmo', status: 'confirmado', avatar: 'TM' },
    { id: 7, nome: 'Camila Santos', funcao: 'Vocal (Contralto)', naipe: 'Vocal', status: 'confirmado', avatar: 'CS' },
    { id: 8, nome: 'Felipe Diniz', funcao: 'Técnico de Som (FOH)', naipe: 'Áudio & Técnica', status: 'confirmado', avatar: 'FD' },
    { id: 9, nome: 'Jéssica Lima', funcao: 'Transmissão & Mídia', naipe: 'Mídia', status: 'confirmado', avatar: 'JL' }
  ]

  // Checklist de Equipamentos do Altar
  const checklistEquipamentos = [
    { item: 'Mesa Behringer X32', setor: 'Som', status: 'OK' },
    { item: '4 Fones In-Ear KZ Pro (Banda)', setor: 'Retorno', status: 'OK' },
    { item: 'Microfones Sem Fio Shure SM58 (3x)', setor: 'Vocal', status: 'OK' },
    { item: 'Direct Boxes Passivos (5x)', setor: 'Palco', status: 'OK' },
    { item: 'Teclado Roland Juno DS + Fonte', setor: 'Teclado', status: 'OK' },
    { item: 'Cabos XLR Balanceados de Reserva (4x)', setor: 'Acessórios', status: 'Verificar' }
  ]

  return (
    <div id="tela-mais">
      {/* Barra de Status Mobile */}
      <div className="status-bar">
        <span className="status-time">9:41</span>
        <div className="status-icons">
          <svg className="icon-signal" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 18.25A10.93 10.93 0 0 1 1 12C1 5.92 5.92 1 12 1s11 4.92 11 11c0 2.37-.75 4.57-2.03 6.36l-.63-.63A9.94 9.94 0 0 0 21 12c0-4.97-4.03-9-9-9z"/>
            <path d="M12 7a5 5 0 0 0-5 5c0 1.25.46 2.39 1.22 3.28l.71-.71A3.98 3.98 0 0 1 8 12a4 4 0 0 1 4-4 4 4 0 0 1 4 4c0 .93-.32 1.79-.86 2.47l.71.71A4.97 4.97 0 0 0 17 12a5 5 0 0 0-5-5z"/>
            <circle cx="12" cy="12" r="1.5"/>
          </svg>
          <svg className="icon-wifi" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A17.88 17.88 0 0 0 12 4z"/>
          </svg>
          <svg className="icon-battery" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
            <rect x="4" y="8" width="12" height="8" rx="1"/>
            <path d="M21 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

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
        <section className="card-perfil-usuario">
          <div className="perfil-avatar-wrapper">
            <div className="avatar-circulo">
              <span>AN</span>
            </div>
            <span className="badge-online"></span>
          </div>
          <div className="perfil-info">
            <div className="perfil-nome-row">
              <h3>Anderson Neres</h3>
              <span className="badge-cargo">Líder</span>
            </div>
            <p className="perfil-funcao">Ministro de Louvor & Teclado</p>
            <span className="perfil-campus">Cruz Church • Campus Central</span>
          </div>
        </section>

        {/* Card de Minha Disponibilidade */}
        <section className="card-disponibilidade">
          <div className="disponibilidade-texto">
            <div className="disp-titulo-row">
              <svg viewBox="0 0 24 24" fill="none" stroke={disponivel ? '#10b981' : '#f59e0b'} strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <h4>Disponível para escalas</h4>
            </div>
            <p className="disp-sub">
              {disponivel
                ? 'Você está elegível para escalas de cultos e ensaios.'
                : 'Você marcou indisponibilidade temporária neste mês.'}
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={disponivel}
              onChange={() => setDisponivel(!disponivel)}
            />
            <span className="slider"></span>
          </label>
        </section>

        {/* GRUPO 1: GESTÃO DO MINISTÉRIO */}
        <section className="grupo-menu">
          <h4 className="grupo-titulo">Gestão do Ministério</h4>
          <div className="cards-lista-menu">
            {/* Equipe e Voluntários */}
            <button
              className="menu-item-card"
              onClick={() => setModalAtivo('equipe')}
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
                <span className="menu-item-titulo">Equipe & Integrantes</span>
                <span className="menu-item-sub">18 membros cadastrados</span>
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
                  {!pedidoRespondido && <span className="badge-alerta-menu">1 pendente</span>}
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
          <h4 className="grupo-titulo">Configurações & Conta</h4>
          <div className="cards-lista-menu">
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
                  checked={notificacoesAtivas}
                  onChange={() => setNotificacoesAtivas(!notificacoesAtivas)}
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
                  checked={temaEscuro}
                  onChange={() => setTemaEscuro(!temaEscuro)}
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
          <span className="versao-texto">Versão 1.0.0 (Front-end Prototype)</span>
        </div>
      </div>

      {/* MODAL: EQUIPE & INTEGRANTES */}
      {modalAtivo === 'equipe' && (
        <div className="modal-backdrop" onClick={() => setModalAtivo(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator"></div>
            <div className="modal-header">
              <h3>Equipe Ministerial ({equipeMembros.length})</h3>
              <button className="btn-fechar-modal" onClick={() => setModalAtivo(null)}>✕</button>
            </div>
            <p className="modal-sub">Membros e voluntários cadastrados no louvor</p>

            <div className="equipe-lista-modal">
              {equipeMembros.map((membro) => (
                <div key={membro.id} className="equipe-item-card">
                  <div className="equipe-avatar">
                    <span>{membro.avatar}</span>
                  </div>
                  <div className="equipe-dados">
                    <span className="equipe-nome">{membro.nome}</span>
                    <span className="equipe-cargo">{membro.funcao}</span>
                  </div>
                  <span className="badge-naipe">{membro.naipe}</span>
                </div>
              ))}
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
                    onClick={() => setPedidoRespondido(true)}
                  >
                    Aceitar Troca
                  </button>
                  <button
                    className="btn-recusar-troca"
                    onClick={() => setPedidoRespondido(true)}
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
              <button className="btn-confirmar-sair" onClick={() => setModalAtivo(null)}>
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
