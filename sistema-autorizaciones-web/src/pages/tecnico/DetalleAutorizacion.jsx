import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { autorizacionesServicio } from '../../services/api'

export default function DetalleTecnico() {
  const { id }    = useParams()
  const navegar   = useNavigate()

  const [autorizacion, setAutorizacion] = useState(null)
  const [cargando,     setCargando]     = useState(true)
  const [firmando,     setFirmando]     = useState(false)
  const [firmaAceptada,setFirmaAceptada]= useState(false)
  const [error,        setError]        = useState('')
  const [exito,        setExito]        = useState('')

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

  const manejarFirmar = async () => {
    if (!firmaAceptada) {
      setError('Debe marcar la casilla de aceptación para confirmar.')
      return
    }
    setFirmando(true)
    setError('')
    try {
      await autorizacionesServicio.firmarTecnico(id)
      setExito('✅ Tarea confirmada correctamente. Estado: Aprobada.')
      cargarAutorizacion()
    } catch (err) {
      setError(
        err.response?.data?.mensaje || 'Error al confirmar la tarea.'
      )
    } finally {
      setFirmando(false)
    }
  }

  const nivelRiesgoColor = {
    Bajo:    { bg: '#D1FAE5', color: '#065F46' },
    Medio:   { bg: '#FFFBEB', color: '#92400E' },
    Alto:    { bg: '#FEE2E2', color: '#991B1B' },
    Critico: { bg: '#4C1D95', color: '#ffffff' },
  }

  if (cargando) return (
    <div style={estilos.cargando}>Cargando autorización...</div>
  )

  if (!autorizacion) return (
    <div style={estilos.cargando}>Autorización no encontrada.</div>
  )

  const puedeFiremar = autorizacion.estado === 'Pendiente' &&
                       !autorizacion.tecnicoAcepto

  return (
    <div>
      {/* Encabezado */}
      <div style={estilos.encabezado}>
        <div>
          <h1 style={estilos.titulo}>
            Autorización {autorizacion.codigo}
          </h1>
          <p style={estilos.subtitulo}>
            Formulario Digital FO-MA-19 — Solo lectura
          </p>
        </div>
        <button
          style={estilos.btnVolver}
          onClick={() => navegar('/tecnico')}
        >
          ← Volver
        </button>
      </div>

      {/* Mensajes */}
      {error && <div style={estilos.error}>⚠️ {error}</div>}
      {exito && <div style={estilos.exito}>{exito}</div>}

      {/* Estado actual */}
      <div style={estilos.estadoBanner}>
        <div style={estilos.estadoItem}>
          <span style={estilos.estadoLabel}>Estado:</span>
          <span style={{
            ...estilos.badge,
            backgroundColor: autorizacion.estado === 'Pendiente'
              ? '#FFFBEB' : '#ECFDF5',
            color: autorizacion.estado === 'Pendiente'
              ? '#D97706' : '#059669',
          }}>
            {autorizacion.estado}
          </span>
        </div>
        <div style={estilos.estadoItem}>
          <span style={estilos.estadoLabel}>
            Firma del aprobador:
          </span>
          <span style={autorizacion.aprobadorAcepto
            ? estilos.firmadoSi : estilos.firmadoNo}>
            {autorizacion.aprobadorAcepto ? '✅ Firmado' : '⏳ Pendiente'}
          </span>
        </div>
        <div style={estilos.estadoItem}>
          <span style={estilos.estadoLabel}>Mi confirmación:</span>
          <span style={autorizacion.tecnicoAcepto
            ? estilos.firmadoSi : estilos.firmadoNo}>
            {autorizacion.tecnicoAcepto
              ? '✅ Confirmado'
              : '⏳ Pendiente'}
          </span>
        </div>
      </div>

      {/* ── Sección 1: Información General ── */}
      <div style={estilos.seccion}>
        <h2 style={estilos.seccionTitulo}>
          1. Información General
        </h2>
        <div style={estilos.grid3}>
          <div style={estilos.campoLectura}>
            <span style={estilos.campoLabel}>Fecha</span>
            <span style={estilos.campoValor}>
              {autorizacion.fecha}
            </span>
          </div>
          <div style={estilos.campoLectura}>
            <span style={estilos.campoLabel}>Hora inicio</span>
            <span style={estilos.campoValor}>
              {autorizacion.horaInicio}
            </span>
          </div>
          <div style={estilos.campoLectura}>
            <span style={estilos.campoLabel}>Hora fin</span>
            <span style={estilos.campoValor}>
              {autorizacion.horaFin}
            </span>
          </div>
          <div style={estilos.campoLectura}>
            <span style={estilos.campoLabel}>Área</span>
            <span style={estilos.campoValor}>
              {autorizacion.area?.nombre}
            </span>
          </div>
          <div style={estilos.campoLectura}>
            <span style={estilos.campoLabel}>Máquina / Equipo</span>
            <span style={estilos.campoValor}>
              {autorizacion.maquina?.nombre || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Sección 2: Tipo de Tarea ── */}
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

      {/* ── Sección 3: Personal ── */}
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
            <span style={estilos.campoLabel}>Cargo del aprobador</span>
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
              Requiere personal de apoyo
            </span>
            <span style={estilos.campoValor}>
              {autorizacion.requiereApoyo ? 'Sí' : 'No'}
            </span>
          </div>
        </div>
        {autorizacion.personalApoyo?.length > 0 && (
          <div style={{ ...estilos.campoLectura, marginTop: '12px' }}>
            <span style={estilos.campoLabel}>Personal de apoyo</span>
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

      {/* ── Sección 4: EPP ── */}
      <div style={estilos.seccion}>
        <h2 style={estilos.seccionTitulo}>
          4. Equipo de Protección Personal (EPP)
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

      {/* ── Sección 5: Análisis de Riesgos ── */}
      <div style={estilos.seccion}>
        <h2 style={estilos.seccionTitulo}>
          5. Análisis de Riesgos
        </h2>
        <table style={estilos.tablaRiesgos}>
          <thead>
            <tr style={estilos.tablaEncabezado}>
              <th style={estilos.tablaTh}>#</th>
              <th style={estilos.tablaTh}>Riesgo identificado</th>
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
                <td style={estilos.tablaTd}>{r.medidasControl}</td>
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

      {/* ── Sección 6: Autorización ── */}
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
            <span style={estilos.campoLabel}>Fecha de autorización</span>
            <span style={estilos.campoValor}>
              {autorizacion.fechaAutorizacion
                ? new Date(autorizacion.fechaAutorizacion)
                    .toLocaleString('es-GT')
                : '—'}
            </span>
          </div>
          <div style={estilos.campoLectura}>
            <span style={estilos.campoLabel}>
              Firmado por aprobador el
            </span>
            <span style={estilos.campoValor}>
              {autorizacion.aprobadorAceptoEn
                ? new Date(autorizacion.aprobadorAceptoEn)
                    .toLocaleString('es-GT')
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Firma del técnico ── */}
      {puedeFiremar && (
        <div style={estilos.firmaContenedor}>
          <h3 style={estilos.firmaTitulo}>
            ✍️ Confirmación del Técnico
          </h3>
          <p style={estilos.firmaDescripcion}>
            He leído y comprendido toda la información contenida en
            esta autorización de trabajo. Me comprometo a seguir las
            medidas de control indicadas y a utilizar el equipo de
            protección personal requerido.
          </p>
          <label style={estilos.firmaLabel}>
            <input
              type="checkbox"
              checked={firmaAceptada}
              onChange={e => setFirmaAceptada(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>
              <strong>Acepto y confirmo</strong> haber leído esta
              autorización de trabajo. Me comprometo a cumplir con
              todas las medidas de seguridad indicadas.
            </span>
          </label>
          <button
            onClick={manejarFirmar}
            disabled={!firmaAceptada || firmando}
            style={!firmaAceptada || firmando
              ? estilos.btnFirmarDesactivado
              : estilos.btnFirmar
            }
          >
            {firmando
              ? 'Confirmando...'
              : '✅ Confirmar que he leído y acepto'}
          </button>
        </div>
      )}

      {/* Mensaje si ya firmó */}
      {autorizacion.tecnicoAcepto && (
        <div style={estilos.yaFirmado}>
          ✅ Ya confirmaste esta autorización el{' '}
          {autorizacion.tecnicoAceptoEn
            ? new Date(autorizacion.tecnicoAceptoEn)
                .toLocaleString('es-GT')
            : ''}
        </div>
      )}
    </div>
  )
}

const estilos = {
  cargando:            { textAlign: 'center', padding: '40px', color: '#6B7280' },
  encabezado:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titulo:              { fontSize: '26px', fontWeight: 'bold', color: '#1B3A5C', margin: 0 },
  subtitulo:           { color: '#6B7280', marginTop: '4px' },
  btnVolver:           { backgroundColor: '#E2E8F0', color: '#4A5568', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  error:               { backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px', color: '#B91C1C', marginBottom: '16px' },
  exito:               { backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px', color: '#166534', marginBottom: '16px' },
  estadoBanner:        { backgroundColor: '#fff', borderRadius: '10px', padding: '16px 24px', marginBottom: '20px', display: 'flex', gap: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  estadoItem:          { display: 'flex', alignItems: 'center', gap: '8px' },
  estadoLabel:         { fontSize: '13px', fontWeight: '600', color: '#6B7280' },
  badge:               { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  firmadoSi:           { color: '#059669', fontWeight: '600', fontSize: '14px' },
  firmadoNo:           { color: '#D97706', fontWeight: '600', fontSize: '14px' },
  seccion:             { backgroundColor: '#fff', borderRadius: '10px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  seccionTitulo:       { fontSize: '18px', fontWeight: 'bold', color: '#1B3A5C', marginTop: 0, marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid #E2E8F0' },
  grid2:               { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  grid3:               { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  campoLectura:        { display: 'flex', flexDirection: 'column', gap: '4px' },
  campoLabel:          { fontSize: '12px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' },
  campoValor:          { fontSize: '15px', color: '#1F2937', fontWeight: '500' },
  campoValorTexto:     { fontSize: '14px', color: '#374151', lineHeight: '1.6', backgroundColor: '#F9FAFB', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' },
  tagsContenedor:      { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' },
  tag:                 { backgroundColor: '#EBF8FF', color: '#2B6CB0', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: '500' },
  tagEpp:              { backgroundColor: '#F0FDF4', color: '#065F46', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: '500' },
  tablaRiesgos:        { width: '100%', borderCollapse: 'collapse', marginTop: '8px' },
  tablaEncabezado:     { backgroundColor: '#F7FAFC' },
  tablaTh:             { padding: '10px 14px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#4A5568', borderBottom: '1px solid #E2E8F0' },
  tablaFila:           { borderBottom: '1px solid #F0F4F8' },
  tablaTd:             { padding: '10px 14px', fontSize: '14px', color: '#2D3748' },
  firmaContenedor:     { backgroundColor: '#FFFBEB', border: '2px solid #FCD34D', borderRadius: '10px', padding: '24px', marginTop: '16px' },
  firmaTitulo:         { fontSize: '16px', fontWeight: '600', color: '#92400E', marginTop: 0, marginBottom: '8px' },
  firmaDescripcion:    { fontSize: '13px', color: '#78350F', marginBottom: '16px', lineHeight: '1.6' },
  firmaLabel:          { display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#374151', cursor: 'pointer', lineHeight: '1.5', marginBottom: '16px' },
  btnFirmar:           { backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  btnFirmarDesactivado:{ backgroundColor: '#9CA3AF', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '15px', fontWeight: '700', cursor: 'not-allowed' },
  yaFirmado:           { backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '10px', padding: '16px 24px', color: '#166534', fontSize: '15px', fontWeight: '600', marginTop: '16px', textAlign: 'center' },
}