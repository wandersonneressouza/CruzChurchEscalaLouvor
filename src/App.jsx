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

// Componente para proteger rotas internas: só acessa se autenticado E com statusAcesso === 'aprovado'
function RotaPrivada({ children }) {
  const { estaAutenticado, usuario, carregandoDados } = useAppContext()
  if (carregandoDados) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#1e5ec8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }
  if (!estaAutenticado) return <Navigate to="/login" replace />
  if (usuario && usuario.statusAcesso && usuario.statusAcesso !== 'aprovado') {
    return <Navigate to="/aguardando-aprovacao" replace />
  }
  return children
}

// Rota de aguardo: para usuários autenticados cujo status ainda não é aprovado (ou revogado/recusado)
function RotaAguardando({ children }) {
  const { estaAutenticado, usuario, carregandoDados } = useAppContext()
  if (carregandoDados) return null
  if (!estaAutenticado) return <Navigate to="/login" replace />
  if (usuario && usuario.statusAcesso === 'aprovado') {
    return <Navigate to="/" replace />
  }
  return children
}

// Componente para telas públicas (Login, Cadastro)
function RotaPublica({ children }) {
  const { estaAutenticado, usuario, carregandoDados } = useAppContext()
  if (carregandoDados) return null
  if (estaAutenticado) {
    if (usuario && usuario.statusAcesso && usuario.statusAcesso !== 'aprovado') {
      return <Navigate to="/aguardando-aprovacao" replace />
    }
    return <Navigate to="/" replace />
  }
  return children
}

// Componente de proteção de rota ADMIN: só acessa se autenticado E se perfil for admin
function RotaAdmin({ children }) {
  const { estaAutenticado, usuario, carregandoDados } = useAppContext()
  if (carregandoDados) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#1e5ec8', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }
  if (!estaAutenticado) return <Navigate to="/login?admin=1" replace />
  const ehAdmin = usuario?.tipoConta === 'admin' || usuario?.tipo_conta === 'admin' || usuario?.cargo === 'ADMIN'
  if (!ehAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}

function AppRotas() {
  const location = useLocation()
  const ehAdmin = location.pathname.startsWith('/admin')

  return (
    <div className={ehAdmin ? 'admin-layout-container' : 'app-container'}>
      <Routes>
        <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
        <Route path="/cadastro" element={<RotaPublica><Cadastro /></RotaPublica>} />
        <Route path="/aguardando-aprovacao" element={<RotaAguardando><AguardandoAprovacao /></RotaAguardando>} />
        <Route path="/admin" element={<RotaAdmin><AdminDashboard /></RotaAdmin>} />
        <Route path="/" element={<RotaPrivada><Inicio /></RotaPrivada>} />
        <Route path="/agenda" element={<RotaPrivada><Agenda /></RotaPrivada>} />
        <Route path="/musicas" element={<RotaPrivada><Repertorio /></RotaPrivada>} />
        <Route path="/devocional" element={<RotaPrivada><Devocional /></RotaPrivada>} />
        <Route path="/mais" element={<RotaPrivada><Mais /></RotaPrivada>} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
