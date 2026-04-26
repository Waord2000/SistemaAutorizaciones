import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { areasServicio, usuariosServicio, autorizacionesServicio } from '../../services/api'

export default function NuevaAutorizacion() {
  const navegar = useNavigate()

  // ── Datos para los selectores ───────────────────────────────
  const [areas,    setAreas]    = useState([])
  const [maquinas, setMaquinas] = useState([])
  const [tecnicos, setTecnicos] = useState([])

  // ── Estado del formulario ───────────────────────────────────
  const [cargando,      setCargando]      = useState(false)
  const [error,         setError]         = useState('')
  const [seccionActual, setSeccionActual] = useState(1)

  // ── Sección 1: Información General ─────────────────────────
  const [infoGeneral, setInfoGeneral] = useState({
    fecha:      new Date().toISOString().split('T')[0],
    horaInicio: '08:00',
    horaFin:    '17:00',
    areaId:     '',
    maquinaId:  '',
  })

  // ── Sección 2: Tipo de tarea (solo uno) ────────────────────
  const tiposDisponibles = [
    { valor: 'Mecanica',        etiqueta: 'Mecánica' },
    { valor: 'Electricidad',    etiqueta: 'Electricidad' },
    { valor: 'Soldadura',       etiqueta: 'Soldadura' },
    { valor: 'Lubricacion',     etiqueta: 'Lubricación' },
    { valor: 'EquiposCriticos', etiqueta: 'Equipos Críticos' },
    { valor: 'Otros',           etiqueta: 'Otros' },
  ]
  const [tipoSeleccionado,  setTipoSeleccionado]  = useState('')
  const [descripcionTarea,  setDescripcionTarea]  = useState('')

  // ── Sección 3: Personal ─────────────────────────────────────
  const [personal, setPersonal] = useState({
    tecnicoId:     '',
    nivelTecnico:  '',
    requiereApoyo: false,
  })
  const [personalApoyo,  setPersonalApoyo]  = useState([])
  const [tecnicoApoyoId, setTecnicoApoyoId] = useState('')

  // ── Sección 4: EPP ──────────────────────────────────────────
  const eppsDisponibles = [
    { valor: 'Casco',                  etiqueta: 'Casco' },
    { valor: 'Lentes',                 etiqueta: 'Lentes' },
    { valor: 'Guantes',                etiqueta: 'Guantes' },
    { valor: 'Botas',                  etiqueta: 'Botas' },
    { valor: 'ProteccionAuditiva',     etiqueta: 'Protección Auditiva' },
    { valor: 'ProteccionRespiratoria', etiqueta: 'Protección Respiratoria' },
    { valor: 'MangaSoldar',            etiqueta: 'Manga para Soldar' },
    { valor: 'ArnesLineaVida',         etiqueta: 'Arnés con Línea de Vida' },
    { valor: 'CaretaSoldar',           etiqueta: 'Careta para Soldar' },
    { valor: 'CalzadoIndustrial',      etiqueta: 'Calzado Industrial' },
    { valor: 'GuantesCuero',           etiqueta: 'Guantes de Cuero' },
    { valor: 'GuantesAltaTemp',        etiqueta: 'Guantes Alta Temperatura' },
    { valor: 'CinturonLumbar',         etiqueta: 'Cinturón Lumbar' },
    { valor: 'Otro',                   etiqueta: 'Otro' },
  ]
  const [eppsSeleccionados, setEppsSeleccionados] = useState([])
  const [eppOtros,          setEppOtros]          = useState('')

  // ── Sección 5: Análisis de Riesgos ─────────────────────────
  const [riesgos, setRiesgos] = useState([
    { riesgoIdentificado: '', medidasControl: '', nivelRiesgo: 'Medio' }
  ])
  const [evaluadorNombre, setEvaluadorNombre] = useState('')
  const [evaluadorPuesto, setEvaluadorPuesto] = useState('')

  // ── Sección 6: Autorización ─────────────────────────────────
  const [observaciones, setObservaciones] = useState('')
  const [firmaAceptada, setFirmaAceptada] = useState(false)

  // ── Cargar datos iniciales ──────────────────────────────────
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [respAreas, respTecnicos] = await Promise.all([
          areasServicio.obtenerTodas(),
          usuariosServicio.obtenerTecnicos(),
        ])
        setAreas(respAreas.data)
        setTecnicos(respTecnicos.data)
      } catch (err) {
        setError('Error al cargar datos.')
      }
    }
    cargarDatos()
  }, [])

  const cargarMaquinas = async (idArea) => {
    if (!idArea) return
    try {
      const respuesta = await areasServicio.obtenerMaquinas(idArea)
      setMaquinas(respuesta.data)
    } catch (err) {
      setMaquinas([])
    }
  }

  // ── Manejadores ─────────────────────────────────────────────
  const toggleEpp = (valor) => {
    setEppsSeleccionados(prev =>
      prev.includes(valor)
        ? prev.filter(e => e !== valor)
        : [...prev, valor]
    )
  }

  const agregarPersonalApoyo = () => {
    if (!tecnicoApoyoId) return

    const tecnico = tecnicos.find(
      t => t.id === parseInt(tecnicoApoyoId)
    )
    if (!tecnico) return

    const nombreCompleto = `${tecnico.nombre} ${tecnico.apellido}`

    if (personalApoyo.includes(nombreCompleto)) return

    if (parseInt(tecnicoApoyoId) === parseInt(personal.tecnicoId)) return

    setPersonalApoyo(prev => [...prev, nombreCompleto])
    setTecnicoApoyoId('')
  }

  const eliminarPersonalApoyo = (indice) => {
    setPersonalApoyo(prev => prev.filter((_, i) => i !== indice))
  }

  const actualizarRiesgo = (indice, campo, valor) => {
    setRiesgos(prev => prev.map((r, i) =>
      i === indice ? { ...r, [campo]: valor } : r
    ))
  }

  const agregarRiesgo = () => {
    setRiesgos(prev => [
      ...prev,
      { riesgoIdentificado: '', medidasControl: '', nivelRiesgo: 'Medio' }
    ])
  }

  const eliminarRiesgo = (indice) => {
    if (riesgos.length === 1) return
    setRiesgos(prev => prev.filter((_, i) => i !== indice))
  }

  // ── Validaciones por sección ────────────────────────────────
  const validarSeccion = (seccion) => {
    switch (seccion) {
      case 1:
        return infoGeneral.fecha &&
               infoGeneral.horaInicio &&
               infoGeneral.horaFin &&
               infoGeneral.areaId
      case 2:
        return tipoSeleccionado !== '' && descripcionTarea.trim()
      case 3:
        return personal.tecnicoId && personal.nivelTecnico
      case 4:
        return eppsSeleccionados.length > 0
      case 5:
        return riesgos.every(r =>
          r.riesgoIdentificado.trim() && r.medidasControl.trim()
        ) && evaluadorNombre.trim() && evaluadorPuesto.trim()
      case 6:
        return firmaAceptada
      default:
        return true
    }
  }

  const siguienteSeccion = () => {
    if (!validarSeccion(seccionActual)) {
      setError('Por favor completa todos los campos requeridos.')
      return
    }
    setError('')
    setSeccionActual(prev => prev + 1)
  }

  const seccionAnterior = () => {
    setError('')
    setSeccionActual(prev => prev - 1)
  }

  // ── Enviar formulario ───────────────────────────────────────
  const manejarEnviar = async () => {
    if (!firmaAceptada) {
      setError('Debe aceptar y firmar la autorización.')
      return
    }
    setCargando(true)
    setError('')

    try {
      const datos = {
        fecha:            infoGeneral.fecha,
        horaInicio:       infoGeneral.horaInicio,
        horaFin:          infoGeneral.horaFin,
        areaId:           parseInt(infoGeneral.areaId),
        maquinaId:        infoGeneral.maquinaId
                            ? parseInt(infoGeneral.maquinaId)
                            : null,
        tecnicoId:        parseInt(personal.tecnicoId),
        nivelTecnico:     personal.nivelTecnico,
        requiereApoyo:    personal.requiereApoyo,
        descripcionTarea: descripcionTarea,
        evaluadorNombre:  evaluadorNombre,
        evaluadorPuesto:  evaluadorPuesto,
        eppOtros:         eppOtros || null,
        observaciones:    observaciones || null,
        tiposTarea:       [tipoSeleccionado],
        epps:             eppsSeleccionados,
        personalApoyo:    personalApoyo,
        analisisRiesgos:  riesgos,
      }

      const respuesta = await autorizacionesServicio.crear(datos)
      const { id }    = respuesta.data

      await autorizacionesServicio.firmarAprobador(id)

      navegar('/aprobador')

    } catch (err) {
      setError(
        err.response?.data?.mensaje || 'Error al crear la autorización.'
      )
    } finally {
      setCargando(false)
    }
  }

  // ── Indicador de progreso ───────────────────────────────────
  const secciones = [
    'Info General',
    'Tipo de Tarea',
    'Personal',
    'EPP',
    'Riesgos',
    'Autorización',
  ]

  return (
    <div>
      {/* Encabezado */}
      <div style={estilos.encabezado}>
        <div>
          <h1 style={estilos.titulo}>Nueva Autorización de Trabajo</h1>
          <p style={estilos.subtitulo}>Formulario Digital FO-MA-19</p>
        </div>
        <button
          style={estilos.btnCancelar}
          onClick={() => navegar('/aprobador')}
        >
          ✕ Cancelar
        </button>
      </div>

      {/* Barra de progreso */}
      <div style={estilos.progreso}>
        {secciones.map((nombre, indice) => {
          const numero     = indice + 1
          const activa     = numero === seccionActual
          const completada = numero < seccionActual
          return (
            <div key={numero} style={estilos.pasoContenedor}>
              <div style={{
                ...estilos.pasoCiruclo,
                backgroundColor: completada ? '#059669'
                                : activa    ? '#1B3A5C'
                                :             '#E2E8F0',
                color: completada || activa ? '#fff' : '#9CA3AF',
              }}>
                {completada ? '✓' : numero}
              </div>
              <span style={{
                ...estilos.pasoNombre,
                color:      activa ? '#1B3A5C' : '#9CA3AF',
                fontWeight: activa ? '600'     : '400',
              }}>
                {nombre}
              </span>
              {indice < secciones.length - 1 && (
                <div style={{
                  ...estilos.pasoLinea,
                  backgroundColor: completada ? '#059669' : '#E2E8F0',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Contenido de la sección */}
      <div style={estilos.tarjeta}>

        {/* Error */}
        {error && <div style={estilos.error}>⚠️ {error}</div>}

        {/* ── Sección 1: Información General ── */}
        {seccionActual === 1 && (
          <div>
            <h2 style={estilos.seccionTitulo}>
              1. Información General
            </h2>
            <div style={estilos.grid2}>
              <div style={estilos.campo}>
                <label style={estilos.etiqueta}>
                  Fecha <span style={estilos.requerido}>*</span>
                </label>
                <input
                  type="date"
                  value={infoGeneral.fecha}
                  onChange={e => setInfoGeneral({
                    ...infoGeneral, fecha: e.target.value
                  })}
                  style={estilos.input}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.etiqueta}>
                  Área <span style={estilos.requerido}>*</span>
                </label>
                <select
                  value={infoGeneral.areaId}
                  onChange={e => {
                    setInfoGeneral({
                      ...infoGeneral,
                      areaId:    e.target.value,
                      maquinaId: ''
                    })
                    cargarMaquinas(e.target.value)
                  }}
                  style={estilos.input}
                >
                  <option value="">Seleccionar área</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={estilos.campo}>
                <label style={estilos.etiqueta}>Hora inicio</label>
                <input
                  type="time"
                  value={infoGeneral.horaInicio}
                  onChange={e => setInfoGeneral({
                    ...infoGeneral, horaInicio: e.target.value
                  })}
                  style={estilos.input}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.etiqueta}>Hora fin</label>
                <input
                  type="time"
                  value={infoGeneral.horaFin}
                  onChange={e => setInfoGeneral({
                    ...infoGeneral, horaFin: e.target.value
                  })}
                  style={estilos.input}
                />
              </div>

              <div style={estilos.campo}>
                <label style={estilos.etiqueta}>
                  Máquina / Equipo
                </label>
                <select
                  value={infoGeneral.maquinaId}
                  onChange={e => setInfoGeneral({
                    ...infoGeneral, maquinaId: e.target.value
                  })}
                  style={estilos.input}
                  disabled={!infoGeneral.areaId}
                >
                  <option value="">Sin máquina específica</option>
                  {maquinas.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Sección 2: Tipo de Tarea ── */}
        {seccionActual === 2 && (
          <div>
            <h2 style={estilos.seccionTitulo}>
              2. Descripción de la Tarea
            </h2>
            <p style={estilos.seccionDesc}>
              Selecciona el tipo de tarea a realizar:
            </p>
            <div style={estilos.radioGrid}>
              {tiposDisponibles.map(tipo => (
                <label
                  key={tipo.valor}
                  style={{
                    ...estilos.radioItem,
                    backgroundColor: tipoSeleccionado === tipo.valor
                      ? '#EBF8FF' : '#F9FAFB',
                    border: tipoSeleccionado === tipo.valor
                      ? '2px solid #2B6CB0' : '1px solid #E2E8F0',
                  }}
                >
                  <input
                    type="radio"
                    name="tipoTarea"
                    value={tipo.valor}
                    checked={tipoSeleccionado === tipo.valor}
                    onChange={() => setTipoSeleccionado(tipo.valor)}
                    style={{ cursor: 'pointer' }}
                  />
                  {tipo.etiqueta}
                </label>
              ))}
            </div>

            <div style={{ ...estilos.campo, marginTop: '20px' }}>
              <label style={estilos.etiqueta}>
                Descripción detallada de la tarea{' '}
                <span style={estilos.requerido}>*</span>
              </label>
              <textarea
                value={descripcionTarea}
                onChange={e => setDescripcionTarea(e.target.value)}
                rows={4}
                placeholder="Describa detalladamente la tarea a realizar..."
                style={{ ...estilos.input, resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        {/* ── Sección 3: Personal ── */}
        {seccionActual === 3 && (
          <div>
            <h2 style={estilos.seccionTitulo}>
              3. Personal Involucrado
            </h2>
            <div style={estilos.grid2}>
              <div style={estilos.campo}>
                <label style={estilos.etiqueta}>
                  Técnico responsable{' '}
                  <span style={estilos.requerido}>*</span>
                </label>
                <select
                  value={personal.tecnicoId}
                  onChange={e => setPersonal({
                    ...personal, tecnicoId: e.target.value
                  })}
                  style={estilos.input}
                >
                  <option value="">Seleccionar técnico</option>
                  {tecnicos.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} {t.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div style={estilos.campo}>
                <label style={estilos.etiqueta}>
                  Nivel técnico requerido{' '}
                  <span style={estilos.requerido}>*</span>
                </label>
                <select
                  value={personal.nivelTecnico}
                  onChange={e => setPersonal({
                    ...personal, nivelTecnico: e.target.value
                  })}
                  style={estilos.input}
                >
                  <option value="">Seleccionar nivel</option>
                  <option value="A">Nivel A</option>
                  <option value="B">Nivel B</option>
                  <option value="C">Nivel C</option>
                </select>
              </div>
            </div>

            {/* Personal de apoyo */}
            <div style={{ marginTop: '20px' }}>
              <label style={estilos.etiqueta}>
                ¿Requiere personal de apoyo?
              </label>
              <div style={estilos.radioGroup}>
                <label style={estilos.radioGroupItem}>
                  <input
                    type="radio"
                    checked={!personal.requiereApoyo}
                    onChange={() => {
                      setPersonal({ ...personal, requiereApoyo: false })
                      setPersonalApoyo([])
                    }}
                  />
                  No
                </label>
                <label style={estilos.radioGroupItem}>
                  <input
                    type="radio"
                    checked={personal.requiereApoyo}
                    onChange={() => setPersonal({
                      ...personal, requiereApoyo: true
                    })}
                  />
                  Sí
                </label>
              </div>
            </div>

            {personal.requiereApoyo && (
              <div style={{ marginTop: '16px' }}>
                <label style={estilos.etiqueta}>
                  Seleccionar técnico de apoyo
                </label>
                <div style={estilos.inputConBoton}>
                  <select
                    value={tecnicoApoyoId}
                    onChange={e => setTecnicoApoyoId(e.target.value)}
                    style={{ ...estilos.input, flex: 1 }}
                  >
                    <option value="">Seleccionar técnico...</option>
                    {tecnicos
                      .filter(t =>
                        t.id !== parseInt(personal.tecnicoId)
                      )
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nombre} {t.apellido}
                        </option>
                      ))
                    }
                  </select>
                  <button
                    type="button"
                    onClick={agregarPersonalApoyo}
                    disabled={!tecnicoApoyoId}
                    style={{
                      ...estilos.btnAgregar,
                      backgroundColor: tecnicoApoyoId
                        ? '#1B3A5C' : '#9CA3AF',
                      cursor: tecnicoApoyoId
                        ? 'pointer' : 'not-allowed',
                    }}
                  >
                    + Agregar
                  </button>
                </div>

                {/* Lista de técnicos de apoyo */}
                <div style={{ marginTop: '8px' }}>
                  {personalApoyo.map((nombre, i) => (
                    <div key={i} style={estilos.tagPersona}>
                      👤 {nombre}
                      <button
                        onClick={() => eliminarPersonalApoyo(i)}
                        style={estilos.btnEliminarTag}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Sección 4: EPP ── */}
        {seccionActual === 4 && (
          <div>
            <h2 style={estilos.seccionTitulo}>
              4. Equipo de Protección Personal (EPP)
            </h2>
            <p style={estilos.seccionDesc}>
              Selecciona el EPP obligatorio para esta tarea:
            </p>
            <div style={estilos.checkGrid}>
              {eppsDisponibles.map(epp => (
                <label key={epp.valor} style={estilos.checkItem}>
                  <input
                    type="checkbox"
                    checked={eppsSeleccionados.includes(epp.valor)}
                    onChange={() => toggleEpp(epp.valor)}
                    style={estilos.checkbox}
                  />
                  {epp.etiqueta}
                </label>
              ))}
            </div>

            {eppsSeleccionados.includes('Otro') && (
              <div style={{ ...estilos.campo, marginTop: '16px' }}>
                <label style={estilos.etiqueta}>
                  Especificar otro EPP
                </label>
                <input
                  value={eppOtros}
                  onChange={e => setEppOtros(e.target.value)}
                  placeholder="Describe el EPP adicional..."
                  style={estilos.input}
                />
              </div>
            )}
          </div>
        )}

        {/* ── Sección 5: Análisis de Riesgos ── */}
        {seccionActual === 5 && (
          <div>
            <h2 style={estilos.seccionTitulo}>
              5. Análisis de Riesgos
            </h2>

            {riesgos.map((riesgo, indice) => (
              <div key={indice} style={estilos.riesgoFila}>
                <div style={estilos.riesgoNumero}>{indice + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={estilos.grid3}>
                    <div style={estilos.campo}>
                      <label style={estilos.etiqueta}>
                        Riesgo identificado{' '}
                        <span style={estilos.requerido}>*</span>
                      </label>
                      <input
                        value={riesgo.riesgoIdentificado}
                        onChange={e => actualizarRiesgo(
                          indice, 'riesgoIdentificado', e.target.value
                        )}
                        placeholder="Describe el riesgo..."
                        style={estilos.input}
                      />
                    </div>
                    <div style={estilos.campo}>
                      <label style={estilos.etiqueta}>
                        Medidas de control{' '}
                        <span style={estilos.requerido}>*</span>
                      </label>
                      <input
                        value={riesgo.medidasControl}
                        onChange={e => actualizarRiesgo(
                          indice, 'medidasControl', e.target.value
                        )}
                        placeholder="Medidas a tomar..."
                        style={estilos.input}
                      />
                    </div>
                    <div style={estilos.campo}>
                      <label style={estilos.etiqueta}>
                        Nivel de riesgo
                      </label>
                      <select
                        value={riesgo.nivelRiesgo}
                        onChange={e => actualizarRiesgo(
                          indice, 'nivelRiesgo', e.target.value
                        )}
                        style={estilos.input}
                      >
                        <option value="Bajo">Bajo</option>
                        <option value="Medio">Medio</option>
                        <option value="Alto">Alto</option>
                        <option value="Critico">Crítico</option>
                      </select>
                    </div>
                  </div>
                </div>
                {riesgos.length > 1 && (
                  <button
                    onClick={() => eliminarRiesgo(indice)}
                    style={estilos.btnEliminarRiesgo}
                  >
                    🗑
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={agregarRiesgo}
              style={estilos.btnAgregarRiesgo}
            >
              + Agregar otro riesgo
            </button>

            <div style={{ ...estilos.grid2, marginTop: '24px' }}>
              <div style={estilos.campo}>
                <label style={estilos.etiqueta}>
                  Nombre de quien evalúa{' '}
                  <span style={estilos.requerido}>*</span>
                </label>
                <input
                  value={evaluadorNombre}
                  onChange={e => setEvaluadorNombre(e.target.value)}
                  placeholder="Nombre completo"
                  style={estilos.input}
                />
              </div>
              <div style={estilos.campo}>
                <label style={estilos.etiqueta}>
                  Puesto de quien evalúa{' '}
                  <span style={estilos.requerido}>*</span>
                </label>
                <input
                  value={evaluadorPuesto}
                  onChange={e => setEvaluadorPuesto(e.target.value)}
                  placeholder="Puesto o cargo"
                  style={estilos.input}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Sección 6: Autorización ── */}
        {seccionActual === 6 && (
          <div>
            <h2 style={estilos.seccionTitulo}>6. Autorización</h2>

            <div style={estilos.campo}>
              <label style={estilos.etiqueta}>
                Observaciones generales
              </label>
              <textarea
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                rows={3}
                placeholder="Observaciones adicionales (opcional)..."
                style={{ ...estilos.input, resize: 'vertical' }}
              />
            </div>

            {/* Resumen */}
            <div style={estilos.resumen}>
              <h3 style={estilos.resumenTitulo}>
                Resumen de la autorización
              </h3>
              <div style={estilos.resumenGrid}>
                <div style={estilos.resumenItem}>
                  <span style={estilos.resumenLabel}>Fecha:</span>
                  <span>{infoGeneral.fecha}</span>
                </div>
                <div style={estilos.resumenItem}>
                  <span style={estilos.resumenLabel}>Horario:</span>
                  <span>
                    {infoGeneral.horaInicio} - {infoGeneral.horaFin}
                  </span>
                </div>
                <div style={estilos.resumenItem}>
                  <span style={estilos.resumenLabel}>Área:</span>
                  <span>
                    {areas.find(a => a.id == infoGeneral.areaId)?.nombre}
                  </span>
                </div>
                <div style={estilos.resumenItem}>
                  <span style={estilos.resumenLabel}>Tipo de tarea:</span>
                  <span>
                    {tiposDisponibles.find(
                      t => t.valor === tipoSeleccionado
                    )?.etiqueta}
                  </span>
                </div>
                <div style={estilos.resumenItem}>
                  <span style={estilos.resumenLabel}>Técnico:</span>
                  <span>
                    {(() => {
                      const t = tecnicos.find(
                        t => t.id == personal.tecnicoId
                      )
                      return t ? `${t.nombre} ${t.apellido}` : ''
                    })()}
                  </span>
                </div>
                <div style={estilos.resumenItem}>
                  <span style={estilos.resumenLabel}>EPP requerido:</span>
                  <span>{eppsSeleccionados.length} elementos</span>
                </div>
                <div style={estilos.resumenItem}>
                  <span style={estilos.resumenLabel}>
                    Riesgos identificados:
                  </span>
                  <span>{riesgos.length}</span>
                </div>
              </div>
            </div>

            {/* Firma digital */}
            <div style={estilos.firmaContenedor}>
              <h3 style={estilos.firmaTitulo}>✍️ Firma del Aprobador</h3>
              <p style={estilos.firmaDescripcion}>
                Al marcar esta casilla, confirmo que he revisado toda la
                información del formulario FO-MA-19, que los datos son
                correctos y que autorizo la ejecución de esta tarea.
              </p>
              <label style={estilos.firmaLabel}>
                <input
                  type="checkbox"
                  checked={firmaAceptada}
                  onChange={e => setFirmaAceptada(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>
                  <strong>Acepto y firmo</strong> la presente autorización
                  de trabajo. Confirmo que la información es correcta y
                  autorizo su ejecución.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Navegación entre secciones */}
        <div style={estilos.navegacion}>
          {seccionActual > 1 && (
            <button
              onClick={seccionAnterior}
              style={estilos.btnAnterior}
            >
              ← Anterior
            </button>
          )}
          <div style={{ flex: 1 }} />
          {seccionActual < 6 ? (
            <button
              onClick={siguienteSeccion}
              style={estilos.btnSiguiente}
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={manejarEnviar}
              disabled={!firmaAceptada || cargando}
              style={!firmaAceptada || cargando
                ? estilos.btnEnviarDesactivado
                : estilos.btnEnviar
              }
            >
              {cargando
                ? 'Enviando...'
                : '✅ Firmar y Enviar al Técnico'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Estilos ───────────────────────────────────────────────────
const estilos = {
  encabezado:           { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titulo:               { fontSize: '26px', fontWeight: 'bold', color: '#1B3A5C', margin: 0 },
  subtitulo:            { color: '#6B7280', marginTop: '4px' },
  btnCancelar:          { backgroundColor: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  progreso:             { display: 'flex', alignItems: 'center', marginBottom: '24px', backgroundColor: '#fff', borderRadius: '10px', padding: '16px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  pasoContenedor:       { display: 'flex', alignItems: 'center', flex: 1 },
  pasoCiruclo:          { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 },
  pasoNombre:           { fontSize: '12px', marginLeft: '8px', whiteSpace: 'nowrap' },
  pasoLinea:            { flex: 1, height: '2px', margin: '0 8px' },
  tarjeta:              { backgroundColor: '#fff', borderRadius: '10px', padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  error:                { backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px', color: '#B91C1C', marginBottom: '16px' },
  seccionTitulo:        { fontSize: '20px', fontWeight: 'bold', color: '#1B3A5C', marginTop: 0, marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #E2E8F0' },
  seccionDesc:          { color: '#6B7280', marginBottom: '16px', fontSize: '14px' },
  grid2:                { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  grid3:                { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  campo:                { display: 'flex', flexDirection: 'column', gap: '6px' },
  etiqueta:             { fontSize: '13px', fontWeight: '600', color: '#374151' },
  requerido:            { color: '#DC2626' },
  input:                { padding: '9px 12px', borderRadius: '7px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  // Radio grid para tipo de tarea
  radioGrid:            { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' },
  radioItem:            { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' },
  // Radio group para apoyo
  radioGroup:           { display: 'flex', gap: '24px', marginTop: '8px' },
  radioGroupItem:       { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' },
  // Checkboxes EPP
  checkGrid:            { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  checkItem:            { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F9FAFB' },
  checkbox:             { width: '16px', height: '16px', cursor: 'pointer' },
  inputConBoton:        { display: 'flex', gap: '8px', marginTop: '6px' },
  btnAgregar:           { color: '#fff', border: 'none', borderRadius: '7px', padding: '9px 16px', fontSize: '14px', whiteSpace: 'nowrap' },
  tagPersona:           { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#EBF8FF', color: '#2B6CB0', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', margin: '4px 4px 0 0' },
  btnEliminarTag:       { background: 'none', border: 'none', cursor: 'pointer', color: '#2B6CB0', fontSize: '12px', padding: 0 },
  riesgoFila:           { display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E2E8F0' },
  riesgoNumero:         { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1B3A5C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', flexShrink: 0, marginTop: '24px' },
  btnEliminarRiesgo:    { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#DC2626', marginTop: '24px' },
  btnAgregarRiesgo:     { backgroundColor: '#EBF8FF', color: '#2B6CB0', border: '1px solid #BEE3F8', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', cursor: 'pointer', fontWeight: '600', marginTop: '8px' },
  resumen:              { backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '10px', padding: '20px', marginTop: '20px', marginBottom: '20px' },
  resumenTitulo:        { fontSize: '15px', fontWeight: '600', color: '#166534', marginTop: 0, marginBottom: '12px' },
  resumenGrid:          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  resumenItem:          { display: 'flex', gap: '8px', fontSize: '14px', color: '#374151' },
  resumenLabel:         { fontWeight: '600', color: '#166534' },
  firmaContenedor:      { backgroundColor: '#FFFBEB', border: '2px solid #FCD34D', borderRadius: '10px', padding: '24px', marginTop: '20px' },
  firmaTitulo:          { fontSize: '16px', fontWeight: '600', color: '#92400E', marginTop: 0, marginBottom: '8px' },
  firmaDescripcion:     { fontSize: '13px', color: '#78350F', marginBottom: '16px', lineHeight: '1.5' },
  firmaLabel:           { display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#374151', cursor: 'pointer', lineHeight: '1.5' },
  navegacion:           { display: 'flex', alignItems: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' },
  btnAnterior:          { backgroundColor: '#E2E8F0', color: '#4A5568', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnSiguiente:         { backgroundColor: '#1B3A5C', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnEnviar:            { backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  btnEnviarDesactivado: { backgroundColor: '#9CA3AF', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '15px', fontWeight: '700', cursor: 'not-allowed' },
}

