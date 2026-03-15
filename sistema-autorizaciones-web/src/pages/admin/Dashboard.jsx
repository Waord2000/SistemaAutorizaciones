import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { autorizacionesServicio } from '../../services/api'

export default function DashboardAdmin() {
  const navegar = useNavigate()
  const [autorizaciones, setAutorizaciones] = useState([])
  const [cargando,       setCargando]       = useState(true)
  const [filtroEstado,   setFiltroEstado]   = useState('Todos')

  useEffect(() => {
    cargarAutorizaciones()
  }, [])

  const cargarAutorizaciones = async () => {
    try {
      const respuesta = await autorizacionesServicio.obtenerTodas()
      setAutorizaciones(respuesta.data)
    } catch (error) {
      console.error('Error al cargar autorizaciones:', error)
    } finally {
      setCargando(false)
    }
  }

  const estadosColores = {
    Borrador:   { bg: '#EFF6FF', color: '#1D4ED8' },
    Pendiente:  { bg: '#FFFBEB', color: '#D97706' },
    Aprobada:   { bg: '#ECFDF5', color: '#059669' },
    Rechazada:  { bg: '#FEF2F2', color: '#DC2626' },
    Completada: { bg: '#F0FDF4', color: '#16A34A' },
    Cancelada:  { bg: '#F9FAFB', color: '#6B7280' },
  }

  const contarPorEstado = (estado) =>
    autorizaciones.filter(a => a.estado === estado).length

  const autorizacionesFiltradas = filtroEstado === 'Todos'
    ? autorizaciones
    : autorizaciones.filter(a => a.estado === filtroEstado)

  if (cargando) return <div style={estilos.cargando}>Cargando...</div>

  return (
    <div>
      {/* Encabezado */}
      <div style={estilos.encabezado}>
        <h1 style={estilos.titulo}>Panel de Administración</h1>
        <p style={estilos.subtitulo}>
          Gestión de autorizaciones de trabajo
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div style={estilos.tarjetasGrid}>
        {[
          { label: 'Total',      valor: autorizaciones.length,          color: '#1B3A5C' },
          { label: 'Pendientes', valor: contarPorEstado('Pendiente'),   color: '#D97706' },
          { label: 'Aprobadas',  valor: contarPorEstado('Aprobada'),    color: '#059669' },
          { label: 'Completadas',valor: contarPorEstado('Completada'),  color: '#16A34A' },
          { label: 'Rechazadas', valor: contarPorEstado('Rechazada'),   color: '#DC2626' },
          { label: 'Canceladas', valor: contarPorEstado('Cancelada'),   color: '#6B7280' },
        ].map((item) => (
          <div key={item.label} style={estilos.tarjeta}>
            <span style={{ ...estilos.tarjetaNumero, color: item.color }}>
              {item.valor}
            </span>
            <span style={estilos.tarjetaLabel}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div style={estilos.accesosGrid}>
        <button
          style={estilos.accesoBtn}
          onClick={() => navegar('/admin/usuarios')}
        >
          👥 Gestionar Usuarios
        </button>
        <button
          style={estilos.accesoBtn}
          onClick={() => navegar('/admin/areas')}
        >
          🏭 Gestionar Áreas y Máquinas
        </button>
      </div>

      {/* Filtros */}
      <div style={estilos.filtros}>
        <span style={estilos.filtroLabel}>Filtrar por estado:</span>
        {['Todos','Borrador','Pendiente','Aprobada',
          'Rechazada','Completada','Cancelada'].map(estado => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            style={{
              ...estilos.filtroBtnBase,
              backgroundColor: filtroEstado === estado ? '#1B3A5C' : '#E2E8F0',
              color:           filtroEstado === estado ? '#fff'    : '#4A5568',
            }}
          >
            {estado}
          </button>
        ))}
      </div>

      {/* Tabla de autorizaciones */}
      <div style={estilos.tablaContenedor}>
        <table style={estilos.tabla}>
          <thead>
            <tr style={estilos.encabezadoTabla}>
              <th style={estilos.th}>Código</th>
              <th style={estilos.th}>Fecha</th>
              <th style={estilos.th}>Área</th>
              <th style={estilos.th}>Aprobador</th>
              <th style={estilos.th}>Técnico</th>
              <th style={estilos.th}>Estado</th>
              <th style={estilos.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {autorizacionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} style={estilos.sinDatos}>
                  No hay autorizaciones registradas
                </td>
              </tr>
            ) : (
              autorizacionesFiltradas.map(a => (
                <tr key={a.id} style={estilos.fila}>
                  <td style={estilos.td}>{a.codigo}</td>
                  <td style={estilos.td}>{a.fecha}</td>
                  <td style={estilos.td}>{a.area}</td>
                  <td style={estilos.td}>{a.aprobador}</td>
                  <td style={estilos.td}>{a.tecnico}</td>
                  <td style={estilos.td}>
                    <span style={{
                      ...estilos.badge,
                      backgroundColor: estadosColores[a.estado]?.bg,
                      color:           estadosColores[a.estado]?.color,
                    }}>
                      {a.estado}
                    </span>
                  </td>
                  <td style={estilos.td}>
                    <button
                      style={estilos.btnVer}
                      onClick={() => navegar(`/admin/autorizacion/${a.id}`)}
                    >
                      Ver detalle
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
  cargando:         { textAlign: 'center', padding: '40px', color: '#6B7280' },
  encabezado:       { marginBottom: '24px' },
  titulo:           { fontSize: '26px', fontWeight: 'bold', color: '#1B3A5C', margin: 0 },
  subtitulo:        { color: '#6B7280', marginTop: '4px' },
  tarjetasGrid:     { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '24px' },
  tarjeta:          { backgroundColor: '#fff', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  tarjetaNumero:    { fontSize: '32px', fontWeight: 'bold' },
  tarjetaLabel:     { fontSize: '13px', color: '#6B7280', marginTop: '4px' },
  accesosGrid:      { display: 'flex', gap: '16px', marginBottom: '24px' },
  accesoBtn:        { backgroundColor: '#1B3A5C', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  filtros:          { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  filtroLabel:      { fontSize: '14px', color: '#4A5568', fontWeight: '600' },
  filtroBtnBase:    { border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
  tablaContenedor:  { backgroundColor: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  tabla:            { width: '100%', borderCollapse: 'collapse' },
  encabezadoTabla:  { backgroundColor: '#F7FAFC' },
  th:               { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4A5568', borderBottom: '1px solid #E2E8F0' },
  fila:             { borderBottom: '1px solid #F0F4F8' },
  td:               { padding: '12px 16px', fontSize: '14px', color: '#2D3748' },
  badge:            { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  btnVer:           { backgroundColor: '#EBF8FF', color: '#2B6CB0', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
  sinDatos:         { textAlign: 'center', padding: '40px', color: '#9CA3AF' },
}