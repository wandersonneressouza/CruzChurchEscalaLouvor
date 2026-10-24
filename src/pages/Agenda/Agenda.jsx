import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import './Agenda.css'

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const MESES_ABREV = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
  'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
]

function formatarDia(dataStr) {
  if (!dataStr) return '--'
  if (dataStr.length >= 10) return dataStr.substring(8, 10)
  return dataStr
}

function formatarMesAbrev(dataStr) {
  if (!dataStr) return 'CUL'
  if (dataStr.length >= 7) {
    const m = parseInt(dataStr.substring(5, 7), 10) - 1
    return MESES_ABREV[m] || 'CUL'
  }
  return 'CUL'
}

function Agenda() {
  const {
    agendaEventos,
    escalas,
    totalEscalasPendentes,
    confirmarPresenca,
    solicitarSubstituicao,
    criarEventoAgenda,
    atualizarEventoAgenda,
    excluirEventoAgenda,
    criarEscala,
    igrejas,
    usuario
  } = useAppContext()

  const [abaAtiva, setAbaAtiva] = useState('calendario')
  const ehLider = usuario?.tipoConta === 'lider' || usuario?.tipoConta === 'admin' || usuario?.cargo?.toLowerCase().includes('líder')

  // Navegação dinâmica de Mês e Ano
  const dataHoje = new Date()
  const [anoAtual, setAnoAtual] = useState(dataHoje.getFullYear())
  const [mesAtual, setMesAtual] = useState(dataHoje.getMonth())
  const [diaSelecionado, setDiaSelecionado] = useState(null)

  // Escala ativa na aba "Escalas"
  const [escalaSelecionadaId, setEscalaSelecionadaId] = useState(null)

  // Modal de Criação / Edição de Evento (Líder / Admin)
  const [modalNovoEvento, setModalNovoEvento] = useState(false)
  const [eventoEmEdicao, setEventoEmEdicao] = useState(null)
  const [formEvento, setFormEvento] = useState({
    titulo: '',
    tipo: 'Culto',
    data: new Date().toISOString().substring(0, 10),
    hora: '19:00',
    local: usuario?.campus || 'Templo Central',
    descricao: '',
    igrejaId: usuario?.igrejaId ? String(usuario.igrejaId) : (igrejas && igrejas.length > 0 ? String(igrejas[0].id) : ''),
    criarEscalaAuto: true
  })
  const [salvandoEvento, setSalvandoEvento] = useState(false)

  // Filtra dados para a congregação atual (ou todas se for Admin geral)
  const eventosIgreja = useMemo(() => {
    if (!agendaEventos) return []
    return agendaEventos.filter(e => !usuario?.igrejaId || e.igrejaId === usuario.igrejaId)
  }, [agendaEventos, usuario?.igrejaId])

  const escalasIgreja = useMemo(() => {
    if (!escalas) return []
    return escalas.filter(e => !usuario?.igrejaId || e.igrejaId === usuario.igrejaId)
  }, [escalas, usuario?.igrejaId])

  // Escala ativa em exibição
  const escalaAtiva = useMemo(() => {
    if (escalasIgreja.length === 0) return null
    if (escalaSelecionadaId) {
      const achou = escalasIgreja.find(e => e.id === escalaSelecionadaId)
      if (achou) return achou
    }
    return escalasIgreja[0]
  }, [escalasIgreja, escalaSelecionadaId])

  // Grupos de integrantes da escala selecionada
  const gruposIntegrantes = useMemo(() => {
    if (!escalaAtiva?.integrantes) return { vocal: [], instrumentos: [], midia: [], outros: [] }
    const res = { vocal: [], instrumentos: [], midia: [], outros: [] }

    escalaAtiva.integrantes.forEach(m => {
      const f = (m.funcao || '').toLowerCase()
      const n = (m.naipe || '').toLowerCase()

      if (
        n.includes('vocal') ||
        f.includes('vocal') ||
        f.includes('soprano') ||
        f.includes('contralto') ||
        f.includes('tenor') ||
        f.includes('ministro') ||
        f.includes('líder de louvor')
      ) {
        res.vocal.push(m)
      } else if (
        n.includes('harmonia') ||
        n.includes('ritmo') ||
        f.includes('teclado') ||
        f.includes('piano') ||
        f.includes('violão') ||
        f.includes('guitarra') ||
        f.includes('baixo') ||
        f.includes('bateria') ||
        f.includes('percussão') ||
        f.includes('metais') ||
        f.includes('sax')
      ) {
        res.instrumentos.push(m)
      } else if (
        n.includes('mídia') ||
        n.includes('técnica') ||
        f.includes('som') ||
        f.includes('áudio') ||
        f.includes('slides') ||
        f.includes('projeção') ||
        f.includes('transmissão') ||
        f.includes('iluminação') ||
        f.includes('foto')
      ) {
        res.midia.push(m)
      } else {
        res.outros.push(m)
      }
    })

    return res
  }, [escalaAtiva])

  // Navegador do Mês
  function avancarMes() {
    if (mesAtual === 11) {
      setMesAtual(0)
      setAnoAtual(prev => prev + 1)
    } else {
      setMesAtual(prev => prev + 1)
    }
    setDiaSelecionado(null)
  }

  function retrocederMes() {
    if (mesAtual === 0) {
      setMesAtual(11)
      setAnoAtual(prev => prev - 1)
    } else {
      setMesAtual(prev => prev - 1)
    }
    setDiaSelecionado(null)
  }

  // Gera a grade de dias do mês atual
  const diasGrid = useMemo(() => {
    const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay()
    const totalDiasMes = new Date(anoAtual, mesAtual + 1, 0).getDate()
    const totalDiasMesAnterior = new Date(anoAtual, mesAtual, 0).getDate()

    const lista = []

    // Dias do mês anterior
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      lista.push({
        numero: totalDiasMesAnterior - i,
        outroMes: true
      })
    }

    // Dias do mês atual com verificação de eventos reais
    for (let d = 1; d <= totalDiasMes; d++) {
      const dStr = String(d).padStart(2, '0')
      const mStr = String(mesAtual + 1).padStart(2, '0')
      const dataIso = `${anoAtual}-${mStr}-${dStr}`

      const evNoDia = eventosIgreja.find(e => e.data === dataIso)
      const escNoDia = escalasIgreja.find(e => e.dataRaw === dataIso || e.data === dataIso)

      let dot = null
      if (evNoDia) {
        dot = evNoDia.tipo === 'Culto' ? 'green' : 'orange'
      } else if (escNoDia) {
        dot = 'green'
      }

      lista.push({
        numero: d,
        dataIso,
        outroMes: false,
        dot,
        temEvento: Boolean(evNoDia || escNoDia)
      })
    }

    return lista
  }, [anoAtual, mesAtual, eventosIgreja, escalasIgreja])

  // Eventos exibidos na lista de compromissos
  const eventosExibidos = useMemo(() => {
    if (diaSelecionado) {
      const dStr = String(diaSelecionado).padStart(2, '0')
      const mStr = String(mesAtual + 1).padStart(2, '0')
      const dataIso = `${anoAtual}-${mStr}-${dStr}`
      return eventosIgreja.filter(e => e.data === dataIso)
    }
    return eventosIgreja
  }, [eventosIgreja, diaSelecionado, anoAtual, mesAtual])

  // Abrir modal configurando para NOVO evento
  function abrirModalNovoEvento() {
    setEventoEmEdicao(null)
    setFormEvento({
      titulo: '',
      tipo: 'Culto',
      data: new Date().toISOString().substring(0, 10),
      hora: '19:00',
      local: usuario?.campus || 'Templo Central',
      descricao: '',
      igrejaId: usuario?.igrejaId ? String(usuario.igrejaId) : (igrejas && igrejas.length > 0 ? String(igrejas[0].id) : ''),
      criarEscalaAuto: true
    })
    setModalNovoEvento(true)
  }

  // Abrir modal configurado para EDITAR evento existente
  function abrirModalEditarEvento(ev, e) {
    if (e) e.stopPropagation()
    setEventoEmEdicao(ev)
    setFormEvento({
      titulo: ev.titulo || '',
      tipo: ev.tipo || 'Culto',
      data: ev.data || new Date().toISOString().substring(0, 10),
      hora: ev.hora ? ev.hora.substring(0, 5) : '19:00',
      local: ev.local || usuario?.campus || 'Templo Central',
      descricao: ev.descricao || '',
      igrejaId: ev.igrejaId ? String(ev.igrejaId) : (usuario?.igrejaId ? String(usuario.igrejaId) : (igrejas && igrejas.length > 0 ? String(igrejas[0].id) : '')),
      criarEscalaAuto: false
    })
    setModalNovoEvento(true)
  }

  // Excluir evento existente do banco de dados
  async function handleExcluirEvento(ev, e) {
    if (e) e.stopPropagation()
    const confirmou = window.confirm(
      `Deseja realmente excluir o evento "${ev.titulo}" (${ev.data})?\n\n` +
      `Se houver escala vinculada a este evento, ela também será removida.`
    )
    if (!confirmou) return

    try {
      if (excluirEventoAgenda) {
        await excluirEventoAgenda(ev.id)
        alert('Evento excluído com sucesso!')
      }
    } catch (err) {
      alert('Erro ao excluir evento: ' + (err.message || 'Falha na comunicação com o banco.'))
    }
  }

  // Salvar evento (Novo ou Edição) no Supabase
  async function handleSalvarEvento(e) {
    e.preventDefault()
    if (!formEvento.titulo) {
      alert('Informe o título do evento.')
      return
    }

    setSalvandoEvento(true)
    try {
      if (eventoEmEdicao) {
        // Atualização de evento existente
        if (atualizarEventoAgenda) {
          await atualizarEventoAgenda(eventoEmEdicao.id, {
            ...formEvento,
            igrejaId: formEvento.igrejaId ? Number(formEvento.igrejaId) : (usuario?.igrejaId ? Number(usuario.igrejaId) : null)
          })
        }
        alert('Evento atualizado com sucesso!')
      } else {
        // Criação de novo evento
        if (criarEventoAgenda) {
          await criarEventoAgenda({
            ...formEvento,
            igrejaId: formEvento.igrejaId ? Number(formEvento.igrejaId) : (usuario?.igrejaId ? Number(usuario.igrejaId) : null)
          })
        }
        alert('Evento agendado com sucesso!')
      }
      setModalNovoEvento(false)
      setEventoEmEdicao(null)
      setFormEvento({
        titulo: '',
        tipo: 'Culto',
        data: new Date().toISOString().substring(0, 10),
        hora: '19:00',
        local: usuario?.campus || 'Templo Central',
        descricao: '',
        igrejaId: usuario?.igrejaId ? String(usuario.igrejaId) : (igrejas && igrejas.length > 0 ? String(igrejas[0].id) : ''),
        criarEscalaAuto: true
      })
    } catch (err) {
      alert('Erro ao salvar evento: ' + (err.message || 'Falha na comunicação.'))
    } finally {
      setSalvandoEvento(false)
    }
  }

  return (
    <div id="tela-agenda">
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
          {ehLider ? (
            <button
              className="btn-add-evento"
              aria-label="Novo evento"
              title="Adicionar Novo Evento"
              onClick={abrirModalNovoEvento}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          ) : (
            <div style={{ width: 38 }}></div>
          )}
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
            Escalas {escalasIgreja.length > 0 && `(${escalasIgreja.length})`}
          </button>
        </div>

        {/* ====================================================================
            VISUALIZAÇÃO: ABA CALENDÁRIO
            ==================================================================== */}
        {abaAtiva === 'calendario' && (
          <div className="conteudo-calendario">
            {/* Navegador de Mês Dinâmico */}
            <div className="mes-navegador">
              <button className="mes-nav-seta" aria-label="Mês anterior" onClick={retrocederMes}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h3>{NOMES_MESES[mesAtual]} {anoAtual}</h3>
              <button className="mes-nav-seta" aria-label="Próximo mês" onClick={avancarMes}>
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

            {/* Grade dos dias do mês calculada dinamicamente */}
            <div className="grade-calendario">
              {diasGrid.map((dia, index) => {
                const isSelecionado = diaSelecionado === dia.numero && !dia.outroMes
                return (
                  <div
                    key={index}
                    className={`dia-celula ${dia.outroMes ? 'outro-mes' : ''} ${isSelecionado ? 'selecionado' : ''}`}
                    onClick={() => {
                      if (!dia.outroMes) {
                        setDiaSelecionado(diaSelecionado === dia.numero ? null : dia.numero)
                      }
                    }}
                  >
                    <span className="dia-numero">{dia.numero}</span>
                    {dia.dot && <span className={`dia-dot ${dia.dot}`}></span>}
                  </div>
                )
              })}
            </div>

            {/* Seção: Próximos Compromissos Reais do Banco de Dados */}
            <section className="secao-compromissos">
              <div className="secao-cabecalho">
                <h3>
                  {diaSelecionado
                    ? `Compromissos em ${diaSelecionado} de ${NOMES_MESES[mesAtual]}`
                    : 'Próximos compromissos'}
                </h3>
                {diaSelecionado && (
                  <button className="link-ver-todos" onClick={() => setDiaSelecionado(null)}>
                    Ver todos
                  </button>
                )}
              </div>

              {eventosExibidos.length > 0 ? (
                <div className="lista-eventos">
                  {eventosExibidos.map(ev => {
                    const temEscala = escalasIgreja.some(
                      esc => esc.dataRaw === ev.data || esc.data === ev.data || esc.evento === ev.titulo
                    )

                    return (
                      <div
                        key={ev.id}
                        className="card-evento"
                        onClick={() => {
                          if (temEscala) {
                            const esc = escalasIgreja.find(
                              e => e.dataRaw === ev.data || e.data === ev.data || e.evento === ev.titulo
                            )
                            if (esc) setEscalaSelecionadaId(esc.id)
                            setAbaAtiva('escalas')
                          }
                        }}
                        style={{ cursor: temEscala ? 'pointer' : 'default' }}
                      >
                        <div className="evento-data-badge">
                          <span className="badge-dia">{formatarDia(ev.data)}</span>
                          <span className="badge-mes">{formatarMesAbrev(ev.data)}</span>
                        </div>
                        <div className="evento-info">
                          <span className={`tag-tipo-evento ${ev.tipo === 'Culto' ? 'culto' : ev.tipo === 'Ensaio' ? 'ensaio' : 'outro'}`}>
                            {ev.tipo || 'Culto'}
                          </span>
                          <h4>{ev.titulo}</h4>
                          <p className="evento-horario">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13, display: 'inline', marginRight: 4, verticalAlign: '-1px' }}>
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {ev.hora || '19:00'}
                          </p>
                          <p className="evento-local">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {ev.local || usuario?.campus || 'Templo Central'}
                          </p>
                          {ev.descricao && (
                            <p style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                              {ev.descricao}
                            </p>
                          )}
                        </div>
                        {ehLider ? (
                          <div className="evento-acoes-lider" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              className="btn-acao-evento btn-editar-evento"
                              title="Editar Evento"
                              aria-label="Editar Evento"
                              onClick={e => abrirModalEditarEvento(ev, e)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="btn-acao-evento btn-excluir-evento"
                              title="Excluir Evento"
                              aria-label="Excluir Evento"
                              onClick={e => handleExcluirEvento(ev, e)}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="evento-seta">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="agenda-vazia-box">
                  <div className="icone-vazia">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <h4>Nenhum evento agendado</h4>
                  <p>
                    {diaSelecionado
                      ? `Não há cultos ou ensaios marcados para o dia ${diaSelecionado} no banco de dados.`
                      : 'Ainda não há compromissos cadastrados no banco de dados para esta congregação.'}
                  </p>
                  {diaSelecionado && (
                    <button className="link-ver-todos" onClick={() => setDiaSelecionado(null)} style={{ marginTop: 6 }}>
                      Ver todos os dias
                    </button>
                  )}
                  {ehLider && (
                    <button
                      type="button"
                      className="btn-acao-vazia"
                      onClick={() => setModalNovoEvento(true)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Cadastrar Novo Culto / Ensaio</span>
                    </button>
                  )}
                </div>
              )}

              {/* Card de Alerta de Escalas Pendentes */}
              <div className="card-alerta-pendente" onClick={() => setAbaAtiva('escalas')}>
                <div className="alerta-avatar-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="alerta-texto">
                  <h4>
                    {totalEscalasPendentes > 0
                      ? `Você tem ${totalEscalasPendentes} escala${totalEscalasPendentes > 1 ? 's' : ''} pendente${totalEscalasPendentes > 1 ? 's' : ''}`
                      : 'Escalas do Ministério'}
                  </h4>
                  <p>
                    {totalEscalasPendentes > 0
                      ? 'Confirme sua presença ou solicite substituição.'
                      : 'Toque para visualizar os integrantes escalados para cada culto.'}
                  </p>
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

        {/* ====================================================================
            VISUALIZAÇÃO: ABA ESCALAS REAIS
            ==================================================================== */}
        {abaAtiva === 'escalas' && (
          <div className="conteudo-escalas">
            {escalasIgreja.length > 0 ? (
              <>
                {/* Seletor de Escalas quando houver mais de uma */}
                {escalasIgreja.length > 1 && (
                  <div className="seletor-escalas-nav">
                    {escalasIgreja.map(esc => {
                      const isActive = escalaAtiva?.id === esc.id
                      return (
                        <button
                          key={esc.id}
                          type="button"
                          className={`btn-seletor-escala ${isActive ? 'active' : ''}`}
                          onClick={() => setEscalaSelecionadaId(esc.id)}
                        >
                          <span>{esc.evento}</span>
                          <small>({esc.dataCurta})</small>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Banner do Culto da Escala Real */}
                <div className="escala-evento-destaque">
                  <span className="tag-evento">{escalaAtiva.status?.toUpperCase() || 'PUBLICADA'}</span>
                  <h3>{escalaAtiva.evento} — {escalaAtiva.dataCurta || formatarDia(escalaAtiva.data)} {formatarMesAbrev(escalaAtiva.data)}</h3>
                  <p className="horario-local">
                    {escalaAtiva.hora} • {escalaAtiva.local || usuario?.campus || 'Templo Central'}
                  </p>
                  {escalaAtiva.observacoes && (
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                      "{escalaAtiva.observacoes}"
                    </p>
                  )}
                </div>

                {/* 1. Grupo: Vocal */}
                {gruposIntegrantes.vocal.length > 0 && (
                  <div className="grupo-escala">
                    <div className="grupo-titulo">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" y1="19" x2="12" y2="23"/>
                        <line x1="8" y1="23" x2="16" y2="23"/>
                      </svg>
                      <h4>Equipe de Vocal ({gruposIntegrantes.vocal.length})</h4>
                    </div>

                    {gruposIntegrantes.vocal.map(m => {
                      const ehVoce = usuario && (m.userId === usuario.id || m.email === usuario.email)
                      return (
                        <div
                          key={m.id || m.userId}
                          className={`membro-linha ${ehVoce && m.status === 'pendente' ? 'pendente-card' : ''}`}
                        >
                          <div className="membro-info-esquerda">
                            <div className={`membro-avatar-circulo ${ehVoce ? 'destaque-voce' : ''}`}>
                              {m.avatar || (m.nome ? m.nome.substring(0, 2).toUpperCase() : 'VC')}
                            </div>
                            <div className="membro-detalhe">
                              <strong>{m.nome} {ehVoce ? '(Você)' : ''}</strong>
                              <span>{m.funcao} {m.naipe && m.naipe !== 'Geral' ? `• ${m.naipe}` : ''}</span>
                            </div>
                          </div>

                          {ehVoce && m.status === 'pendente' ? (
                            <div className="membro-acoes">
                              <button className="btn-confirmar" onClick={() => confirmarPresenca(escalaAtiva.id)}>Confirmar</button>
                              <button className="btn-substituir" onClick={() => solicitarSubstituicao(escalaAtiva.id)}>Substituir</button>
                            </div>
                          ) : (
                            <span className={`status-badge ${m.status === 'confirmado' ? 'confirmado' : m.status === 'substituicao' ? 'pendente' : 'pendente'}`}>
                              {m.status === 'confirmado' ? 'Confirmado' : m.status === 'substituicao' ? 'Substituição' : 'Pendente'}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* 2. Grupo: Instrumentistas */}
                {gruposIntegrantes.instrumentos.length > 0 && (
                  <div className="grupo-escala">
                    <div className="grupo-titulo">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                      </svg>
                      <h4>Banda & Instrumentistas ({gruposIntegrantes.instrumentos.length})</h4>
                    </div>

                    {gruposIntegrantes.instrumentos.map(m => {
                      const ehVoce = usuario && (m.userId === usuario.id || m.email === usuario.email)
                      return (
                        <div
                          key={m.id || m.userId}
                          className={`membro-linha ${ehVoce && m.status === 'pendente' ? 'pendente-card' : ''}`}
                        >
                          <div className="membro-info-esquerda">
                            <div className={`membro-avatar-circulo ${ehVoce ? 'destaque-voce' : ''}`}>
                              {m.avatar || (m.nome ? m.nome.substring(0, 2).toUpperCase() : 'IN')}
                            </div>
                            <div className="membro-detalhe">
                              <strong>{m.nome} {ehVoce ? '(Você)' : ''}</strong>
                              <span>{m.funcao}</span>
                            </div>
                          </div>

                          {ehVoce && m.status === 'pendente' ? (
                            <div className="membro-acoes">
                              <button className="btn-confirmar" onClick={() => confirmarPresenca(escalaAtiva.id)}>Confirmar</button>
                              <button className="btn-substituir" onClick={() => solicitarSubstituicao(escalaAtiva.id)}>Substituir</button>
                            </div>
                          ) : (
                            <span className={`status-badge ${m.status === 'confirmado' ? 'confirmado' : m.status === 'substituicao' ? 'pendente' : 'pendente'}`}>
                              {m.status === 'confirmado' ? 'Confirmado' : m.status === 'substituicao' ? 'Substituição' : 'Pendente'}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* 3. Grupo: Sonoplastia e Mídia */}
                {gruposIntegrantes.midia.length > 0 && (
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
                      <h4>Sonoplastia & Mídia ({gruposIntegrantes.midia.length})</h4>
                    </div>

                    {gruposIntegrantes.midia.map(m => {
                      const ehVoce = usuario && (m.userId === usuario.id || m.email === usuario.email)
                      return (
                        <div
                          key={m.id || m.userId}
                          className={`membro-linha ${ehVoce && m.status === 'pendente' ? 'pendente-card' : ''}`}
                        >
                          <div className="membro-info-esquerda">
                            <div className={`membro-avatar-circulo ${ehVoce ? 'destaque-voce' : ''}`}>
                              {m.avatar || (m.nome ? m.nome.substring(0, 2).toUpperCase() : 'MD')}
                            </div>
                            <div className="membro-detalhe">
                              <strong>{m.nome} {ehVoce ? '(Você)' : ''}</strong>
                              <span>{m.funcao}</span>
                            </div>
                          </div>

                          {ehVoce && m.status === 'pendente' ? (
                            <div className="membro-acoes">
                              <button className="btn-confirmar" onClick={() => confirmarPresenca(escalaAtiva.id)}>Confirmar</button>
                              <button className="btn-substituir" onClick={() => solicitarSubstituicao(escalaAtiva.id)}>Substituir</button>
                            </div>
                          ) : (
                            <span className={`status-badge ${m.status === 'confirmado' ? 'confirmado' : m.status === 'substituicao' ? 'pendente' : 'pendente'}`}>
                              {m.status === 'confirmado' ? 'Confirmado' : m.status === 'substituicao' ? 'Substituição' : 'Pendente'}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* 4. Outros integrantes */}
                {gruposIntegrantes.outros.length > 0 && (
                  <div className="grupo-escala">
                    <div className="grupo-titulo">
                      <h4>Outros Ministros ({gruposIntegrantes.outros.length})</h4>
                    </div>

                    {gruposIntegrantes.outros.map(m => {
                      const ehVoce = usuario && (m.userId === usuario.id || m.email === usuario.email)
                      return (
                        <div
                          key={m.id || m.userId}
                          className={`membro-linha ${ehVoce && m.status === 'pendente' ? 'pendente-card' : ''}`}
                        >
                          <div className="membro-info-esquerda">
                            <div className={`membro-avatar-circulo ${ehVoce ? 'destaque-voce' : ''}`}>
                              {m.avatar || 'MB'}
                            </div>
                            <div className="membro-detalhe">
                              <strong>{m.nome} {ehVoce ? '(Você)' : ''}</strong>
                              <span>{m.funcao}</span>
                            </div>
                          </div>

                          <span className={`status-badge ${m.status === 'confirmado' ? 'confirmado' : 'pendente'}`}>
                            {m.status === 'confirmado' ? 'Confirmado' : 'Pendente'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Bloco de Setlist / Repertório Real da Escala */}
                {escalaAtiva.repertorio && escalaAtiva.repertorio.length > 0 && (
                  <div className="bloco-repertorio-escala">
                    <div className="topo-repertorio">
                      <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#1e5ec8" strokeWidth="2" style={{ width: 16, height: 16 }}>
                          <path d="M9 18V5l12-2v13" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="16" r="3" />
                        </svg>
                        <span>Repertório Escalado ({escalaAtiva.repertorio.length} músicas)</span>
                      </h4>
                      <Link to="/musicas" style={{ fontSize: '11.5px', color: '#1e5ec8', fontWeight: '700' }}>
                        Ver Cifras
                      </Link>
                    </div>

                    <div className="lista-musicas-escala">
                      {escalaAtiva.repertorio.map((r, idx) => (
                        <div key={r.id || idx} className="item-musica-escala">
                          <div className="musica-esquerda">
                            <span className="musica-ordem-badge">{r.ordem || idx + 1}</span>
                            <div className="musica-titulos">
                              <strong>{r.musica?.titulo || 'Louvor'}</strong>
                              <span>{r.musica?.artista || 'Ministério'}</span>
                            </div>
                          </div>
                          <span className="musica-tom-tag">Tom: {r.tom || r.musica?.tom || 'G'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="agenda-vazia-box">
                <div className="icone-vazia">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <h4>Nenhuma escala cadastrada</h4>
                <p>
                  Ainda não há escalas montadas no banco de dados para os próximos cultos desta congregação.
                </p>
                {ehLider && (
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                      Como líder, você pode montar novas escalas e associar voluntários e repertório.
                    </p>
                    <button
                      type="button"
                      className="btn-salvar-modal-agenda"
                      style={{ padding: '8px 18px', fontSize: '13px' }}
                      onClick={abrirModalNovoEvento}
                    >
                      + Agendar Culto &amp; Criar Escala
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ====================================================================
          MODAL: NOVO EVENTO NA AGENDA (LÍDER / ADMIN)
          ==================================================================== */}
      {modalNovoEvento && (
        <div className="modal-agenda-backdrop" onClick={() => setModalNovoEvento(false)}>
          <div className="modal-agenda-caixa" onClick={e => e.stopPropagation()}>
            <div className="modal-agenda-header">
              <h3>{eventoEmEdicao ? 'Editar Evento da Agenda' : 'Novo Evento na Agenda'}</h3>
              <button
                type="button"
                className="btn-fechar-modal-agenda"
                onClick={() => {
                  setModalNovoEvento(false)
                  setEventoEmEdicao(null)
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEvento}>
              <div className="modal-agenda-corpo">
                {/* Seleção de Congregação se houver mais de uma ou se for Admin */}
                {igrejas && igrejas.length > 1 && (
                  <div className="campo-modal-agenda">
                    <label htmlFor="ev-igreja">Congregação / Igreja *</label>
                    <select
                      id="ev-igreja"
                      value={formEvento.igrejaId}
                      onChange={e => setFormEvento({ ...formEvento, igrejaId: e.target.value })}
                    >
                      {igrejas.map(ig => (
                        <option key={ig.id} value={ig.id}>
                          {ig.nome} {ig.cidade ? `(${ig.cidade})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="campo-modal-agenda">
                  <label htmlFor="ev-titulo">Nome do Evento / Culto *</label>
                  <input
                    id="ev-titulo"
                    type="text"
                    required
                    placeholder="Ex: Culto de Celebração, Ensaio Geral"
                    value={formEvento.titulo}
                    onChange={e => setFormEvento({ ...formEvento, titulo: e.target.value })}
                  />
                </div>

                <div className="linha-campos-dupla">
                  <div className="campo-modal-agenda">
                    <label htmlFor="ev-tipo">Tipo</label>
                    <select
                      id="ev-tipo"
                      value={formEvento.tipo}
                      onChange={e => setFormEvento({ ...formEvento, tipo: e.target.value })}
                    >
                      <option value="Culto">Culto</option>
                      <option value="Ensaio">Ensaio</option>
                      <option value="Conferência">Conferência</option>
                      <option value="Imersão">Imersão</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div className="campo-modal-agenda">
                    <label htmlFor="ev-hora">Horário</label>
                    <input
                      id="ev-hora"
                      type="time"
                      value={formEvento.hora}
                      onChange={e => setFormEvento({ ...formEvento, hora: e.target.value })}
                    />
                  </div>
                </div>

                <div className="campo-modal-agenda">
                  <label htmlFor="ev-data">Data *</label>
                  <input
                    id="ev-data"
                    type="date"
                    required
                    value={formEvento.data}
                    onChange={e => setFormEvento({ ...formEvento, data: e.target.value })}
                  />
                </div>

                <div className="campo-modal-agenda">
                  <label htmlFor="ev-local">Local</label>
                  <input
                    id="ev-local"
                    type="text"
                    placeholder="Ex: Templo Principal, Sala de Música"
                    value={formEvento.local}
                    onChange={e => setFormEvento({ ...formEvento, local: e.target.value })}
                  />
                </div>

                <div className="campo-modal-agenda">
                  <label htmlFor="ev-desc">Observações / Detalhes</label>
                  <textarea
                    id="ev-desc"
                    rows="2"
                    placeholder="Orientações aos músicos, dress code, tema, etc."
                    value={formEvento.descricao}
                    onChange={e => setFormEvento({ ...formEvento, descricao: e.target.value })}
                  ></textarea>
                </div>

                {!eventoEmEdicao && (
                  <div className="campo-modal-agenda">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={formEvento.criarEscalaAuto}
                        onChange={e => setFormEvento({ ...formEvento, criarEscalaAuto: e.target.checked })}
                        style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                      <span>Gerar escala de louvor para este culto automaticamente</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="modal-agenda-rodape" style={{ justifyContent: eventoEmEdicao ? 'space-between' : 'flex-end' }}>
                {eventoEmEdicao && (
                  <button
                    type="button"
                    className="btn-excluir-modal-agenda"
                    onClick={() => {
                      const ev = eventoEmEdicao
                      setModalNovoEvento(false)
                      setEventoEmEdicao(null)
                      handleExcluirEvento(ev)
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Excluir Evento
                  </button>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-cancelar-modal-agenda"
                    onClick={() => {
                      setModalNovoEvento(false)
                      setEventoEmEdicao(null)
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-salvar-modal-agenda"
                    disabled={salvandoEvento}
                  >
                    {salvandoEvento ? 'Salvando...' : (eventoEmEdicao ? 'Salvar Alterações' : 'Salvar no Banco')}
                  </button>
                </div>
              </div>
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
