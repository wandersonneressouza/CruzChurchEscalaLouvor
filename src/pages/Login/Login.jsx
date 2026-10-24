import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { redefinirSenhaSupabase, reenviarConfirmacaoEmail } from '../../services/supabase'
import './Login.css'

function Login() {
  const { login, usuario, supabaseConfigurado } = useAppContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [lembrarAcesso, setLembrarAcesso] = useState(true)
  const [carregando, setCarregando] = useState(false)
  const [erroLogin, setErroLogin] = useState('')
  const [reenviandoEmail, setReenviandoEmail] = useState(false)
  const [reenvioSucesso, setReenvioSucesso] = useState(false)
  const [modalRecuperacao, setModalRecuperacao] = useState(false)
  const [emailRecuperacao, setEmailRecuperacao] = useState('')
  const [recuperacaoEnviada, setRecuperacaoEnviada] = useState(false)

  // Preenche dados caso venha redirecionado para acesso admin
  useEffect(() => {
    if (searchParams.get('admin') === '1') {
      setEmail('djandersonneres@hotmail.com')
      setErroLogin('Área restrita. Efetue login com sua conta de Administrador para acessar.')
    }
  }, [searchParams])

  // Submissão do login
  async function handleSubmit(e) {
    e.preventDefault()
    setErroLogin('')
    setCarregando(true)

    try {
      const res = await login({
        email: email.trim(),
        senha: senha,
        lembrar: lembrarAcesso
      })
      setCarregando(false)
      if (res?.perfil?.tipoConta === 'admin' || res?.perfil?.tipo_conta === 'admin' || res?.perfil?.cargo === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error('Erro ao efetuar login:', err)
      let msg = err.message || 'Falha ao autenticar. Tente novamente.'

      if (err.message?.toLowerCase().includes('email not confirmed') || err.message?.toLowerCase().includes('não foi confirmado')) {
        msg = 'Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada e a pasta de spam (ou entre em contato com o administrador).'
      } else if (err.message?.includes('Invalid login credentials')) {
        msg = 'E-mail ou senha incorretos. Verifique suas credenciais.'
      }

      setErroLogin(msg)
      setCarregando(false)
    }
  }

  // Reenviar confirmação de e-mail caso não tenha recebido
  async function handleReenviarConfirmacao() {
    if (!email.trim()) {
      alert('Informe seu e-mail no campo acima para reenviar a confirmação.')
      return
    }

    setReenviandoEmail(true)
    try {
      if (supabaseConfigurado) {
        await reenviarConfirmacaoEmail(email.trim())
      }
      setReenvioSucesso(true)
      setTimeout(() => setReenvioSucesso(false), 5000)
    } catch (err) {
      alert(err.message || 'Erro ao reenviar confirmação de e-mail.')
    } finally {
      setReenviandoEmail(false)
    }
  }

  // Enviar recuperação de senha
  async function handleRecuperarSenha(e) {
    e.preventDefault()
    if (!emailRecuperacao) return

    try {
      if (supabaseConfigurado) {
        await redefinirSenhaSupabase(emailRecuperacao.trim())
      }
      setRecuperacaoEnviada(true)
      setTimeout(() => {
        setModalRecuperacao(false)
        setRecuperacaoEnviada(false)
        setEmailRecuperacao('')
      }, 3000)
    } catch (err) {
      alert(err.message || 'Erro ao enviar e-mail de recuperação.')
    }
  }

  return (
    <div id="tela-login">
      {/* Conteúdo Principal */}
      <div className="login-scroll-content">
        {/* Topo / Logo da Cruz Church */}
        <header className="login-header">
          <div className="login-logo-box">
            <svg viewBox="0 0 48 48" fill="none" className="cruz-svg">
              <rect width="48" height="48" rx="14" fill="#1e5ec8" />
              <rect x="21" y="10" width="6" height="28" rx="2" fill="#ffffff" />
              <rect x="13" y="17" width="22" height="6" rx="2" fill="#ffffff" />
            </svg>
          </div>
          <h1>Cruz Church</h1>
          <p className="login-subtitulo">Sistema de Gestão do Ministério de Louvor</p>
        </header>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="form-login">
          {erroLogin && (
            <div className="alerta-erro-login" style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '14px',
              lineHeight: 1.45
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', flexShrink: 0, marginTop: '2px', color: '#dc2626' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ flex: 1 }}>{erroLogin}</span>
              </div>

              {erroLogin.toLowerCase().includes('spam') && (
                <div style={{
                  marginTop: '4px',
                  paddingTop: '8px',
                  borderTop: '1px dashed #fca5a5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    type="button"
                    onClick={handleReenviarConfirmacao}
                    disabled={reenviandoEmail}
                    style={{
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: reenviandoEmail ? 'not-allowed' : 'pointer',
                      opacity: reenviandoEmail ? 0.7 : 1
                    }}
                  >
                    {reenviandoEmail ? 'Reenviando...' : 'Reenviar e-mail de confirmação'}
                  </button>
                  {reenvioSucesso && (
                    <span style={{ color: '#16a34a', fontSize: '0.78rem', fontWeight: 600 }}>
                      ✓ E-mail reenviado com sucesso!
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="form-campo">
            <label htmlFor="login-email">E-mail ministerial</label>
            <div className="input-com-icone">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icone">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@cruzchurch.com"
                required
              />
            </div>
          </div>

          <div className="form-campo">
            <div className="label-com-link">
              <label htmlFor="login-senha">Senha de acesso</label>
              <button
                type="button"
                className="link-esqueci-senha"
                onClick={() => setModalRecuperacao(true)}
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="input-com-icone">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icone">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="login-senha"
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="btn-toggle-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
              >
                {mostrarSenha ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-lembrar-row">
            <label className="checkbox-custom-label">
              <input
                type="checkbox"
                checked={lembrarAcesso}
                onChange={() => setLembrarAcesso(!lembrarAcesso)}
              />
              <span className="checkbox-box"></span>
              <span className="checkbox-texto">Lembrar meu acesso neste aparelho</span>
            </label>
          </div>

          <button
            type="submit"
            className={`btn-entrar ${carregando ? 'carregando' : ''}`}
            disabled={carregando}
          >
            {carregando ? (
              <span className="spinner-login"></span>
            ) : (
              <>
                <span>Acessar Ministério</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>

          <div className="login-cadastro-link-box">
            <span className="texto-nao-tem-conta">Ainda não faz parte do louvor?</span>
            <Link to="/cadastro" className="btn-link-solicitar-cadastro">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              <span>Cadastrar-se / Solicitar Acesso</span>
            </Link>
          </div>
        </form>

        {/* Opção discreta e pequena de entrar como Administrador */}
        <div className="login-admin-atalho-container">
          <button
            type="button"
            className="btn-admin-atalho-discreto"
            onClick={() => {
              setEmail('djandersonneres@hotmail.com')
              setSenha('')
              setErroLogin('')
              const senhaEl = document.getElementById('login-senha')
              if (senhaEl) senhaEl.focus()
            }}
            title="Acesso exclusivo para Administradores"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Entrar como administrador</span>
          </button>
        </div>

        {/* Rodapé Informativo */}
        <footer className="login-footer">
          <p className="footer-aviso">
            Acesso exclusivo para voluntários e líderes credenciados da <strong>Cruz Church</strong>.
          </p>
          <span className="footer-versao">Versão 1.0.0 • Gestão & Escalas</span>
        </footer>
      </div>

      {/* MODAL: RECUPERAÇÃO DE SENHA */}
      {modalRecuperacao && (
        <div className="modal-backdrop" onClick={() => setModalRecuperacao(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-indicator"></div>
            <div className="modal-header">
              <h3>Recuperar Senha</h3>
              <button className="btn-fechar-modal" onClick={() => setModalRecuperacao(false)}>✕</button>
            </div>
            <p className="modal-sub">
              Informe seu e-mail para receber as instruções de redefinição de acesso.
            </p>

            {!recuperacaoEnviada ? (
              <form onSubmit={handleRecuperarSenha} className="form-recuperar">
                <input
                  type="email"
                  value={emailRecuperacao}
                  onChange={(e) => setEmailRecuperacao(e.target.value)}
                  placeholder="seu.email@cruzchurch.com"
                  required
                />
                <button type="submit" className="btn-enviar-recuperacao">
                  Enviar Link de Recuperação
                </button>
              </form>
            ) : (
              <div className="feedback-sucesso">
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p>Link de recuperação enviado para o e-mail!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
