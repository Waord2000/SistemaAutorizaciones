namespace SistemaAutorizaciones.API.Models
{
    public class AutorizacionPersonalApoyo
    {
        public int Id { get; set; }
        public int AutorizacionId { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public int? UsuarioId { get; set; }

        public Autorizacion Autorizacion { get; set; } = null!;
        public Usuario? Usuario { get; set; }
    }
}