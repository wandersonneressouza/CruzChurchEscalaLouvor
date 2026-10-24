import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Devocional.css'

function Devocional() {
  const [abaAtiva, setAbaAtiva] = useState('leitura') // 'leitura' | 'plano'
  const [lido, setLido] = useState(false)
  const [favorito, setFavorito] = useState(false)
  const [tocandoAudio, setTocandoAudio] = useState(false)
  const [diaSelecionado, setDiaSelecionado] = useState(26)
  const [notificacaoCopiado, setNotificacaoCopiado] = useState(false)

  // Dados dos dias do plano de leitura da semana
  const diasPlano = [
    {
      dia: 26,
      semana: 'Seg',
      dataExtenso: '26 de Outubro',
      titulo: 'O Poder da Adoração em Meio à Provação',
      passagem: 'Atos 16:25-26',
      tempo: '3 min',
      status: 'hoje',
      concluido: lido
    },
    {
      dia: 27,
      semana: 'Ter',
      dataExtenso: '27 de Outubro',
      titulo: 'Excelência Técnica e Coração Humilde',
      passagem: '1 Crônicas 25:6-8',
      tempo: '4 min',
      status: 'proximo',
      concluido: false
    },
    {
      dia: 28,
      semana: 'Qua',
      dataExtenso: '28 de Outubro',
      titulo: 'Preparação do Ensaio com Propósito',
      passagem: 'Salmos 33:1-3',
      tempo: '3 min',
      status: 'proximo',
      concluido: false
    },
    {
      dia: 29,
      semana: 'Qui',
      dataExtenso: '29 de Outubro',
      titulo: 'Unidade entre Banda, Som e Mídia',
      passagem: 'Efésios 4:1-3',
      tempo: '4 min',
      status: 'proximo',
      concluido: false
    },
    {
      dia: 30,
      semana: 'Sex',
      dataExtenso: '30 de Outubro',
      titulo: 'Santificação e Vida Secreta com Deus',
      passagem: 'Salmos 51:10-12',
      tempo: '5 min',
      status: 'proximo',
      concluido: false
    },
    {
      dia: 31,
      semana: 'Sáb',
      dataExtenso: '31 de Outubro',
      titulo: 'O Descanso e a Confiança no Senhor',
      passagem: 'Salmos 37:5-7',
      tempo: '3 min',
      status: 'proximo',
      concluido: false
    },
    {
      dia: 1,
      semana: 'Dom',
      dataExtenso: '01 de Novembro',
      titulo: 'O Culto da Celebração: Adoração Coletiva',
      passagem: 'Salmos 100:1-5',
      tempo: '4 min',
      status: 'proximo',
      concluido: false
    }
  ]

  const handleCompartilhar = () => {
    navigator.clipboard?.writeText(
      'Devocional Cruz Church: "O Poder da Adoração em Meio à Provação" (Atos 16:25) - Perto da meia-noite Paulo e Silas cantavam louvores a Deus...'
    )
    setNotificacaoCopiado(true)
    setTimeout(() => setNotificacaoCopiado(false), 2600)
  }

  return (
    <div id="tela-devocional">
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
      <div className="devocional-scroll-content">
        {/* Topo / Header */}
        <header className="devocional-header">
          <Link to="/" className="btn-voltar" aria-label="Voltar para o Início">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h2>Devocional</h2>
          <div className="header-acoes">
            <button
              className={`btn-acao-header ${favorito ? 'ativo' : ''}`}
              onClick={() => setFavorito(!favorito)}
              aria-label="Favoritar reflexão"
            >
              <svg viewBox="0 0 24 24" fill={favorito ? '#f59e0b' : 'none'} stroke={favorito ? '#f59e0b' : 'currentColor'} strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
            <button
              className="btn-acao-header"
              onClick={handleCompartilhar}
              aria-label="Compartilhar reflexão"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </header>

        {/* Notificação Toast Flutuante ao compartilhar */}
        {notificacaoCopiado && (
          <div className="toast-aviso">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Texto copiado para compartilhar!</span>
          </div>
        )}

        {/* Segmented Control: Abas de visualização */}
        <div className="segmented-wrapper">
          <div className="segmented-control">
            <button
              className={`segmented-btn ${abaAtiva === 'leitura' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('leitura')}
            >
              Leitura do Dia
            </button>
            <button
              className={`segmented-btn ${abaAtiva === 'plano' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('plano')}
            >
              Plano Semanal
            </button>
          </div>
        </div>

        {/* CONTEÚDO DA ABA: LEITURA DO DIA */}
        {abaAtiva === 'leitura' && (
          <div className="aba-leitura-container">
            {/* Hero Card do Devocional */}
            <section className="hero-devocional">
              <div className="hero-badge-row">
                <span className="badge-tema">Ministério & Altar</span>
                <span className="hero-data">26 Out 2026</span>
              </div>
              <h1 className="hero-titulo">O Poder da Adoração em Meio à Provação</h1>
              <div className="hero-autor-meta">
                <div className="autor-avatar">
                  <span>CC</span>
                </div>
                <div className="autor-detalhes">
                  <span className="autor-nome">Pr. Marcos Cruz</span>
                  <span className="autor-sub">Pastoral de Adoração • 3 min de leitura</span>
                </div>
              </div>

              {/* Player de Áudio Devocional */}
              <div className="player-audio-card">
                <button
                  className="btn-play-pause"
                  onClick={() => setTocandoAudio(!tocandoAudio)}
                  aria-label={tocandoAudio ? 'Pausar áudio' : 'Ouvir devocional em áudio'}
                >
                  {tocandoAudio ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>
                <div className="player-info">
                  <div className="player-titulos">
                    <span className="player-titulo">
                      {tocandoAudio ? 'Tocando reflexão narrada...' : 'Ouvir reflexão em áudio'}
                    </span>
                    <span className="player-duracao">{tocandoAudio ? '01:42 / 03:50' : '03:50 min'}</span>
                  </div>
                  <div className="player-barra">
                    <div
                      className="player-progresso"
                      style={{ width: tocandoAudio ? '45%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Card Versículo Chave */}
            <section className="card-versiculo-chave">
              <div className="versiculo-icone">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <blockquote className="versiculo-texto">
                "Por volta da meia-noite, Paulo e Silas oravam e cantavam hinos a Deus, e os outros presos os escutavam. De repente, sobreveio um terremoto tão violento que os alicerces da prisão foram abalados."
              </blockquote>
              <cite className="versiculo-ref">Atos 16:25-26</cite>
            </section>

            {/* Corpo da Mensagem Reflexiva */}
            <section className="corpo-reflexao">
              <div className="paragrafo-bloco">
                <h3>1. Adoração independe das circunstâncias</h3>
                <p>
                  Na prisão de Filipos, os pés de Paulo e Silas estavam presos no tronco e suas costas sangravam devido aos açoites. Não havia luz, conforto ou aplausos. Mesmo assim, à meia-noite, o som que ecoava não era de queixas, mas de adoração genuína.
                </p>
                <p>
                  Muitas vezes chegamos ao ensaio ou ao altar trazendo ansiedades, cansaço da semana ou pressões pessoais. Mas a adoração verdadeira não nasce do que sentimos ao redor; nasce de Quem Deus é no trono.
                </p>
              </div>

              <div className="paragrafo-bloco">
                <h3>2. A melodia que destranca prisões</h3>
                <p>
                  O texto diz que <em>"os outros presos os escutavam"</em>. Quando ministramos ou tocamos com entrega total, aqueles que estão no templo ouvindo — feridos, oprimidos ou sem esperança — experimentam a atmosfera da liberdade de Cristo.
                </p>
                <p>
                  O seu instrumento e a sua voz não são meras apresentações musicais. São canais proféticos para que cadeias espirituais caiam e corações sejam restaurados.
                </p>
              </div>

              <div className="paragrafo-bloco">
                <h3>3. Aplicação prática para o nosso louvor</h3>
                <p>
                  Nesta semana, antes de ligar o instrumento ou aquecer a voz, dedique 5 minutos em oração particular. Peça para que o Espírito Santo alinhe sua motivação à glória de Deus e que a unção flua sobre toda a igreja.
                </p>
              </div>
            </section>

            {/* Oração Guiada do Ministro */}
            <section className="card-oracao">
              <div className="oracao-header">
                <div className="oracao-icon-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <h4>Oração do Ministro & Voluntário</h4>
                  <span className="oracao-sub">Momento de consagração individual</span>
                </div>
              </div>
              <p className="oracao-texto">
                "Senhor Jesus, esvazio meu coração de qualquer vaidade ou busca por reconhecimento. Que minhas mãos, meus lábios e meu dom sejam exclusivamente para glorificar o Teu Santo Nome. Toca os corações daqueles que ouvirem o louvor e cura os quebrantados. Em Teu Nome, Amém."
              </p>
            </section>

            {/* Card de Conclusão / Marcar como Lido */}
            <section className="secao-conclusao">
              <button
                className={`btn-marcar-lido ${lido ? 'concluido' : ''}`}
                onClick={() => setLido(!lido)}
              >
                {lido ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Leitura Concluída Hoje!</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 14 14" />
                    </svg>
                    <span>Concluir Leitura de Hoje</span>
                  </>
                )}
              </button>
            </section>
          </div>
        )}

        {/* CONTEÚDO DA ABA: PLANO SEMANAL */}
        {abaAtiva === 'plano' && (
          <div className="aba-plano-container">
            {/* Card de Progresso da Semana */}
            <section className="card-progresso-semana">
              <div className="progresso-header">
                <div>
                  <h3>Plano Semanal: Vida no Altar</h3>
                  <p>Semana 43 • Outubro 2026</p>
                </div>
                <span className="progresso-percent">
                  {lido ? '57%' : '43%'}
                </span>
              </div>
              <div className="barra-progresso-bg">
                <div
                  className="barra-progresso-fill"
                  style={{ width: lido ? '57%' : '43%' }}
                ></div>
              </div>
              <div className="progresso-stats">
                <span>{lido ? '4 de 7 devocionais lidos' : '3 de 7 devocionais lidos'}</span>
                <span className="streak-badge">🔥 4 dias seguidos</span>
              </div>
            </section>

            {/* Lista dos 7 Dias do Plano */}
            <section className="lista-dias-plano">
              <h4 className="secao-plano-titulo">Cronograma de Leituras</h4>
              <div className="cards-dias-grid">
                {diasPlano.map((item) => (
                  <div
                    key={item.dia}
                    className={`card-dia-item ${item.dia === diaSelecionado ? 'selecionado' : ''} ${item.status === 'hoje' ? 'dia-atual' : ''}`}
                    onClick={() => setDiaSelecionado(item.dia)}
                  >
                    <div className="dia-badge-col">
                      <span className="dia-semana">{item.semana}</span>
                      <span className="dia-numero">{item.dia}</span>
                      {item.concluido && (
                        <span className="dia-check-icon">✓</span>
                      )}
                    </div>
                    <div className="dia-info-col">
                      <div className="dia-topo-row">
                        <span className="dia-passagem">{item.passagem}</span>
                        <span className="dia-tempo">{item.tempo}</span>
                      </div>
                      <h4 className="dia-titulo">{item.titulo}</h4>
                      {item.status === 'hoje' && (
                        <span className="tag-hoje-badge">Devocional de Hoje</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
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

        <Link to="/devocional" className="nav-item active">
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

export default Devocional
