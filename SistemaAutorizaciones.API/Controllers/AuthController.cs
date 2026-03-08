using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAutorizaciones.API.Data;
using SistemaAutorizaciones.API.Helpers;
using SistemaAutorizaciones.API.Models;

namespace SistemaAutorizaciones.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _baseDatos;
        private readonly JwtHelper _tokenJwt;

        public AuthController(ApplicationDbContext baseDatos,
                               IConfiguration configuracion)
        {
            _baseDatos = baseDatos;
            _tokenJwt = new JwtHelper(configuracion);
        }

        // ── POST api/auth/login ───────────────────────────────
        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] SolicitudLogin solicitud)
        {
            if (string.IsNullOrEmpty(solicitud.Correo) ||
                string.IsNullOrEmpty(solicitud.Contrasena))
                return BadRequest(new
                {
                    mensaje = "Correo y contraseña son requeridos."
                });

            var usuario = await _baseDatos.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == solicitud.Correo
                                       && u.Activo);

            if (usuario == null)
                return Unauthorized(new
                {
                    mensaje = "Credenciales incorrectas."
                });

            bool contrasenaValida = BCrypt.Net.BCrypt.Verify(
                                        solicitud.Contrasena,
                                        usuario.PasswordHash);
            if (!contrasenaValida)
                return Unauthorized(new
                {
                    mensaje = "Credenciales incorrectas."
                });

            // Registrar último acceso
            usuario.UltimoAcceso = DateTime.Now;
            await _baseDatos.SaveChangesAsync();

            // Generar token JWT
            var tokenGenerado = _tokenJwt.GenerarToken(
                usuario.Id,
                usuario.Correo,
                usuario.Rol.ToString(),
                $"{usuario.Nombre} {usuario.Apellido}"
            );

            return Ok(new
            {
                token = tokenGenerado,
                usuario = new
                {
                    id = usuario.Id,
                    nombre = usuario.Nombre,
                    apellido = usuario.Apellido,
                    correo = usuario.Correo,
                    rol = usuario.Rol.ToString(),
                    cargo = usuario.Cargo,
                    nivelTecnico = usuario.NivelTecnico?.ToString()
                }
            });
        }

        // ── POST api/auth/setup ───────────────────────────────
        // ⚠ Solo para crear el primer administrador
        // Deshabilitar una vez creado el primer usuario
        [HttpPost("setup")]
        public async Task<IActionResult> Configuracion(
            [FromBody] SolicitudConfiguracion solicitud)
        {
            bool existenUsuarios = await _baseDatos.Usuarios.AnyAsync();
            if (existenUsuarios)
                return BadRequest(new
                {
                    mensaje = "Ya existen usuarios. Endpoint deshabilitado."
                });

            var nuevoAdministrador = new Usuario
            {
                Nombre = solicitud.Nombre,
                Apellido = solicitud.Apellido,
                Correo = solicitud.Correo,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(solicitud.Contrasena),
                Rol = RolUsuario.Administrador,
                Cargo = "Administrador del Sistema",
                Activo = true
            };

            _baseDatos.Usuarios.Add(nuevoAdministrador);
            await _baseDatos.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Administrador creado correctamente.",
                id = nuevoAdministrador.Id
            });
        }
    }

    // ── Modelos de solicitud ──────────────────────────────────
    public class SolicitudLogin
    {
        public string Correo { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
    }

    public class SolicitudConfiguracion
    {
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Contrasena { get; set; } = string.Empty;
    }
}