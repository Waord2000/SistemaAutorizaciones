namespace SistemaAutorizaciones.API.Models
{
    public class Notificacion
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public int? AutorizacionId { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Mensaje { get; set; } = string.Empty;
        public bool Leida { get; set; } = false;
        public DateTime CreadoEn { get; set; } = DateTime.Now;

        public Usuario Usuario { get; set; } = null!;
        public Autorizacion? Autorizacion { get; set; }
    }
}