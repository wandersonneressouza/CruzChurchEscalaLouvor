import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { CATEGORIAS_MUSICAIS, TODAS_AS_FUNCOES } from '../../constants/categoriasMusicais'
import './Cadastro.css'

function Cadastro() {
  const { cadastrarVoluntario, cadastrarSolicitacaoLider, igrejas } = useAppContext()
  const navigate = useNavigate()

  // Tipo de cadastro: 'voluntario' ou 'lider'
  const [tipoConta, setTipoConta] = useState('voluntario')

  // Dados comuns
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  // Dados para Voluntário (sincroniza com a primeira congregação real cadastrada)
  const [igrejaSelecionada, setIgrejaSelecionada] = useState(igrejas && igrejas.length > 0 ? String(igrejas[0].id) : '')
  const [buscaIgreja, setBuscaIgreja] = useState('')
  const [funcaoSelecionada, setFuncaoSelecionada] = useState(TODAS_AS_FUNCOES[0]?.funcao || 'Vocal Líder')

  // Atualiza igrejaSelecionada assim que a lista de congregações for carregada do Supabase
  useEffect(() => {
    if (igrejas && igrejas.length > 0) {
      setIgrejaSelecionada(prev => {
        const existe = igrejas.some(i => String(i.id) === String(prev))
        return existe ? prev : String(igrejas[0].id)
      })
    }
  }, [igrejas])

  // Dados para Líder
  const [nomeIgrejaLider, setNomeIgrejaLider] = useState('')
  const [cidadeIgrejaLider, setCidadeIgrejaLider] = useState('')

  // Estados de envio e feedback
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  // Filtro de igrejas
  const igrejasFiltradas = igrejas.filter(i =>
    i.nome.toLowerCase().includes(buscaIgreja.toLowerCase()) ||
    i.cidade.toLowerCase().includes(buscaIgreja.toLowerCase())
  )

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres.')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas digitadas não coincidem.')
      return
    }

    setCarregando(true)

    try {
      if (tipoConta === 'voluntario') {
        const idIgrejaFinal = Number(igrejaSelecionada) || (igrejas && igrejas.length > 0 ? igrejas[0].id : null)
        if (!idIgrejaFinal) {
          setErro('Nenhuma congregação ativa encontrada para vincular o voluntário.')
          setCarregando(false)
          return
        }

        await cadastrarVoluntario({
          nome,
          email: email.trim(),
          senha,
          telefone,
          igrejaId: idIgrejaFinal,
          funcao: funcaoSelecionada
        })
      } else {
        if (!nomeIgrejaLider.trim()) {
          setErro('Informe o nome da igreja ou congregação.')
          setCarregando(false)
          return
        }
        await cadastrarSolicitacaoLider({
          nome,
          email: email.trim(),
          senha,
          telefone,
          nomeIgreja: nomeIgrejaLider,
          cidadeIgreja: cidadeIgrejaLider
        })
      }

      setCarregando(false)
      navigate('/aguardando-aprovacao')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      let msg = err.message || 'Ocorreu um erro ao processar o cadastro. Tente novamente.'
      if (err.message?.toLowerCase().includes('email not confirmed') || err.message?.toLowerCase().includes('não foi confirmado')) {
        msg = 'Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada e a pasta de spam (ou entre em contato com o administrador).'
      } else if (err.message?.includes('User already registered')) {
        msg = 'Este e-mail já está cadastrado na plataforma. Tente fazer login.'
      }
      setErro(msg)
      setCarregando(false)
    }
  }

  return (
    <div id="tela-cadastro">
      <div className="cadastro-scroll-content">
        {/* Topo / Voltar */}
        <header className="cadastro-header">
          <Link to="/login" className="btn-voltar-login">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Voltar ao Login</span>
          </Link>
          <div className="cadastro-logo-badge">
            <svg viewBox="0 0 48 48" fill="none" className="cruz-svg">
              <rect width="48" height="48" rx="14" fill="#1e5ec8" />
              <rect x="21" y="10" width="6" height="28" rx="2" fill="#ffffff" />
              <rect x="13" y="17" width="22" height="6" rx="2" fill="#ffffff" />
            </svg>
          </div>
          <h1>Criar Conta Ministerial</h1>
          <p className="cadastro-subtitulo">
            Cadastre-se para participar das escalas e louvor da sua igreja
          </p>
        </header>

        {/* Seletor do Tipo de Conta */}
        <div className="seletor-tipo-conta">
          <button
            type="button"
            className={`btn-opcao-tipo ${tipoConta === 'voluntario' ? 'ativo' : ''}`}
            onClick={() => setTipoConta('voluntario')}
          >
            <div className="icone-tipo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="texto-tipo">
              <strong>Integrante Voluntário</strong>
              <span>Quero participar de uma igreja já cadastrada</span>
            </div>
            <span className="indicador-check"></span>
          </button>

          <button
            type="button"
            className={`btn-opcao-tipo ${tipoConta === 'lider' ? 'ativo' : ''}`}
            onClick={() => setTipoConta('lider')}
          >
            <div className="icone-tipo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
            </div>
            <div className="texto-tipo">
              <strong>Líder de Louvor</strong>
              <span>Quero cadastrar e administrar minha igreja</span>
            </div>
            <span className="indicador-check"></span>
          </button>
        </div>

        {/* Mensagem de Erro se houver */}
        {erro && (
          <div className="alerta-erro-cadastro">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{erro}</span>
          </div>
        )}

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} className="form-cadastro">
          {/* Seção 1: Dados Pessoais */}
          <div className="secao-formulario">
            <h3 className="secao-titulo">1. Dados Pessoais</h3>

            <div className="form-campo">
              <label htmlFor="cad-nome">Nome completo *</label>
              <input
                id="cad-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Carlos Eduardo de Oliveira"
                required
              />
            </div>

            <div className="form-campo">
              <label htmlFor="cad-email">E-mail *</label>
              <input
                id="cad-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
              />
            </div>

            <div className="form-campo">
              <label htmlFor="cad-telefone">WhatsApp / Telefone *</label>
              <input
                id="cad-telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(16) 99876-5432"
                required
              />
            </div>

            <div className="form-campo-grid">
              <div className="form-campo">
                <label htmlFor="cad-senha">Senha (mín. 6 dígitos) *</label>
                <div className="input-senha-wrapper">
                  <input
                    id="cad-senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="btn-ver-senha-cad"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                  >
                    {mostrarSenha ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>

              <div className="form-campo">
                <label htmlFor="cad-confirmar">Confirmar senha *</label>
                <input
                  id="cad-confirmar"
                  type={mostrarSenha ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Especificidades de acordo com o Tipo */}
          {tipoConta === 'voluntario' ? (
            <div className="secao-formulario">
              <h3 className="secao-titulo">2. Selecione sua Igreja e Função</h3>
              <p className="secao-descricao">
                Sua solicitação será enviada ao líder de louvor responsável pela igreja escolhida.
              </p>

              <div className="form-campo">
                <label htmlFor="cad-busca-igreja">Pesquisar congregação</label>
                <div className="input-com-icone-cad">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="icone-input">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    id="cad-busca-igreja"
                    type="text"
                    value={buscaIgreja}
                    onChange={(e) => setBuscaIgreja(e.target.value)}
                    placeholder="Filtrar por nome ou cidade..."
                  />
                </div>
              </div>

              <div className="form-campo">
                <label htmlFor="cad-igreja">Igreja / Campus de vinculação *</label>
                <select
                  id="cad-igreja"
                  value={igrejaSelecionada}
                  onChange={(e) => setIgrejaSelecionada(e.target.value)}
                  required
                  className="select-custom"
                >
                  {igrejasFiltradas.length > 0 ? (
                    igrejasFiltradas.map(igreja => (
                      <option key={igreja.id} value={igreja.id}>
                        {igreja.nome} — {igreja.cidade} (Líder: {igreja.lider})
                      </option>
                    ))
                  ) : (
                    <option disabled value="">Nenhuma igreja encontrada com o termo pesquisado</option>
                  )}
                </select>
              </div>

              <div className="form-campo">
                <label htmlFor="cad-funcao">Função Musical Principal *</label>
                <select
                  id="cad-funcao"
                  value={funcaoSelecionada}
                  onChange={(e) => setFuncaoSelecionada(e.target.value)}
                  required
                  className="select-custom"
                >
                  {CATEGORIAS_MUSICAIS.map(cat => (
                    <optgroup key={cat.naipe} label={`— ${cat.naipe} —`}>
                      {cat.funcoes.map(f => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <span className="ajuda-campo">
                  Você poderá adicionar outras habilidades e o líder poderá ajustar sua alocação na equipe.
                </span>
              </div>
            </div>
          ) : (
            <div className="secao-formulario">
              <h3 className="secao-titulo">2. Dados da Igreja / Ministério</h3>
              <p className="secao-descricao">
                Como líder, sua solicitação será enviada para homologação do <strong>Administrador Geral</strong> antes da liberação do painel.
              </p>

              <div className="form-campo">
                <label htmlFor="cad-nome-igreja-lider">Nome da Igreja ou Congregação *</label>
                <input
                  id="cad-nome-igreja-lider"
                  type="text"
                  value={nomeIgrejaLider}
                  onChange={(e) => setNomeIgrejaLider(e.target.value)}
                  placeholder="Ex: Cruz Church — Campus Norte"
                  required
                />
              </div>

              <div className="form-campo">
                <label htmlFor="cad-cidade-lider">Cidade / Estado *</label>
                <input
                  id="cad-cidade-lider"
                  type="text"
                  value={cidadeIgrejaLider}
                  onChange={(e) => setCidadeIgrejaLider(e.target.value)}
                  placeholder="Ex: Ribeirão Preto - SP"
                  required
                />
              </div>

              <div className="card-aviso-analise">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>
                  Para evitar duplicidades, o Administrador Geral validará o cadastro da congregação e atribuirá as permissões de liderança ao seu perfil.
                </p>
              </div>
            </div>
          )}

          {/* Botão de Envio */}
          <button
            type="submit"
            className={`btn-cadastrar-submit ${carregando ? 'carregando' : ''}`}
            disabled={carregando}
          >
            {carregando ? (
              <span className="spinner-cad"></span>
            ) : (
              <>
                <span>
                  {tipoConta === 'voluntario'
                    ? 'Enviar Solicitação de Acesso'
                    : 'Solicitar Cadastro como Líder'}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Rodapé */}
        <footer className="cadastro-footer">
          <p>
            Já possui conta aprovada? <Link to="/login">Fazer Login</Link>
          </p>
          <span className="cadastro-nota-seguranca">
            Ambiente seguro • Os dados de contato são utilizados apenas para organização de escalas ministeriais.
          </span>
        </footer>
      </div>
    </div>
  )
}

export default Cadastro
