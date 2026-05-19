using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAutorizaciones.API.Data;
using System.Security.Claims;

namespace SistemaAutorizaciones.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificacionesController : ControllerBase
    {
        private readonly ApplicationDbContext _baseDatos;

        public NotificacionesController(ApplicationDbContext baseDatos)
            => _baseDatos = baseDatos;

        // GET api/notificaciones — notificaciones del usuario actual
        [HttpGet]
        public async Task<IActionResult> ObtenerMisNotificaciones()
        {
            var idUsuario = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var notificaciones = await _baseDatos.Notificaciones
                .Where(n => n.UsuarioId == idUsuario)
                .OrderByDescending(n => n.CreadoEn)
                .Select(n => new
                {
                    n.Id,
                    n.Titulo,
                    n.Mensaje,
                    n.Leida,
                    n.CreadoEn,
                    n.AutorizacionId
                })
                .ToListAsync();

            return Ok(notificaciones);
        }

        // GET api/notificaciones/sin-leer/cantidad
        [HttpGet("sin-leer/cantidad")]
        public async Task<IActionResult> ContarSinLeer()
        {
            var idUsuario = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var cantidad = await _baseDatos.Notificaciones
                .CountAsync(n => n.UsuarioId == idUsuario && !n.Leida);

            return Ok(new { cantidad });
        }

        // PUT api/notificaciones/{id}/leer
        [HttpPut("{id}/leer")]
        public async Task<IActionResult> MarcarLeida(int id)
        {
            var idUsuario = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var notificacion = await _baseDatos.Notificaciones
                .FirstOrDefaultAsync(n => n.Id == id
                                       && n.UsuarioId == idUsuario);

            if (notificacion == null)
                return NotFound(new { mensaje = "Notificación no encontrada." });

            notificacion.Leida = true;
            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Notificación marcada como leída." });
        }

        // PUT api/notificaciones/leer-todas
        [HttpPut("leer-todas")]
        public async Task<IActionResult> MarcarTodasLeidas()
        {
            var idUsuario = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var pendientes = await _baseDatos.Notificaciones
                .Where(n => n.UsuarioId == idUsuario && !n.Leida)
                .ToListAsync();

            pendientes.ForEach(n => n.Leida = true);
            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = $"{pendientes.Count} notificaciones marcadas como leídas." });
        }
    }
}