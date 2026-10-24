import React from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import './Inicio.css'

function Inicio() {
  const { usuario, totalEscalasPendentes, totalSolicitacoesPendentes, devocional } = useAppContext()
  const primeiroNome = usuario?.nome ? usuario.nome.split(' ')[0] : 'Anderson'
  const ehLider = usuario?.tipoConta === 'lider' || usuario?.cargo?.toLowerCase().includes('líder')

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
              <p>Servindo com excelência</p>
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
          <Link to="/mais" className="banner-solicitacoes-pendentes">
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

        {/* Card Principal: Próximo Culto */}
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
              <span className="culto-tag">PRÓXIMO CULTO</span>
              <h3>Culto de Domingo</h3>
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
              26 de outubro de 2026 • 19:00
            </p>
            <p className="culto-local">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Igreja da Graça - São Carlos
            </p>
          </div>

          <Link to="/agenda" className="btn-ver-escala">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <polyline points="9 11 12 14 22 4" />
            </svg>
            <span>Ver minha escala</span>
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
              <p className="sub-texto">Quarta-feira • 19:30</p>
              <p className="local-texto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21h18M3 7v14M21 7v14M6 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
                </svg>
                Sala de Música
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

        {/* Seção: Avisos da Liderança */}
        <section className="secao-avisos">
          <div className="secao-cabecalho">
            <div className="secao-titulo-com-icone">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <h3>Avisos da liderança</h3>
            </div>
            <button className="link-ver-todos">Ver todos</button>
          </div>

          <div className="card-aviso">
            <div className="aviso-titulo-row">
              <span className="dot-indicador"></span>
              <h4>Ensaio geral</h4>
            </div>
            <p className="aviso-mensagem">
              Na próxima quarta-feira teremos o ensaio geral com a banda e equipe de mídia.
            </p>
            <span className="aviso-tempo">Há 2 horas</span>
          </div>
        </section>

        {/* Seção: Devocional da Semana */}
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
              <h4>Confie no Senhor</h4>
              <p className="devocional-frase">"Entrega o teu caminho ao Senhor..."</p>
              <span className="devocional-ref">Salmos 37:5</span>
            </div>
            <div className="seta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Link>
        </section>
      </div>

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
