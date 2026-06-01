import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Product , CommitResultDto } from './types';
import { firstValueFrom } from 'rxjs';

// Tipos que mapean directamente con las tablas de Supabase
export interface SupabaseTienda {
  id: number;
  nombre: string;
  descripcion: string | null;
  ciudad_id: number;
  direccion: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  latitud: number | null;
  longitud: number | null;
  google_maps_url: string | null;
  horario: string | null;
  logo_url: string | null;
  imagen_portada_url: string | null;
  rating: number;
  total_resenas: number;
  activa: boolean;
  ciudades?: { nombre: string; provincia: string };
}

export interface SupabaseProducto {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  marca: string | null;
  unidad: string | null;
  imagen_url: string | null;
  destacado: boolean;
  tendencia: boolean;
  categorias?: { nombre: string };
  inventario?: SupabaseInventario[];
}

export interface SupabaseInventario {
  id: number;
  tienda_id: number;
  producto_id: number;
  precio: number;
  precio_anterior: number | null;
  stock: boolean;
  cantidad_stock: number | null;
  oferta: boolean;
}

// Tipo para tienda transformada (compatible con la UI actual)
export interface TiendaUI {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  reviews: number;
  image: string;
  status: 'open' | 'closed';
  distance: string;
  categories: string[];
  latitud?: number;
  longitud?: number;
  direccion?: string;
  horario?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabaseClient: SupabaseClient;
  private http = inject(HttpClient);

  readonly tiendas = signal<TiendaUI[]>([]);
  readonly productos = signal<Product[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.supabaseClient = createClient(
      environment.supabase.url,
      environment.supabase.publishableKey
    );
    console.log('✅ Supabase conectado');
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  async cargarTiendas(city?: string): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams();
      if (city) params = params.set('city', city);

      const url = `${environment.apiUrl}/Stores`;
      const tiendas = await firstValueFrom(this.http.get<TiendaUI[]>(url, { params }));
      this.tiendas.set(tiendas ?? []);
    } catch (err: any) {
      console.warn('⚠️ Cargando tiendas fallback...');
      await this.cargarTiendasFallback();
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarProductos(query?: string, city?: string): Promise<void> {
    console.log('🚀 Iniciando carga de productos...', query || 'sin query', city || 'sin ciudad');
    this.cargando.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams();
      if (query) params = params.set('q', query);
      if (city) params = params.set('city', city);
      params = params.set('_t', Date.now().toString());
      
      const url = `${environment.apiUrl}/Products`;
      console.log('🔗 Petición a:', url);
      
      const productos = await firstValueFrom(this.http.get<Product[]>(url, { params }));
      console.log('✅ Productos recibidos:', productos?.length || 0);
      this.productos.set(productos ?? []);
    } catch (err: any) {
      console.error('❌ Error cargando productos API:', err);
      console.warn('⚠️ Cargando productos fallback...');
      await this.cargarProductosFallback();
    } finally {
      this.cargando.set(false);
      console.log('🏁 Carga finalizada. Total productos en signal:', this.productos().length);
    }
  }

  async cargarMisProductosApi(): Promise<Product[]> {
    try {
      let params = new HttpParams().set('_t', Date.now().toString());
      const productos = await firstValueFrom(this.http.get<Product[]>(`${environment.apiUrl}/Products/my`, { params }));
      if (!productos || productos.length === 0) {
        // alert('El backend devolvió 0 productos para esta tienda.');
      }
      return productos ?? [];
    } catch (err: any) {
      alert('Error cargando mis productos: ' + (err.message || err.statusText || 'Error desconocido'));
      console.error('Error cargando mis productos', err);
      return [];
    }
  }

