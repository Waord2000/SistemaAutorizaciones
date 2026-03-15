import { useState, useEffect } from 'react'
import { usuariosServicio } from '../../services/api'

export default function Usuarios() {
  const [usuarios,     setUsuarios]     = useState([])
  const [cargando,     setCargando]     = useState(true)
  const [mostrarForm,  setMostrarForm]  = useState(false)
  const [error,        setError]        = useState('')
  const [exito,        setExito]        = useState('')

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre:       '',
    apellido:     '',
    correo:       '',
    contrasena:   '',
    rol:          'Tecnico',
    cargo:        '',
    nivelTecnico: '',
  })

  useEffect(() => { cargarUsuarios() }, [])

  const cargarUsuarios = async () => {
    try {
      const respuesta = await usuariosServicio.obtenerTodos()
      setUsuarios(respuesta.data)
    } catch (err) {
      setError('Error al cargar usuarios.')
    } finally {
      setCargando(false)
    }
  }

  const manejarCambio = (e) => {
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value })
  }

  const manejarCrear = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')
    try {
      await usuariosServicio.crear(nuevoUsuario)
      setExito('Usuario creado correctamente.')
      setMostrarForm(false)
      setNuevoUsuario({
        nombre: '', apellido: '', correo: '',
        contrasena: '', rol: 'Tecnico', cargo: '', nivelTecnico: '',
      })
      cargarUsuarios()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear usuario.')
    }
  }

  const manejarCambiarEstado = async (id, estadoActual) => {
    try {
      await usuariosServicio.cambiarEstado(id, !estadoActual)
      cargarUsuarios()
    } catch (err) {
      setError('Error al cambiar estado del usuario.')
    }
  }

  const rolesColores = {
    Administrador: { bg: '#EDE9FE', color: '#6D28D9' },
    Aprobador:     { bg: '#DBEAFE', color: '#1D4ED8' },
    Tecnico:       { bg: '#D1FAE5', color: '#065F46' },
  }

  if (cargando) return <div style={estilos.cargando}>Cargando...</div>

  return (
    <div>
      {/* Encabezado */}
      <div style={estilos.encabezado}>
        <div>
          <h1 style={estilos.titulo}>Gestión de Usuarios</h1>
          <p style={estilos.subtitulo}>
            Administra los usuarios del sistema
          </p>
        </div>
        <button
          style={estilos.btnNuevo}
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {/* Mensajes */}
      {error  && <div style={estilos.error}>⚠️ {error}</div>}
      {exito  && <div style={estilos.exito}>✅ {exito}</div>}

      {/* Formulario nuevo usuario */}
      {mostrarForm && (
        <div style={estilos.formularioContenedor}>
          <h3 style={estilos.formularioTitulo}>Crear nuevo usuario</h3>
          <form onSubmit={manejarCrear} style={estilos.formularioGrid}>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Nombre</label>
              <input
                name="nombre"
                value={nuevoUsuario.nombre}
                onChange={manejarCambio}
                required
                style={estilos.input}
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Apellido</label>
              <input
                name="apellido"
                value={nuevoUsuario.apellido}
                onChange={manejarCambio}
                required
                style={estilos.input}
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Correo</label>
              <input
                name="correo"
                type="email"
                value={nuevoUsuario.correo}
                onChange={manejarCambio}
                required
                style={estilos.input}
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Contraseña</label>
              <input
                name="contrasena"
                type="password"
                value={nuevoUsuario.contrasena}
                onChange={manejarCambio}
                required
                style={estilos.input}
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Rol</label>
              <select
                name="rol"
                value={nuevoUsuario.rol}
                onChange={manejarCambio}
                style={estilos.input}
              >
                <option value="Administrador">Administrador</option>
                <option value="Aprobador">Aprobador</option>
                <option value="Tecnico">Técnico</option>
              </select>
            </div>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Cargo</label>
              <input
                name="cargo"
                value={nuevoUsuario.cargo}
                onChange={manejarCambio}
                placeholder="Ej: Jefe de Área"
                style={estilos.input}
              />
            </div>

            {nuevoUsuario.rol === 'Tecnico' && (
              <div style={estilos.campo}>
                <label style={estilos.etiqueta}>Nivel Técnico</label>
                <select
                  name="nivelTecnico"
                  value={nuevoUsuario.nivelTecnico}
                  onChange={manejarCambio}
                  style={estilos.input}
                >
                  <option value="">Seleccionar</option>
                  <option value="A">Nivel A</option>
                  <option value="B">Nivel B</option>
                  <option value="C">Nivel C</option>
                </select>
              </div>
            )}

            <div style={estilos.campoCompleto}>
              <button type="submit" style={estilos.btnGuardar}>
                Crear Usuario
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div style={estilos.tablaContenedor}>
        <table style={estilos.tabla}>
          <thead>
            <tr style={estilos.encabezadoTabla}>
              <th style={estilos.th}>Nombre</th>
              <th style={estilos.th}>Correo</th>
              <th style={estilos.th}>Rol</th>
              <th style={estilos.th}>Cargo</th>
              <th style={estilos.th}>Nivel</th>
              <th style={estilos.th}>Estado</th>
              <th style={estilos.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={7} style={estilos.sinDatos}>
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              usuarios.map(u => (
                <tr key={u.id} style={estilos.fila}>
                  <td style={estilos.td}>
                    {u.nombre} {u.apellido}
                  </td>
                  <td style={estilos.td}>{u.correo}</td>
                  <td style={estilos.td}>
                    <span style={{
                      ...estilos.badge,
                      backgroundColor: rolesColores[u.rol]?.bg,
                      color:           rolesColores[u.rol]?.color,
                    }}>
                      {u.rol}
                    </span>
                  </td>
                  <td style={estilos.td}>{u.cargo || '—'}</td>
                  <td style={estilos.td}>{u.nivelTecnico || '—'}</td>
                  <td style={estilos.td}>
                    <span style={{
                      ...estilos.badge,
                      backgroundColor: u.activo ? '#D1FAE5' : '#FEE2E2',
                      color:           u.activo ? '#065F46' : '#991B1B',
                    }}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={estilos.td}>
                    <button
                      style={{
                        ...estilos.btnEstado,
                        backgroundColor: u.activo ? '#FEE2E2' : '#D1FAE5',
                        color:           u.activo ? '#991B1B' : '#065F46',
                      }}
                      onClick={() => manejarCambiarEstado(u.id, u.activo)}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const estilos = {
  cargando:            { textAlign: 'center', padding: '40px', color: '#6B7280' },
  encabezado:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titulo:              { fontSize: '26px', fontWeight: 'bold', color: '#1B3A5C', margin: 0 },
  subtitulo:           { color: '#6B7280', marginTop: '4px' },
  btnNuevo:            { backgroundColor: '#1B3A5C', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  error:               { backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px', color: '#B91C1C', marginBottom: '16px' },
  exito:               { backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px', color: '#166534', marginBottom: '16px' },
  formularioContenedor:{ backgroundColor: '#fff', borderRadius: '10px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  formularioTitulo:    { fontSize: '16px', fontWeight: '600', color: '#1B3A5C', marginBottom: '16px' },
  formularioGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  campo:               { display: 'flex', flexDirection: 'column', gap: '6px' },
  campoCompleto:       { gridColumn: '1 / -1' },
  etiqueta:            { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input:               { padding: '9px 12px', borderRadius: '7px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' },
  btnGuardar:          { backgroundColor: '#1B3A5C', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  tablaContenedor:     { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  tabla:               { width: '100%', borderCollapse: 'collapse' },
  encabezadoTabla:     { backgroundColor: '#F7FAFC' },
  th:                  { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4A5568', borderBottom: '1px solid #E2E8F0' },
  fila:                { borderBottom: '1px solid #F0F4F8' },
  td:                  { padding: '12px 16px', fontSize: '14px', color: '#2D3748' },
  badge:               { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  btnEstado:           { border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  sinDatos:            { textAlign: 'center', padding: '40px', color: '#9CA3AF' },
}