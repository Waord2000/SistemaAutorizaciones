import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { authServicio } from '../../services/api'

export default function Login() {
  const navegar          = useNavigate()
  const { iniciarSesion } = useAuth()

  const [correo,     setCorreo]     = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error,      setError]      = useState('')
  const [cargando,   setCargando]   = useState(false)

  const manejarLogin = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const respuesta = await authServicio.login({ correo, contrasena })
      const { token, usuario } = respuesta.data

      iniciarSesion(token, usuario)

      // Redirigir según rol
      if (usuario.rol === 'Administrador') navegar('/admin')
      else if (usuario.rol === 'Aprobador') navegar('/aprobador')
      else if (usuario.rol === 'Tecnico')   navegar('/tecnico')

    } catch (err) {
      setError(
        err.response?.data?.mensaje || 'Error al iniciar sesión. Verifica tus credenciales.'
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.tarjeta}>

        {/* Logo / Encabezado */}
        <div style={estilos.encabezado}>
          <div style={estilos.icono}>🏭</div>
          <h1 style={estilos.titulo}>Sistema de Autorizaciones</h1>
          <p style={estilos.subtitulo}>Formulario Digital FO-MA-19</p>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarLogin} style={estilos.formulario}>

          <div style={estilos.campo}>
            <label style={estilos.etiqueta}>Correo electrónico</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@empresa.com"
              required
              style={estilos.input}
            />
          </div>

          <div style={estilos.campo}>
            <label style={estilos.etiqueta}>Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              required
              style={estilos.input}
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div style={estilos.error}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={cargando ? estilos.botonDesactivado : estilos.boton}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

        </form>

        <p style={estilos.pie}>
          Acceso restringido al personal autorizado
        </p>
      </div>
    </div>
  )
}

// ── Estilos ───────────────────────────────────────────────────
const estilos = {
  contenedor: {
    minHeight:       '100vh',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: '#f0f4f8',
    fontFamily:      'Arial, sans-serif',
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    borderRadius:    '12px',
    padding:         '40px',
    width:           '100%',
    maxWidth:        '420px',
    boxShadow:       '0 4px 24px rgba(0,0,0,0.10)',
  },
  encabezado: {
    textAlign:     'center',
    marginBottom:  '32px',
  },
  icono: {
    fontSize:      '48px',
    marginBottom:  '12px',
  },
  titulo: {
    fontSize:      '22px',
    fontWeight:    'bold',
    color:         '#1B3A5C',
    margin:        '0 0 6px 0',
  },
  subtitulo: {
    fontSize:      '14px',
    color:         '#6B7280',
    margin:        0,
  },
  formulario: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '20px',
  },
  campo: {
    display:       'flex',
    flexDirection: 'column',
    gap:           '6px',
  },
  etiqueta: {
    fontSize:      '14px',
    fontWeight:    '600',
    color:         '#374151',
  },
  input: {
    padding:       '10px 14px',
    borderRadius:  '8px',
    border:        '1px solid #D1D5DB',
    fontSize:      '15px',
    outline:       'none',
    transition:    'border 0.2s',
  },
  error: {
    backgroundColor: '#FEF2F2',
    border:          '1px solid #FCA5A5',
    borderRadius:    '8px',
    padding:         '10px 14px',
    color:           '#B91C1C',
    fontSize:        '14px',
  },
  boton: {
    backgroundColor: '#1B3A5C',
    color:           '#ffffff',
    border:          'none',
    borderRadius:    '8px',
    padding:         '12px',
    fontSize:        '16px',
    fontWeight:      'bold',
    cursor:          'pointer',
    transition:      'background 0.2s',
  },
  botonDesactivado: {
    backgroundColor: '#9CA3AF',
    color:           '#ffffff',
    border:          'none',
    borderRadius:    '8px',
    padding:         '12px',
    fontSize:        '16px',
    fontWeight:      'bold',
    cursor:          'not-allowed',
  },
  pie: {
    textAlign:   'center',
    fontSize:    '12px',
    color:       '#9CA3AF',
    marginTop:   '24px',
    marginBottom: 0,
  },
}