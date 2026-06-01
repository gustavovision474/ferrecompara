using System;
using System.Linq;
using System.Threading.Tasks;
using Supabase;
using FerreCompara.Api.Models;

class Program
{
    static async Task Main(string[] args)
    {
        var options = new SupabaseOptions { AutoConnectRealtime = false };
        var client = new Client("https://qvglqtwjohwjvwyisrbj.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z2xxdHdqb2h3anZ3eWlzcmJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkxMzcyNywiZXhwIjoyMDkzNDg5NzI3fQ.Ewe_JFOz64MyJ9shozObRlnIdK2jN5vcrd2Ux4JNNnE", options);
        await client.InitializeAsync();

        var ciudadResp = await client.From<CiudadModel>().Filter(c => c.Nombre, Postgrest.Constants.Operator.ILike, $"%Portoviejo%").Get();
        var ciudadObj = ciudadResp.Models.FirstOrDefault();
        Console.WriteLine($"Ciudad: {ciudadObj?.Id} - {ciudadObj?.Nombre}");

        var storeQuery = client.From<StoreModel>().Where(t => t.Activa == true);
        if (ciudadObj != null)
        {
            storeQuery = storeQuery.Where(t => t.CiudadId == ciudadObj.Id);
        }
        else
        {
            storeQuery = storeQuery.Where(t => t.City == "Portoviejo");
        }

        var storesResp = await storeQuery.Get();
        Console.WriteLine($"Stores from Where: {storesResp.Models.Count}");

        var filterQuery = client.From<StoreModel>()
            .Filter("activa", Postgrest.Constants.Operator.Equals, true)
            .Filter("ciudad_id", Postgrest.Constants.Operator.Equals, ciudadObj?.Id);
        var filterResp = await filterQuery.Get();
        Console.WriteLine($"Stores from Filter: {filterResp.Models.Count}");
    }
}
