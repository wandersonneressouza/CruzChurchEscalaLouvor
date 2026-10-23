import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Agenda.css'

function Agenda() {
  const [abaAtiva, setAbaAtiva] = useState('calendario')
  const [diaSelecionado, setDiaSelecionado] = useState(26)

  // Dias de outubro de 2026 para a grade do calendário
  const diasMes = [
    // Dias do mês anterior (Setembro)
    { numero: 27, outroMes: true },
    { numero: 28, outroMes: true },
    { numero: 29, outroMes: true },
    { numero: 30, outroMes: true },
    // Dias de Outubro
    { numero: 1 }, { numero: 2 }, { numero: 3 },
    { numero: 4 }, { numero: 5 }, { numero: 6 }, { numero: 7 }, { numero: 8 }, { numero: 9 }, { numero: 10 },
    { numero: 11 }, { numero: 12 }, { numero: 13 }, { numero: 14, dot: 'green' }, { numero: 15 }, { numero: 16 }, { numero: 17 },
    { numero: 18 }, { numero: 19 }, { numero: 20, dot: 'orange' }, { numero: 21, dot: 'orange' }, { numero: 22 }, { numero: 23, dot: 'green' }, { numero: 24, dot: 'green' },
    { numero: 25 }, { numero: 26, evento: 'culto' }, { numero: 27 }, { numero: 28, dot: 'orange' }, { numero: 29 }, { numero: 30, dot: 'green' }, { numero: 31 }
  ]

  return (
    <div id="tela-agenda">
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
      <div className="agenda-scroll-content">
        {/* Topo / Header */}
        <header className="agenda-header">
          <Link to="/" className="btn-voltar" aria-label="Voltar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h2>Agenda e Escalas</h2>
          <button className="btn-add-evento" aria-label="Novo evento ou filtro">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
        </header>

        {/* Seletor de Abas (Segmented Control) */}
        <div className="abas-container">
          <button
            className={`aba-btn ${abaAtiva === 'calendario' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('calendario')}
          >
            Calendário
          </button>
          <button
            className={`aba-btn ${abaAtiva === 'escalas' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('escalas')}
          >
            Escalas
          </button>
        </div>

        {/* VISUALIZAÇÃO: ABA CALENDÁRIO */}
        {abaAtiva === 'calendario' && (
          <div className="conteudo-calendario">
            {/* Navegador de Mês */}
            <div className="mes-navegador">
              <button className="mes-nav-seta" aria-label="Mês anterior">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h3>Outubro 2026</h3>
              <button className="mes-nav-seta" aria-label="Próximo mês">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Cabeçalho dos dias da semana */}
            <div className="dias-semana-header">
              <span>D</span>
              <span>S</span>
              <span>T</span>
              <span>Q</span>
              <span>Q</span>
              <span>S</span>
              <span>S</span>
            </div>

            {/* Grade dos dias do mês */}
            <div className="grade-calendario">
              {diasMes.map((dia, index) => {
                const isSelecionado = diaSelecionado === dia.numero && !dia.outroMes
                return (
                  <div
                    key={index}
                    className={`dia-celula ${dia.outroMes ? 'outro-mes' : ''} ${isSelecionado ? 'selecionado' : ''}`}
                    onClick={() => !dia.outroMes && setDiaSelecionado(dia.numero)}
                  >
                    <span className="dia-numero">{dia.numero}</span>
                    {dia.dot && <span className={`dia-dot ${dia.dot}`}></span>}
                  </div>
                )
              })}
            </div>

            {/* Seção: Próximos Compromissos */}
            <section className="secao-compromissos">
              <div className="secao-cabecalho">
                <h3>Próximos compromissos</h3>
                <button className="link-ver-todos">Ver todos</button>
              </div>

              <div className="lista-eventos">
                {/* Evento 1 */}
                <div className="card-evento">
                  <div className="evento-data-badge">
                    <span className="badge-dia">26</span>
                    <span className="badge-mes">OUT</span>
                  </div>
                  <div className="evento-info">
                    <h4>Culto de Domingo</h4>
                    <p className="evento-horario">19:00 - 21:00</p>
                    <p className="evento-local">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Igreja da Graça - São Carlos
                    </p>
                  </div>
                  <div className="evento-seta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>

                {/* Evento 2 */}
                <div className="card-evento">
                  <div className="evento-data-badge">
                    <span className="badge-dia">28</span>
                    <span className="badge-mes">OUT</span>
                  </div>
                  <div className="evento-info">
                    <h4>Ensaio da Banda</h4>
                    <p className="evento-horario">19:30 - 21:30</p>
                    <p className="evento-local">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 21h18M3 7v14M21 7v14M6 7V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
                      </svg>
                      Sala de Música
                    </p>
                  </div>
                  <div className="evento-seta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>

                {/* Evento 3 */}
                <div className="card-evento">
                  <div className="evento-data-badge">
                    <span className="badge-dia">01</span>
                    <span className="badge-mes">NOV</span>
                  </div>
                  <div className="evento-info">
                    <h4>Culto de Celebração</h4>
                    <p className="evento-horario">19:00 - 21:00</p>
                    <p className="evento-local">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Igreja da Graça - São Carlos
                    </p>
                  </div>
                  <div className="evento-seta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>

                {/* Evento 4 */}
                <div className="card-evento">
                  <div className="evento-data-badge">
                    <span className="badge-dia">04</span>
                    <span className="badge-mes">NOV</span>
                  </div>
                  <div className="evento-info">
                    <h4>Ensaio Geral</h4>
                    <p className="evento-horario">19:30 - 22:00</p>
                    <p className="evento-local">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Igreja da Graça - São Carlos
                    </p>
                  </div>
                  <div className="evento-seta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card de Alerta de Escalas Pendentes */}
              <div className="card-alerta-pendente" onClick={() => setAbaAtiva('escalas')}>
                <div className="alerta-avatar-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="alerta-texto">
                  <h4>Você tem 2 escalas pendentes</h4>
                  <p>Confirme sua presença ou solicite substituição.</p>
                </div>
                <div className="alerta-seta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VISUALIZAÇÃO: ABA ESCALAS */}
        {abaAtiva === 'escalas' && (
          <div className="conteudo-escalas">
            {/* Banner do Culto da Escala */}
            <div className="escala-evento-destaque">
              <span className="tag-evento">ESCALA CONFIRMADA</span>
              <h3>Culto de Domingo — 26 OUT</h3>
              <p className="horario-local">19:00 • Igreja da Graça - São Carlos</p>
            </div>

            {/* Grupo: Vocal */}
            <div className="grupo-escala">
              <div className="grupo-titulo">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                <h4>Equipe de Vocal</h4>
              </div>

              <div className="membro-linha">
                <div className="membro-detalhe">
                  <strong>Sarah Mendes</strong>
                  <span>Líder / Soprano</span>
                </div>
                <span className="status-badge confirmado">Confirmado</span>
              </div>

              <div className="membro-linha">
                <div className="membro-detalhe">
                  <strong>Camila Lima</strong>
                  <span>Contralto</span>
                </div>
                <span className="status-badge confirmado">Confirmado</span>
              </div>

              <div className="membro-linha pendente-card">
                <div className="membro-detalhe">
                  <strong>Wanderson Neres (Você)</strong>
                  <span>Tenor</span>
                </div>
                <div className="membro-acoes">
                  <button className="btn-confirmar">Confirmar</button>
                  <button className="btn-substituir">Substituir</button>
                </div>
              </div>

              <div className="membro-linha">
                <div className="membro-detalhe">
                  <strong>Lucas Ferreira</strong>
                  <span>Backing Vocal</span>
                </div>
                <span className="status-badge confirmado">Confirmado</span>
              </div>
            </div>

            {/* Grupo: Instrumentistas */}
            <div className="grupo-escala">
              <div className="grupo-titulo">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                  <path d="M9 18V5l12-2v13"/>
                  <circle cx="6" cy="18" r="3"/>
                  <circle cx="18" cy="16" r="3"/>
                </svg>
                <h4>Instrumentistas</h4>
              </div>

              <div className="membro-linha">
                <div className="membro-detalhe">
                  <strong>Mateus Ribeiro</strong>
                  <span>Teclado</span>
                </div>
                <span className="status-badge confirmado">Confirmado</span>
              </div>

              <div className="membro-linha pendente-card">
                <div className="membro-detalhe">
                  <strong>Wanderson Neres (Você)</strong>
                  <span>Violão</span>
                </div>
                <div className="membro-acoes">
                  <button className="btn-confirmar">Confirmar</button>
                  <button className="btn-substituir">Substituir</button>
                </div>
              </div>

              <div className="membro-linha">
                <div className="membro-detalhe">
                  <strong>Gabriel Ramos</strong>
                  <span>Bateria</span>
                </div>
                <span className="status-badge confirmado">Confirmado</span>
              </div>

              <div className="membro-linha">
                <div className="membro-detalhe">
                  <strong>Felipe Castro</strong>
                  <span>Baixo</span>
                </div>
                <span className="status-badge confirmado">Confirmado</span>
              </div>
            </div>

            {/* Grupo: Sonoplastia e Mídia */}
            <div className="grupo-escala">
              <div className="grupo-titulo">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/>
                  <line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <line x1="2" y1="7" x2="7" y2="7"/>
                  <line x1="2" y1="17" x2="7" y2="17"/>
                  <line x1="17" y1="17" x2="22" y2="17"/>
                  <line x1="17" y1="7" x2="22" y2="7"/>
                </svg>
                <h4>Sonoplastia & Mídia</h4>
              </div>

              <div className="membro-linha">
                <div className="membro-detalhe">
                  <strong>Rodrigo Alves</strong>
                  <span>Operador de Som</span>
                </div>
                <span className="status-badge confirmado">Confirmado</span>
              </div>

              <div className="membro-linha">
                <div className="membro-detalhe">
                  <strong>Beatriz Souza</strong>
                  <span>Slides / Projeção</span>
                </div>
                <span className="status-badge confirmado">Confirmado</span>
              </div>

              <div className="membro-linha">
                <div className="membro-detalhe">
                  <strong>Daniel Moreira</strong>
                  <span>Transmissão ao Vivo</span>
                </div>
                <span className="status-badge confirmado">Confirmado</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Menu Inferior Fixo (Bottom Navigation) */}
      <nav className="bottom-nav">
        <Link to="/" className="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Início</span>
        </Link>

        <Link to="/agenda" className="nav-item active">
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

export default Agenda
