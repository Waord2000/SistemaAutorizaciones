import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { autorizacionesServicio, notificacionesServicio } from '../../services/api'

export default function DashboardTecnico() {
  const navegar              = useNavigate()
  const [tareas,         setTareas]         = useState([])
  const [cargando,       setCargando]       = useState(true)
  const [cantidadSinLeer,setCantidadSinLeer]= useState(0)
  const [busqueda,       setBusqueda]       = useState('')

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    try {
      const [respTareas, respNotif] = await Promise.all([
        autorizacionesServicio.obtenerTodas(),
        notificacionesServicio.contarSinLeer(),
      ])
      setTareas(respTareas.data)
      setCantidadSinLeer(respNotif.data.cantidad)
    } catch (err) {
      console.error('Error al cargar:', err)
    } finally {
      setCargando(false)
    }
  }

  const estadosColores = {
    Pendiente:  { bg: '#FFFBEB', color: '#D97706' },
    Aprobada:   { bg: '#ECFDF5', color: '#059669' },
    Completada: { bg: '#F0FDF4', color: '#16A34A' },
    Cancelada:  { bg: '#F9FAFB', color: '#6B7280' },
  }

  const tareasPendientes  = tareas.filter(t => t.estado === 'Pendiente')
  const tareasAprobadas   = tareas.filter(t => t.estado === 'Aprobada')
  const tareasCompletadas = tareas.filter(t => t.estado === 'Completada')

  // ── Filtrado por búsqueda ─────────────────────────────────
  const tareasFiltradas = tareas.filter(t => {
    if (!busqueda.trim()) return true
    const texto = busqueda.toLowerCase()
    return (
      t.codigo?.toLowerCase().includes(texto)    ||
      t.area?.toLowerCase().includes(texto)      ||
      t.aprobador?.toLowerCase().includes(texto) ||
      t.estado?.toLowerCase().includes(texto)
    )
  })

  if (cargando) return (
    <div style={estilos.cargando}>Cargando tus tareas...</div>
  )

  return (
    <div>
      {/* Encabezado */}
      <div style={estilos.encabezado}>
        <div>
          <h1 style={estilos.titulo}>Mis Tareas Asignadas</h1>
          <p style={estilos.subtitulo}>
            Revisa y confirma las autorizaciones de trabajo
          </p>
        </div>
        {cantidadSinLeer > 0 && (
          <div style={estilos.alertaNotif}>
            🔔 Tienes <strong>{cantidadSinLeer}</strong> notificación(es) sin leer
          </div>
        )}
      </div>

      {/* Tarjetas resumen */}
      <div style={estilos.tarjetasGrid}>
        {[
          { label: 'Total asignadas', valor: tareas.length,            color: '#1B3A5C' },
          { label: 'Por confirmar',   valor: tareasPendientes.length,  color: '#D97706' },
          { label: 'Confirmadas',     valor: tareasAprobadas.length,   color: '#059669' },
          { label: 'Completadas',     valor: tareasCompletadas.length, color: '#16A34A' },
        ].map(item => (
          <div key={item.label} style={estilos.tarjeta}>
            <span style={{ ...estilos.tarjetaNumero, color: item.color }}>
              {item.valor}
            </span>
            <span style={estilos.tarjetaLabel}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Alerta tareas pendientes */}
      {tareasPendientes.length > 0 && (
        <div style={estilos.alertaPendiente}>
          ⚠️ Tienes <strong>{tareasPendientes.length}</strong> tarea(s)
          pendiente(s) de confirmación. Por favor revísalas y acepta.
        </div>
      )}

      {/* Barra de búsqueda */}
      <div style={estilos.barraBusqueda}>
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar por código, área, aprobador o estado..."
          style={estilos.inputBusqueda}
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            style={estilos.btnLimpiar}
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Lista de tareas */}
      <div style={estilos.tablaContenedor}>
        <table style={estilos.tabla}>
          <thead>
            <tr style={estilos.encabezadoTabla}>
              <th style={estilos.th}>Código</th>
              <th style={estilos.th}>Fecha</th>
              <th style={estilos.th}>Área</th>
              <th style={estilos.th}>Aprobador</th>
              <th style={estilos.th}>Estado</th>
              <th style={estilos.th}>Mi confirmación</th>
              <th style={estilos.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tareasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} style={estilos.sinDatos}>
                  {busqueda
                    ? `No se encontraron resultados para "${busqueda}"`
                    : 'No tienes tareas asignadas actualmente.'
                  }
                </td>
              </tr>
            ) : (
              tareasFiltradas.map(t => (
                <tr key={t.id} style={{
                  ...estilos.fila,
                  backgroundColor: t.estado === 'Pendiente'
                    ? '#FFFBEB' : '#fff'
                }}>
                  <td style={estilos.td}>
                    <strong>{t.codigo}</strong>
                  </td>
                  <td style={estilos.td}>{t.fecha}</td>
                  <td style={estilos.td}>{t.area}</td>
                  <td style={estilos.td}>{t.aprobador}</td>
                  <td style={estilos.td}>
                    <span style={{
                      ...estilos.badge,
                      backgroundColor: estadosColores[t.estado]?.bg,
                      color:           estadosColores[t.estado]?.color,
                    }}>
                      {t.estado}
                    </span>
                  </td>
                  <td style={estilos.td}>
                    {t.tecnicoAcepto
                      ? <span style={estilos.confirmado}>✅ Confirmado</span>
                      : <span style={estilos.sinConfirmar}>⏳ Sin confirmar</span>
                    }
                  </td>
                  <td style={estilos.td}>
                    <button
                      style={{
                        ...estilos.btnVer,
                        backgroundColor: t.estado === 'Pendiente'
                          ? '#1B3A5C' : '#EBF8FF',
                        color: t.estado === 'Pendiente'
                          ? '#fff' : '#2B6CB0',
                      }}
                      onClick={() =>
                        navegar(`/tecnico/autorizacion/${t.id}`)
                      }
                    >
                      {t.estado === 'Pendiente'
                        ? '✍️ Revisar y firmar'
                        : 'Ver detalle'
                      }
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
  cargando:        { textAlign: 'center', padding: '40px', color: '#6B7280' },
  encabezado:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titulo:          { fontSize: '26px', fontWeight: 'bold', color: '#1B3A5C', margin: 0 },
  subtitulo:       { color: '#6B7280', marginTop: '4px' },
  alertaNotif:     { backgroundColor: '#EBF8FF', border: '1px solid #90CDF4', borderRadius: '8px', padding: '12px 20px', color: '#2B6CB0', fontSize: '14px' },
  alertaPendiente: { backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px 20px', color: '#92400E', fontSize: '14px', marginBottom: '16px' },
  tarjetasGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  tarjeta:         { backgroundColor: '#fff', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  tarjetaNumero:   { fontSize: '32px', fontWeight: 'bold' },
  tarjetaLabel:    { fontSize: '13px', color: '#6B7280', marginTop: '4px', textAlign: 'center' },
  barraBusqueda:   { display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' },
  inputBusqueda:   { flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  btnLimpiar:      { backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' },
  tablaContenedor: { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  tabla:           { width: '100%', borderCollapse: 'collapse' },
  encabezadoTabla: { backgroundColor: '#F7FAFC' },
  th:              { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4A5568', borderBottom: '1px solid #E2E8F0' },
  fila:            { borderBottom: '1px solid #F0F4F8' },
  td:              { padding: '12px 16px', fontSize: '14px', color: '#2D3748' },
  badge:           { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  btnVer:          { border: 'none', borderRadius: '6px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  confirmado:      { color: '#059669', fontSize: '13px', fontWeight: '600' },
  sinConfirmar:    { color: '#D97706', fontSize: '13px', fontWeight: '600' },
  sinDatos:        { textAlign: 'center', padding: '40px', color: '#9CA3AF' },
}