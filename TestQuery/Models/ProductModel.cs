using Postgrest.Attributes;
using Postgrest.Models;

namespace FerreCompara.Api.Models
{
    [Table("productos")]
    public class ProductModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("nombre")]
        public string Nombre { get; set; } = string.Empty;

        [Column("descripcion")]
        public string? Descripcion { get; set; }

        [Column("categoria_id")]
        public int? CategoriaId { get; set; }

        [Column("marca")]
        public string? Marca { get; set; }

        [Column("imagen_url")]
        public string? ImagenUrl { get; set; }

        [Column("unidad")]
        public string? Unidad { get; set; }

        [Column("peso_kg")]
        public decimal? PesoKg { get; set; }

        [Column("dimensiones")]
        public string? Dimensiones { get; set; }

        [Column("diametro_mm")]
        public decimal? DiametroMm { get; set; }

        [Column("color")]
        public string? Color { get; set; }

        [Column("normalized_name")]
        public string? NormalizedName { get; set; }

        [Column("attributes")]
        public Dictionary<string, object>? Attributes { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

    }
}
