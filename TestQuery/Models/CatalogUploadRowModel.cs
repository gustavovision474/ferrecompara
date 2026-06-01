using Newtonsoft.Json.Linq;
using Postgrest.Attributes;
using Postgrest.Models;

namespace FerreCompara.Api.Models
{
    [Table("catalog_upload_rows")]
    public class CatalogUploadRowModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid Id { get; set; }

        [Column("upload_id")]
        public Guid UploadId { get; set; }

        [Column("row_number")]
        public int RowNumber { get; set; }

        [Column("raw_data")]
        public string? RawData { get; set; }

        [Column("parsed_data")]
        public JObject? ParsedData { get; set; }

        [Column("status")]
        public string Status { get; set; } = string.Empty;

        [Column("error_message")]
        public string? ErrorMessage { get; set; }
    }
}
