using Postgrest.Attributes;
using Postgrest.Models;

namespace FerreCompara.Api.Models
{
    [Table("horarios_tienda")]
    public class HorarioTiendaModel : BaseModel
    {
        [PrimaryKey("id", false)]
        public int Id { get; set; }

        [Column("tienda_id")]
        public int TiendaId { get; set; }

        [Column("dia_semana")]
        public int DiaSemana { get; set; } // 0=Domingo, 1=Lunes...

        [Column("hora_apertura")]
        public string? HoraApertura { get; set; }

        [Column("hora_cierre")]
        public string? HoraCierre { get; set; }

        [Column("esta_cerrado")]
        public bool EstaCerrado { get; set; }
    }
}
