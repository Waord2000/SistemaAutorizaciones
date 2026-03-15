import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children, rolesPermitidos }) {
  const { estaAutenticado, usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="pantalla-carga">
        <p>Cargando...</p>
      </div>
    )
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rol)) {
    return <Navigate to="/sin-acceso" replace />
  }

  return children
}