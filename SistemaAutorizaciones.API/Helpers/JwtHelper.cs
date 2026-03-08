using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SistemaAutorizaciones.API.Helpers
{
    public class JwtHelper
    {
        private readonly IConfiguration _configuracion;

        public JwtHelper(IConfiguration configuracion)
        {
            _configuracion = configuracion;
        }

        public string GenerarToken(int idUsuario, string correo,
                                   string rol, string nombreCompleto)
        {
            var configuracionJwt = _configuracion.GetSection("JwtSettings");
            var llave = new SymmetricSecurityKey(
                                       Encoding.UTF8.GetBytes(
                                           configuracionJwt["SecretKey"]!));
            var credenciales = new SigningCredentials(
                                       llave, SecurityAlgorithms.HmacSha256);

            var reclamaciones = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, idUsuario.ToString()),
                new Claim(ClaimTypes.Email,          correo),
                new Claim(ClaimTypes.Role,           rol),
                new Claim(ClaimTypes.Name,           nombreCompleto),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var fechaExpiracion = DateTime.UtcNow.AddHours(
                double.Parse(configuracionJwt["ExpirationHours"]!));

            var token = new JwtSecurityToken(
                issuer: configuracionJwt["Issuer"],
                audience: configuracionJwt["Audience"],
                claims: reclamaciones,
                expires: fechaExpiracion,
                signingCredentials: credenciales
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}