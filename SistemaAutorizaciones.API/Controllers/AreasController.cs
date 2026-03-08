using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAutorizaciones.API.Data;
using SistemaAutorizaciones.API.Models;

namespace SistemaAutorizaciones.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AreasController : ControllerBase
    {
        private readonly ApplicationDbContext _baseDatos;

        public AreasController(ApplicationDbContext baseDatos)
            => _baseDatos = baseDatos;

        // GET api/areas
        [HttpGet]
        public async Task<IActionResult> ObtenerTodas()
        {
            var areas = await _baseDatos.Areas
                .Where(a => a.Activa)
                .Select(a => new
                {
                    a.Id,
                    a.Nombre,
                    a.Descripcion
                })
                .ToListAsync();

            return Ok(areas);
        }

        // GET api/areas/{id}/maquinas
        [HttpGet("{id}/maquinas")]
        public async Task<IActionResult> ObtenerMaquinas(int id)
        {
            var maquinas = await _baseDatos.Maquinas
                .Where(m => m.AreaId == id && m.Activa)
                .Select(m => new
                {
                    m.Id,
                    m.Nombre,
                    m.Descripcion
                })
                .ToListAsync();

            return Ok(maquinas);
        }

        // POST api/areas
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> CrearArea([FromBody] SolicitudArea solicitud)
        {
            var nuevaArea = new Area
            {
                Nombre = solicitud.Nombre,
                Descripcion = solicitud.Descripcion,
                Activa = true
            };

            _baseDatos.Areas.Add(nuevaArea);
            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Área creada correctamente.", id = nuevaArea.Id });
        }

        // POST api/areas/{id}/maquinas
        [HttpPost("{id}/maquinas")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> CrearMaquina(int id,
            [FromBody] SolicitudMaquina solicitud)
        {
            var areaExiste = await _baseDatos.Areas.AnyAsync(a => a.Id == id);
            if (!areaExiste)
                return NotFound(new { mensaje = "Área no encontrada." });

            var nuevaMaquina = new Maquina
            {
                Nombre = solicitud.Nombre,
                Descripcion = solicitud.Descripcion,
                AreaId = id,
                Activa = true
            };

            _baseDatos.Maquinas.Add(nuevaMaquina);
            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Máquina creada correctamente.", id = nuevaMaquina.Id });
        }
    }

    public class SolicitudArea
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
    }

    public class SolicitudMaquina
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
    }
}