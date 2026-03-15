using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SistemaAutorizaciones.API.Data;
using System.Text;

var constructor = WebApplication.CreateBuilder(args);

// ── 1. Base de datos MySQL ────────────────────────────────────
constructor.Services.AddDbContext<ApplicationDbContext>(opciones =>
    opciones.UseMySql(
        constructor.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(constructor.Configuration.GetConnectionString("DefaultConnection"))
    )
);

// ── 2. Autenticación JWT ──────────────────────────────────────
var configuracionJwt = constructor.Configuration.GetSection("JwtSettings");
var llaveSecreta = configuracionJwt["SecretKey"]!;

constructor.Services.AddAuthentication(opciones =>
{
    opciones.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opciones.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(opciones =>
{
    opciones.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = configuracionJwt["Issuer"],
        ValidAudience = configuracionJwt["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
                                       Encoding.UTF8.GetBytes(llaveSecreta))
    };
});

constructor.Services.AddAuthorization();

// ── 3. CORS — permite peticiones desde React ──────────────────
constructor.Services.AddCors(opciones =>
{
    opciones.AddPolicy("AplicacionReact", politica =>
    {
        politica.WithOrigins(
                    "http://localhost:5173",
                    "http://localhost:3000"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
    });
});

// ── 4. Controladores + JSON ───────────────────────────────────
constructor.Services.AddControllers()
    .AddJsonOptions(opciones =>
    {
        // Serializa enums como texto (ej: "Aprobada" en vez de 2)
        opciones.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
        // Evita referencias circulares entre entidades
        opciones.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// ── 5. Swagger con soporte JWT ────────────────────────────────
constructor.Services.AddEndpointsApiExplorer();
constructor.Services.AddSwaggerGen(configuracion =>
{
    configuracion.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Sistema de Autorizaciones API",
        Version = "v1",
        Description = "API para gestión digital del formulario FO-MA-19"
    });

    configuracion.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresa: Bearer {tu token}"
    });

    configuracion.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var aplicacion = constructor.Build();

// ── 6. Pipeline de la aplicación ─────────────────────────────
if (aplicacion.Environment.IsDevelopment())
{
    aplicacion.UseSwagger();
    aplicacion.UseSwaggerUI(configuracion =>
    {
        configuracion.SwaggerEndpoint("/swagger/v1/swagger.json",
                                      "Sistema Autorizaciones v1");
        configuracion.RoutePrefix = string.Empty;
    });
}

aplicacion.UseHttpsRedirection();
aplicacion.UseCors("AplicacionReact");
aplicacion.UseAuthentication();
aplicacion.UseAuthorization();
aplicacion.MapControllers();

aplicacion.Run();
