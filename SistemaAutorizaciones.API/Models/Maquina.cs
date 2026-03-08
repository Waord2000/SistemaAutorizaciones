namespace SistemaAutorizaciones.API.Models
{
    public class Maquina
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int AreaId { get; set; }
        public bool Activa { get; set; } = true;
        public DateTime CreadoEn { get; set; } = DateTime.Now;

        public Area Area { get; set; } = null!;
        public ICollection<Autorizacion> Autorizaciones { get; set; } = new List<Autorizacion>();
    }
}