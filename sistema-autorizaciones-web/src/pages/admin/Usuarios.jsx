import { useState, useEffect } from 'react'
import { usuariosServicio } from '../../services/api'

export default function Usuarios() {
  const [usuarios,       setUsuarios]       = useState([])
  const [cargando,       setCargando]       = useState(true)
  const [mostrarForm,    setMostrarForm]    = useState(false)
  const [error,          setError]          = useState('')
  const [exito,          setExito]          = useState('')

  // ── Estado formulario nuevo usuario ────────────────────────
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre:       '',
    apellido:     '',
    correo:       '',
    contrasena:   '',
    rol:          'Tecnico',
    cargo:        '',
    nivelTecnico: '',
  })

  // ── Estado edición ──────────────────────────────────────────
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null)
  const [datosEdicion,      setDatosEdicion]      = useState({
    nombre:          '',
    apellido:        '',
    cargo:           '',
    nivelTecnico:    '',
    nuevaContrasena: '',
  })

  // ── Estado confirmación eliminar ────────────────────────────
  const [usuarioEliminandoId, setUsuarioEliminandoId] = useState(null)

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

  const manejarCambioEdicion = (e) => {
    setDatosEdicion({ ...datosEdicion, [e.target.name]: e.target.value })
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

  const manejarEditar = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')
    try {
      await usuariosServicio.editar(usuarioEditandoId, datosEdicion)
      setExito('Usuario actualizado correctamente.')
      setUsuarioEditandoId(null)
      cargarUsuarios()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al editar usuario.')
    }
  }

  const manejarCambiarEstado = async (id, estadoActual) => {
    setError('')
    setExito('')
    try {
      await usuariosServicio.cambiarEstado(id, !estadoActual)
      setExito(
        !estadoActual ? 'Usuario activado.' : 'Usuario desactivado.'
      )
      cargarUsuarios()
    } catch (err) {
      setError('Error al cambiar estado del usuario.')
    }
  }

  const manejarEliminar = async (id) => {
    setError('')
    setExito('')
    try {
      await usuariosServicio.eliminar(id)
      setExito('Usuario eliminado correctamente.')
      setUsuarioEliminandoId(null)
      cargarUsuarios()
    } catch (err) {
      setError(
        err.response?.data?.mensaje || 'Error al eliminar usuario.'
      )
      setUsuarioEliminandoId(null)
    }
  }

  const abrirEdicion = (u) => {
    setUsuarioEditandoId(u.id)
    setDatosEdicion({
      nombre:          u.nombre,
      apellido:        u.apellido,
      cargo:           u.cargo || '',
      nivelTecnico:    u.nivelTecnico === 'null' ? '' : (u.nivelTecnico || ''),
      nuevaContrasena: '',
    })
    setMostrarForm(false)
    setError('')
    setExito('')
  }

  const rolesColores = {
    Administrador: { bg: '#EDE9FE', color: '#6D28D9' },
    Aprobador:     { bg: '#DBEAFE', color: '#1D4ED8' },
    Tecnico:       { bg: '#D1FAE5', color: '#065F46' },
  }

  if (cargando) return (
    <div style={estilos.cargando}>Cargando...</div>
  )

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
          onClick={() => {
            setMostrarForm(!mostrarForm)
            setUsuarioEditandoId(null)
          }}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {/* Mensajes */}
      {error && <div style={estilos.error}>⚠️ {error}</div>}
      {exito && <div style={estilos.exito}>✅ {exito}</div>}

      {/* ── Formulario nuevo usuario ── */}
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

      {/* ── Formulario editar usuario ── */}
      {usuarioEditandoId && (
        <div style={estilos.formularioEdicion}>
          <h3 style={estilos.formularioTitulo}>
            ✏️ Editando usuario
          </h3>
          <form onSubmit={manejarEditar} style={estilos.formularioGrid}>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Nombre</label>
              <input
                name="nombre"
                value={datosEdicion.nombre}
                onChange={manejarCambioEdicion}
                required
                style={estilos.input}
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Apellido</label>
              <input
                name="apellido"
                value={datosEdicion.apellido}
                onChange={manejarCambioEdicion}
                required
                style={estilos.input}
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Cargo</label>
              <input
                name="cargo"
                value={datosEdicion.cargo}
                onChange={manejarCambioEdicion}
                placeholder="Ej: Jefe de Área"
                style={estilos.input}
              />
            </div>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Nivel Técnico</label>
              <select
                name="nivelTecnico"
                value={datosEdicion.nivelTecnico}
                onChange={manejarCambioEdicion}
                style={estilos.input}
              >
                <option value="">Sin nivel</option>
                <option value="A">Nivel A</option>
                <option value="B">Nivel B</option>
                <option value="C">Nivel C</option>
              </select>
            </div>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>
                Nueva contraseña{' '}
                <span style={estilos.opcional}>(opcional)</span>
              </label>
              <input
                name="nuevaContrasena"
                type="password"
                value={datosEdicion.nuevaContrasena}
                onChange={manejarCambioEdicion}
                placeholder="Dejar vacío para no cambiar"
                style={estilos.input}
              />
            </div>

            <div style={estilos.campoCompleto}>
              <div style={estilos.botonesEdicion}>
                <button
                  type="button"
                  onClick={() => setUsuarioEditandoId(null)}
                  style={estilos.btnSecundario}
                >
                  Cancelar
                </button>
                <button type="submit" style={estilos.btnGuardar}>
                  Guardar cambios
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabla de usuarios ── */}
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
                  <td style={estilos.td}>
                    {u.nivelTecnico === 'null' || !u.nivelTecnico
                      ? '—'
                      : u.nivelTecnico}
                  </td>
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
                    <div style={estilos.accionesFila}>

                      {/* Editar */}
                      <button
                        style={estilos.btnEditar}
                        onClick={() => abrirEdicion(u)}
                      >
                        ✏️
                      </button>

                      {/* Activar / Desactivar */}
                      <button
                        style={{
                          ...estilos.btnEstado,
                          backgroundColor: u.activo
                            ? '#FEE2E2' : '#D1FAE5',
                          color: u.activo ? '#991B1B' : '#065F46',
                        }}
                        onClick={() =>
                          manejarCambiarEstado(u.id, u.activo)
                        }
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>

                      {/* Eliminar */}
                      {usuarioEliminandoId === u.id ? (
                        <div style={estilos.confirmarEliminar}>
                          <span style={estilos.confirmarTexto}>
                            ¿Confirmar?
                          </span>
                          <button
                            style={estilos.btnConfirmarSi}
                            onClick={() => manejarEliminar(u.id)}
                          >
                            Sí
                          </button>
                          <button
                            style={estilos.btnConfirmarNo}
                            onClick={() => setUsuarioEliminandoId(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          style={estilos.btnEliminar}
                          onClick={() => setUsuarioEliminandoId(u.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
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
  formularioEdicion:   { backgroundColor: '#FFFBEB', border: '2px solid #FCD34D', borderRadius: '10px', padding: '24px', marginBottom: '24px' },
  formularioTitulo:    { fontSize: '16px', fontWeight: '600', color: '#1B3A5C', marginBottom: '16px', marginTop: 0 },
  formularioGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  campo:               { display: 'flex', flexDirection: 'column', gap: '6px' },
  campoCompleto:       { gridColumn: '1 / -1' },
  etiqueta:            { fontSize: '13px', fontWeight: '600', color: '#374151' },
  opcional:            { fontSize: '11px', fontWeight: '400', color: '#9CA3AF' },
  input:               { padding: '9px 12px', borderRadius: '7px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' },
  btnGuardar:          { backgroundColor: '#1B3A5C', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  botonesEdicion:      { display: 'flex', gap: '12px' },
  btnSecundario:       { backgroundColor: '#E2E8F0', color: '#4A5568', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', cursor: 'pointer' },
  tablaContenedor:     { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  tabla:               { width: '100%', borderCollapse: 'collapse' },
  encabezadoTabla:     { backgroundColor: '#F7FAFC' },
  th:                  { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4A5568', borderBottom: '1px solid #E2E8F0' },
  fila:                { borderBottom: '1px solid #F0F4F8' },
  td:                  { padding: '12px 16px', fontSize: '14px', color: '#2D3748' },
  badge:               { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  accionesFila:        { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' },
  btnEditar:           { backgroundColor: '#EBF8FF', color: '#2B6CB0', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '14px', cursor: 'pointer' },
  btnEstado:           { border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  btnEliminar:         { backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '14px', cursor: 'pointer' },
  confirmarEliminar:   { display: 'flex', alignItems: 'center', gap: '4px' },
  confirmarTexto:      { fontSize: '12px', color: '#991B1B', fontWeight: '600' },
  btnConfirmarSi:      { backgroundColor: '#DC2626', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  btnConfirmarNo:      { backgroundColor: '#E2E8F0', color: '#4A5568', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' },
  sinDatos:            { textAlign: 'center', padding: '40px', color: '#9CA3AF' },
}