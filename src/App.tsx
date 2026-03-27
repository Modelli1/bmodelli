import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from './layouts/PublicLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { HomePage } from './pages/public/HomePage'
import { ProdutoPage } from './pages/public/ProdutoPage'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { ClientesPage } from './pages/admin/ClientesPage'
import { ProdutosPage } from './pages/admin/ProdutosPage'
import { VendasPage } from './pages/admin/VendasPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/produtos/:slug" element={<ProdutoPage />} />
        </Route>

        {/* Auth */}
        <Route path="/auth/login" element={<LoginPage />} />

        {/* Rotas admin (protegidas) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/clientes" element={<ClientesPage />} />
            <Route path="/admin/produtos" element={<ProdutosPage />} />
            <Route path="/admin/vendas" element={<VendasPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
