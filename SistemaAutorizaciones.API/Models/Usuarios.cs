namespace SistemaAutorizaciones.API.Models
{
    public enum RolUsuario
    {
        Administrador,
        Aprobador,
        Tecnico
    }

    public enum NivelTecnico
    {
        A, B, C
    }

    public class Usuario
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public RolUsuario Rol { get; set; }
        public string? Cargo { get; set; }
        public NivelTecnico? NivelTecnico { get; set; }
        public bool Activo { get; set; } = true;
        public DateTime? UltimoAcceso { get; set; }
        public DateTime CreadoEn { get; set; } = DateTime.Now;
        public DateTime ActualizadoEn { get; set; } = DateTime.Now;

        public ICollection<Autorizacion> AutorizacionesElaboradas { get; set; } = new List<Autorizacion>();
        public ICollection<Autorizacion> AutorizacionesTecnico { get; set; } = new List<Autorizacion>();
        public ICollection<Notificacion> Notificaciones { get; set; } = new List<Notificacion>();
    }
}
