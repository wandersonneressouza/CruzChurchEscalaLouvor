import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import './Inicio.css'

function Inicio() {
  const {
    usuario,
    totalEscalasPendentes,
    totalSolicitacoesPendentes,
    devocional,
    agendaEventos,
    escalas,
    comunicados,
    criarComunicado
  } = useAppContext()

  const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'Ministro'
  const ehLider = usuario?.tipoConta === 'lider' || usuario?.tipoConta === 'admin' || usuario?.cargo?.toLowerCase().includes('líder')

  // Estado para criação de novo comunicado (Líder / Admin)
  const [modalNovoAviso, setModalNovoAviso] = useState(false)
  const [novoAviso, setNovoAviso] = useState({ titulo: '', conteudo: '', prioridade: 'normal' })
  const [salvandoAviso, setSalvandoAviso] = useState(false)

  // Filtra eventos e cultos da congregação do usuário
  const eventosIgreja = useMemo(() => {
    if (!agendaEventos) return []
    return agendaEventos.filter(e => !usuario?.igrejaId || e.igrejaId === usuario.igrejaId)
  }, [agendaEventos, usuario?.igrejaId])

  // Próximo culto real
  const proximoCulto = useMemo(() => {
    const cultoEv = eventosIgreja.find(e => e.tipo === 'Culto')
    if (cultoEv) return cultoEv

    if (escalas && escalas.length > 0) {
      const esc = escalas.find(e => !usuario?.igrejaId || e.igrejaId === usuario.igrejaId)
      if (esc) {
        return {
          titulo: esc.evento,
          tipo: 'Culto',
          data: esc.data,
          dataFormatada: esc.data,
          hora: esc.hora,
          local: esc.local
        }
      }
    }
    return eventosIgreja[0] || null
  }, [eventosIgreja, escalas, usuario?.igrejaId])

  // Próximo ensaio real
  const proximoEnsaio = useMemo(() => {
    return eventosIgreja.find(e => e.tipo === 'Ensaio') || null
  }, [eventosIgreja])

  // Avisos reais da congregação
  const comunicadosIgreja = useMemo(() => {
    if (!comunicados) return []
    return comunicados.filter(c => !usuario?.igrejaId || c.igrejaId === usuario.igrejaId)
  }, [comunicados, usuario?.igrejaId])

  // Salvar novo aviso no Supabase
  async function handleSalvarAviso(e) {
    e.preventDefault()
    if (!novoAviso.titulo || !novoAviso.conteudo) {
      alert('Preencha o título e o conteúdo do aviso.')
      return
    }

    setSalvandoAviso(true)
    try {
      if (criarComunicado) {
        await criarComunicado(novoAviso)
      }
      setModalNovoAviso(false)
      setNovoAviso({ titulo: '', conteudo: '', prioridade: 'normal' })
    } catch (err) {
      alert('Erro ao publicar aviso: ' + (err.message || 'Falha na comunicação.'))
    } finally {
      setSalvandoAviso(false)
    }
  }

  return (
    <div id="tela-inicio">
      {/* Conteúdo Principal com Rolagem */}
      <div className="inicio-scroll-content">
        {/* Topo / Header da Igreja */}
        <header className="header-ministerio">
          <div className="header-info">
            <div className="logo-cruz">
              <svg viewBox="0 0 36 36" fill="none">
                <rect x="15" y="4" width="6" height="24" rx="3" fill="#1e5ec8" />
                <rect x="7" y="10" width="22" height="6" rx="3" fill="#1e5ec8" />
                <path d="M6 31C6 29 11 27 18 27C25 27 30 29 30 31H6Z" fill="#1e5ec8" />
              </svg>
            </div>
            <div className="header-titles">
              <h1>Ministério de Louvor</h1>
              <p>{usuario?.campus || 'Servindo com excelência'}</p>
            </div>
          </div>

          <Link to="/mais" className="btn-notificacao" aria-label="Notificações">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {(totalSolicitacoesPendentes > 0 || totalEscalasPendentes > 0) && (
              <span className="badge-dot"></span>
            )}
          </Link>
        </header>

        {/* Saudação */}
        <section className="secao-saudacao">
          <h2>Olá, {primeiroNome}!</h2>
          <p>Que hoje seja um dia de adoração e serviço ao Senhor.</p>
        </section>

        {/* Banner de Solicitações Pendentes para o Líder */}
        {ehLider && totalSolicitacoesPendentes > 0 && (
          <Link to="/mais?aba=solicitacoes" className="banner-solicitacoes-pendentes">
            <div className="icone-alerta-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
            </div>
            <div className="texto-alerta-banner">
              <strong>{totalSolicitacoesPendentes} novo(s) voluntário(s) aguardando</strong>
              <span>Toque para revisar e homologar na equipe</span>
            </div>
            <svg className="seta-alerta-banner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        )}

        {/* Card Principal: Próximo Culto Real do Banco */}
        <section className="card-proximo-culto">
          <div className="culto-top">
            <div className="culto-icone-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="3" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <circle cx="8.5" cy="14.5" r="1.5" fill="#1e5ec8" />
                <circle cx="15.5" cy="14.5" r="1.5" fill="#1e5ec8" />
              </svg>
            </div>
            <div className="culto-chamada">
              <span className="culto-tag">PRÓXIMO COMPROMISSO</span>
              <h3>{proximoCulto ? (proximoCulto.titulo || 'Culto de Celebração') : 'Cultos & Celebrações'}</h3>
            </div>
            <div className="seta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          <div className="culto-detalhes">
            <p className="culto-data">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {proximoCulto
                ? `${proximoCulto.dataFormatada || proximoCulto.data} • ${proximoCulto.hora || '19:00'}`
                : 'Consulte a programação da congregação'}
            </p>
            <p className="culto-local">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {proximoCulto?.local || usuario?.campus || 'Templo Central'}
            </p>
          </div>

          <Link to="/agenda" className="btn-ver-escala">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <polyline points="9 11 12 14 22 4" />
            </svg>
            <span>Ver agenda e escalas</span>
            <svg className="btn-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </section>

        {/* Linha de Cards Rápidos (Ensaio e Confirmações) */}
        <section className="grid-cards-rapidos">
          <div className="mini-card card-ensaio">
            <div className="mini-card-icon-wrapper blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <div className="mini-card-texto">
              <h4>Próximo ensaio</h4>
              <p className="sub-texto">
                {proximoEnsaio
                  ? `${proximoEnsaio.dataFormatada || proximoEnsaio.data} • ${proximoEnsaio.hora || '19:30'}`
                  : 'Sem ensaios agendados'}
              </p>
              <p className="local-texto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7v14M21 7v14M6 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
                </svg>
                {proximoEnsaio?.local || usuario?.campus || 'Sala de Música'}
              </p>
            </div>
          </div>

          <Link to="/agenda" className="mini-card card-confirmacoes">
            <div className="mini-card-icon-wrapper light-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="mini-card-texto">
              <h4>Confirmações</h4>
              <p className="pendente-alerta">
                {totalEscalasPendentes > 0 ? `${totalEscalasPendentes} pendente${totalEscalasPendentes > 1 ? 's' : ''}` : 'Tudo em dia!'}
              </p>
            </div>
            <div className="mini-card-seta">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        </section>

        {/* Seção: Avisos Reais da Liderança (Banco Supabase) */}
        <section className="secao-avisos">
          <div className="secao-cabecalho">
            <div className="secao-titulo-com-icone">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <h3>Avisos da liderança</h3>
            </div>
            {ehLider ? (
              <button
                type="button"
                className="link-ver-todos"
                onClick={() => setModalNovoAviso(true)}
              >
                + Novo aviso
              </button>
            ) : (
              <button className="link-ver-todos" onClick={() => {}}>Recentes</button>
            )}
          </div>

          {comunicadosIgreja.length > 0 ? (
            comunicadosIgreja.slice(0, 3).map(aviso => (
              <div key={aviso.id} className="card-aviso">
                <div className="aviso-titulo-row">
                  <span className={`dot-indicador ${aviso.prioridade === 'urgente' ? 'urgente' : ''}`}></span>
                  <h4>{aviso.titulo}</h4>
                </div>
                <p className="aviso-mensagem">{aviso.conteudo}</p>
                <span className="aviso-tempo">{aviso.tempoRelativo || 'Recente'}</span>
              </div>
            ))
          ) : (
            <div className="card-aviso" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
              <p className="aviso-mensagem" style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                Nenhum comunicado recente publicado pela liderança.
              </p>
            </div>
          )}
        </section>

        {/* Seção: Devocional da Semana Real do Banco Supabase */}
        <section className="secao-devocional">
          <div className="secao-cabecalho">
            <div className="secao-titulo-com-icone">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <h3>Devocional da semana</h3>
            </div>
            <Link to="/devocional" className="link-ver-todos">Ver mais</Link>
          </div>

          <Link to="/devocional" className="card-devocional">
            <div className="devocional-capa">
              <div className="capa-ilustracao">
                <div className="sol-devocional"></div>
                <div className="montanhas-devocional"></div>
              </div>
            </div>
            <div className="devocional-info">
              <h4>{devocional?.titulo || 'Adoração com Propósito e Santidade'}</h4>
              <p className="devocional-frase">
                "{devocional?.versiculoTexto || 'Servi ao Senhor com alegria e apresentai-vos a ele com cânticos.'}"
              </p>
              <span className="devocional-ref">{devocional?.versiculoReferencia || 'Salmos 100:2'}</span>
            </div>
            <div className="seta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        </section>
      </div>

      {/* Modal de Publicação de Aviso (Líder / Admin) */}
      {modalNovoAviso && (
        <div className="modal-agenda-backdrop" onClick={() => setModalNovoAviso(false)}>
          <div className="modal-agenda-caixa" onClick={e => e.stopPropagation()}>
            <div className="modal-agenda-header">
              <h3>Publicar Aviso para a Equipe</h3>
              <button
                type="button"
                className="btn-fechar-modal-agenda"
                onClick={() => setModalNovoAviso(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarAviso}>
              <div className="modal-agenda-corpo">
                <div className="campo-modal-agenda">
                  <label htmlFor="aviso-titulo">Título do Aviso *</label>
                  <input
                    id="aviso-titulo"
                    type="text"
                    required
                    placeholder="Ex: Ensaio Geral na Quarta, Novo Repertório"
                    value={novoAviso.titulo}
                    onChange={e => setNovoAviso({ ...novoAviso, titulo: e.target.value })}
                  />
                </div>

                <div className="campo-modal-agenda">
                  <label htmlFor="aviso-prioridade">Prioridade</label>
                  <select
                    id="aviso-prioridade"
                    value={novoAviso.prioridade}
                    onChange={e => setNovoAviso({ ...novoAviso, prioridade: e.target.value })}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgente">Urgente / Importante</option>
                    <option value="baixa">Informativo</option>
                  </select>
                </div>

                <div className="campo-modal-agenda">
                  <label htmlFor="aviso-conteudo">Mensagem *</label>
                  <textarea
                    id="aviso-conteudo"
                    rows="3"
                    required
                    placeholder="Escreva a mensagem que todos os integrantes da congregação verão..."
                    value={novoAviso.conteudo}
                    onChange={e => setNovoAviso({ ...novoAviso, conteudo: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="modal-agenda-rodape">
                <button
                  type="button"
                  className="btn-cancelar-modal-agenda"
                  onClick={() => setModalNovoAviso(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-salvar-modal-agenda"
                  disabled={salvandoAviso}
                >
                  {salvandoAviso ? 'Publicando...' : 'Publicar no Mural'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Inferior Fixo (Bottom Navigation) */}
      <nav className="bottom-nav">
        <Link to="/" className="nav-item active">
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

        <Link to="/mais" className="nav-item">
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

export default Inicio
