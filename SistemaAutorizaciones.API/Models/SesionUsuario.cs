namespace SistemaAutorizaciones.API.Models
{
    public class SesionUsuario
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string TokenHash { get; set; } = string.Empty;
        public string? IpAcceso { get; set; }
        public DateTime ExpiraEn { get; set; }
        public bool Activa { get; set; } = true;
        public DateTime CreadoEn { get; set; } = DateTime.Now;

        public Usuario Usuario { get; set; } = null!;
    }
}