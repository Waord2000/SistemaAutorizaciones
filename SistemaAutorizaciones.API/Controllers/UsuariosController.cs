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
    public class UsuariosController : ControllerBase
    {
        private readonly ApplicationDbContext _baseDatos;

        public UsuariosController(ApplicationDbContext baseDatos)
            => _baseDatos = baseDatos;

        // GET api/usuarios
        [HttpGet]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> ObtenerTodos()
        {
            var usuarios = await _baseDatos.Usuarios
                .Select(u => new
                {
                    u.Id,
                    u.Nombre,
                    u.Apellido,
                    u.Correo,
                    Rol = u.Rol.ToString(),
                    u.Cargo,
                    NivelTecnico = u.NivelTecnico.ToString(),
                    u.Activo,
                    u.UltimoAcceso,
                    u.CreadoEn
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        // GET api/usuarios/tecnicos
        [HttpGet("tecnicos")]
        [Authorize(Roles = "Administrador,Aprobador")]
        public async Task<IActionResult> ObtenerTecnicos()
        {
            var tecnicos = await _baseDatos.Usuarios
                .Where(u => u.Rol == RolUsuario.Tecnico && u.Activo)
                .Select(u => new
                {
                    u.Id,
                    u.Nombre,
                    u.Apellido,
                    NivelTecnico = u.NivelTecnico.ToString()
                })
                .ToListAsync();

            return Ok(tecnicos);
        }

        // GET api/usuarios/aprobadores
        [HttpGet("aprobadores")]
        [Authorize(Roles = "Administrador,Aprobador")]
        public async Task<IActionResult> ObtenerAprobadores()
        {
            var aprobadores = await _baseDatos.Usuarios
                .Where(u => u.Rol == RolUsuario.Aprobador && u.Activo)
                .Select(u => new
                {
                    u.Id,
                    u.Nombre,
                    u.Apellido,
                    u.Cargo
                })
                .ToListAsync();

            return Ok(aprobadores);
        }

        // POST api/usuarios
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Crear(
            [FromBody] SolicitudUsuario solicitud)
        {
            bool correoExiste = await _baseDatos.Usuarios
                .AnyAsync(u => u.Correo == solicitud.Correo);

            if (correoExiste)
                return BadRequest(new
                {
                    mensaje = "El correo ya está registrado."
                });

            var nuevoUsuario = new Usuario
            {
                Nombre = solicitud.Nombre,
                Apellido = solicitud.Apellido,
                Correo = solicitud.Correo,
                PasswordHash = BCrypt.Net.BCrypt
                               .HashPassword(solicitud.Contrasena),
                Rol = Enum.Parse<RolUsuario>(solicitud.Rol),
                Cargo = solicitud.Cargo,
                NivelTecnico = string.IsNullOrEmpty(solicitud.NivelTecnico)
                                   ? null
                                   : Enum.Parse<NivelTecnico>(
                                       solicitud.NivelTecnico),
                Activo = true
            };

            _baseDatos.Usuarios.Add(nuevoUsuario);
            await _baseDatos.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Usuario creado correctamente.",
                id = nuevoUsuario.Id
            });
        }

        // PUT api/usuarios/{id}/estado ← solo una versión
        [HttpPut("{id}/estado")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> CambiarEstado(int id,
            [FromBody] CambiarEstadoRequest solicitud)
        {
            var usuario = await _baseDatos.Usuarios.FindAsync(id);
            if (usuario == null)
                return NotFound(new { mensaje = "Usuario no encontrado." });

            usuario.Activo = solicitud.Activo;
            usuario.ActualizadoEn = DateTime.Now;
            await _baseDatos.SaveChangesAsync();

            return Ok(new
            {
                mensaje = solicitud.Activo
                    ? "Usuario activado."
                    : "Usuario desactivado."
            });
        }

        // PUT api/usuarios/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Editar(int id,
            [FromBody] SolicitudEditarUsuario solicitud)
        {
            var usuario = await _baseDatos.Usuarios.FindAsync(id);
            if (usuario == null)
                return NotFound(new { mensaje = "Usuario no encontrado." });

            usuario.Nombre = solicitud.Nombre;
            usuario.Apellido = solicitud.Apellido;
            usuario.Cargo = solicitud.Cargo;
            usuario.NivelTecnico = string.IsNullOrEmpty(solicitud.NivelTecnico)
                                        ? null
                                        : Enum.Parse<NivelTecnico>(
                                            solicitud.NivelTecnico);
            usuario.ActualizadoEn = DateTime.Now;

            if (!string.IsNullOrEmpty(solicitud.NuevaContrasena))
                usuario.PasswordHash = BCrypt.Net.BCrypt
                                       .HashPassword(solicitud.NuevaContrasena);

            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Usuario actualizado correctamente." });
        }

        // DELETE api/usuarios/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var usuario = await _baseDatos.Usuarios.FindAsync(id);
            if (usuario == null)
                return NotFound(new { mensaje = "Usuario no encontrado." });

            bool tieneAutorizaciones = await _baseDatos.Autorizaciones
                .AnyAsync(a =>
                    (a.AprobadorId == id || a.TecnicoId == id)
                    && a.Estado != EstadoAutorizacion.Completada
                    && a.Estado != EstadoAutorizacion.Cancelada);

            if (tieneAutorizaciones)
                return BadRequest(new
                {
                    mensaje = "No se puede eliminar el usuario porque " +
                              "tiene autorizaciones activas."
                });

            _baseDatos.Usuarios.Remove(usuario);
            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Usuario eliminado correctamente." });
        }

    } 

    public class SolicitudUsuario
    {
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
        public string? Cargo { get; set; }
        public string? NivelTecnico { get; set; }
    }

    public class CambiarEstadoRequest
    {
        public bool Activo { get; set; }
    }

    public class SolicitudEditarUsuario
    {
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string? Cargo { get; set; }
        public string? NivelTecnico { get; set; }
        public string? NuevaContrasena { get; set; }
    }

} 