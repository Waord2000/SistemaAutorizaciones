namespace SistemaAutorizaciones.API.Models
{
    public enum NivelRiesgo
    {
        Bajo,
        Medio,
        Alto,
        Critico
    }

    public class AnalisisRiesgo
    {
        public int Id { get; set; }
        public int AutorizacionId { get; set; }
        public string RiesgoIdentificado { get; set; } = string.Empty;
        public string MedidasControl { get; set; } = string.Empty;
        public NivelRiesgo NivelRiesgo { get; set; }
        public int Orden { get; set; } = 1;

        public Autorizacion Autorizacion { get; set; } = null!;
    }
}