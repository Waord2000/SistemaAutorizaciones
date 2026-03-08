namespace SistemaAutorizaciones.API.Models
{
    public class Area
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public bool Activa { get; set; } = true;
        public DateTime CreadoEn { get; set; } = DateTime.Now;

        public ICollection<Maquina> Maquinas { get; set; } = new List<Maquina>();
        public ICollection<Autorizacion> Autorizaciones { get; set; } = new List<Autorizacion>();
    }
}