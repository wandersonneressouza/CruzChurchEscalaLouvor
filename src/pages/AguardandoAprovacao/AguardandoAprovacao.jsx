import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import './AguardandoAprovacao.css'

function AguardandoAprovacao() {
  const { usuario, logout, verificarStatusAcesso } = useAppContext()
  const navigate = useNavigate()
  const [verificando, setVerificando] = useState(false)
  const [mensagemStatus, setMensagemStatus] = useState('')

  const status = usuario?.statusAcesso || 'pendente'

  // Checa automaticamente ao carregar e monitora em segundo plano a cada 4 segundos
  useEffect(() => {
    if (usuario?.statusAcesso === 'aprovado') {
      navigate('/')
      return
    }

    let ativo = true
    async function checar() {
      if (verificarStatusAcesso && ativo) {
        try {
          const statusNovo = await verificarStatusAcesso()
          if (statusNovo === 'aprovado' && ativo) {
            navigate('/')
          }
        } catch (e) {
          // Silencioso em segundo plano
        }
      }
    }

    // Checagem imediata
    checar()

    // Polling a cada 4 segundos
    const timer = setInterval(checar, 4000)

    return () => {
      ativo = false
      clearInterval(timer)
    }
  }, [usuario?.statusAcesso, verificarStatusAcesso, navigate])

  // Checar status manualmente
  async function handleVerificarStatus() {
    setVerificando(true)
    setMensagemStatus('')
    try {
      if (verificarStatusAcesso) {
        const statusNovo = await verificarStatusAcesso()
        if (statusNovo === 'aprovado') {
          navigate('/')
          return
        }
      }
      setMensagemStatus('Status verificado: Seu pedido continua em análise.')
      setTimeout(() => setMensagemStatus(''), 4000)
    } catch (e) {
      setMensagemStatus('Erro ao verificar status. Tente novamente em instantes.')
    } finally {
      setVerificando(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div id="tela-aguardando">
      <div className="aguardando-container">
        {/* Logo Cruz Church */}
        <div className="aguardando-logo-wrapper">
          <svg viewBox="0 0 48 48" fill="none" className="cruz-svg">
            <rect width="48" height="48" rx="14" fill="#1e5ec8" />
            <rect x="21" y="10" width="6" height="28" rx="2" fill="#ffffff" />
            <rect x="13" y="17" width="22" height="6" rx="2" fill="#ffffff" />
          </svg>
        </div>

        {/* Card Principal de Status */}
        <div className="card-status-central">
          {/* 1. STATUS: PENDENTE (VOLUNTÁRIO) */}
          {status === 'pendente' && (
            <>
              <div className="icone-status-animado pendente">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span className="tag-status pendente">Aguardando Aprovação</span>
              <h2>Solicitação em Análise</h2>
              <p className="texto-status">
                Olá, <strong>{usuario?.nome || 'Voluntário'}</strong>! Seu pedido de vínculo com a congregação{' '}
                <strong>{usuario?.campus || 'Cruz Church'}</strong> foi registrado com sucesso.
              </p>
              <div className="box-detalhes-pedido">
                <div className="linha-detalhe">
                  <span className="detalhe-rotulo">Função solicitada:</span>
                  <span className="detalhe-valor">{usuario?.funcao || 'Vocal'}</span>
                </div>
                <div className="linha-detalhe">
                  <span className="detalhe-rotulo">Destinatário:</span>
                  <span className="detalhe-valor">Líder de Louvor da Igreja</span>
                </div>
                <div className="linha-detalhe">
                  <span className="detalhe-rotulo">Situação:</span>
                  <span className="detalhe-valor destaque-amarelo">Pendente de homologação</span>
                </div>
              </div>
              <p className="nota-rodape-status">
                Por regras de segurança, o acesso às escalas, repertório e materiais internos só é liberado após a validação do líder responsável.
              </p>
            </>
          )}

          {/* 2. STATUS: PENDENTE LÍDER (AGUARDA ADMIN GERAL) */}
          {status === 'pendente_lider' && (
            <>
              <div className="icone-status-animado lider">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="tag-status lider">Validação Institucional</span>
              <h2>Cadastro de Liderança em Homologação</h2>
              <p className="texto-status">
                Olá, <strong>{usuario?.nome}</strong>! Sua solicitação para administrar o ministério da igreja{' '}
                <strong>{usuario?.nomeIgreja || usuario?.campus || 'sua igreja'}</strong> está sob análise do <strong>Administrador Geral</strong> do sistema.
              </p>
              <div className="box-detalhes-pedido">
                <div className="linha-detalhe">
                  <span className="detalhe-rotulo">Nível solicitado:</span>
                  <span className="detalhe-valor">Líder de Louvor & Gestor</span>
                </div>
                <div className="linha-detalhe">
                  <span className="detalhe-rotulo">Homologador:</span>
                  <span className="detalhe-valor">Administração Geral Cruz Church</span>
                </div>
                <div className="linha-detalhe">
                  <span className="detalhe-rotulo">Objetivo:</span>
                  <span className="detalhe-valor">Evitar congregações duplicadas</span>
                </div>
              </div>
              <p className="nota-rodape-status">
                Assim que aprovado, você terá acesso pleno ao painel de escalas e aprovação de novos integrantes.
              </p>
            </>
          )}

          {/* 3. STATUS: RECUSADO */}
          {status === 'recusado' && (
            <>
              <div className="icone-status-animado recusado">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <span className="tag-status recusado">Solicitação Recusada</span>
              <h2>Cadastro Não Aprovado</h2>
              <p className="texto-status">
                Olá, <strong>{usuario?.nome}</strong>. Sua solicitação de acesso para a congregação{' '}
                <strong>{usuario?.campus}</strong> não foi aprovada pela liderança do ministério de louvor no momento.
              </p>
              <div className="box-detalhes-pedido recusado-box">
                <p>
                  Isso pode ocorrer caso os dados informados não correspondam ao cadastro presencial de voluntários ou se a congregação selecionada estiver incorreta.
                </p>
                <p className="contato-aviso">
                  Procure pessoalmente o líder de louvor da sua igreja para alinhar seu ingresso na equipe musical.
                </p>
              </div>
            </>
          )}

          {/* 4. STATUS: REVOGADO */}
          {status === 'revogado' && (
            <>
              <div className="icone-status-animado revogado">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="18" y1="8" x2="23" y2="13" />
                  <line x1="23" y1="8" x2="18" y2="13" />
                </svg>
              </div>
              <span className="tag-status revogado">Vínculo Revogado</span>
              <h2>Acesso à Igreja Desvinculado</h2>
              <p className="texto-status">
                Olá, <strong>{usuario?.nome}</strong>. Seu vínculo com a congregação{' '}
                <strong>{usuario?.campus}</strong> foi encerrado pelo líder do ministério.
              </p>
              <div className="box-detalhes-pedido revogado-box">
                <p>
                  Sua conta pessoal e seu histórico de participações anteriores permanecem intactos e protegidos, mas o acesso às escalas e áreas internas desta congregação foi suspenso.
                </p>
              </div>
            </>
          )}

          {/* Ações Inferiores */}
          <div className="acoes-aguardando">
            <button
              type="button"
              className="btn-verificar-status"
              onClick={handleVerificarStatus}
              disabled={verificando}
            >
              {verificando ? (
                <span className="spinner-aguardando"></span>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>Atualizar Status</span>
                </>
              )}
            </button>

            <button type="button" className="btn-sair-conta" onClick={handleLogout}>
              Desconectar Conta
            </button>
          </div>

          {mensagemStatus && (
            <div style={{
              marginTop: '12px',
              padding: '8px 14px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#cbd5e1',
              fontSize: '0.82rem',
              textAlign: 'center'
            }}>
              {mensagemStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AguardandoAprovacao
