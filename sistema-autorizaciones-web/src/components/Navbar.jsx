import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { usuario, cerrarSesion, esAdmin, esAprobador, esTecnico } = useAuth()
  const navegar = useNavigate()

  const manejarCerrarSesion = () => {
    cerrarSesion()
    navegar('/login')
  }

  const obtenerRutaInicio = () => {
    if (esAdmin)     return '/admin'
    if (esAprobador) return '/aprobador'
    if (esTecnico)   return '/tecnico'
    return '/'
  }

  return (
    <nav style={estilos.navbar}>
      {/* Logo e inicio */}
      <div
        style={estilos.logo}
        onClick={() => navegar(obtenerRutaInicio())}
      >
        <span style={estilos.logoIcono}>🏭</span>
        <span style={estilos.logoTexto}>Sistema de Autorizaciones</span>
      </div>

      {/* Navegación según rol */}
      <div style={estilos.navegacion}>
        {esAdmin && (
          <>
            <button
              style={estilos.enlace}
              onClick={() => navegar('/admin')}
            >
              Dashboard
            </button>
            <button
              style={estilos.enlace}
              onClick={() => navegar('/admin/usuarios')}
            >
              Usuarios
            </button>
            <button
              style={estilos.enlace}
              onClick={() => navegar('/admin/areas')}
            >
              Áreas
            </button>
          </>
        )}

        {esAprobador && (
          <>
            <button
              style={estilos.enlace}
              onClick={() => navegar('/aprobador')}
            >
              Mis Autorizaciones
            </button>
            <button
              style={estilos.enlace}
              onClick={() => navegar('/aprobador/nueva')}
            >
              Nueva Autorización
            </button>
          </>
        )}

        {esTecnico && (
          <>
            <button
              style={estilos.enlace}
              onClick={() => navegar('/tecnico')}
            >
              Mis Tareas
            </button>
          </>
        )}
      </div>

      {/* Usuario y cerrar sesión */}
      <div style={estilos.usuarioPanel}>
        <div style={estilos.usuarioInfo}>
          <span style={estilos.usuarioNombre}>
            {usuario?.nombre} {usuario?.apellido}
          </span>
          <span style={estilos.usuarioRol}>
            {usuario?.rol}
          </span>
        </div>
        <button
          style={estilos.botonSalir}
          onClick={manejarCerrarSesion}
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}

const estilos = {
  navbar: {
    backgroundColor:  '#1B3A5C',
    padding:          '0 24px',
    height:           '64px',
    display:          'flex',
    alignItems:       'center',
    justifyContent:   'space-between',
    boxShadow:        '0 2px 8px rgba(0,0,0,0.2)',
    position:         'sticky',
    top:              0,
    zIndex:           100,
  },
  logo: {
    display:    'flex',
    alignItems: 'center',
    gap:        '10px',
    cursor:     'pointer',
  },
  logoIcono: {
    fontSize: '24px',
  },
  logoTexto: {
    color:      '#ffffff',
    fontWeight: 'bold',
    fontSize:   '16px',
  },
  navegacion: {
    display: 'flex',
    gap:     '8px',
  },
  enlace: {
    backgroundColor: 'transparent',
    color:           '#CBD5E0',
    border:          'none',
    padding:         '8px 14px',
    borderRadius:    '6px',
    cursor:          'pointer',
    fontSize:        '14px',
    fontWeight:      '500',
    transition:      'all 0.2s',
  },
  usuarioPanel: {
    display:    'flex',
    alignItems: 'center',
    gap:        '16px',
  },
  usuarioInfo: {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'flex-end',
  },
  usuarioNombre: {
    color:      '#ffffff',
    fontSize:   '14px',
    fontWeight: '600',
  },
  usuarioRol: {
    color:    '#90CDF4',
    fontSize: '12px',
  },
  botonSalir: {
    backgroundColor: '#E53E3E',
    color:           '#ffffff',
    border:          'none',
    padding:         '8px 16px',
    borderRadius:    '6px',
    cursor:          'pointer',
    fontSize:        '14px',
    fontWeight:      '600',
  },
}