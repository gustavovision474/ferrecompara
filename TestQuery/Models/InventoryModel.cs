using Postgrest.Attributes;
using Postgrest.Models;

namespace FerreCompara.Api.Models
{
    [Table("inventario")]
    public class InventoryModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("tienda_id")]
        public int TiendaId { get; set; }

        [Column("producto_id")]
        public int ProductoId { get; set; }

        [Column("precio")]
        public decimal Precio { get; set; }

        [Column("precio_anterior")]
        public decimal? PrecioAnterior { get; set; }

        [Column("stock")]
        public int Stock { get; set; }

        [Column("oferta")]
        public bool Oferta { get; set; }

        [Column("sku_externo")]
        public string? SkuExterno { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

    }
}
