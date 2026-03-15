import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import DetalleAdmin from './pages/admin/DetalleAutorizacion'

// Auth
import Login from './pages/auth/Login'

// Admin
import DashboardAdmin     from './pages/admin/Dashboard'
import Usuarios           from './pages/admin/Usuarios'
import Areas              from './pages/admin/Areas'

// Aprobador
import DashboardAprobador from './pages/aprobador/Dashboard'
import NuevaAutorizacion  from './pages/aprobador/NuevaAutorizacion'
import DetalleAprobador   from './pages/aprobador/DetalleAutorizacion'

// Técnico
import DashboardTecnico   from './pages/tecnico/Dashboard'
import DetalleTecnico     from './pages/tecnico/DetalleAutorizacion'

function RutaInicio() {
  const { usuario, estaAutenticado } = useAuth()
  if (!estaAutenticado)              return <Navigate to="/login" replace />
  if (usuario?.rol === 'Administrador') return <Navigate to="/admin"     replace />
  if (usuario?.rol === 'Aprobador')     return <Navigate to="/aprobador" replace />
  if (usuario?.rol === 'Tecnico')       return <Navigate to="/tecnico"   replace />
  return <Navigate to="/login" replace />
}

function PaginaProtegida({ roles, children }) {
  return (
    <ProtectedRoute rolesPermitidos={roles}>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<RutaInicio />} />
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route path="/admin" element={
        <PaginaProtegida roles={['Administrador']}>
          <DashboardAdmin />
        </PaginaProtegida>
      } />
      <Route path="/admin/usuarios" element={
        <PaginaProtegida roles={['Administrador']}>
          <Usuarios />
        </PaginaProtegida>
      } />
      <Route path="/admin/areas" element={
        <PaginaProtegida roles={['Administrador']}>
          <Areas />
        </PaginaProtegida>
      } />
      <Route path="/admin/autorizacion/:id" element={
        <PaginaProtegida roles={['Administrador']}>
          <DetalleAdmin />
        </PaginaProtegida>
      } />

      {/* Aprobador */}
      <Route path="/aprobador" element={
        <PaginaProtegida roles={['Aprobador']}>
          <DashboardAprobador />
        </PaginaProtegida>
      } />
      <Route path="/aprobador/nueva" element={
        <PaginaProtegida roles={['Aprobador']}>
          <NuevaAutorizacion />
        </PaginaProtegida>
      } />
      <Route path="/aprobador/autorizacion/:id" element={
        <PaginaProtegida roles={['Aprobador']}>
          <DetalleAprobador />
        </PaginaProtegida>
      } />

      {/* Técnico */}
      <Route path="/tecnico" element={
        <PaginaProtegida roles={['Tecnico']}>
          <DashboardTecnico />
        </PaginaProtegida>
      } />
      <Route path="/tecnico/autorizacion/:id" element={
        <PaginaProtegida roles={['Tecnico']}>
          <DetalleTecnico />
        </PaginaProtegida>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}