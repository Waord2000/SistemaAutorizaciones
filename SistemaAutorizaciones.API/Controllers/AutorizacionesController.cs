using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SistemaAutorizaciones.API.Data;
using SistemaAutorizaciones.API.Models;
using System.Security.Claims;

namespace SistemaAutorizaciones.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AutorizacionesController : ControllerBase
    {
        private readonly ApplicationDbContext _baseDatos;

        public AutorizacionesController(ApplicationDbContext baseDatos)
            => _baseDatos = baseDatos;

        // ── GET api/autorizaciones ────────────────────────────
        // Administrador ve todas, Aprobador ve las suyas,
        // Técnico ve las asignadas a él
        [HttpGet]
        public async Task<IActionResult> ObtenerTodas()
        {
            var idUsuario = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var rol = User.FindFirstValue(ClaimTypes.Role)!;

            var consulta = _baseDatos.Autorizaciones
                .Include(a => a.Area)
                .Include(a => a.Maquina)
                .Include(a => a.Aprobador)
                .Include(a => a.Tecnico)
                .AsQueryable();

            // Filtrar según rol
            if (rol == "Aprobador")
                consulta = consulta.Where(a => a.AprobadorId == idUsuario);
            else if (rol == "Tecnico")
                consulta = consulta.Where(a => a.TecnicoId == idUsuario);

            var resultado = await consulta
                .OrderByDescending(a => a.CreadoEn)
                .Select(a => new
                {
                    a.Id,
                    a.Codigo,
                    a.Fecha,
                    a.HoraInicio,
                    a.HoraFin,
                    Area = a.Area.Nombre,
                    Maquina = a.Maquina != null ? a.Maquina.Nombre : null,
                    Aprobador = $"{a.Aprobador.Nombre} {a.Aprobador.Apellido}",
                    Tecnico = $"{a.Tecnico.Nombre} {a.Tecnico.Apellido}",
                    Estado = a.Estado.ToString(),
                    a.AprobadorAcepto,
                    a.TecnicoAcepto,
                    a.CreadoEn
                })
                .ToListAsync();

            return Ok(resultado);
        }

        // ── GET api/autorizaciones/{id} ───────────────────────
        // Detalle completo del formulario FO-MA-19
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var autorizacion = await _baseDatos.Autorizaciones
                .Include(a => a.Area)
                .Include(a => a.Maquina)
                .Include(a => a.Aprobador)
                .Include(a => a.Tecnico)
                .Include(a => a.TiposTarea)
                .Include(a => a.Epps)
                .Include(a => a.PersonalApoyo)
                .Include(a => a.AnalisisRiesgos)
                .Include(a => a.Historial)
                    .ThenInclude(h => h.Usuario)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (autorizacion == null)
                return NotFound(new { mensaje = "Autorización no encontrada." });

            return Ok(new
            {
                autorizacion.Id,
                autorizacion.Codigo,

                // Sección 1
                Fecha = autorizacion.Fecha.ToString("yyyy-MM-dd"),
                HoraInicio = autorizacion.HoraInicio.ToString("HH:mm"),
                HoraFin = autorizacion.HoraFin.ToString("HH:mm"),
                Area = new { autorizacion.Area.Id, autorizacion.Area.Nombre },
                Maquina = autorizacion.Maquina != null
                             ? new { autorizacion.Maquina.Id, autorizacion.Maquina.Nombre }
                             : null,

                // Sección 2
                TiposTarea = autorizacion.TiposTarea
                             .Select(t => t.Tipo.ToString()),

                // Sección 3
                Aprobador = new
                {
                    autorizacion.Aprobador.Id,
                    autorizacion.Aprobador.Nombre,
                    autorizacion.Aprobador.Apellido,
                    autorizacion.Aprobador.Cargo
                },
                Tecnico = new
                {
                    autorizacion.Tecnico.Id,
                    autorizacion.Tecnico.Nombre,
                    autorizacion.Tecnico.Apellido,
                    NivelTecnico = autorizacion.Tecnico.NivelTecnico.ToString()
                },
                NivelTecnico = autorizacion.NivelTecnico?.ToString(),
                autorizacion.RequiereApoyo,
                PersonalApoyo = autorizacion.PersonalApoyo
                                 .Select(p => new { p.Id, p.NombreCompleto }),

                // Sección 4
                Epps = autorizacion.Epps.Select(e => e.EppTipo.ToString()),
                autorizacion.EppOtros,

                // Sección 5
                AnalisisRiesgos = autorizacion.AnalisisRiesgos
                                  .OrderBy(r => r.Orden)
                                  .Select(r => new
                                  {
                                      r.Id,
                                      r.RiesgoIdentificado,
                                      r.MedidasControl,
                                      NivelRiesgo = r.NivelRiesgo.ToString(),
                                      r.Orden
                                  }),
                autorizacion.EvaluadorNombre,
                autorizacion.EvaluadorPuesto,

                // Sección 6
                autorizacion.Observaciones,
                autorizacion.DescripcionTarea,
                autorizacion.MotivoRechazo,
                autorizacion.FechaAutorizacion,

                // Firmas digitales
                autorizacion.AprobadorAcepto,
                autorizacion.AprobadorAceptoEn,
                autorizacion.TecnicoAcepto,
                autorizacion.TecnicoAceptoEn,

                // Estado
                Estado = autorizacion.Estado.ToString(),
                autorizacion.CreadoEn,
                autorizacion.ActualizadoEn,

                // Historial
                Historial = autorizacion.Historial
                            .OrderByDescending(h => h.FechaAccion)
                            .Select(h => new
                            {
                                h.Id,
                                EstadoAnterior = h.EstadoAnterior.ToString(),
                                EstadoNuevo = h.EstadoNuevo.ToString(),
                                h.Comentario,
                                h.FechaAccion,
                                Usuario = $"{h.Usuario.Nombre} {h.Usuario.Apellido}"
                            })
            });
        }

        // ── POST api/autorizaciones ───────────────────────────
        // Aprobador crea el formulario completo
        [HttpPost]
        [Authorize(Roles = "Aprobador")]
        public async Task<IActionResult> Crear(
            [FromBody] SolicitudAutorizacion solicitud)
        {
            var idAprobador = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Generar código correlativo AT-2026-XXXX
            var totalHoy = await _baseDatos.Autorizaciones.CountAsync();
            var codigo = $"AT-{DateTime.Now.Year}-{(totalHoy + 1):D4}";

            var nuevaAutorizacion = new Autorizacion
            {
                Codigo = codigo,
                Fecha = DateOnly.Parse(solicitud.Fecha),
                HoraInicio = TimeOnly.Parse(solicitud.HoraInicio),
                HoraFin = TimeOnly.Parse(solicitud.HoraFin),
                AreaId = solicitud.AreaId,
                MaquinaId = solicitud.MaquinaId,
                AprobadorId = idAprobador,
                TecnicoId = solicitud.TecnicoId,
                NivelTecnico = string.IsNullOrEmpty(solicitud.NivelTecnico)
                                       ? null
                                       : Enum.Parse<NivelTecnico>(solicitud.NivelTecnico),
                RequiereApoyo = solicitud.RequiereApoyo,
                DescripcionTarea = solicitud.DescripcionTarea,
                EvaluadorNombre = solicitud.EvaluadorNombre,
                EvaluadorPuesto = solicitud.EvaluadorPuesto,
                EppOtros = solicitud.EppOtros,
                Observaciones = solicitud.Observaciones,
                Estado = EstadoAutorizacion.Borrador
            };

            _baseDatos.Autorizaciones.Add(nuevaAutorizacion);
            await _baseDatos.SaveChangesAsync();

            // Tipos de tarea
            if (solicitud.TiposTarea?.Any() == true)
            {
                var tipos = solicitud.TiposTarea.Select(t => new AutorizacionTipoTarea
                {
                    AutorizacionId = nuevaAutorizacion.Id,
                    Tipo = Enum.Parse<TipoTarea>(t)
                });
                _baseDatos.AutorizacionTiposTarea.AddRange(tipos);
            }

            // EPP
            if (solicitud.Epps?.Any() == true)
            {
                var epps = solicitud.Epps.Select(e => new AutorizacionEpp
                {
                    AutorizacionId = nuevaAutorizacion.Id,
                    EppTipo = Enum.Parse<TipoEpp>(e)
                });
                _baseDatos.AutorizacionEpps.AddRange(epps);
            }

            // Personal de apoyo
            if (solicitud.PersonalApoyo?.Any() == true)
            {
                var personal = solicitud.PersonalApoyo.Select(p =>
                    new AutorizacionPersonalApoyo
                    {
                        AutorizacionId = nuevaAutorizacion.Id,
                        NombreCompleto = p
                    });
                _baseDatos.AutorizacionPersonalApoyo.AddRange(personal);
            }

            // Análisis de riesgos
            if (solicitud.AnalisisRiesgos?.Any() == true)
            {
                var riesgos = solicitud.AnalisisRiesgos
                    .Select((r, indice) => new AnalisisRiesgo
                    {
                        AutorizacionId = nuevaAutorizacion.Id,
                        RiesgoIdentificado = r.RiesgoIdentificado,
                        MedidasControl = r.MedidasControl,
                        NivelRiesgo = Enum.Parse<NivelRiesgo>(r.NivelRiesgo),
                        Orden = indice + 1
                    });
                _baseDatos.AnalisisRiesgos.AddRange(riesgos);
            }

            // Historial
            _baseDatos.AutorizacionHistorial.Add(new AutorizacionHistorial
            {
                AutorizacionId = nuevaAutorizacion.Id,
                UsuarioId = idAprobador,
                EstadoAnterior = null,
                EstadoNuevo = EstadoAutorizacion.Borrador,
                Comentario = "Formulario creado."
            });

            await _baseDatos.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Autorización creada correctamente.",
                id = nuevaAutorizacion.Id,
                codigo
            });
        }

        // ── PUT api/autorizaciones/{id}/firmar-aprobador ──────
        // Aprobador acepta y envía al técnico → Pendiente
        [HttpPut("{id}/firmar-aprobador")]
        [Authorize(Roles = "Aprobador")]
        public async Task<IActionResult> FirmarAprobador(int id)
        {
            var idAprobador = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var autorizacion = await _baseDatos.Autorizaciones
                .FirstOrDefaultAsync(a => a.Id == id
                                       && a.AprobadorId == idAprobador
                                       && a.Estado == EstadoAutorizacion.Borrador);

            if (autorizacion == null)
                return NotFound(new
                {
                    mensaje = "Autorización no encontrada o no está en estado Borrador."
                });

            autorizacion.AprobadorAcepto = true;
            autorizacion.AprobadorAceptoEn = DateTime.Now;
            autorizacion.FechaAutorizacion = DateTime.Now;
            autorizacion.Estado = EstadoAutorizacion.Pendiente;
            autorizacion.ActualizadoEn = DateTime.Now;

            // Historial
            _baseDatos.AutorizacionHistorial.Add(new AutorizacionHistorial
            {
                AutorizacionId = id,
                UsuarioId = idAprobador,
                EstadoAnterior = EstadoAutorizacion.Borrador,
                EstadoNuevo = EstadoAutorizacion.Pendiente,
                Comentario = "Aprobador firmó y envió al técnico."
            });

            // Notificación al técnico
            _baseDatos.Notificaciones.Add(new Notificacion
            {
                UsuarioId = autorizacion.TecnicoId,
                AutorizacionId = id,
                Titulo = "Nueva tarea asignada",
                Mensaje = $"Tienes una nueva autorización de trabajo ({autorizacion.Codigo}) asignada. Por favor revísala y acepta."
            });

            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Formulario firmado y enviado al técnico." });
        }

        // ── PUT api/autorizaciones/{id}/firmar-tecnico ────────
        // Técnico acepta haber leído → Aprobada
        [HttpPut("{id}/firmar-tecnico")]
        [Authorize(Roles = "Tecnico")]
        public async Task<IActionResult> FirmarTecnico(int id)
        {
            var idTecnico = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var autorizacion = await _baseDatos.Autorizaciones
                .FirstOrDefaultAsync(a => a.Id == id
                                       && a.TecnicoId == idTecnico
                                       && a.Estado == EstadoAutorizacion.Pendiente);

            if (autorizacion == null)
                return NotFound(new
                {
                    mensaje = "Autorización no encontrada o no está pendiente de tu confirmación."
                });

            autorizacion.TecnicoAcepto = true;
            autorizacion.TecnicoAceptoEn = DateTime.Now;
            autorizacion.Estado = EstadoAutorizacion.Aprobada;
            autorizacion.ActualizadoEn = DateTime.Now;

            // Historial
            _baseDatos.AutorizacionHistorial.Add(new AutorizacionHistorial
            {
                AutorizacionId = id,
                UsuarioId = idTecnico,
                EstadoAnterior = EstadoAutorizacion.Pendiente,
                EstadoNuevo = EstadoAutorizacion.Aprobada,
                Comentario = "Técnico confirmó haber leído la autorización."
            });

            // Notificación al aprobador
            _baseDatos.Notificaciones.Add(new Notificacion
            {
                UsuarioId = autorizacion.AprobadorId,
                AutorizacionId = id,
                Titulo = "Autorización confirmada por técnico",
                Mensaje = $"El técnico confirmó la autorización ({autorizacion.Codigo})."
            });

            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Autorización confirmada. Estado: Aprobada." });
        }

        // ── PUT api/autorizaciones/{id}/cancelar ──────────────
        [HttpPut("{id}/cancelar")]
        [Authorize(Roles = "Administrador,Aprobador")]
        public async Task<IActionResult> Cancelar(int id,
            [FromBody] string motivo)
        {
            var idUsuario = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var autorizacion = await _baseDatos.Autorizaciones
                .FirstOrDefaultAsync(a => a.Id == id
                                       && a.Estado != EstadoAutorizacion.Completada
                                       && a.Estado != EstadoAutorizacion.Cancelada);

            if (autorizacion == null)
                return NotFound(new { mensaje = "Autorización no encontrada o ya finalizada." });

            var estadoAnterior = autorizacion.Estado;
            autorizacion.Estado = EstadoAutorizacion.Cancelada;
            autorizacion.ActualizadoEn = DateTime.Now;

            _baseDatos.AutorizacionHistorial.Add(new AutorizacionHistorial
            {
                AutorizacionId = id,
                UsuarioId = idUsuario,
                EstadoAnterior = estadoAnterior,
                EstadoNuevo = EstadoAutorizacion.Cancelada,
                Comentario = motivo
            });

            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Autorización cancelada." });
        }

        // ── PUT api/autorizaciones/{id}/completar ─────────────
        [HttpPut("{id}/completar")]
        [Authorize(Roles = "Administrador,Aprobador")]
        public async Task<IActionResult> Completar(int id)
        {
            var idUsuario = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var autorizacion = await _baseDatos.Autorizaciones
                .FirstOrDefaultAsync(a => a.Id == id
                                       && a.Estado == EstadoAutorizacion.Aprobada);

            if (autorizacion == null)
                return NotFound(new
                {
                    mensaje = "Autorización no encontrada o no está en estado Aprobada."
                });

            autorizacion.Estado = EstadoAutorizacion.Completada;
            autorizacion.ActualizadoEn = DateTime.Now;

            _baseDatos.AutorizacionHistorial.Add(new AutorizacionHistorial
            {
                AutorizacionId = id,
                UsuarioId = idUsuario,
                EstadoAnterior = EstadoAutorizacion.Aprobada,
                EstadoNuevo = EstadoAutorizacion.Completada,
                Comentario = "Tarea completada."
            });

            await _baseDatos.SaveChangesAsync();

            return Ok(new { mensaje = "Autorización marcada como completada." });
        }
    }

    // ── DTOs ──────────────────────────────────────────────────
    public class SolicitudAutorizacion
    {
        public string Fecha { get; set; } = string.Empty;
        public string HoraInicio { get; set; } = string.Empty;
        public string HoraFin { get; set; } = string.Empty;
        public int AreaId { get; set; }
        public int? MaquinaId { get; set; }
        public int TecnicoId { get; set; }
        public string? NivelTecnico { get; set; }
        public bool RequiereApoyo { get; set; }
        public string DescripcionTarea { get; set; } = string.Empty;
        public string? EvaluadorNombre { get; set; }
        public string? EvaluadorPuesto { get; set; }
        public string? EppOtros { get; set; }
        public string? Observaciones { get; set; }
        public List<string>? TiposTarea { get; set; }
        public List<string>? Epps { get; set; }
        public List<string>? PersonalApoyo { get; set; }
        public List<SolicitudRiesgo>? AnalisisRiesgos { get; set; }
    }

    public class SolicitudRiesgo
    {
        public string RiesgoIdentificado { get; set; } = string.Empty;
        public string MedidasControl { get; set; } = string.Empty;
        public string NivelRiesgo { get; set; } = string.Empty;
    }
}