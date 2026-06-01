using Postgrest.Attributes;
using Postgrest.Models;

namespace FerreCompara.Api.Models
{
    [Table("click_stats")]
    public class ClickStatModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("store_id")]
        public int StoreId { get; set; }

        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("clicked_at")]
        public DateTime ClickedAt { get; set; }
    }
}
