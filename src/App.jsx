import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useAppContext } from './context/AppContext'
import Login from './pages/Login/Login'
import Cadastro from './pages/Cadastro/Cadastro'
import AguardandoAprovacao from './pages/AguardandoAprovacao/AguardandoAprovacao'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Inicio from './pages/Inicio/Inicio'
import Agenda from './pages/Agenda/Agenda'
import Repertorio from './pages/Repertorio/Repertorio'
import Devocional from './pages/Devocional/Devocional'
import Mais from './pages/Mais/Mais'
import RedefinirSenha from './pages/RedefinirSenha/RedefinirSenha'

// Helper para verificar se o usuário é administrador geral
function checarEhAdmin(usuario) {
  if (!usuario) return false
  return (
    usuario.tipoConta === 'admin' ||
    usuario.tipo_conta === 'admin' ||
    usuario.cargo === 'ADMIN' ||
    usuario.email === 'djandersonneres@hotmail.com'
  )
}

// Componente de carregamento visual consistente
function TelaCarregando() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#1e5ec8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}

// Componente para proteger rotas internas do aplicativo comum:
// - Administradores NÃO acessam o app comum: são redirecionados para /admin
// - Usuários comuns só acessam se autenticados E aprovados
function RotaPrivada({ children }) {
  const { estaAutenticado, usuario, carregandoDados } = useAppContext()
  if (carregandoDados || (estaAutenticado && !usuario)) {
    return <TelaCarregando />
  }
  if (!estaAutenticado) return <Navigate to="/login" replace />

  // Administrador tem acesso exclusivo ao painel /admin
  if (checarEhAdmin(usuario)) {
    return <Navigate to="/admin" replace />
  }

  if (usuario && usuario.statusAcesso && usuario.statusAcesso !== 'aprovado') {
    return <Navigate to="/aguardando-aprovacao" replace />
  }
  return children
}

// Rota de aguardo: para voluntários/líderes pendentes
function RotaAguardando({ children }) {
  const { estaAutenticado, usuario, carregandoDados } = useAppContext()
  if (carregandoDados || (estaAutenticado && !usuario)) {
    return <TelaCarregando />
  }
  if (!estaAutenticado) return <Navigate to="/login" replace />

  if (checarEhAdmin(usuario)) {
    return <Navigate to="/admin" replace />
  }

  if (usuario && usuario.statusAcesso === 'aprovado') {
    return <Navigate to="/" replace />
  }
  return children
}

// Componente para telas públicas (Login, Cadastro):
// Se autenticado e for admin -> vai direto para /admin
// Se autenticado e for comum aprovado -> vai para /
function RotaPublica({ children }) {
  const { estaAutenticado, usuario, carregandoDados } = useAppContext()
  if (carregandoDados || (estaAutenticado && !usuario)) {
    return <TelaCarregando />
  }
  if (estaAutenticado && usuario) {
    if (checarEhAdmin(usuario)) {
      return <Navigate to="/admin" replace />
    }
    if (usuario.statusAcesso && usuario.statusAcesso !== 'aprovado') {
      return <Navigate to="/aguardando-aprovacao" replace />
    }
    return <Navigate to="/" replace />
  }
  return children
}

// Componente de proteção de rota ADMIN: só acessa se autenticado E se perfil for admin
function RotaAdmin({ children }) {
  const { estaAutenticado, usuario, carregandoDados } = useAppContext()
  if (carregandoDados || (estaAutenticado && !usuario)) {
    return <TelaCarregando />
  }
  if (!estaAutenticado) return <Navigate to="/login?admin=1" replace />

  if (!checarEhAdmin(usuario)) {
    return <Navigate to="/" replace />
  }
  return children
}

function AppRotas() {
  const location = useLocation()
  const { usuario } = useAppContext()
  const ehAdmin = checarEhAdmin(usuario)
  const naAreaAdmin = location.pathname.startsWith('/admin')

  return (
    <div className={naAreaAdmin ? 'admin-layout-container' : 'app-container'}>
      <Routes>
        <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
        <Route path="/cadastro" element={<RotaPublica><Cadastro /></RotaPublica>} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/aguardando-aprovacao" element={<RotaAguardando><AguardandoAprovacao /></RotaAguardando>} />
        <Route path="/admin" element={<RotaAdmin><AdminDashboard /></RotaAdmin>} />
        <Route path="/" element={<RotaPrivada><Inicio /></RotaPrivada>} />
        <Route path="/agenda" element={<RotaPrivada><Agenda /></RotaPrivada>} />
        <Route path="/musicas" element={<RotaPrivada><Repertorio /></RotaPrivada>} />
        <Route path="/devocional" element={<RotaPrivada><Devocional /></RotaPrivada>} />
        <Route path="/mais" element={<RotaPrivada><Mais /></RotaPrivada>} />
        <Route path="*" element={<Navigate to={ehAdmin ? '/admin' : '/'} replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRotas />
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