  async obtenerTiendasPorProducto(productoId: string | number): Promise<any[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('inventario')
        .select(`
          precio,
          stock,
          oferta,
          tiendas (
            id,
            nombre,
            direccion,
            ciudad:ciudades (nombre),
            telefono,
            latitud,
            longitud,
            rating,
            activa
          )
        `)
        .eq('producto_id', productoId);
        
      if (error) throw error;
      
      // Filtrar aquellos donde la tienda no viene (por el inner join) o no está activa
      const validos = data?.filter(i => i.tiendas != null && (i.tiendas as any).activa === true) || [];
      
      return validos.map(i => ({
        storeId: (i.tiendas as any).id,
        store: (i.tiendas as any).nombre,
        logo: (i.tiendas as any).nombre.charAt(0),
        verified: true,
        distance: (i.tiendas as any).direccion || (i.tiendas as any).ciudad?.nombre,
        price: i.precio,
        minPrice: i.precio,
        phone: (i.tiendas as any).telefono,
        stock: i.stock > 0 ? 'Disponible' : 'Agotado',
        isCurrentStore: false,
        latitud: (i.tiendas as any).latitud,
        longitud: (i.tiendas as any).longitud,
        direccion: (i.tiendas as any).direccion
      }));
    } catch (err) {
      console.error('Error obteniendo tiendas del producto', err);
      return [];
    }
  }

  async cargarProductosPorTiendaApi(storeId: string): Promise<Product[]> {
    try {
      let params = new HttpParams().set('_t', Date.now().toString());
      const productos = await firstValueFrom(this.http.get<Product[]>(`${environment.apiUrl}/Products/store/${storeId}`, { params }));
      return productos ?? [];
    } catch (err: any) {
      console.error(`Error cargando productos para tienda ${storeId}`, err);
      return [];
    }
  }

  async cargarCategorias(): Promise<any[]> {
    try {
      const { data, error } = await this.supabaseClient.from('categorias').select('id, nombre').order('nombre');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error cargando categorías', err);
      return [];
    }
  }

  async probarConexion(): Promise<boolean> {
    try {
      const { error } = await this.supabaseClient.from('ciudades').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return true;
    } catch (err: any) {
      return false;
    }
  }

  private async cargarTiendasFallback(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient.from('tiendas').select(`*, ciudades ( nombre, provincia )`).eq('activa', true);
      if (error) throw error;
      const tiendasUI: TiendaUI[] = (data as SupabaseTienda[]).map(t => ({
        id: t.id.toString(),
        name: t.nombre,
        address: t.direccion || '',
        city: t.ciudades?.nombre || '',
        phone: t.telefono || '',
        rating: t.rating,
        reviews: t.total_resenas,
        image: t.imagen_portada_url || '',
        status: t.activa ? 'open' : 'closed',
        distance: '',
        categories: [],
        latitud: t.latitud ?? undefined,
        longitud: t.longitud ?? undefined,
        direccion: t.direccion ?? undefined
      }));
      this.tiendas.set(tiendasUI);
    } catch (err: any) {}
  }

  private async cargarProductosFallback(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient.from('productos').select(`*, categorias ( nombre ), inventario ( precio, stock, oferta )`);
      if (error) throw error;
      const productosUI: Product[] = (data as SupabaseProducto[]).map(p => ({
        id: p.id.toString(),
        name: p.nombre,
        brand: p.marca || '',
        minPrice: p.inventario?.[0]?.precio || 0,
        maxPrice: p.inventario?.[0]?.precio || 0,
        image: p.imagen_url || '',
        status: 'available',
        category: p.categorias?.nombre || ''
      }));
      this.productos.set(productosUI);
    } catch (err: any) {}
  }

  // ─────────────────────────────────────────────
  // MÉTODOS DE SUBIDA (API C#)
  // ─────────────────────────────────────────────
  async subirImagenProducto(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await firstValueFrom(this.http.post<{ url: string }>(`${environment.apiUrl}/Media/upload-product-photo`, formData));
    return res;
  }

  async subirImagenTienda(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await firstValueFrom(this.http.post<{ url: string }>(`${environment.apiUrl}/Stores/me/photo`, formData));
    return res;
  }

  async subirAvatarCliente(userId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post<{ url: string }>(`${environment.apiUrl}/Auth/upload-avatar/${userId}`, formData));
  }

  async actualizarPerfilUsuario(datos: { nombre?: string; telefono?: string; ciudad?: string; direccion?: string; avatarUrl?: string }) {
    const { data: { session } } = await this.supabaseClient.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('No hay sesión activa');
    await firstValueFrom(this.http.put(`${environment.apiUrl}/Auth/profile/${user.id}`, datos));
  }

  async actualizarPerfilTienda(datos: any) {
    return firstValueFrom(this.http.put(`${environment.apiUrl}/Stores/me`, datos));
  }
 
  async eliminarProducto(id: number) {
    return firstValueFrom(this.http.delete(`${environment.apiUrl}/Products/${id}`));
  }


  async actualizarProducto(id: number, datos: any) {
    return firstValueFrom(this.http.put(`${environment.apiUrl}/Products/${id}`, datos));
  }

  async cargarHorariosTienda(tiendaId: number) {
    const { data, error } = await this.supabaseClient
      .from('horarios_tienda')
      .select('*')
      .eq('tienda_id', tiendaId);
    if (error) throw error;
    return data ?? [];
  }

  async subirCatalogoExcel(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await firstValueFrom(this.http.post<any>(`${environment.apiUrl}/catalog/upload`, formData));
    return res;
  }

  async subirCatalogo(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post<any>(`${environment.apiUrl}/catalog/upload`, formData));
  }

  async previewCatalogo(uploadId: string): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${environment.apiUrl}/catalog/upload/${uploadId}/preview`, {}));
  }

  async commitCatalogo(uploadId: string, strategy: string = 'UpdateExisting'): Promise<CommitResultDto> {
    try {
      const res = await firstValueFrom(
        this.http.post<CommitResultDto>(
          `${environment.apiUrl}/catalog/upload/${uploadId}/commit?strategy=${strategy}`,
          {}
        )
      );
      return res;
    } catch (err: any) {
      const status = err?.status;
      let mensaje: string;
      switch (status) {
        case 401: mensaje = 'Tu sesión expiró. Por favor volvé a iniciar sesión.'; break;
        case 403: mensaje = 'No tenés permiso para aplicar esta carga.'; break;
        case 404: mensaje = 'No se encontró la carga. Intentá subirla de nuevo.'; break;
        case 400: mensaje = err?.error?.message || 'La carga no se puede aplicar en este momento.'; break;
        case 500: mensaje = 'Error inesperado al aplicar al inventario.'; break;
        default: mensaje = 'Error desconocido al aplicar la carga.';
      }
      throw new Error(mensaje);
    }
  }

  // --- ENDPOINTS PARA CRÉDITOS ---

  async solicitarCredito(tiendaId: string | number, monto: number, plazo: number, ingresos: number): Promise<any> {
    const { data: userData } = await this.supabaseClient.auth.getUser();
    if (!userData.user) throw new Error("No user logged in");

    console.log('solicitarCredito: Enviando solicitud para tiendaId:', tiendaId, 'clienteId:', userData.user.id);

    const { data, error } = await this.supabaseClient
      .from('solicitudes_credito')
      .insert({
        tienda_id: tiendaId,
        cliente_id: userData.user.id,
        monto_solicitado: monto,
        plazo_meses: plazo,
        ingresos_mensuales: ingresos
      })
      .select()
      .single();
      
    if (error) {
      console.error('solicitarCredito: Error al insertar', error);
      throw error;
    }
    
    console.log('solicitarCredito: Insertado con éxito', data);
    return data;
  }

  async obtenerSolicitudesTienda(tiendaId: string | number): Promise<any[]> {
    console.log('obtenerSolicitudesTienda: Buscando para tiendaId:', tiendaId);
    
    const { data, error } = await this.supabaseClient
      .from('solicitudes_credito')
      .select('*')
      .eq('tienda_id', tiendaId)
      .order('fecha_solicitud', { ascending: false });

    if (error) {
      console.error('obtenerSolicitudesTienda: Error', error);
      throw error;
    }
    
    console.log('obtenerSolicitudesTienda: Encontradas:', data);
    // Extraer perfiles en un segundo paso para evitar RLS complex
    if (data && data.length > 0) {
      const ids = [...new Set(data.map((d: any) => d.cliente_id))].filter(Boolean);
      if (ids.length > 0) {
        const { data: perfiles } = await this.supabaseClient
          .from('profiles')
          .select('id, nombre_completo, avatar_url, telefono, ciudad')
          .in('id', ids);
        
        const perfilesMap = new Map();
        if (perfiles) {
          perfiles.forEach(p => perfilesMap.set(p.id, {
            full_name: p.nombre_completo,
            avatar_url: p.avatar_url,
            telefono: p.telefono,
            ciudad: p.ciudad
          }));
        }

        data.forEach((d: any) => {
          d.perfiles = perfilesMap.get(d.cliente_id) || { full_name: 'Cliente', avatar_url: '' };
        });
      }
    }
    
    return data ?? [];
  }

  async resolverSolicitud(solicitudId: string, estado: 'aprobada' | 'rechazada', montoAprobado?: number, tasaInteres?: number, plazo?: number, tiendaId?: number, clienteId?: string): Promise<any> {
    const { error } = await this.supabaseClient.rpc('resolver_solicitud', {
      p_solicitud_id: solicitudId,
      p_estado: estado,
      p_monto: montoAprobado || null,
      p_tasa: tasaInteres || null,
      p_plazo: plazo || null,
      p_tienda_id: tiendaId || null,
      p_cliente_id: clienteId || null
    });
    
    if (error) {
      console.error('Error en resolverSolicitud RPC:', error);
      throw error;
    }
    return true;
  }

  async obtenerCarteraCredito(tiendaId: string | number): Promise<any> {
    const { data, error } = await this.supabaseClient
      .from('creditos_activos')
      .select('*')
      .eq('tienda_id', tiendaId);
    if (error) throw error;
    
    // Calcular métricas
    const creditos = data ?? [];
    const totalPrestado = creditos.reduce((acc, c) => acc + Number(c.monto_aprobado), 0);
    const carteraVencida = creditos.filter(c => c.estado === 'en_mora').reduce((acc, c) => acc + Number(c.saldo_pendiente), 0);
    const clientesMora = creditos.filter(c => c.estado === 'en_mora').length;

    return {
      totalPrestado,
      cobradoMes: creditos
        .filter(c => {
          const updatedAt = new Date(c.updated_at);
          const now = new Date();
          return updatedAt.getMonth() === now.getMonth() && updatedAt.getFullYear() === now.getFullYear();
        })
        .reduce((acc: number, c: any) => acc + (Number(c.monto_aprobado) - Number(c.saldo_pendiente)), 0),
      carteraVencida,
      clientesMora,
      lista: creditos
    };
  }

  async obtenerConfigCredito(tiendaId: string | number): Promise<any> {
    const { data, error } = await this.supabaseClient
      .from('creditos_configuracion')
      .select('*')
      .eq('tienda_id', tiendaId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async guardarConfigCredito(tiendaId: string | number, tasa: number, limite: number, plazo: number): Promise<any> {
    const { data, error } = await this.supabaseClient
      .from('creditos_configuracion')
      .upsert({
        tienda_id: tiendaId,
        tasa_interes_mensual: tasa,
        monto_maximo_credito: limite,
        plazo_maximo_meses: plazo
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async obtenerMisCreditos(): Promise<{ solicitudes: any[], activos: any[] }> {
    const { data: userData, error: authErr } = await this.supabaseClient.auth.getUser();
    const clienteId = userData?.user?.id;
    if (!clienteId) {
      console.warn('obtenerMisCreditos: No user found', authErr);
      return { solicitudes: [], activos: [] };
    }

    console.log('obtenerMisCreditos: Buscando solicitudes para clienteId:', clienteId);
    
    const { data: solicitudes, error: errorSol } = await this.supabaseClient
      .from('solicitudes_credito')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('fecha_solicitud', { ascending: false });

    if (errorSol) console.error('Error fetching solicitudes:', errorSol);
    console.log('obtenerMisCreditos: Solicitudes encontradas:', solicitudes);

    const { data: activos, error: errorAct } = await this.supabaseClient
      .from('creditos_activos')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('fecha_aprobacion', { ascending: false });

    if (errorAct) console.error('Error fetching activos:', errorAct);
    console.log('obtenerMisCreditos: Activos encontrados:', activos);

    const tiendaIds = [...new Set([
      ...(solicitudes || []).map((s: any) => s.tienda_id),
      ...(activos || []).map((a: any) => a.tienda_id)
    ])].filter(Boolean);

    let perfilesMap = new Map();
    if (tiendaIds.length > 0) {
      const { data: tiendas, error: errTiendas } = await this.supabaseClient
        .from('profiles')
        .select('tienda_id, nombre_tienda')
        .in('tienda_id', tiendaIds);

      if (tiendas) {
        tiendas.forEach((t: any) => perfilesMap.set(t.tienda_id, t.nombre_tienda));
      }
    }

    const mapStoreName = (arr: any[]) => {
      return (arr || []).map(item => ({
        ...item,
        nombre_tienda: perfilesMap.get(item.tienda_id) || 'Ferretería'
      }));
    };

    return {
      solicitudes: mapStoreName(solicitudes || []),
      activos: mapStoreName(activos || [])
    };
  }

  // ─────────────────────────────────────────────
  // PEDIDOS
  // ─────────────────────────────────────────────
  async crearPedidos(pedidosPorTienda: any[], direccion: string | null = null): Promise<boolean> {
    const { data: userData } = await this.supabaseClient.auth.getUser();
    if (!userData.user) throw new Error("No user logged in");
    
    for (const pedidoData of pedidosPorTienda) {
      // 1. Insertar pedido principal
      const { data: pedido, error: errPedido } = await this.supabaseClient
        .from('pedidos')
        .insert({
          cliente_id: userData.user.id,
          tienda_id: pedidoData.tiendaId,
          total: pedidoData.subtotal,
          direccion: direccion // Added address
        })
        .select()
        .single();
        
      if (errPedido) {
        console.error('Error creando pedido principal:', errPedido);
        throw new Error(`Error Supabase: ${errPedido.message}`);
      }
      
      // 2. Insertar items
      const itemsToInsert = pedidoData.items.map((i: any) => ({
        pedido_id: pedido.id,
        producto_id: i.product.id,
        nombre_producto: i.product.name,
        cantidad: i.quantity,
        precio_unitario: i.product.minPrice
      }));
      
      const { error: errItems } = await this.supabaseClient
        .from('pedidos_items')
        .insert(itemsToInsert);
        
      if (errItems) {
        console.error('Error insertando items del pedido:', errItems);
        throw new Error(`Error en items (posiblemente producto_id): ${errItems.message}`);
      }
        
      if (errItems) console.error('Error insertando items:', errItems);
    }
    return true;
  }

  async obtenerMisPedidos(): Promise<any[]> {
    const { data: userData } = await this.supabaseClient.auth.getUser();
    if (!userData.user) return [];
    
    const { data, error } = await this.supabaseClient
      .from('pedidos')
      .select('*, pedidos_items(*), tiendas(nombre, telefono)')
      .eq('cliente_id', userData.user.id)
      .order('fecha_pedido', { ascending: false });
      
    if (error) {
      console.error('Error obteniendo mis pedidos:', error);
      return [];
    }
    return data || [];
  }

  async obtenerPedidosTienda(tiendaId: string | number): Promise<any[]> {
    const { data, error } = await this.supabaseClient
      .from('pedidos')
      .select('*, pedidos_items(*)')
      .eq('tienda_id', tiendaId)
      .order('fecha_pedido', { ascending: false });
      
    if (error) {
      console.error('Error obteniendo pedidos de la tienda:', error);
      return [];
    }

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((d: any) => d.cliente_id))];
      if (userIds.length > 0) {
        const { data: perfilesData } = await this.supabaseClient
          .from('profiles')
          .select('id, nombre_completo, avatar_url, telefono, ciudad')
          .in('id', userIds);
          
        if (perfilesData) {
          const perfilesMap = new Map(perfilesData.map((p: any) => [p.id, p]));
          data.forEach((d: any) => {
            const p = perfilesMap.get(d.cliente_id);
            d.profiles = { 
              nombre_completo: p?.nombre_completo || 'Cliente', 
              telefono: p?.telefono || 'Sin teléfono' 
            };
          });
        }
      }
    }

    return data || [];
  }

  async actualizarEstadoPedido(pedidoId: string, estado: 'aprobado' | 'rechazado' | 'entregado', costoEnvio: number = 0): Promise<boolean> {
    // Usamos RPC para saltar restricciones de CORS/RLS de PostgREST en PATCH
    const { error } = await this.supabaseClient.rpc('actualizar_estado_pedido', {
      p_pedido_id: pedidoId,
      p_estado: estado,
      p_costo_envio: costoEnvio
    });
      
    if (error) {
      console.error('Error actualizando pedido:', error);
      throw error;
    }
    return true;
  }

  // ─────────────────────────────────────────────
  // EXPERTOS
  // ─────────────────────────────────────────────
  async getExpertos(tiendaId?: number | string): Promise<any[]> {
    let query = this.supabaseClient.from('expertos').select('*, tiendas(nombre)');
    if (tiendaId) {
      query = query.eq('tienda_id', tiendaId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching expertos:', error);
      return []; 
    }
    return data || [];
  }

  async addExperto(experto: any): Promise<any> {
    const { data, error } = await this.supabaseClient
      .from('expertos')
      .insert(experto)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateExperto(id: string, experto: any): Promise<any> {
    try {
      console.log('Intentando actualizar experto', id, experto);
      const { data, error } = await this.supabaseClient
        .from('expertos')
        .update(experto)
        .eq('id', id)
        .select(); // Quitamos .single() temporalmente por si RLS bloquea y devuelve 0 filas
        
      if (error) {
        console.error('Error desde Supabase (updateExperto):', error);
        throw error;
      }
      return data?.[0] || null;
    } catch (e) {
      console.error('Excepción en updateExperto:', e);
      throw e;
    }
  }
}