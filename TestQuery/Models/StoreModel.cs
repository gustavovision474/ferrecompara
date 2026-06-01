using Postgrest.Attributes;
using Postgrest.Models;

namespace FerreCompara.Api.Models
{
    [Table("tiendas")]
    public class StoreModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("direccion")]
        public string? Direccion { get; set; }

        [Column("telefono")]
        public string? Telefono { get; set; }

        [Column("rating")]
        public double? Rating { get; set; }

        [Column("total_resenas")]
        public int? TotalResenas { get; set; }

        [Column("activa")]
        public bool? Activa { get; set; }

        [Column("imagen_portada_url")]
        public string? ImagenPortadaUrl { get; set; }

        [Column("latitud")]
        public double? Latitud { get; set; }

        [Column("longitud")]
        public double? Longitud { get; set; }

        [Column("city")]
        public string? City { get; set; }

        [Column("ciudad_id")]
        public int? CiudadId { get; set; }

        [Column("horario")]
        public string? Horario { get; set; }

        [Reference(typeof(CiudadModel))]
        public CiudadModel? Ciudades { get; set; }
    }
}
