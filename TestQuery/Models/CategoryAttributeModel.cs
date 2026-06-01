using Postgrest.Attributes;
using Postgrest.Models;

namespace FerreCompara.Api.Models
{
    [Table("category_attributes")]
    public class CategoryAttributeModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("categoria_id")]
        public int CategoriaId { get; set; }

        [Column("attribute_key")]
        public string AttributeKey { get; set; } = string.Empty;

        [Column("attribute_label")]
        public string AttributeLabel { get; set; } = string.Empty;

        [Column("attribute_type")]
        public string AttributeType { get; set; } = string.Empty;

        [Column("options")]
        public string? Options { get; set; }

        [Column("is_required")]
        public bool IsRequired { get; set; }

        [Column("display_order")]
        public int DisplayOrder { get; set; }
    }
}
