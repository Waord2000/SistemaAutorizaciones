using Microsoft.EntityFrameworkCore;
using SistemaAutorizaciones.API.Models;

namespace SistemaAutorizaciones.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        // ── DbSets — una propiedad por tabla ──────────────────
        public DbSet<Area> Areas { get; set; }
        public DbSet<Maquina> Maquinas { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Autorizacion> Autorizaciones { get; set; }
        public DbSet<AutorizacionTipoTarea> AutorizacionTiposTarea { get; set; }
        public DbSet<AutorizacionEpp> AutorizacionEpps { get; set; }
        public DbSet<AutorizacionPersonalApoyo> AutorizacionPersonalApoyo { get; set; }
        public DbSet<AnalisisRiesgo> AnalisisRiesgos { get; set; }
        public DbSet<AutorizacionHistorial> AutorizacionHistorial { get; set; }
        public DbSet<Notificacion> Notificaciones { get; set; }
        public DbSet<SesionUsuario> SesionesUsuario { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Areas ─────────────────────────────────────────
            modelBuilder.Entity<Area>(e =>
            {
                e.ToTable("Areas");
                e.HasKey(a => a.Id);
                e.Property(a => a.Nombre).IsRequired().HasMaxLength(100);
                e.Property(a => a.Descripcion).HasMaxLength(255);
            });

            // ── Maquinas ──────────────────────────────────────
            modelBuilder.Entity<Maquina>(e =>
            {
                e.ToTable("Maquinas");
                e.HasKey(m => m.Id);
                e.Property(m => m.Nombre).IsRequired().HasMaxLength(150);
                e.HasOne(m => m.Area)
                 .WithMany(a => a.Maquinas)
                 .HasForeignKey(m => m.AreaId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── Usuarios ──────────────────────────────────────
            modelBuilder.Entity<Usuario>(e =>
            {
                e.ToTable("Usuarios");
                e.HasKey(u => u.Id);
                e.HasIndex(u => u.Correo).IsUnique();
                e.Property(u => u.Nombre).IsRequired().HasMaxLength(100);
                e.Property(u => u.Apellido).IsRequired().HasMaxLength(100);
                e.Property(u => u.Correo).IsRequired().HasMaxLength(150);
                e.Property(u => u.PasswordHash).HasColumnName("password_hash").IsRequired().HasMaxLength(255);
                e.Property(u => u.Rol).HasConversion<string>();
                e.Property(u => u.NivelTecnico).HasColumnName("nivel_tecnico").HasConversion<string>();
                e.Property(u => u.Cargo).HasMaxLength(100);
                e.Property(u => u.Activo).HasColumnName("activo");
                e.Property(u => u.UltimoAcceso).HasColumnName("ultimo_acceso");
                e.Property(u => u.CreadoEn).HasColumnName("creado_en");
                e.Property(u => u.ActualizadoEn).HasColumnName("actualizado_en");
            });

            // ── Autorizaciones ────────────────────────────────
            modelBuilder.Entity<Autorizacion>(e =>
            {
                e.ToTable("Autorizaciones");
                e.HasKey(a => a.Id);
                e.HasIndex(a => a.Codigo).IsUnique();
                e.Property(a => a.Codigo).IsRequired().HasMaxLength(20);
                e.Property(a => a.Estado).HasConversion<string>();
                e.Property(a => a.NivelTecnico).HasConversion<string>();

                // Aprobador
                e.HasOne(a => a.Aprobador)
                 .WithMany(u => u.AutorizacionesElaboradas)
                 .HasForeignKey(a => a.AprobadorId)
                 .OnDelete(DeleteBehavior.Restrict);

                // Técnico
                e.HasOne(a => a.Tecnico)
                 .WithMany(u => u.AutorizacionesTecnico)
                 .HasForeignKey(a => a.TecnicoId)
                 .OnDelete(DeleteBehavior.Restrict);

                // Área
                e.HasOne(a => a.Area)
                 .WithMany(ar => ar.Autorizaciones)
                 .HasForeignKey(a => a.AreaId)
                 .OnDelete(DeleteBehavior.Restrict);

                // Máquina
                e.HasOne(a => a.Maquina)
                 .WithMany(m => m.Autorizaciones)
                 .HasForeignKey(a => a.MaquinaId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── AutorizacionTiposTarea ─────────────────────────
            modelBuilder.Entity<AutorizacionTipoTarea>(e =>
            {
                e.ToTable("AutorizacionTiposTarea");
                e.HasKey(t => t.Id);
                e.Property(t => t.Tipo).HasConversion<string>();
                e.HasOne(t => t.Autorizacion)
                 .WithMany(a => a.TiposTarea)
                 .HasForeignKey(t => t.AutorizacionId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ── AutorizacionEpp ───────────────────────────────
            modelBuilder.Entity<AutorizacionEpp>(e =>
            {
                e.ToTable("AutorizacionEPP");
                e.HasKey(ep => ep.Id);
                e.Property(ep => ep.EppTipo).HasConversion<string>();
                e.HasOne(ep => ep.Autorizacion)
                 .WithMany(a => a.Epps)
                 .HasForeignKey(ep => ep.AutorizacionId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ── AutorizacionPersonalApoyo ─────────────────────
            modelBuilder.Entity<AutorizacionPersonalApoyo>(e =>
            {
                e.ToTable("AutorizacionPersonalApoyo");
                e.HasKey(p => p.Id);
                e.Property(p => p.NombreCompleto).IsRequired().HasMaxLength(150);
                e.HasOne(p => p.Autorizacion)
                 .WithMany(a => a.PersonalApoyo)
                 .HasForeignKey(p => p.AutorizacionId)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(p => p.Usuario)
                 .WithMany()
                 .HasForeignKey(p => p.UsuarioId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── AnalisisRiesgos ───────────────────────────────
            modelBuilder.Entity<AnalisisRiesgo>(e =>
            {
                e.ToTable("AnalisisRiesgos");
                e.HasKey(r => r.Id);
                e.Property(r => r.NivelRiesgo).HasConversion<string>();
                e.HasOne(r => r.Autorizacion)
                 .WithMany(a => a.AnalisisRiesgos)
                 .HasForeignKey(r => r.AutorizacionId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ── AutorizacionHistorial ─────────────────────────
            modelBuilder.Entity<AutorizacionHistorial>(e =>
            {
                e.ToTable("AutorizacionHistorial");
                e.HasKey(h => h.Id);
                e.Property(h => h.EstadoAnterior).HasConversion<string>();
                e.Property(h => h.EstadoNuevo).HasConversion<string>();
                e.HasOne(h => h.Autorizacion)
                 .WithMany(a => a.Historial)
                 .HasForeignKey(h => h.AutorizacionId)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(h => h.Usuario)
                 .WithMany()
                 .HasForeignKey(h => h.UsuarioId)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // ── Notificaciones ────────────────────────────────
            modelBuilder.Entity<Notificacion>(e =>
            {
                e.ToTable("Notificaciones");
                e.HasKey(n => n.Id);
                e.HasOne(n => n.Usuario)
                 .WithMany(u => u.Notificaciones)
                 .HasForeignKey(n => n.UsuarioId)
                 .OnDelete(DeleteBehavior.Cascade);
                e.HasOne(n => n.Autorizacion)
                 .WithMany(a => a.Notificaciones)
                 .HasForeignKey(n => n.AutorizacionId)
                 .OnDelete(DeleteBehavior.SetNull);
            });

            // ── SesionesUsuario ───────────────────────────────
            modelBuilder.Entity<SesionUsuario>(e =>
            {
                e.ToTable("SesionesUsuario");
                e.HasKey(s => s.Id);
                e.HasOne(s => s.Usuario)
                 .WithMany()
                 .HasForeignKey(s => s.UsuarioId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            // ── Convención global: PascalCase → snake_case ────────────────
            foreach (var entidad in modelBuilder.Model.GetEntityTypes())
            {
                // Nombre de tabla en minúsculas
                entidad.SetTableName(entidad.GetTableName());

                // Columnas en snake_case
                foreach (var propiedad in entidad.GetProperties())
                {
                    var nombreColumna = string.Concat(
                        propiedad.Name.Select((letra, indice) =>
                            indice > 0 && char.IsUpper(letra)
                                ? "_" + char.ToLower(letra)
                                : char.ToLower(letra).ToString()
                        )
                    );
                    propiedad.SetColumnName(nombreColumna);
                }
            }
        }
    }
}