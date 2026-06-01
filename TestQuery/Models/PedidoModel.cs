using Postgrest.Attributes;
using Postgrest.Models;

namespace FerreCompara.Api.Models
{
    [Table("pedidos")]
    public class PedidoModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public long Id { get; set; }

        [Column("cliente_id")]
        public string ClienteId { get; set; } = string.Empty;

        [Column("tienda_id")]
        public int TiendaId { get; set; }

        [Column("estado")]
        public string Estado { get; set; } = "pendiente";

        [Column("tipo_venta")]
        public string TipoVenta { get; set; } = "contado";

        [Column("es_mayorista")]
        public bool EsMayorista { get; set; } = false;

        [Column("subtotal")]
        public decimal Subtotal { get; set; }

        [Column("descuento")]
        public decimal Descuento { get; set; }

        [Column("iva")]
        public decimal Iva { get; set; }

        [Column("total")]
        public decimal Total { get; set; }

        [Column("notas")]
        public string? Notas { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("pedido_items")]
    public class PedidoItemModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public long Id { get; set; }

        [Column("pedido_id")]
        public long PedidoId { get; set; }

        [Column("producto_id")]
        public int ProductoId { get; set; }

        [Column("nombre_producto")]
        public string NombreProducto { get; set; } = string.Empty;

        [Column("sku")]
        public string Sku { get; set; } = string.Empty;

        [Column("cantidad")]
        public int Cantidad { get; set; }

        [Column("precio_unitario")]
        public decimal PrecioUnitario { get; set; }

        [Column("descuento_pct")]
        public decimal DescuentoPct { get; set; }

        [Column("total")]
        public decimal Total { get; set; }
    }
}
