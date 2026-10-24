import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigurado, atualizarSenhaSupabase } from '../../services/supabase'
import './RedefinirSenha.css'

function RedefinirSenha() {
  const navigate = useNavigate()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [sessaoValida, setSessaoValida] = useState(true)

  // Verifica se o usuário chegou com token de recuperação ou sessão ativa de recuperação
  useEffect(() => {
    let montado = true

    async function verificarSessao() {
      if (!supabaseConfigurado || !supabase) {
        if (montado) {
          setErro('Serviço de autenticação temporariamente indisponível. Verifique as credenciais do Supabase.')
        }
        return
      }

      // 1. Checa se veio com erro na URL (ex: link expirado pelo Supabase)
      const hash = window.location.hash || ''
      const search = window.location.search || ''

      if (hash.includes('error=') || search.includes('error=')) {
        if (montado) {
          setSessaoValida(false)
          setErro('O link de recuperação expirou ou é inválido. Por favor, solicite um novo link de redefinição na tela de login.')
        }
        return
      }

      // 2. Se veio com ?code= (PKCE do Supabase)
      if (search.includes('code=')) {
        const params = new URLSearchParams(search)
        const code = params.get('code')
        if (code) {
          try {
            const { error: codeErr } = await supabase.auth.exchangeCodeForSession(code)
            if (!codeErr && montado) {
              setSessaoValida(true)
              return
            }
          } catch (eCode) {
            console.warn('Erro ao processar code de recuperação:', eCode)
          }
        }
      }

      // 3. Checa se o Supabase já capturou a sessão de recuperação
      const { data: { session } } = await supabase.auth.getSession()
      if (session && montado) {
        setSessaoValida(true)
        return
      }

      // 4. Se não há sessão imediata nem token no hash após um breve tempo, avisa o usuário
      const timer = setTimeout(async () => {
        if (!montado) return
        const { data: { session: sCheck } } = await supabase.auth.getSession()
        const hashAtual = window.location.hash || ''
        if (!sCheck && !hashAtual.includes('access_token')) {
          setSessaoValida(false)
          setErro('Nenhuma sessão de recuperação ativa encontrada. Por favor, solicite a redefinição de senha na tela de login.')
        } else if (montado) {
          setSessaoValida(true)
        }
      }, 1500)

      return () => clearTimeout(timer)
    }

    // Ouvinte em tempo real para capturar evento PASSWORD_RECOVERY emitido pelo Supabase Auth
    const { data: authListener } = supabase?.auth?.onAuthStateChange((event, session) => {
      if (!montado) return
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
        setSessaoValida(true)
        setErro('')
      }
    }) || { data: null }

    verificarSessao()

    return () => {
      montado = false
      authListener?.subscription?.unsubscribe?.()
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas digitadas não coincidem.')
      return
    }

    setCarregando(true)

    try {
      await atualizarSenhaSupabase(novaSenha)
      setSucesso(true)
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 3000)
    } catch (err) {
      console.error('Erro ao atualizar senha:', err)
      let msg = err.message || 'Erro ao redefinir senha. Tente novamente.'
      if (err.message?.includes('same_password')) {
        msg = 'A nova senha não pode ser idêntica à senha anterior.'
      } else if (err.message?.includes('expired') || err.message?.includes('invalid')) {
        msg = 'O link de recuperação expirou. Por favor, solicite um novo link de redefinição.'
        setSessaoValida(false)
      }
      setErro(msg)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div id="tela-redefinir-senha">
      <div className="redefinir-card">
        {/* Cabeçalho */}
        <header className="redefinir-header">
          <div className="redefinir-logo-box">
            <svg viewBox="0 0 48 48" fill="none" className="cruz-svg">
              <rect width="48" height="48" rx="14" fill="#1e5ec8" />
              <rect x="21" y="10" width="6" height="28" rx="2" fill="#ffffff" />
              <rect x="13" y="17" width="22" height="6" rx="2" fill="#ffffff" />
            </svg>
          </div>
          <h1>Redefinir Senha</h1>
          <p className="redefinir-subtitulo">
            Crie uma nova senha segura para o seu acesso ao Ministério de Louvor
          </p>
        </header>

        {erro && (
          <div className="redefinir-alerta erro">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{erro}</span>
          </div>
        )}

        {sucesso ? (
          <div className="redefinir-sucesso-box">
            <div className="icone-sucesso">
              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3>Senha atualizada com sucesso!</h3>
            <p>Sua nova senha já está ativa. Redirecionando para o login em instantes...</p>
            <Link to="/login" className="btn-ir-login">
              Acessar Agora
            </Link>
          </div>
        ) : sessaoValida ? (
          <form onSubmit={handleSubmit} className="form-redefinir">
            <div className="form-campo">
              <label htmlFor="nova-senha">Nova Senha *</label>
              <div className="input-senha-wrapper">
                <input
                  id="nova-senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                  minLength={6}
                />
                <button
                  type="button"
                  className="btn-toggle-senha-redefinir"
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
              <span className="requisitos-senha">Mínimo de 6 caracteres</span>
            </div>

            <div className="form-campo">
              <label htmlFor="confirmar-nova-senha">Confirmar Nova Senha *</label>
              <div className="input-senha-wrapper">
                <input
                  id="confirmar-nova-senha"
                  type={mostrarConfirmar ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="btn-toggle-senha-redefinir"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  aria-label={mostrarConfirmar ? 'Ocultar senha' : 'Ver senha'}
                >
                  {mostrarConfirmar ? (
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

            <button
              type="submit"
              className={`btn-salvar-senha ${carregando ? 'carregando' : ''}`}
              disabled={carregando}
            >
              {carregando ? (
                <span className="spinner-redefinir"></span>
              ) : (
                'Salvar Nova Senha'
              )}
            </button>
          </form>
        ) : (
          <div className="redefinir-invalido-box">
            <Link to="/login" className="btn-voltar-login-link">
              Voltar para o Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default RedefinirSenha
