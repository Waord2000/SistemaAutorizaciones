namespace SistemaAutorizaciones.API.Models
{
    public enum TipoTarea
    {
        Mecanica,
        Electricidad,
        Soldadura,
        Lubricacion,
        EquiposCriticos,
        Otros
    }

    public class AutorizacionTipoTarea
    {
        public int Id { get; set; }
        public int AutorizacionId { get; set; }
        public TipoTarea Tipo { get; set; }

        public Autorizacion Autorizacion { get; set; } = null!;
    }
}