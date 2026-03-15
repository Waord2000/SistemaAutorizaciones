import { useState, useEffect } from 'react'
import { areasServicio } from '../../services/api'

export default function Areas() {
  const [areas,         setAreas]         = useState([])
  const [maquinas,      setMaquinas]      = useState([])
  const [areaSeleccionada, setAreaSeleccionada] = useState(null)
  const [cargando,      setCargando]      = useState(true)
  const [mostrarFormArea,    setMostrarFormArea]    = useState(false)
  const [mostrarFormMaquina, setMostrarFormMaquina] = useState(false)
  const [error,         setError]         = useState('')
  const [exito,         setExito]         = useState('')

  const [nuevaArea,    setNuevaArea]    = useState({ nombre: '', descripcion: '' })
  const [nuevaMaquina, setNuevaMaquina] = useState({ nombre: '', descripcion: '' })

  useEffect(() => { cargarAreas() }, [])

  const cargarAreas = async () => {
    try {
      const respuesta = await areasServicio.obtenerTodas()
      setAreas(respuesta.data)
    } catch (err) {
      setError('Error al cargar áreas.')
    } finally {
      setCargando(false)
    }
  }

  const cargarMaquinas = async (idArea) => {
    try {
      const respuesta = await areasServicio.obtenerMaquinas(idArea)
      setMaquinas(respuesta.data)
      setAreaSeleccionada(idArea)
    } catch (err) {
      setError('Error al cargar máquinas.')
    }
  }

  const manejarCrearArea = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')
    try {
      await areasServicio.crearArea(nuevaArea)
      setExito('Área creada correctamente.')
      setNuevaArea({ nombre: '', descripcion: '' })
      setMostrarFormArea(false)
      cargarAreas()
    } catch (err) {
      setError('Error al crear área.')
    }
  }

  const manejarCrearMaquina = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')
    try {
      await areasServicio.crearMaquina(areaSeleccionada, nuevaMaquina)
      setExito('Máquina creada correctamente.')
      setNuevaMaquina({ nombre: '', descripcion: '' })
      setMostrarFormMaquina(false)
      cargarMaquinas(areaSeleccionada)
    } catch (err) {
      setError('Error al crear máquina.')
    }
  }

  if (cargando) return <div style={estilos.cargando}>Cargando...</div>

  return (
    <div>
      {/* Encabezado */}
      <div style={estilos.encabezado}>
        <div>
          <h1 style={estilos.titulo}>Áreas y Máquinas</h1>
          <p style={estilos.subtitulo}>
            Gestiona las áreas y equipos de la empresa
          </p>
        </div>
        <button
          style={estilos.btnNuevo}
          onClick={() => setMostrarFormArea(!mostrarFormArea)}
        >
          {mostrarFormArea ? '✕ Cancelar' : '+ Nueva Área'}
        </button>
      </div>

      {/* Mensajes */}
      {error && <div style={estilos.error}>⚠️ {error}</div>}
      {exito && <div style={estilos.exito}>✅ {exito}</div>}

      {/* Formulario nueva área */}
      {mostrarFormArea && (
        <div style={estilos.formularioContenedor}>
          <h3 style={estilos.formularioTitulo}>Crear nueva área</h3>
          <form onSubmit={manejarCrearArea} style={estilos.formularioGrid}>
            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Nombre del área</label>
              <input
                value={nuevaArea.nombre}
                onChange={(e) => setNuevaArea({ ...nuevaArea, nombre: e.target.value })}
                required
                style={estilos.input}
              />
            </div>
            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>Descripción</label>
              <input
                value={nuevaArea.descripcion}
                onChange={(e) => setNuevaArea({ ...nuevaArea, descripcion: e.target.value })}
                style={estilos.input}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" style={estilos.btnGuardar}>
                Crear Área
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Layout dos columnas */}
      <div style={estilos.dosColumnas}>

        {/* Lista de áreas */}
        <div style={estilos.columna}>
          <h3 style={estilos.columnaTitulo}>Áreas registradas</h3>
          {areas.length === 0 ? (
            <p style={estilos.sinDatos}>No hay áreas registradas</p>
          ) : (
            areas.map(area => (
              <div
                key={area.id}
                style={{
                  ...estilos.areaItem,
                  borderColor: areaSeleccionada === area.id ? '#1B3A5C' : '#E2E8F0',
                  backgroundColor: areaSeleccionada === area.id ? '#EBF8FF' : '#fff',
                }}
                onClick={() => cargarMaquinas(area.id)}
              >
                <span style={estilos.areaNombre}>🏭 {area.nombre}</span>
                {area.descripcion && (
                  <span style={estilos.areaDesc}>{area.descripcion}</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Máquinas del área seleccionada */}
        <div style={estilos.columna}>
          <div style={estilos.maquinasEncabezado}>
            <h3 style={estilos.columnaTitulo}>
              {areaSeleccionada
                ? `Máquinas — ${areas.find(a => a.id === areaSeleccionada)?.nombre}`
                : 'Selecciona un área'}
            </h3>
            {areaSeleccionada && (
              <button
                style={estilos.btnNuevoSm}
                onClick={() => setMostrarFormMaquina(!mostrarFormMaquina)}
              >
                {mostrarFormMaquina ? '✕' : '+ Máquina'}
              </button>
            )}
          </div>

          {mostrarFormMaquina && (
            <form onSubmit={manejarCrearMaquina} style={estilos.formMaquina}>
              <input
                placeholder="Nombre de la máquina"
                value={nuevaMaquina.nombre}
                onChange={(e) => setNuevaMaquina({ ...nuevaMaquina, nombre: e.target.value })}
                required
                style={estilos.input}
              />
              <input
                placeholder="Descripción (opcional)"
                value={nuevaMaquina.descripcion}
                onChange={(e) => setNuevaMaquina({ ...nuevaMaquina, descripcion: e.target.value })}
                style={estilos.input}
              />
              <button type="submit" style={estilos.btnGuardar}>
                Agregar
              </button>
            </form>
          )}

          {!areaSeleccionada ? (
            <p style={estilos.sinDatos}>
              Haz clic en un área para ver sus máquinas
            </p>
          ) : maquinas.length === 0 ? (
            <p style={estilos.sinDatos}>
              No hay máquinas registradas en esta área
            </p>
          ) : (
            maquinas.map(m => (
              <div key={m.id} style={estilos.maquinaItem}>
                <span>⚙️ {m.nombre}</span>
                {m.descripcion && (
                  <span style={estilos.areaDesc}>{m.descripcion}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const estilos = {
  cargando:             { textAlign: 'center', padding: '40px', color: '#6B7280' },
  encabezado:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titulo:               { fontSize: '26px', fontWeight: 'bold', color: '#1B3A5C', margin: 0 },
  subtitulo:            { color: '#6B7280', marginTop: '4px' },
  btnNuevo:             { backgroundColor: '#1B3A5C', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnNuevoSm:           { backgroundColor: '#1B3A5C', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' },
  error:                { backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px', color: '#B91C1C', marginBottom: '16px' },
  exito:                { backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px', color: '#166534', marginBottom: '16px' },
  formularioContenedor: { backgroundColor: '#fff', borderRadius: '10px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  formularioTitulo:     { fontSize: '16px', fontWeight: '600', color: '#1B3A5C', marginBottom: '16px' },
  formularioGrid:       { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  campo:                { display: 'flex', flexDirection: 'column', gap: '6px' },
  etiqueta:             { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input:                { padding: '9px 12px', borderRadius: '7px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  btnGuardar:           { backgroundColor: '#1B3A5C', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  dosColumnas:          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  columna:              { backgroundColor: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  columnaTitulo:        { fontSize: '15px', fontWeight: '600', color: '#1B3A5C', marginBottom: '16px', marginTop: 0 },
  maquinasEncabezado:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  areaItem:             { border: '2px solid', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', transition: 'all 0.2s' },
  areaNombre:           { fontSize: '14px', fontWeight: '600', color: '#2D3748' },
  areaDesc:             { fontSize: '12px', color: '#9CA3AF' },
  maquinaItem:          { border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' },
  formMaquina:          { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', padding: '12px', backgroundColor: '#F7FAFC', borderRadius: '8px' },
  sinDatos:             { textAlign: 'center', color: '#9CA3AF', fontSize: '14px', padding: '20px 0' },
}