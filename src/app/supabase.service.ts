import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Product } from './types';
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
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  // Getter para que otros servicios accedan al cliente sin bracket notation
  get client(): SupabaseClient {
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
    this.cargando.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams();
      if (query) params = params.set('q', query);
      if (city) params = params.set('city', city);
      params = params.set('_t', Date.now().toString());

      const productos = await firstValueFrom(this.http.get<Product[]>(`${environment.apiUrl}/Products`, { params }));
      this.productos.set(productos ?? []);
    } catch {
      await this.cargarProductosFallback();
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarMisProductosApi(): Promise<Product[]> {
    try {
      let params = new HttpParams().set('_t', Date.now().toString());
      const productos = await firstValueFrom(this.http.get<Product[]>(`${environment.apiUrl}/Products/my`, { params }));
      return productos ?? [];
    } catch (err: any) {
      console.error('Error cargando mis productos', err);
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
      const { data, error } = await this.supabaseClient
        .from('tiendas')
        .select(`*, ciudades ( nombre, provincia )`)
        .eq('activa', true);
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
    } catch { /* silencioso: sin datos de fallback */ }
  }

  private async cargarProductosFallback(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient
        .from('productos')
        .select(`*, categorias ( nombre ), inventario ( precio, stock, oferta )`);
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
    } catch { /* silencioso: sin datos de fallback */ }
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
}
