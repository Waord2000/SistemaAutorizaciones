using SistemaAutorizaciones.API.Models;

namespace SistemaAutorizaciones.API.Models
{
    public enum EstadoAutorizacion
    {
        Borrador,
        Pendiente,
        Aprobada,
        Rechazada,
        Completada,
        Cancelada
    }

    public class Autorizacion
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;

        // Sección 1 — Información General
        public DateOnly Fecha { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFin { get; set; }
        public int AreaId { get; set; }
        public int? MaquinaId { get; set; }

        // Sección 2 — Descripción (checkboxes en AutorizacionTiposTarea)
        public string DescripcionTarea { get; set; } = string.Empty;

        // Sección 3 — Personal involucrado
        public int AprobadorId { get; set; }
        public int TecnicoId { get; set; }
        public NivelTecnico? NivelTecnico { get; set; }
        public bool RequiereApoyo { get; set; } = false;

        // Sección 4 — EPP (checkboxes en AutorizacionEpp)
        public string? EppOtros { get; set; }

        // Sección 5 — Análisis de riesgos (en AnalisisRiesgos)
        public string? EvaluadorNombre { get; set; }
        public string? EvaluadorPuesto { get; set; }

        // Sección 6 — Autorización
        public string? Observaciones { get; set; }
        public string? MotivoRechazo { get; set; }
        public DateTime? FechaAutorizacion { get; set; }

        // Firma del Aprobador — confirma creación del formulario
        public bool AprobadorAcepto { get; set; } = false;
        public DateTime? AprobadorAceptoEn { get; set; }

        // Firma del Técnico — confirma haber leído la tarea
        public bool TecnicoAcepto { get; set; } = false;
        public DateTime? TecnicoAceptoEn { get; set; }

        // Control PDF
        public bool PdfGenerado { get; set; } = false;
        public DateTime? PdfGeneradoEn { get; set; }

        // Estado del flujo
        public EstadoAutorizacion Estado { get; set; } = EstadoAutorizacion.Borrador;
        public DateTime CreadoEn { get; set; } = DateTime.Now;
        public DateTime ActualizadoEn { get; set; } = DateTime.Now;

        // Navegación
        public Area Area { get; set; } = null!;
        public Maquina? Maquina { get; set; }
        public Usuario Aprobador { get; set; } = null!;
        public Usuario Tecnico { get; set; } = null!;
        public ICollection<AutorizacionTipoTarea> TiposTarea { get; set; } = new List<AutorizacionTipoTarea>();
        public ICollection<AutorizacionEpp> Epps { get; set; } = new List<AutorizacionEpp>();
        public ICollection<AutorizacionPersonalApoyo> PersonalApoyo { get; set; } = new List<AutorizacionPersonalApoyo>();
        public ICollection<AnalisisRiesgo> AnalisisRiesgos { get; set; } = new List<AnalisisRiesgo>();
        public ICollection<AutorizacionHistorial> Historial { get; set; } = new List<AutorizacionHistorial>();
        public ICollection<Notificacion> Notificaciones { get; set; } = new List<Notificacion>();
    }
}