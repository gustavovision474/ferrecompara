using FerreCompara.Api.Models;
using FerreCompara.Api.DTOs;
using Supabase;

namespace FerreCompara.Api.Services
{
    public interface IProductService
    {
        Task<List<ProductUI>> GetProductosUIAsync(string? query = null, string? city = null);
        Task<List<ProductUI>> GetMyProductosUIAsync(int storeId);
        Task<ProductModel?> GetProductByIdAsync(int id);
        Task<ProductModel?> CreateProductAsync(ProductCreateDto dto, int storeId);
        Task<bool> UpdateProductAsync(int productId, ProductCreateDto dto, int storeId);
        Task<bool> DeleteProductAsync(int productId, int storeId);
    }

    public class ProductService : IProductService
    {
        private readonly Client _supabaseClient;

        public ProductService(Client supabaseClient)
        {
            _supabaseClient = supabaseClient;
        }

        public async Task<List<ProductUI>> GetMyProductosUIAsync(int storeId)
        {
            try 
            {
                // 1. Traer el inventario de la tienda
                var testResponse = await _supabaseClient.From<InventoryModel>().Get();
                Console.WriteLine($"[TEST] Sin filtro: {testResponse.Models.Count} items totales");
                Console.WriteLine($"[TEST] Primeros tienda_ids: {string.Join(", ", testResponse.Models.Take(5).Select(i => i.TiendaId))}");
                Console.WriteLine($"[DEBUG] Buscando inventario para tienda_id={storeId} (tipo: {storeId.GetType().Name})");
                var inventoryResponse = await _supabaseClient.From<InventoryModel>()
                    .Filter("tienda_id", Postgrest.Constants.Operator.Equals, ((long)storeId).ToString())
                    .Range(0, 999)
                    .Get();
                Console.WriteLine($"[DEBUG] Supabase devolvió {inventoryResponse.Models.Count} items");
                Console.WriteLine($"[DEBUG] ResponseContent: {inventoryResponse.Content?.Substring(0, Math.Min(200, inventoryResponse.Content?.Length ?? 0))}");
                var miInventario = inventoryResponse.Models;
                Console.WriteLine($"[GetMyProductosUI] Encontrados {miInventario.Count} items en inventario para tienda {storeId}");

                if (!miInventario.Any()) return new List<ProductUI>();

                // 2. Traer los productos en batches de 50 para evitar límites del operador In
                var productIds = miInventario.Select(i => i.ProductoId).Distinct().ToList();
                Console.WriteLine($"[GetMyProductosUI] IDs de productos a buscar: {string.Join(", ", productIds)}");

                var misProductos = new Dictionary<int, ProductModel>();
                var batches = productIds
                    .Select((id, i) => new { id, i })
                    .GroupBy(x => x.i / 50)
                    .Select(g => g.Select(x => x.id).ToList())
                    .ToList();

                foreach (var batch in batches)
                {
                    var batchResponse = await _supabaseClient.From<ProductModel>()
                        .Filter("id", Postgrest.Constants.Operator.In, batch)
                        .Get();
                    foreach (var p in batchResponse.Models)
                        misProductos[p.Id] = p;
                }
                Console.WriteLine($"[GetMyProductosUI] Productos recuperados de DB: {misProductos.Count}");

                var result = miInventario.Select(i =>
                {
                    if (!misProductos.TryGetValue(i.ProductoId, out var p))
                    {
                        return null;
                    }

                    string status = "available";
                    if (i.Stock == 0) status = "out-of-stock";
                    else if (i.Stock <= 2) status = "low-stock";

                    return new ProductUI
                    {
                        Id = p.Id.ToString(),
                        Name = p.Nombre,
                        Brand = p.Marca ?? "Generico",
                        MinPrice = i.Precio,
                        MaxPrice = i.Precio,
                        Image = p.ImagenUrl ?? "https://via.placeholder.com/150",
                        Status = status,
                        Tag = i.Oferta ? "OFERTA" : null,
                        Category = "Sin Categoria",
                        Stock = i.Stock
                    };
                }).Where(x => x != null).Cast<ProductUI>().ToList();

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR GetMyProductosUIAsync: {ex.Message}");
                Console.WriteLine($"STACK: {ex.StackTrace}");
                return new List<ProductUI>();
            }
        }

