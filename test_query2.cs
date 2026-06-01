using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Supabase;
using FerreCompara.Api.Models;

class Program
{
    static async Task Main(string[] args)
    {
        try {
            var options = new SupabaseOptions { AutoConnectRealtime = false };
            var client = new Client("https://qvglqtwjohwjvwyisrbj.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z2xxdHdqb2h3anZ3eWlzcmJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkxMzcyNywiZXhwIjoyMDkzNDg5NzI3fQ.Ewe_JFOz64MyJ9shozObRlnIdK2jN5vcrd2Ux4JNNnE", options);
            await client.InitializeAsync();

            var allowedStoreIds = new List<int> { 1, 8 };
            var batch = new List<int> { 1, 2, 3 };

            var invQuery = client.From<InventoryModel>()
                .Filter("producto_id", Postgrest.Constants.Operator.In, batch);

            if (allowedStoreIds != null && allowedStoreIds.Any())
            {
                invQuery = invQuery.Filter("tienda_id", Postgrest.Constants.Operator.In, allowedStoreIds);
            }
            
            var batchResponse = await invQuery.Get();
            Console.WriteLine($"Inventory counts: {batchResponse.Models.Count}");
        } catch (Exception ex) {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
