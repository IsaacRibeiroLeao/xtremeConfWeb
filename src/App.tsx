import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Orders from './pages/Orders'
import Menu from './pages/Menu'
import Bingo from './pages/Bingo'
import Reports from './pages/Reports'
import Config from './pages/Config'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Orders />} />
        <Route path="cardapio" element={<Menu />} />
        <Route path="bingo" element={<Bingo />} />
        <Route path="relatorios" element={<Reports />} />
        <Route path="config" element={<Config />} />
      </Route>
    </Routes>
  )
}
