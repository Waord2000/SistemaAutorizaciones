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

        // PUT api/areas/maquinas/{id}
        [HttpPut("maquinas/{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> EditarMaquina(int id,
            [FromBody] SolicitudMaquina solicitud)
        {
            var maquina = await _baseDatos.Maquinas.FindAsync(id);
            if (maquina == null)
                return NotFound(new { mensaje = "Máquina no encontrada." });

            maquina.Nombre = solicitud.Nombre;
            maquina.Descripcion = solicitud.Descripcion;
            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Máquina actualizada correctamente." });
        }

        // DELETE api/areas/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> EliminarArea(int id)
        {
            var area = await _baseDatos.Areas.FindAsync(id);
            if (area == null)
                return NotFound(new { mensaje = "Área no encontrada." });

            // Verificar que no tenga autorizaciones activas
            bool tieneAutorizaciones = await _baseDatos.Autorizaciones
                .AnyAsync(a => a.AreaId == id
                            && a.Estado != EstadoAutorizacion.Completada
                            && a.Estado != EstadoAutorizacion.Cancelada);

            if (tieneAutorizaciones)
                return BadRequest(new
                {
                    mensaje = "No se puede eliminar el área porque " +
                              "tiene autorizaciones activas."
                });

            // Verificar que no tenga máquinas registradas
            bool tieneMaquinas = await _baseDatos.Maquinas
                .AnyAsync(m => m.AreaId == id);

            if (tieneMaquinas)
                return BadRequest(new
                {
                    mensaje = "No se puede eliminar el área porque " +
                              "tiene máquinas registradas. " +
                              "Elimina primero las máquinas."
                });

            _baseDatos.Areas.Remove(area);
            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Área eliminada correctamente." });
        }

        // DELETE api/areas/maquinas/{id}
        [HttpDelete("maquinas/{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> EliminarMaquina(int id)
        {
            var maquina = await _baseDatos.Maquinas.FindAsync(id);
            if (maquina == null)
                return NotFound(new { mensaje = "Máquina no encontrada." });

            // Verificar que no tenga autorizaciones activas
            bool tieneAutorizaciones = await _baseDatos.Autorizaciones
                .AnyAsync(a => a.MaquinaId == id
                            && a.Estado != EstadoAutorizacion.Completada
                            && a.Estado != EstadoAutorizacion.Cancelada);

            if (tieneAutorizaciones)
                return BadRequest(new
                {
                    mensaje = "No se puede eliminar la máquina porque " +
                              "tiene autorizaciones activas."
                });

            _baseDatos.Maquinas.Remove(maquina);
            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Máquina eliminada correctamente." });
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