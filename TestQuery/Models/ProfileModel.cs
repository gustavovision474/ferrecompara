using Postgrest.Attributes;
using Postgrest.Models;

namespace FerreCompara.Api.Models
{
    [Table("profiles")]
    public class ProfileModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public string Id { get; set; } = string.Empty; // UUID de auth.users

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("rol")]
        public string Rol { get; set; } = "cliente";

        [Column("tienda_id")]
        public int? TiendaId { get; set; }

        [Column("nombre_completo")]
        public string? NombreCompleto { get; set; }

        [Column("telefono")]
        public string? Telefono { get; set; }

        [Column("ciudad")]
        public string? Ciudad { get; set; }

        [Column("direccion")]
        public string? Direccion { get; set; }

        [Column("avatar_url")]
        public string? AvatarUrl { get; set; }
    }
}
