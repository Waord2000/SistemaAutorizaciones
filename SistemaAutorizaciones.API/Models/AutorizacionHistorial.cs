namespace SistemaAutorizaciones.API.Models
{
    public class AutorizacionHistorial
    {
        public int Id { get; set; }
        public int AutorizacionId { get; set; }
        public int UsuarioId { get; set; }
        public EstadoAutorizacion? EstadoAnterior { get; set; }
        public EstadoAutorizacion EstadoNuevo { get; set; }
        public string? Comentario { get; set; }
        public DateTime FechaAccion { get; set; } = DateTime.Now;

        public Autorizacion Autorizacion { get; set; } = null!;
        public Usuario Usuario { get; set; } = null!;
    }
}