        public async Task<List<ProductUI>> GetProductosUIAsync(string? query = null, string? city = null)
        {
            List<int>? allowedStoreIds = null;
            if (!string.IsNullOrEmpty(city))
            {
                var ciudadResp = await _supabaseClient.From<CiudadModel>()
                    .Filter(c => c.Nombre, Postgrest.Constants.Operator.ILike, $"%{city}%")
                    .Get();
                
                var ciudadObj = ciudadResp.Models.FirstOrDefault();
                var storeQuery = _supabaseClient.From<StoreModel>().Where(t => t.Activa == true);

                if (ciudadObj != null)
                {
                    storeQuery = storeQuery.Where(t => t.CiudadId == ciudadObj.Id);
                }
                else
                {
                    storeQuery = storeQuery.Where(t => t.City == city);
                }

                var storesResp = await storeQuery.Get();
                allowedStoreIds = storesResp.Models.Select(t => t.Id).ToList();

                if (!allowedStoreIds.Any())
                {
                    return new List<ProductUI>();
                }
            }

            Postgrest.Responses.ModeledResponse<ProductModel> response;

            if (!string.IsNullOrEmpty(query))
            {
                response = await _supabaseClient.From<ProductModel>()
                    .Filter(p => p.Nombre, Postgrest.Constants.Operator.ILike, $"%{query}%")
                    .Get();
            }
            else
            {
                response = await _supabaseClient.From<ProductModel>().Get();
            }

            var productos = response.Models;

            if (!productos.Any()) return new List<ProductUI>();

            var productIds = productos.Select(p => p.Id).Distinct().ToList();
            var allInventories = new List<InventoryModel>();
            
            var batches = productIds
                .Select((id, i) => new { id, i })
                .GroupBy(x => x.i / 50)
                .Select(g => g.Select(x => x.id).ToList())
                .ToList();

            foreach (var batch in batches)
            {
                var invQuery = _supabaseClient.From<InventoryModel>()
                    .Filter("producto_id", Postgrest.Constants.Operator.In, batch);
                    
                if (allowedStoreIds != null && allowedStoreIds.Any())
                {
                    invQuery = invQuery.Filter("tienda_id", Postgrest.Constants.Operator.In, allowedStoreIds);
                }
                
                var batchResponse = await invQuery.Get();
                allInventories.AddRange(batchResponse.Models);
            }

            var inventoryByProduct = allInventories.GroupBy(i => i.ProductoId)
                                                   .ToDictionary(g => g.Key, g => g.ToList());

            return productos.Select(p =>
            {
                if (!inventoryByProduct.TryGetValue(p.Id, out var inventarioValido))
                {
                    return null;
                }

                if (!inventarioValido.Any()) return null;

                var precios = inventarioValido.Select(i => i.Precio).ToList();
                var minPrice = precios.Any() ? precios.Min() : 0;
                var maxPrice = precios.Any() ? precios.Max() : 0;
                var tieneOferta = inventarioValido.Any(i => i.Oferta);
                var stockTotal = inventarioValido.Count(i => i.Stock > 0);

                string status = "available";
                if (stockTotal == 0) status = "out-of-stock";
                else if (stockTotal <= 2) status = "low-stock";

                string? tag = null;
                if (tieneOferta) tag = "OFERTA";
                else if (status == "low-stock") tag = "BAJO STOCK";

                var currentStock = inventarioValido.Sum(i => i.Stock);

                return new ProductUI
                {
                    Id = p.Id.ToString(),
                    Name = p.Nombre,
                    Brand = p.Marca ?? "Generico",
                    MinPrice = minPrice,
                    MaxPrice = maxPrice,
                    Image = p.ImagenUrl ?? "https://via.placeholder.com/150",
                    Status = status,
                    Tag = tag,
                    Category = "Sin Categoria",
                    Stock = currentStock
                };
            }).Where(x => x != null).Cast<ProductUI>().ToList();
        }

        public async Task<ProductModel?> GetProductByIdAsync(int id)
        {
            var response = await _supabaseClient
                .From<ProductModel>()
                .Where(p => p.Id == id)
                .Single();
            return response;
        }

