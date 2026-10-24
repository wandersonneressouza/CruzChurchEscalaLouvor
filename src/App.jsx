import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Inicio from './pages/Inicio/Inicio'
import Agenda from './pages/Agenda/Agenda'
import Repertorio from './pages/Repertorio/Repertorio'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/musicas" element={<Repertorio />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
