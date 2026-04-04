import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { autorizacionesServicio } from '../../services/api'

export default function DetalleAdmin() {
  const { id }  = useParams()
  const navegar = useNavigate()

  const [autorizacion,    setAutorizacion]    = useState(null)
  const [cargando,        setCargando]        = useState(true)
  const [procesando,      setProcesando]      = useState(false)
  const [error,           setError]           = useState('')
  const [exito,           setExito]           = useState('')
  const [motivoCancelar,  setMotivoCancelar]  = useState('')
  const [mostrarCancelar, setMostrarCancelar] = useState(false)
  const [vistaActiva,     setVistaActiva]     = useState('formulario')

  useEffect(() => { cargarAutorizacion() }, [id])

  const cargarAutorizacion = async () => {
    try {
      const respuesta = await autorizacionesServicio.obtenerPorId(id)
      setAutorizacion(respuesta.data)
    } catch (err) {
      setError('Error al cargar la autorización.')
    } finally {
      setCargando(false)
    }
  }

  const manejarCompletar = async () => {
    setProcesando(true)
    setError('')
    try {
      await autorizacionesServicio.completar(id)
      setExito('✅ Autorización marcada como completada.')
      cargarAutorizacion()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al completar.')
    } finally {
      setProcesando(false)
    }
  }

  const manejarCancelar = async () => {
    if (!motivoCancelar.trim()) {
      setError('Debe indicar el motivo de cancelación.')
      return
    }
    setProcesando(true)
    setError('')
    try {
      await autorizacionesServicio.cancelar(id, motivoCancelar)
      setExito('Autorización cancelada correctamente.')
      setMostrarCancelar(false)
      cargarAutorizacion()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cancelar.')
    } finally {
      setProcesando(false)
    }
  }

  const nivelRiesgoColor = {
    Bajo:    { bg: '#D1FAE5', color: '#065F46' },
    Medio:   { bg: '#FFFBEB', color: '#92400E' },
    Alto:    { bg: '#FEE2E2', color: '#991B1B' },
    Critico: { bg: '#4C1D95', color: '#ffffff' },
  }

  const estadoColor = {
    Borrador:   { bg: '#EFF6FF', color: '#1D4ED8' },
    Pendiente:  { bg: '#FFFBEB', color: '#D97706' },
    Aprobada:   { bg: '#ECFDF5', color: '#059669' },
    Rechazada:  { bg: '#FEF2F2', color: '#DC2626' },
    Completada: { bg: '#F0FDF4', color: '#16A34A' },
    Cancelada:  { bg: '#F9FAFB', color: '#6B7280' },
  }

  if (cargando) return (
    <div style={estilos.cargando}>Cargando autorización...</div>
  )
  if (!autorizacion) return (
    <div style={estilos.cargando}>Autorización no encontrada.</div>
  )

  const puedeCompletar = autorizacion.estado === 'Aprobada'
  const puedeCancelar  = !['Completada', 'Cancelada']
                          .includes(autorizacion.estado)

  return (
    <div>
      {/* Encabezado */}
      <div style={estilos.encabezado}>
        <div>
          <h1 style={estilos.titulo}>
            Autorización {autorizacion.codigo}
          </h1>
          <p style={estilos.subtitulo}>
            Vista completa del Administrador
          </p>
        </div>
        <button
          style={estilos.btnVolver}
          onClick={() => navegar('/admin')}
        >
          ← Volver al panel
        </button>
      </div>

      {/* Mensajes */}
      {error && <div style={estilos.error}>⚠️ {error}</div>}
      {exito && <div style={estilos.exito}>{exito}</div>}

      {/* Banner de estado */}
      <div style={estilos.estadoBanner}>
        <div style={estilos.estadoItem}>
          <span style={estilos.estadoLabel}>Estado:</span>
          <span style={{
            ...estilos.badge,
            backgroundColor: estadoColor[autorizacion.estado]?.bg,
            color:           estadoColor[autorizacion.estado]?.color,
          }}>
            {autorizacion.estado}
          </span>
        </div>
        <div style={estilos.estadoItem}>
          <span style={estilos.estadoLabel}>Aprobador:</span>
          <span style={estilos.estadoValor}>
            {autorizacion.aprobador?.nombre}{' '}
            {autorizacion.aprobador?.apellido}
          </span>
        </div>
        <div style={estilos.estadoItem}>
          <span style={estilos.estadoLabel}>Técnico:</span>
          <span style={estilos.estadoValor}>
            {autorizacion.tecnico?.nombre}{' '}
            {autorizacion.tecnico?.apellido}
          </span>
        </div>
        <div style={estilos.estadoItem}>
          <span style={estilos.estadoLabel}>
            Firma aprobador:
          </span>
          <span style={autorizacion.aprobadorAcepto
            ? estilos.firmadoSi : estilos.firmadoNo}>
            {autorizacion.aprobadorAcepto
              ? '✅ Firmado' : '⏳ Pendiente'}
          </span>
        </div>
        <div style={estilos.estadoItem}>
          <span style={estilos.estadoLabel}>
            Confirmación técnico:
          </span>
          <span style={autorizacion.tecnicoAcepto
            ? estilos.firmadoSi : estilos.firmadoNo}>
            {autorizacion.tecnicoAcepto
              ? '✅ Confirmado' : '⏳ Pendiente'}
          </span>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div style={estilos.pestanas}>
        {[
          { id: 'formulario', label: '📋 Formulario FO-MA-19' },
          { id: 'historial',  label: '📜 Historial completo' },
          { id: 'gestion',    label: '⚙️ Gestión' },
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setVistaActiva(p.id)}
            style={{
              ...estilos.pestanaBtn,
              backgroundColor: vistaActiva === p.id
                ? '#1B3A5C' : '#E2E8F0',
              color: vistaActiva === p.id ? '#fff' : '#4A5568',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Pestaña: Formulario ── */}
      {vistaActiva === 'formulario' && (
        <div>
          {/* Sección 1 */}
          <div style={estilos.seccion}>
            <h2 style={estilos.seccionTitulo}>
              1. Información General
            </h2>
            <div style={estilos.grid3}>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>Código</span>
                <span style={estilos.campoValor}>
                  {autorizacion.codigo}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>Fecha</span>
                <span style={estilos.campoValor}>
                  {autorizacion.fecha}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>Horario</span>
                <span style={estilos.campoValor}>
                  {autorizacion.horaInicio} — {autorizacion.horaFin}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>Área</span>
                <span style={estilos.campoValor}>
                  {autorizacion.area?.nombre}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>
                  Máquina / Equipo
                </span>
                <span style={estilos.campoValor}>
                  {autorizacion.maquina?.nombre || '—'}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>Creado el</span>
                <span style={estilos.campoValor}>
                  {new Date(autorizacion.creadoEn)
                    .toLocaleString('es-GT')}
                </span>
              </div>
            </div>
          </div>

          {/* Sección 2 */}
          <div style={estilos.seccion}>
            <h2 style={estilos.seccionTitulo}>
              2. Descripción de la Tarea
            </h2>
            <div style={estilos.campoLectura}>
              <span style={estilos.campoLabel}>Tipos de tarea</span>
              <div style={estilos.tagsContenedor}>
                {autorizacion.tiposTarea?.map(tipo => (
                  <span key={tipo} style={estilos.tag}>{tipo}</span>
                ))}
              </div>
            </div>
            <div style={{ ...estilos.campoLectura, marginTop: '12px' }}>
              <span style={estilos.campoLabel}>
                Descripción detallada
              </span>
              <span style={estilos.campoValorTexto}>
                {autorizacion.descripcionTarea}
              </span>
            </div>
          </div>

          {/* Sección 3 */}
          <div style={estilos.seccion}>
            <h2 style={estilos.seccionTitulo}>
              3. Personal Involucrado
            </h2>
            <div style={estilos.grid3}>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>Aprobador</span>
                <span style={estilos.campoValor}>
                  {autorizacion.aprobador?.nombre}{' '}
                  {autorizacion.aprobador?.apellido}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>
                  Cargo del aprobador
                </span>
                <span style={estilos.campoValor}>
                  {autorizacion.aprobador?.cargo || '—'}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>
                  Técnico responsable
                </span>
                <span style={estilos.campoValor}>
                  {autorizacion.tecnico?.nombre}{' '}
                  {autorizacion.tecnico?.apellido}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>Nivel técnico</span>
                <span style={estilos.campoValor}>
                  {autorizacion.nivelTecnico || '—'}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>
                  Personal de apoyo
                </span>
                <span style={estilos.campoValor}>
                  {autorizacion.requiereApoyo ? 'Sí' : 'No'}
                </span>
              </div>
            </div>
            {autorizacion.personalApoyo?.length > 0 && (
              <div style={{ ...estilos.campoLectura, marginTop: '12px' }}>
                <span style={estilos.campoLabel}>
                  Nombres de apoyo
                </span>
                <div style={estilos.tagsContenedor}>
                  {autorizacion.personalApoyo.map((p, i) => (
                    <span key={i} style={estilos.tag}>
                      👤 {p.nombreCompleto}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sección 4 */}
          <div style={estilos.seccion}>
            <h2 style={estilos.seccionTitulo}>
              4. Equipo de Protección Personal
            </h2>
            <div style={estilos.tagsContenedor}>
              {autorizacion.epps?.map(epp => (
                <span key={epp} style={estilos.tagEpp}>
                  🦺 {epp}
                </span>
              ))}
            </div>
            {autorizacion.eppOtros && (
              <div style={{ ...estilos.campoLectura, marginTop: '12px' }}>
                <span style={estilos.campoLabel}>EPP adicional</span>
                <span style={estilos.campoValor}>
                  {autorizacion.eppOtros}
                </span>
              </div>
            )}
          </div>

          {/* Sección 5 */}
          <div style={estilos.seccion}>
            <h2 style={estilos.seccionTitulo}>
              5. Análisis de Riesgos
            </h2>
            <table style={estilos.tablaRiesgos}>
              <thead>
                <tr style={estilos.tablaEncabezado}>
                  <th style={estilos.tablaTh}>#</th>
                  <th style={estilos.tablaTh}>Riesgo</th>
                  <th style={estilos.tablaTh}>Medidas de control</th>
                  <th style={estilos.tablaTh}>Nivel</th>
                </tr>
              </thead>
              <tbody>
                {autorizacion.analisisRiesgos?.map((r, i) => (
                  <tr key={r.id} style={estilos.tablaFila}>
                    <td style={estilos.tablaTd}>{i + 1}</td>
                    <td style={estilos.tablaTd}>
                      {r.riesgoIdentificado}
                    </td>
                    <td style={estilos.tablaTd}>
                      {r.medidasControl}
                    </td>
                    <td style={estilos.tablaTd}>
                      <span style={{
                        ...estilos.badge,
                        backgroundColor:
                          nivelRiesgoColor[r.nivelRiesgo]?.bg,
                        color:
                          nivelRiesgoColor[r.nivelRiesgo]?.color,
                      }}>
                        {r.nivelRiesgo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ ...estilos.grid2, marginTop: '16px' }}>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>Evaluado por</span>
                <span style={estilos.campoValor}>
                  {autorizacion.evaluadorNombre || '—'}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>Puesto</span>
                <span style={estilos.campoValor}>
                  {autorizacion.evaluadorPuesto || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Sección 6 */}
          <div style={estilos.seccion}>
            <h2 style={estilos.seccionTitulo}>6. Autorización</h2>
            {autorizacion.observaciones && (
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>Observaciones</span>
                <span style={estilos.campoValorTexto}>
                  {autorizacion.observaciones}
                </span>
              </div>
            )}
            <div style={{ ...estilos.grid2, marginTop: '12px' }}>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>
                  Aprobador firmó el
                </span>
                <span style={estilos.campoValor}>
                  {autorizacion.aprobadorAceptoEn
                    ? new Date(autorizacion.aprobadorAceptoEn)
                        .toLocaleString('es-GT')
                    : '—'}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>
                  Técnico confirmó el
                </span>
                <span style={estilos.campoValor}>
                  {autorizacion.tecnicoAceptoEn
                    ? new Date(autorizacion.tecnicoAceptoEn)
                        .toLocaleString('es-GT')
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pestaña: Historial ── */}
      {vistaActiva === 'historial' && (
        <div style={estilos.seccion}>
          <h2 style={estilos.seccionTitulo}>
            📜 Historial completo de cambios
          </h2>
          {autorizacion.historial?.length === 0 ? (
            <p style={estilos.sinDatos}>
              No hay registros en el historial.
            </p>
          ) : (
            <div style={estilos.historialContenedor}>
              {autorizacion.historial?.map((h, i) => (
                <div key={h.id} style={estilos.historialItem}>
                  {/* Línea de tiempo */}
                  <div style={estilos.timelineContenedor}>
                    <div style={{
                      ...estilos.timelineCirculo,
                      backgroundColor: i === 0 ? '#1B3A5C' : '#CBD5E0',
                    }} />
                    {i < autorizacion.historial.length - 1 && (
                      <div style={estilos.timelineLinea} />
                    )}
                  </div>
                  {/* Contenido */}
                  <div style={estilos.historialContenido}>
                    <div style={estilos.historialEncabezado}>
                      <span style={estilos.historialUsuario}>
                        👤 {h.usuario}
                      </span>
                      <span style={estilos.historialFecha}>
                        {new Date(h.fechaAccion)
                          .toLocaleString('es-GT')}
                      </span>
                    </div>
                    <p style={estilos.historialComentario}>
                      {h.comentario}
                    </p>
                    {h.estadoAnterior && (
                      <div style={estilos.historialEstados}>
                        <span style={{
                          ...estilos.badge,
                          backgroundColor:
                            estadoColor[h.estadoAnterior]?.bg,
                          color: estadoColor[h.estadoAnterior]?.color,
                        }}>
                          {h.estadoAnterior}
                        </span>
                        <span style={estilos.historialFlecha}>→</span>
                        <span style={{
                          ...estilos.badge,
                          backgroundColor:
                            estadoColor[h.estadoNuevo]?.bg,
                          color: estadoColor[h.estadoNuevo]?.color,
                        }}>
                          {h.estadoNuevo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Pestaña: Gestión ── */}
      {vistaActiva === 'gestion' && (
        <div style={estilos.seccion}>
          <h2 style={estilos.seccionTitulo}>
            ⚙️ Gestión de la Autorización
          </h2>

          {/* Resumen de métricas */}
          <div style={estilos.metricasGrid}>
            <div style={estilos.metricaTarjeta}>
              <span style={estilos.metricaIcono}>📋</span>
              <span style={estilos.metricaValor}>
                {autorizacion.tiposTarea?.length || 0}
              </span>
              <span style={estilos.metricaLabel}>Tipos de tarea</span>
            </div>
            <div style={estilos.metricaTarjeta}>
              <span style={estilos.metricaIcono}>🦺</span>
              <span style={estilos.metricaValor}>
                {autorizacion.epps?.length || 0}
              </span>
              <span style={estilos.metricaLabel}>EPP requeridos</span>
            </div>
            <div style={estilos.metricaTarjeta}>
              <span style={estilos.metricaIcono}>⚠️</span>
              <span style={estilos.metricaValor}>
                {autorizacion.analisisRiesgos?.length || 0}
              </span>
              <span style={estilos.metricaLabel}>
                Riesgos identificados
              </span>
            </div>
            <div style={estilos.metricaTarjeta}>
              <span style={estilos.metricaIcono}>📜</span>
              <span style={estilos.metricaValor}>
                {autorizacion.historial?.length || 0}
              </span>
              <span style={estilos.metricaLabel}>
                Cambios registrados
              </span>
            </div>
          </div>

          {/* Información de auditoría */}
          <div style={estilos.auditoria}>
            <h3 style={estilos.auditoriaTitulo}>
              🔍 Información de Auditoría
            </h3>
            <div style={estilos.grid2}>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>Creado el</span>
                <span style={estilos.campoValor}>
                  {new Date(autorizacion.creadoEn)
                    .toLocaleString('es-GT')}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>
                  Última actualización
                </span>
                <span style={estilos.campoValor}>
                  {new Date(autorizacion.actualizadoEn)
                    .toLocaleString('es-GT')}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>
                  Aprobador firmó
                </span>
                <span style={estilos.campoValor}>
                  {autorizacion.aprobadorAceptoEn
                    ? new Date(autorizacion.aprobadorAceptoEn)
                        .toLocaleString('es-GT')
                    : 'No firmado aún'}
                </span>
              </div>
              <div style={estilos.campoLectura}>
                <span style={estilos.campoLabel}>
                  Técnico confirmó
                </span>
                <span style={estilos.campoValor}>
                  {autorizacion.tecnicoAceptoEn
                    ? new Date(autorizacion.tecnicoAceptoEn)
                        .toLocaleString('es-GT')
                    : 'No confirmado aún'}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones del admin */}
          <div style={estilos.accionesAdmin}>
            <h3 style={estilos.accionesTitulo}>Acciones disponibles</h3>

            {puedeCompletar && (
              <div style={estilos.accionItem}>
                <div>
                  <p style={estilos.accionNombre}>
                    ✅ Marcar como completada
                  </p>
                  <p style={estilos.accionDesc}>
                    La tarea fue ejecutada y el proceso ha finalizado
                    correctamente.
                  </p>
                </div>
                <button
                  onClick={manejarCompletar}
                  disabled={procesando}
                  style={estilos.btnCompletar}
                >
                  {procesando ? 'Procesando...' : 'Completar'}
                </button>
              </div>
            )}

            {puedeCancelar && (
              <div style={estilos.accionItem}>
                <div>
                  <p style={estilos.accionNombre}>
                    ✕ Cancelar autorización
                  </p>
                  <p style={estilos.accionDesc}>
                    Cancela esta autorización. Debes indicar el motivo.
                  </p>
                </div>
                <button
                  onClick={() => setMostrarCancelar(!mostrarCancelar)}
                  style={estilos.btnCancelar}
                >
                  Cancelar
                </button>
              </div>
            )}

            {!puedeCompletar && !puedeCancelar && (
              <p style={estilos.sinAcciones}>
                Esta autorización ya está en estado final —
                no hay acciones disponibles.
              </p>
            )}
          </div>

          {/* Formulario cancelar */}
          {mostrarCancelar && (
            <div style={estilos.cancelarContenedor}>
              <h3 style={estilos.cancelarTitulo}>
                Motivo de cancelación
              </h3>
              <textarea
                value={motivoCancelar}
                onChange={e => setMotivoCancelar(e.target.value)}
                rows={3}
                placeholder="Indica el motivo de cancelación..."
                style={estilos.textarea}
              />
              <div style={estilos.cancelarBotones}>
                <button
                  onClick={() => setMostrarCancelar(false)}
                  style={estilos.btnSecundario}
                >
                  Volver
                </button>
                <button
                  onClick={manejarCancelar}
                  disabled={procesando}
                  style={estilos.btnConfirmarCancelar}
                >
                  {procesando
                    ? 'Cancelando...'
                    : 'Confirmar cancelación'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const estilos = {
  cargando:             { textAlign: 'center', padding: '40px', color: '#6B7280' },
  encabezado:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titulo:               { fontSize: '26px', fontWeight: 'bold', color: '#1B3A5C', margin: 0 },
  subtitulo:            { color: '#6B7280', marginTop: '4px' },
  btnVolver:            { backgroundColor: '#E2E8F0', color: '#4A5568', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  error:                { backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px', color: '#B91C1C', marginBottom: '16px' },
  exito:                { backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px', color: '#166534', marginBottom: '16px' },
  estadoBanner:         { backgroundColor: '#fff', borderRadius: '10px', padding: '16px 24px', marginBottom: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  estadoItem:           { display: 'flex', alignItems: 'center', gap: '8px' },
  estadoLabel:          { fontSize: '13px', fontWeight: '600', color: '#6B7280' },
  estadoValor:          { fontSize: '14px', color: '#1F2937', fontWeight: '500' },
  badge:                { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  firmadoSi:            { color: '#059669', fontWeight: '600', fontSize: '14px' },
  firmadoNo:            { color: '#D97706', fontWeight: '600', fontSize: '14px' },
  pestanas:             { display: 'flex', gap: '8px', marginBottom: '20px' },
  pestanaBtn:           { border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  seccion:              { backgroundColor: '#fff', borderRadius: '10px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  seccionTitulo:        { fontSize: '18px', fontWeight: 'bold', color: '#1B3A5C', marginTop: 0, marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid #E2E8F0' },
  grid2:                { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  grid3:                { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  campoLectura:         { display: 'flex', flexDirection: 'column', gap: '4px' },
  campoLabel:           { fontSize: '12px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' },
  campoValor:           { fontSize: '15px', color: '#1F2937', fontWeight: '500' },
  campoValorTexto:      { fontSize: '14px', color: '#374151', lineHeight: '1.6', backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' },
  tagsContenedor:       { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' },
  tag:                  { backgroundColor: '#EBF8FF', color: '#2B6CB0', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: '500' },
  tagEpp:               { backgroundColor: '#F0FDF4', color: '#065F46', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: '500' },
  tablaRiesgos:         { width: '100%', borderCollapse: 'collapse', marginTop: '8px' },
  tablaEncabezado:      { backgroundColor: '#F7FAFC' },
  tablaTh:              { padding: '10px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4A5568', borderBottom: '1px solid #E2E8F0' },
  tablaFila:            { borderBottom: '1px solid #F0F4F8' },
  tablaTd:              { padding: '10px 14px', fontSize: '14px', color: '#2D3748' },
  sinDatos:             { textAlign: 'center', color: '#9CA3AF', padding: '20px 0' },
  historialContenedor:  { display: 'flex', flexDirection: 'column', gap: '0' },
  historialItem:        { display: 'flex', gap: '16px' },
  timelineContenedor:   { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' },
  timelineCirculo:      { width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0, marginTop: '4px' },
  timelineLinea:        { width: '2px', flex: 1, backgroundColor: '#E2E8F0', margin: '4px 0' },
  historialContenido:   { flex: 1, paddingBottom: '20px' },
  historialEncabezado:  { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  historialUsuario:     { fontSize: '14px', fontWeight: '600', color: '#1B3A5C' },
  historialFecha:       { fontSize: '12px', color: '#9CA3AF' },
  historialComentario:  { fontSize: '14px', color: '#374151', margin: '4px 0' },
  historialEstados:     { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' },
  historialFlecha:      { color: '#9CA3AF', fontWeight: 'bold' },
  metricasGrid:         { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  metricaTarjeta:       { backgroundColor: '#F7FAFC', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: '1px solid #E2E8F0' },
  metricaIcono:         { fontSize: '28px' },
  metricaValor:         { fontSize: '28px', fontWeight: 'bold', color: '#1B3A5C' },
  metricaLabel:         { fontSize: '12px', color: '#6B7280', textAlign: 'center' },
  auditoria:            { backgroundColor: '#F7FAFC', borderRadius: '10px', padding: '20px', marginBottom: '24px', border: '1px solid #E2E8F0' },
  auditoriaTitulo:      { fontSize: '15px', fontWeight: '600', color: '#1B3A5C', marginTop: 0, marginBottom: '16px' },
  accionesAdmin:        { borderTop: '1px solid #E2E8F0', paddingTop: '20px' },
  accionesTitulo:       { fontSize: '15px', fontWeight: '600', color: '#1B3A5C', marginBottom: '16px' },
  accionItem:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', marginBottom: '12px', border: '1px solid #E2E8F0' },
  accionNombre:         { fontSize: '14px', fontWeight: '600', color: '#1F2937', margin: '0 0 4px 0' },
  accionDesc:           { fontSize: '13px', color: '#6B7280', margin: 0 },
  sinAcciones:          { textAlign: 'center', color: '#9CA3AF', fontSize: '14px', padding: '20px 0' },
  btnCompletar:         { backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnCancelar:          { backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  cancelarContenedor:   { backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', padding: '24px', marginTop: '16px' },
  cancelarTitulo:       { fontSize: '15px', fontWeight: '600', color: '#991B1B', marginTop: 0, marginBottom: '12px' },
  textarea:             { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FCA5A5', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' },
  cancelarBotones:      { display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' },
  btnSecundario:        { backgroundColor: '#E2E8F0', color: '#4A5568', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', cursor: 'pointer' },
  btnConfirmarCancelar: { backgroundColor: '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
}