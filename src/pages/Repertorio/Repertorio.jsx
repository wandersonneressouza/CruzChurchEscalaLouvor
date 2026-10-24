import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Repertorio.css'

function Repertorio() {
  const [filtroAtivo, setFiltroAtivo] = useState('Todas')
  const [busca, setBusca] = useState('')
  const [mostrarBusca, setMostrarBusca] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)

  // Campos para novo louvor
  const [novoTitulo, setNovoTitulo] = useState('')
  const [novoArtista, setNovoArtista] = useState('')
  const [novoTom, setNovoTom] = useState('G')
  const [novoBpm, setNovoBpm] = useState('72')
  const [novaTag, setNovaTag] = useState('Culto de Domingo')

  // Lista inicial com os louvores do protótipo
  const [musicas, setMusicas] = useState([
    {
      id: 1,
      titulo: 'Aleluia',
      artista: 'Gabriela Rocha',
      tom: 'G',
      bpm: '72',
      tag: 'Culto de Domingo',
      tipo: 'Culto',
      capaTexto: 'ALELUIA'
    },
    {
      id: 2,
      titulo: 'A Ele a Glória',
      artista: 'Ministério Zoe',
      tom: 'D',
      bpm: '70',
      tag: 'Culto de Domingo',
      tipo: 'Culto',
      capaTexto: 'A ELE A GLÓRIA'
    },
    {
      id: 3,
      titulo: 'Bondade de Deus',
      artista: 'Isaias Saad',
      tom: 'A',
      bpm: '74',
      tag: 'Ensaio',
      tipo: 'Culto',
      capaTexto: 'BONDADE'
    },
    {
      id: 4,
      titulo: 'Deus Cuida de Mim',
      artista: 'Pr. Lucas',
      tom: 'C',
      bpm: '68',
      tag: 'Culto de Celebração',
      tipo: 'Culto',
      capaTexto: 'CUIDA DE MIM'
    },
    {
      id: 5,
      titulo: 'Faz Tua Vontade',
      artista: 'Morada',
      tom: 'E',
      bpm: '76',
      tag: 'Tema: Adoração',
      tipo: 'Tema',
      capaTexto: 'FAZ TUA VONTADE'
    },
    {
      id: 6,
      titulo: 'Ninguém Explica Deus',
      artista: 'Preto no Branco',
      tom: 'G',
      bpm: '72',
      tag: 'Repertório Geral',
      tipo: 'Minhas listas',
      capaTexto: 'PRETO NO BRANCO'
    }
  ])

  // Filtragem dinâmica
  const musicasFiltradas = musicas.filter((musica) => {
    const atendeFiltro =
      filtroAtivo === 'Todas' ||
      (filtroAtivo === 'Culto' && musica.tipo === 'Culto') ||
      (filtroAtivo === 'Tema' && musica.tipo === 'Tema') ||
      (filtroAtivo === 'Minhas listas' && musica.tipo === 'Minhas listas')

    const termo = busca.toLowerCase()
    const atendeBusca =
      musica.titulo.toLowerCase().includes(termo) ||
      musica.artista.toLowerCase().includes(termo) ||
      musica.tom.toLowerCase().includes(termo) ||
      musica.tag.toLowerCase().includes(termo)

    return atendeFiltro && atendeBusca
  })

  // Adicionar música ao repertório local
  function handleAdicionarMusica(e) {
    e.preventDefault()
    if (!novoTitulo.trim() || !novoArtista.trim()) return

    const novaMusica = {
      id: Date.now(),
      titulo: novoTitulo,
      artista: novoArtista,
      tom: novoTom,
      bpm: novoBpm,
      tag: novaTag,
      tipo: novaTag.includes('Tema') ? 'Tema' : 'Culto',
      capaTexto: novoTitulo.substring(0, 10).toUpperCase()
    }

    setMusicas([novaMusica, ...musicas])
    setNovoTitulo('')
    setNovoArtista('')
    setModalAberto(false)
  }

  return (
    <div id="tela-repertorio">
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

      {/* Conteúdo com Rolagem */}
      <div className="repertorio-scroll-content">
        {/* Topo / Header */}
        <header className="repertorio-header">
          <Link to="/" className="btn-voltar" aria-label="Voltar para o Início">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h2>Repertório</h2>
          <button
            className={`btn-busca-toggle ${mostrarBusca ? 'ativo' : ''}`}
            onClick={() => setMostrarBusca(!mostrarBusca)}
            aria-label="Buscar música"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </header>

        {/* Campo de Busca Rápida (Expansível) */}
        {mostrarBusca && (
          <div className="campo-busca-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, cantor ou tom..."
              autoFocus
            />
            {busca && (
              <button className="btn-limpar-busca" onClick={() => setBusca('')}>
                ✕
              </button>
            )}
          </div>
        )}

        {/* Chips de Filtros Horizontais */}
        <div className="chips-filtros-container">
          {['Todas', 'Culto', 'Tema', 'Minhas listas'].map((categoria) => (
            <button
              key={categoria}
              className={`chip-btn ${filtroAtivo === categoria ? 'active' : ''}`}
              onClick={() => setFiltroAtivo(categoria)}
            >
              {categoria}
            </button>
          ))}
        </div>

        {/* Lista de Louvores */}
        <div className="lista-musicas">
          {musicasFiltradas.length > 0 ? (
            musicasFiltradas.map((musica) => (
              <div key={musica.id} className="card-musica">
                {/* Capa da Música */}
                <div className="musica-capa">
                  <div className="capa-textura">
                    <span className="capa-label">{musica.capaTexto}</span>
                  </div>
                </div>

                {/* Detalhes da Música */}
                <div className="musica-info">
                  <h4>{musica.titulo}</h4>
                  <p className="musica-artista">{musica.artista}</p>
                  <p className="musica-meta">
                    Tom: <strong>{musica.tom}</strong> • BPM: <strong>{musica.bpm}</strong>
                  </p>
                  <span className="musica-tag">{musica.tag}</span>
                </div>

                {/* Seta de navegação */}
                <div className="musica-seta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            ))
          ) : (
            <div className="sem-resultados">
              <p>Nenhuma música encontrada com esse filtro.</p>
              <button onClick={() => { setBusca(''); setFiltroAtivo('Todas'); }}>Limpar filtros</button>
            </div>
          )}
        </div>
      </div>

      {/* Botão de Ação Flutuante (FAB) para Adicionar Louvor */}
      <button
        className="btn-fab-adicionar"
        onClick={() => setModalAberto(true)}
        aria-label="Adicionar louvor"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Modal Monobloco de Cadastro de Música */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adicionar Nova Música</h3>
              <button className="btn-fechar-modal" onClick={() => setModalAberto(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAdicionarMusica} className="modal-form">
              <label>
                Título do Louvor
                <input
                  type="text"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex: Bondade de Deus"
                  required
                />
              </label>

              <label>
                Artista / Ministério
                <input
                  type="text"
                  value={novoArtista}
                  onChange={(e) => setNovoArtista(e.target.value)}
                  placeholder="Ex: Isaias Saad"
                  required
                />
              </label>

              <div className="form-duo">
                <label>
                  Tom Principal
                  <input
                    type="text"
                    value={novoTom}
                    onChange={(e) => setNovoTom(e.target.value)}
                    placeholder="G, D, Em..."
                    required
                  />
                </label>
                <label>
                  BPM
                  <input
                    type="number"
                    value={novoBpm}
                    onChange={(e) => setNovoBpm(e.target.value)}
                    placeholder="72"
                    required
                  />
                </label>
              </div>

              <label>
                Classificação / Culto
                <select value={novaTag} onChange={(e) => setNovaTag(e.target.value)}>
                  <option value="Culto de Domingo">Culto de Domingo</option>
                  <option value="Culto de Celebração">Culto de Celebração</option>
                  <option value="Ensaio">Ensaio</option>
                  <option value="Tema: Adoração">Tema: Adoração</option>
                  <option value="Repertório Geral">Repertório Geral</option>
                </select>
              </label>

              <button type="submit" className="btn-salvar-musica">
                Salvar Louvor
              </button>
            </form>
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

        <Link to="/musicas" className="nav-item active">
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

export default Repertorio