        public async Task<ProductModel?> CreateProductAsync(ProductCreateDto dto, int storeId)
        {
            try 
            {
                int? finalCategoryId = dto.CategoriaId;

                if (!string.IsNullOrEmpty(dto.CategoriaNombre))
                {
                    // Buscar si existe la categoría
                    var catResponse = await _supabaseClient.From<CategoriaModel>()
                        .Where(c => c.Nombre == dto.CategoriaNombre)
                        .Get();
                    
                    var existingCat = catResponse.Models.FirstOrDefault();

                    if (existingCat != null)
                    {
                        finalCategoryId = existingCat.Id;
                    }
                    else
                    {
                        // Crear la categoría
                        var newCatResponse = await _supabaseClient.From<CategoriaModel>()
                            .Insert(new CategoriaModel { Nombre = dto.CategoriaNombre });
                        var createdCat = newCatResponse.Models.FirstOrDefault();
                        if (createdCat != null) finalCategoryId = createdCat.Id;
                    }
                }

                // 1. Crear el producto en el catálogo global
                var product = new ProductModel
                {
                    Nombre = dto.Nombre,
                    Descripcion = dto.Descripcion,
                    CategoriaId = finalCategoryId,
                    Marca = dto.Marca,
                    ImagenUrl = dto.ImagenUrl
                };

                var productResponse = await _supabaseClient.From<ProductModel>().Insert(product);
                var newProduct = productResponse.Models.FirstOrDefault();

                if (newProduct != null)
                {
                    // 2. Vincularlo automáticamente al inventario de la tienda que lo creó
                    var inventory = new InventoryModel
                    {
                        TiendaId = storeId,
                        ProductoId = newProduct.Id,
                        Precio = dto.PrecioInicial,
                        Stock = dto.TieneStock,
                        Oferta = false
                    };

                    await _supabaseClient.From<InventoryModel>().Insert(inventory);
                    return newProduct;
                }

                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error FATAL al crear producto: {ex.Message}");
                Console.WriteLine($"STACK: {ex.StackTrace}");
                return null;
            }
        }
        public async Task<bool> UpdateProductAsync(int productId, ProductCreateDto dto, int storeId)
        {
            try
            {
                Console.WriteLine($"DEBUG: Actualizando Producto {productId} para Tienda {storeId}");
                Console.WriteLine($"DEBUG: Nombre: {dto.Nombre}, Precio: {dto.PrecioInicial}, Stock: {dto.TieneStock}");

                // 1. Actualizar catálogo global (solo campos que no sean nulos)
                var productUpdate = _supabaseClient.From<ProductModel>()
                    .Where(p => p.Id == productId)
                    .Set(p => p.Nombre, dto.Nombre ?? "Producto sin nombre");

#pragma warning disable CS8603
                if (dto.Descripcion != null) productUpdate = productUpdate.Set(p => p.Descripcion, dto.Descripcion);
                if (dto.Marca != null) productUpdate = productUpdate.Set(p => p.Marca, dto.Marca);
                if (dto.ImagenUrl != null) productUpdate = productUpdate.Set(p => p.ImagenUrl, dto.ImagenUrl);
                if (dto.CategoriaId > 0) productUpdate = productUpdate.Set(p => p.CategoriaId, dto.CategoriaId);
#pragma warning restore CS8603

                var globalRes = await productUpdate.Update();
                Console.WriteLine($"DEBUG: Catálogo global actualizado: {globalRes.Models.Count > 0}");

                // 2. Asegurar registro en el inventario (Actualizar o Insertar de forma segura)
                var existingInvList = await _supabaseClient.From<InventoryModel>()
                    .Filter(i => i.ProductoId, Postgrest.Constants.Operator.Equals, productId)
                    .Filter(i => i.TiendaId, Postgrest.Constants.Operator.Equals, storeId)
                    .Get();

                // Limpieza de duplicados: Si por error hay más de 1, nos quedamos con el primero y borramos el resto
                var existingInv = existingInvList.Models.FirstOrDefault();
                if (existingInvList.Models.Count > 1)
                {
                    var duplicates = existingInvList.Models.Skip(1).ToList();
                    foreach (var dup in duplicates)
                    {
                        await _supabaseClient.From<InventoryModel>().Where(i => i.Id == dup.Id).Delete();
                    }
                    Console.WriteLine($"DEBUG: Se eliminaron {duplicates.Count} registros duplicados de inventario.");
                }

                if (existingInv != null)
                {
                    // Actualizar el existente
                    await _supabaseClient.From<InventoryModel>()
                        .Where(i => i.Id == existingInv.Id)
                        .Set(i => i.Precio, dto.PrecioInicial)
                        .Set(i => i.Stock, dto.TieneStock)
                        .Update();
                    Console.WriteLine($"DEBUG: Inventario actualizado (Update). ID: {existingInv.Id}");
                }
                else
                {
                    // Crear nuevo
                    var newItem = new InventoryModel
                    {
                        TiendaId = storeId,
                        ProductoId = productId,
                        Precio = dto.PrecioInicial,
                        Stock = dto.TieneStock,
                        Oferta = false
                    };
                    await _supabaseClient.From<InventoryModel>().Insert(newItem);
                    Console.WriteLine("DEBUG: Inventario creado (Insert).");
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error FATAL al actualizar producto: {ex.Message}");
                Console.WriteLine($"STACK: {ex.StackTrace}");
                return false;
            }
        }

        public async Task<bool> DeleteProductAsync(int productId, int storeId)
        {
            try
            {
                // 1. Eliminar del inventario de la tienda específica
                await _supabaseClient
                    .From<InventoryModel>()
                    .Where(i => i.ProductoId == productId && i.TiendaId == storeId)
                    .Delete();

                // 2. Intentar eliminar del catálogo global 
                // (Nota: Esto podría fallar si otras tiendas también lo tienen en su inventario, 
                // lo cual es el comportamiento deseado de integridad referencial)
                await _supabaseClient
                    .From<ProductModel>()
                    .Where(p => p.Id == productId)
                    .Delete();

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error al eliminar producto: {ex.Message}");
                return false;
            }
        }
    }
}
