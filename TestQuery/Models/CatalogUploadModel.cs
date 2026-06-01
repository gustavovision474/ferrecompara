using Postgrest.Attributes;
using Postgrest.Models;

namespace FerreCompara.Api.Models
{
    [Table("catalog_uploads")]
    public class CatalogUploadModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid Id { get; set; }

        [Column("tienda_id")]
        public int TiendaId { get; set; }

        [Column("filename")]
        public string Filename { get; set; } = string.Empty;

        [Column("status")]
        public string Status { get; set; } = string.Empty;

        [Column("column_mapping")]
        public string? ColumnMapping { get; set; }

        [Column("error_log")]
        public string? ErrorLog { get; set; }

        [Column("total_rows")]
        public int? TotalRows { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        [Column("committed_at")]
        public DateTime? CommittedAt { get; set; }
    }
}
