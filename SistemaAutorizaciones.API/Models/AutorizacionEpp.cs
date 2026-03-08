namespace SistemaAutorizaciones.API.Models
{
    public enum TipoEpp
    {
        Casco,
        Lentes,
        Guantes,
        Botas,
        ProteccionAuditiva,
        ProteccionRespiratoria,
        MangaSoldar,
        ArnesLineaVida,
        CaretaSoldar,
        CalzadoIndustrial,
        GuantesCuero,
        GuantesAltaTemp,
        CinturonLumbar,
        Otro
    }

    public class AutorizacionEpp
    {
        public int Id { get; set; }
        public int AutorizacionId { get; set; }
        public TipoEpp EppTipo { get; set; }

        public Autorizacion Autorizacion { get; set; } = null!;
    }
}