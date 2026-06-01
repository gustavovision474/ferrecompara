using Postgrest.Attributes;
using Postgrest.Models;

namespace FerreCompara.Api.Models
{
    [Table("ciudades")]
    public class CiudadModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;
        
        [Column("provincia")]
        public string Provincia { get; set; } = string.Empty;
    }
}
