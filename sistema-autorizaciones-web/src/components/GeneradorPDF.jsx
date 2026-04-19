import { useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function GeneradorPDF({ autorizacion, onGenerado }) {
  const contenedorRef = useRef(null)

  const generarPDF = async () => {
    const elemento = contenedorRef.current
    if (!elemento) return

    try {
      const canvas = await html2canvas(elemento, {
        scale:           2,
        useCORS:         true,
        backgroundColor: '#ffffff',
        logging:         false,
      })

      const imgData  = canvas.toDataURL('image/png')
      const pdf      = new jsPDF('p', 'mm', 'letter')
      const pdfAncho = pdf.internal.pageSize.getWidth()
      const pdfAlto  = pdf.internal.pageSize.getHeight()

      const imgAncho = canvas.width
      const imgAlto  = canvas.height
      const ratio    = imgAncho / imgAlto

      const anchoFinal = pdfAncho - 20
      const altoFinal  = anchoFinal / ratio

      // Si el contenido cabe en una página
      if (altoFinal <= pdfAlto - 20) {
        pdf.addImage(imgData, 'PNG', 10, 10, anchoFinal, altoFinal)
      } else {
        // Múltiples páginas
        let posicionY    = 0
        let paginaActual = 0

        while (posicionY < imgAlto) {
          if (paginaActual > 0) pdf.addPage()

          const altoPagina = (pdfAlto - 20) * (imgAncho / anchoFinal)
          const canvasPagina = document.createElement('canvas')
          canvasPagina.width  = imgAncho
          canvasPagina.height = Math.min(altoPagina, imgAlto - posicionY)

          const ctx = canvasPagina.getContext('2d')
          ctx.drawImage(
            canvas, 0, posicionY,
            imgAncho, canvasPagina.height,
            0, 0,
            imgAncho, canvasPagina.height
          )

          const imgPagina   = canvasPagina.toDataURL('image/png')
          const altoImgReal = (canvasPagina.height * anchoFinal) / imgAncho

          pdf.addImage(imgPagina, 'PNG', 10, 10, anchoFinal, altoImgReal)

          posicionY    += altoPagina
          paginaActual += 1
        }
      }

      pdf.save(`FO-MA-19_${autorizacion.codigo}.pdf`)
      if (onGenerado) onGenerado()

    } catch (err) {
      console.error('Error al generar PDF:', err)
    }
  }

  const chequeado = (condicion) => condicion ? '☑' : '☐'

  return (
    <div>
      {/* Botón para generar */}
      <button onClick={generarPDF} style={estilos.btnPDF}>
        📄 Descargar PDF — FO-MA-19
      </button>

      {/* Contenido del formulario que se convertirá en PDF */}
      <div
        ref={contenedorRef}
        style={estilos.formularioPDF}
      >
        {/* ── Encabezado institucional ── */}
        <div style={estilos.encabezado}>
          <div style={estilos.encabezadoIzquierda}>
            <div style={estilos.logoPlaceholder}>
              🏭
            </div>
          </div>
          <div style={estilos.encabezadoCentro}>
            <p style={estilos.empresaNombre}>
              SISTEMA DE AUTORIZACIONES DE TRABAJO
            </p>
            <p style={estilos.formularioNombre}>
              FORMULARIO DE AUTORIZACIÓN DE TAREAS
            </p>
          </div>
          <div style={estilos.encabezadoDerecha}>
            <table style={estilos.tablaCodigo}>
              <tbody>
                <tr>
                  <td style={estilos.codigoLabel}>Código:</td>
                  <td style={estilos.codigoValor}>FO-MA-19</td>
                </tr>
                <tr>
                  <td style={estilos.codigoLabel}>No.:</td>
                  <td style={estilos.codigoValor}>
                    {autorizacion.codigo}
                  </td>
                </tr>
                <tr>
                  <td style={estilos.codigoLabel}>Estado:</td>
                  <td style={{
                    ...estilos.codigoValor,
                    fontWeight: 'bold',
                    color: autorizacion.estado === 'Aprobada' ||
                           autorizacion.estado === 'Completada'
                      ? '#065F46' : '#92400E'
                  }}>
                    {autorizacion.estado?.toUpperCase()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Sección 1: Información General ── */}
        <div style={estilos.seccionTitulo}>
          1. INFORMACIÓN GENERAL
        </div>
        <table style={estilos.tablaInfo}>
          <tbody>
            <tr>
              <td style={estilos.tdLabel}>Fecha:</td>
              <td style={estilos.tdValor}>{autorizacion.fecha}</td>
              <td style={estilos.tdLabel}>Área:</td>
              <td style={estilos.tdValor}>
                {autorizacion.area?.nombre}
              </td>
            </tr>
            <tr>
              <td style={estilos.tdLabel}>Máquina / Equipo:</td>
              <td style={estilos.tdValor}>
                {autorizacion.maquina?.nombre || '—'}
              </td>
              <td style={estilos.tdLabel}>Hora inicio:</td>
              <td style={estilos.tdValor}>
                {autorizacion.horaInicio}
              </td>
            </tr>
            <tr>
              <td style={estilos.tdLabel}></td>
              <td style={estilos.tdValor}></td>
              <td style={estilos.tdLabel}>Hora fin:</td>
              <td style={estilos.tdValor}>
                {autorizacion.horaFin}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Sección 2: Descripción ── */}
        <div style={estilos.seccionTitulo}>
          2. DESCRIPCIÓN DE LA TAREA
        </div>
        <div style={estilos.seccionContenido}>
          <div style={estilos.checkboxFila}>
            {[
              { valor: 'Mecanica',        label: 'Mecánica' },
              { valor: 'Electricidad',    label: 'Electricidad' },
              { valor: 'Soldadura',       label: 'Soldadura' },
              { valor: 'Lubricacion',     label: 'Lubricación' },
              { valor: 'EquiposCriticos', label: 'Equipos críticos' },
              { valor: 'Otros',           label: 'Otros' },
            ].map(tipo => (
              <span key={tipo.valor} style={estilos.checkboxItem}>
                {chequeado(autorizacion.tiposTarea?.includes(tipo.valor))}
                {' '}{tipo.label}
              </span>
            ))}
          </div>
          <div style={estilos.campoTexto}>
            <strong>Descripción:</strong>{' '}
            {autorizacion.descripcionTarea}
          </div>
        </div>

        {/* ── Sección 3: Personal ── */}
        <div style={estilos.seccionTitulo}>
          3. PERSONAL INVOLUCRADO
        </div>
        <div style={estilos.seccionContenido}>
          <table style={estilos.tablaInfo}>
            <tbody>
              <tr>
                <td style={estilos.tdLabel}>
                  Técnico responsable:
                </td>
                <td style={estilos.tdValor}>
                  {autorizacion.tecnico?.nombre}{' '}
                  {autorizacion.tecnico?.apellido}
                </td>
                <td style={estilos.tdLabel}>Nivel:</td>
                <td style={estilos.tdValor}>
                  {chequeado(autorizacion.nivelTecnico === 'A')} A{'  '}
                  {chequeado(autorizacion.nivelTecnico === 'B')} B{'  '}
                  {chequeado(autorizacion.nivelTecnico === 'C')} C
                </td>
              </tr>
              <tr>
                <td style={estilos.tdLabel}>
                  ¿Requiere personal de apoyo?
                </td>
                <td colSpan={3} style={estilos.tdValor}>
                  {chequeado(!autorizacion.requiereApoyo)} No{'  '}
                  {chequeado(autorizacion.requiereApoyo)} Sí
                  {autorizacion.requiereApoyo &&
                   autorizacion.personalApoyo?.length > 0 && (
                    <span>
                      {' — '}
                      {autorizacion.personalApoyo
                        .map(p => p.nombreCompleto)
                        .join(', ')}
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Firma del técnico */}
          <table style={{ ...estilos.tablaInfo, marginTop: '8px' }}>
            <tbody>
              <tr>
                <td style={estilos.tdLabel}>
                  Firma del técnico:
                </td>
                <td style={estilos.tdFirma}>
                  {autorizacion.tecnicoAcepto ? (
                    <span style={estilos.firmaDigital}>
                      ✅ Aceptado digitalmente el{' '}
                      {autorizacion.tecnicoAceptoEn
                        ? new Date(autorizacion.tecnicoAceptoEn)
                            .toLocaleString('es-GT')
                        : ''}
                    </span>
                  ) : (
                    <span style={estilos.firmaPendiente}>
                      ⏳ Pendiente de confirmación
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Sección 4: EPP ── */}
        <div style={estilos.seccionTitulo}>
          4. EQUIPO DE PROTECCIÓN PERSONAL (EPP) OBLIGATORIO
        </div>
        <div style={estilos.seccionContenido}>
          <div style={estilos.checkboxGrid}>
            {[
              { valor: 'Casco',                  label: 'Casco' },
              { valor: 'Lentes',                 label: 'Lentes' },
              { valor: 'Guantes',                label: 'Guantes' },
              { valor: 'Botas',                  label: 'Botas' },
              { valor: 'ProteccionAuditiva',     label: 'Protección auditiva' },
              { valor: 'ProteccionRespiratoria', label: 'Protección respiratoria' },
              { valor: 'MangaSoldar',            label: 'Manga para soldar' },
              { valor: 'ArnesLineaVida',         label: 'Arnés con línea de vida' },
              { valor: 'CaretaSoldar',           label: 'Careta para soldar' },
              { valor: 'CalzadoIndustrial',      label: 'Calzado industrial' },
              { valor: 'GuantesCuero',           label: 'Guantes de cuero' },
              { valor: 'GuantesAltaTemp',        label: 'Guantes alta temperatura' },
              { valor: 'CinturonLumbar',         label: 'Cinturón lumbar' },
              { valor: 'Otro',                   label: 'Otro' },
            ].map(epp => (
              <span key={epp.valor} style={estilos.checkboxItem}>
                {chequeado(autorizacion.epps?.includes(epp.valor))}
                {' '}{epp.label}
              </span>
            ))}
          </div>
          {autorizacion.eppOtros && (
            <div style={estilos.campoTexto}>
              <strong>Otro:</strong> {autorizacion.eppOtros}
            </div>
          )}
        </div>

        {/* ── Sección 5: Riesgos ── */}
        <div style={estilos.seccionTitulo}>
          5. ANÁLISIS DE RIESGOS DE LA TAREA
        </div>
        <div style={estilos.seccionContenido}>
          <table style={estilos.tablaRiesgos}>
            <thead>
              <tr style={estilos.tablaRiesgosEncabezado}>
                <th style={estilos.tablaRiesgosTh}>
                  Riesgo identificado
                </th>
                <th style={estilos.tablaRiesgosTh}>
                  Medidas de control
                </th>
                <th style={{
                  ...estilos.tablaRiesgosTh, width: '100px'
                }}>
                  Nivel de riesgo
                </th>
              </tr>
            </thead>
            <tbody>
              {autorizacion.analisisRiesgos?.map((r, i) => (
                <tr key={i}>
                  <td style={estilos.tablaRiesgosTd}>
                    {r.riesgoIdentificado}
                  </td>
                  <td style={estilos.tablaRiesgosTd}>
                    {r.medidasControl}
                  </td>
                  <td style={{
                    ...estilos.tablaRiesgosTd,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: r.nivelRiesgo === 'Alto' ||
                           r.nivelRiesgo === 'Critico'
                      ? '#DC2626' : '#374151'
                  }}>
                    {r.nivelRiesgo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table style={{ ...estilos.tablaInfo, marginTop: '8px' }}>
            <tbody>
              <tr>
                <td style={estilos.tdLabel}>
                  Nombre de quien evalúa:
                </td>
                <td style={estilos.tdValor}>
                  {autorizacion.evaluadorNombre}
                </td>
                <td style={estilos.tdLabel}>Puesto:</td>
                <td style={estilos.tdValor}>
                  {autorizacion.evaluadorPuesto}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Sección 6: Autorización ── */}
        <div style={estilos.seccionTitulo}>
          6. AUTORIZACIÓN
        </div>
        <div style={estilos.seccionContenido}>
          <table style={estilos.tablaInfo}>
            <tbody>
              <tr>
                <td style={estilos.tdLabel}>
                  Nombre de quien autoriza:
                </td>
                <td style={estilos.tdValor}>
                  {autorizacion.aprobador?.nombre}{' '}
                  {autorizacion.aprobador?.apellido}
                </td>
                <td style={estilos.tdLabel}>Puesto:</td>
                <td style={estilos.tdValor}>
                  {autorizacion.aprobador?.cargo}
                </td>
              </tr>
              <tr>
                <td style={estilos.tdLabel}>
                  Firma del aprobador:
                </td>
                <td colSpan={3} style={estilos.tdFirma}>
                  {autorizacion.aprobadorAcepto ? (
                    <span style={estilos.firmaDigital}>
                      ✅ Autorizado digitalmente el{' '}
                      {autorizacion.aprobadorAceptoEn
                        ? new Date(autorizacion.aprobadorAceptoEn)
                            .toLocaleString('es-GT')
                        : ''}
                    </span>
                  ) : (
                    <span style={estilos.firmaPendiente}>
                      ⏳ Pendiente de autorización
                    </span>
                  )}
                </td>
              </tr>
              {autorizacion.observaciones && (
                <tr>
                  <td style={estilos.tdLabel}>Observaciones:</td>
                  <td colSpan={3} style={estilos.tdValor}>
                    {autorizacion.observaciones}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pie del documento ── */}
        <div style={estilos.pie}>
          <div style={estilos.pieIzquierda}>
            Documento generado digitalmente el{' '}
            {new Date().toLocaleString('es-GT')}
          </div>
          <div style={estilos.pieDerecha}>
            FO-MA-19 — {autorizacion.codigo}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Estilos del PDF ───────────────────────────────────────────
const estilos = {
  btnPDF: {
    backgroundColor: '#1B3A5C',
    color:           '#fff',
    border:          'none',
    borderRadius:    '8px',
    padding:         '10px 20px',
    fontSize:        '14px',
    fontWeight:      '600',
    cursor:          'pointer',
    marginBottom:    '24px',
    display:         'flex',
    alignItems:      'center',
    gap:             '8px',
  },
  formularioPDF: {
    width:           '750px',
    backgroundColor: '#ffffff',
    fontFamily:      'Arial, sans-serif',
    fontSize:        '10px',
    color:           '#000000',
    border:          '1px solid #000',
    padding:         '10px',
  },
  // Encabezado
  encabezado: {
    display:       'flex',
    alignItems:    'center',
    borderBottom:  '2px solid #1B3A5C',
    paddingBottom: '6px',
    marginBottom:  '6px',
    gap:           '12px',
  },
  encabezadoIzquierda: {
    width: '60px',
  },
  logoPlaceholder: {
    fontSize:   '36px',
    textAlign:  'center',
  },
  encabezadoCentro: {
    flex:      1,
    textAlign: 'center',
  },
  empresaNombre: {
    fontSize:   '13px',
    fontWeight: 'bold',
    color:      '#1B3A5C',
    margin:     '0 0 4px 0',
  },
  formularioNombre: {
    fontSize:   '11px',
    color:      '#374151',
    margin:     0,
  },
  encabezadoDerecha: {
    width: '160px',
  },
  tablaCodigo: {
    width:           '100%',
    borderCollapse:  'collapse',
    border:          '1px solid #000',
  },
  codigoLabel: {
    padding:         '3px 6px',
    fontWeight:      'bold',
    fontSize:        '10px',
    border:          '1px solid #000',
    backgroundColor: '#F0F4F8',
  },
  codigoValor: {
    padding:  '3px 6px',
    fontSize: '10px',
    border:   '1px solid #000',
  },
  // Secciones
  seccionTitulo: {
    backgroundColor: '#1B3A5C',
    color:           '#ffffff',
    fontWeight:      'bold',
    fontSize:        '10px',
    padding:         '3px 8px',
    marginTop:       '5px',
    marginBottom:    '0',
  },
  seccionContenido: {
    border:        '1px solid #CBD5E0',
    borderTop:     'none',
    padding:       '4px 8px',
    marginBottom:  '0',
  },
  // Tablas
  tablaInfo: {
    width:          '100%',
    borderCollapse: 'collapse',
  },
  tdLabel: {
    fontWeight:  'bold',
    padding:     '2px 6px',
    fontSize:    '9px',
    width:       '25%',
    color:       '#374151',
    borderBottom:'1px solid #E2E8F0',
  },
  tdValor: {
    padding:     '2px 6px',
    fontSize:    '9px',
    width:       '25%',
    borderBottom:'1px solid #E2E8F0',
    borderLeft:  '1px dotted #CBD5E0',
  },
  tdFirma: {
    padding:  '6px',
    fontSize: '10px',
  },
  // Checkboxes
  checkboxFila: {
    display:        'flex',
    flexWrap:       'wrap',
    gap:            '12px',
    padding:        '4px 0',
    marginBottom:   '6px',
  },
  checkboxGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap:                 '2px',
    padding:             '2px 0',
  },
  checkboxItem: {
    fontSize: '9px',
    display:  'flex',
    alignItems: 'center',
    gap:      '2px',
  },
  campoTexto: {
    fontSize:    '10px',
    padding:     '4px 0',
    lineHeight:  '1.4',
    borderTop:   '1px solid #E2E8F0',
    marginTop:   '4px',
  },
  // Tabla riesgos
  tablaRiesgos: {
    width:          '100%',
    borderCollapse: 'collapse',
    border:         '1px solid #CBD5E0',
  },
  tablaRiesgosEncabezado: {
    backgroundColor: '#F0F4F8',
  },
  tablaRiesgosTh: {
    padding:    '3px 6px',
    fontWeight: 'bold',
    fontSize:   '9px',
    border:     '1px solid #CBD5E0',
    textAlign:  'left',
  },
  tablaRiesgosTd: {
    padding:  '3px 6px',
    fontSize: '9px',
    border:   '1px solid #CBD5E0',
  },
  // Firmas digitales
  firmaDigital: {
    color:      '#065F46',
    fontWeight: 'bold',
    fontSize:   '10px',
  },
  firmaPendiente: {
    color:    '#92400E',
    fontSize: '10px',
  },
  // Pie
  pie: {
    display:        'flex',
    justifyContent: 'space-between',
    marginTop:      '6px',
    paddingTop:     '4px',
    borderTop:      '1px solid #CBD5E0',
    fontSize:       '8px',
    color:          '#6B7280',
  },
  pieIzquierda: { textAlign: 'left' },
  pieDerecha:   { textAlign: 'right' },
}