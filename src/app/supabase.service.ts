import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Product , CommitResultDto } from './types';
import { firstValueFrom, timeout } from 'rxjs';

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
    // Inicializar inmediatamente con datos disponibles para render instantáneo
    this.tiendas.set(this.obtenerTiendasDemo());
    this.productos.set(this.obtenerProductosDemo());
    console.log('✅ Supabase conectado & catálogo demo listo');
  }

  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  async cargarTiendas(city?: string): Promise<void> {
    const isDemo = localStorage.getItem('ferrecompara_demo_session') !== null;
    if (isDemo) {
      if (this.tiendas().length === 0) {
        this.tiendas.set(this.obtenerTiendasDemo());
      }
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams();
      if (city) params = params.set('city', city);

      const url = `${environment.apiUrl}/Stores`;
      const tiendas = await firstValueFrom(this.http.get<TiendaUI[]>(url, { params }).pipe(timeout(3500)));
      if (tiendas && tiendas.length > 0) {
        this.tiendas.set(tiendas);
      } else {
        await this.cargarTiendasFallback();
      }
    } catch (err: any) {
      console.warn('⚠️ Cargando tiendas fallback...');
      await this.cargarTiendasFallback();
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarProductos(query?: string, city?: string): Promise<void> {
    const isDemo = localStorage.getItem('ferrecompara_demo_session') !== null;
    if (isDemo) {
      if (this.productos().length === 0) {
        this.productos.set(this.obtenerProductosDemo());
      }
      this.cargando.set(false);
      return;
    }

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
      
      const productos = await firstValueFrom(this.http.get<Product[]>(url, { params }).pipe(timeout(3500)));
      console.log('✅ Productos recibidos:', productos?.length || 0);
      if (productos && productos.length > 0) {
        this.productos.set(productos);
      } else {
        await this.cargarProductosFallback();
      }
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
      const productos = await firstValueFrom(
        this.http.get<Product[]>(`${environment.apiUrl}/Products/my`, { params }).pipe(timeout(3500))
      );
      if (productos && productos.length > 0) return productos;
      return this.obtenerProductosPorTiendaDemo('1');
    } catch (err: any) {
      console.warn('Backend o Supabase no disponible para cargarMisProductos, usando modo resiliente', err);
      return this.obtenerProductosPorTiendaDemo('1');
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
      
      if (validos.length === 0) {
        return this.obtenerOfertasDemoPorProducto(productoId);
      }

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
      console.warn('Usando ofertas fallback para producto:', productoId);
      return this.obtenerOfertasDemoPorProducto(productoId);
    }
  }

  obtenerOfertasDemoPorProducto(productoId: string | number): any[] {
    const prod = this.productos().find(p => p.id.toString() === productoId.toString());
    const basePrice = prod?.minPrice || 8.50;
    return [
      {
        storeId: '1',
        store: 'Ferretería Zambrano',
        logo: 'F',
        verified: true,
        distance: 'Av. Los Álamos y Reales Tamarindos, Portoviejo',
        price: basePrice,
        minPrice: basePrice,
        phone: '0983195610',
        stock: 'Disponible',
        isCurrentStore: false,
        latitud: -1.0545,
        longitud: -80.4545,
        direccion: 'Av. Los Álamos y Reales Tamarindos, Portoviejo'
      },
      {
        storeId: '8',
        store: 'El Panameño Ferretero',
        logo: 'E',
        verified: true,
        distance: 'Av. Chile y Bolívar, Portoviejo',
        price: +(basePrice * 1.05).toFixed(2),
        minPrice: +(basePrice * 1.05).toFixed(2),
        phone: '0998888888',
        stock: 'Disponible',
        isCurrentStore: false,
        latitud: -1.0580,
        longitud: -80.4590,
        direccion: 'Av. Chile y Bolívar, Portoviejo'
      },
      {
        storeId: '2',
        store: 'FerriMax',
        logo: 'F',
        verified: true,
        distance: 'Av. 25 de Julio Km 4.5, Guayaquil',
        price: +(basePrice * 1.08).toFixed(2),
        minPrice: +(basePrice * 1.08).toFixed(2),
        phone: '042987654',
        stock: 'Disponible',
        isCurrentStore: false,
        latitud: -2.2200,
        longitud: -79.9000,
        direccion: 'Av. 25 de Julio Km 4.5, Guayaquil'
      }
    ];
  }

  async cargarProductosPorTiendaApi(storeId: string): Promise<Product[]> {
    try {
      let params = new HttpParams().set('_t', Date.now().toString());
      const productos = await firstValueFrom(this.http.get<Product[]>(`${environment.apiUrl}/Products/store/${storeId}`, { params }).pipe(timeout(3000)));
      if (productos && productos.length > 0) return productos;
      return this.obtenerProductosPorTiendaDemo(storeId);
    } catch (err: any) {
      return this.obtenerProductosPorTiendaDemo(storeId);
    }
  }

  obtenerProductosPorTiendaDemo(storeId: string): Product[] {
    const todos = this.obtenerProductosDemo();
    // Variamos un poco los productos según la tienda
    if (storeId === '8') {
      return todos.slice(2, 10);
    } else if (storeId === '2') {
      return todos.slice(1, 9);
    }
    return todos.slice(0, 8);
  }

  async cargarCategorias(): Promise<any[]> {
    try {
      const { data, error } = await this.supabaseClient.from('categorias').select('id, nombre').order('nombre');
      if (error || !data || data.length === 0) {
        return this.obtenerCategoriasDemo();
      }
      return data;
    } catch (err) {
      return this.obtenerCategoriasDemo();
    }
  }

  obtenerCategoriasDemo(): any[] {
    return [
      { id: 1, nombre: 'Cemento y Morteros' },
      { id: 2, nombre: 'Hierro y Acero' },
      { id: 3, nombre: 'Herramientas Eléctricas' },
      { id: 4, nombre: 'Herramientas Manuales' },
      { id: 5, nombre: 'Pinturas y Acabados' },
      { id: 6, nombre: 'Plomería y Tuberías' },
      { id: 7, nombre: 'Electricidad e Iluminación' },
      { id: 8, nombre: 'Mampostería y Techos' }
    ];
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
      if (tiendasUI.length > 0) {
        this.tiendas.set(tiendasUI);
      } else {
        this.tiendas.set(this.obtenerTiendasDemo());
      }
    } catch (err: any) {
      this.tiendas.set(this.obtenerTiendasDemo());
    }
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
      if (productosUI.length > 0) {
        this.productos.set(productosUI);
      } else {
        this.productos.set(this.obtenerProductosDemo());
      }
    } catch (err: any) {
      this.productos.set(this.obtenerProductosDemo());
    }
  }

  obtenerTiendasDemo(): TiendaUI[] {
    return [
      {
        id: '1',
        name: 'Ferretería Zambrano',
        address: 'Av. Los Álamos y Reales Tamarindos',
        city: 'Portoviejo',
        phone: '0983195610',
        rating: 4.8,
        reviews: 234,
        image: 'https://images.unsplash.com/photo-1513467655676-561b7d489a88?q=80&w=600&auto=format&fit=crop',
        status: 'open',
        distance: '0.8 km',
        categories: ['Construcción', 'Herramientas', 'Pinturas'],
        latitud: -1.0545,
        longitud: -80.4545,
        direccion: 'Av. Los Álamos y Reales Tamarindos'
      },
      {
        id: '8',
        name: 'El Panameño Ferretero',
        address: 'Av. Chile y Bolívar',
        city: 'Portoviejo',
        phone: '0998888888',
        rating: 4.6,
        reviews: 180,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&auto=format&fit=crop',
        status: 'open',
        distance: '1.4 km',
        categories: ['Plomería', 'Acabados', 'Eléctricos'],
        latitud: -1.0580,
        longitud: -80.4590,
        direccion: 'Av. Chile y Bolívar'
      },
      {
        id: '2',
        name: 'FerriMax Guayaquil',
        address: 'Av. 25 de Julio Km 4.5',
        city: 'Guayaquil',
        phone: '042987654',
        rating: 4.7,
        reviews: 189,
        image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=600&auto=format&fit=crop',
        status: 'open',
        distance: '2.5 km',
        categories: ['Construcción', 'Hierro', 'Cielorrasos'],
        latitud: -2.2200,
        longitud: -79.9000,
        direccion: 'Av. 25 de Julio Km 4.5'
      },
      {
        id: '4',
        name: 'Megaferretería Quito',
        address: 'Av. 6 de Diciembre N32-145',
        city: 'Quito',
        phone: '022234567',
        rating: 4.8,
        reviews: 312,
        image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=600&auto=format&fit=crop',
        status: 'open',
        distance: '3.1 km',
        categories: ['Ferretería Industrial', 'Maquinaria'],
        latitud: -0.1806,
        longitud: -78.4678,
        direccion: 'Av. 6 de Diciembre N32-145'
      },
      {
        id: '7',
        name: 'Ferretería del Sur',
        address: 'Av. Las Américas y Loja',
        city: 'Cuenca',
        phone: '072345678',
        rating: 4.7,
        reviews: 167,
        image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=600&auto=format&fit=crop',
        status: 'open',
        distance: '1.9 km',
        categories: ['Electricidad', 'Herramientas'],
        latitud: -2.9001,
        longitud: -79.0059,
        direccion: 'Av. Las Américas y Loja'
      },
      {
        id: '9',
        name: 'Disensa Portoviejo Central',
        address: 'Av. Manabí y Calle 10 de Agosto',
        city: 'Portoviejo',
        phone: '0994567890',
        rating: 4.9,
        reviews: 410,
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600&auto=format&fit=crop',
        status: 'open',
        distance: '0.5 km',
        categories: ['Cemento y Morteros', 'Hierro y Acero'],
        latitud: -1.0510,
        longitud: -80.4520,
        direccion: 'Av. Manabí y Calle 10 de Agosto'
      },
      {
        id: '10',
        name: 'Kywi Express Manta',
        address: 'Av. 4 de Noviembre y Calle 119',
        city: 'Manta',
        phone: '052620100',
        rating: 4.8,
        reviews: 256,
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop',
        status: 'open',
        distance: '32 km',
        categories: ['Herramientas', 'Pinturas', 'Jardinería'],
        latitud: -0.9620,
        longitud: -80.7120,
        direccion: 'Av. 4 de Noviembre y Calle 119'
      }
    ];
  }

  obtenerProductosDemo(): Product[] {
    return [
      {
        id: '1',
        name: 'Cemento Holcim Fuerte 50kg',
        brand: 'Holcim',
        minPrice: 7.80,
        maxPrice: 8.50,
        image: '/assets/products/cemento_holcim_bag_1777907525047.png',
        status: 'available',
        category: 'Cemento',
        tag: 'Más Cotizado'
      },
      {
        id: '2',
        name: 'Taladro Percutor DeWalt 20V Max XR Brushless',
        brand: 'DeWalt',
        minPrice: 145.00,
        maxPrice: 160.00,
        image: '/assets/products/taladro_dewalt_product_1777907550093.png',
        status: 'available',
        category: 'Herramientas',
        tag: 'Garantía 3 Años'
      },
      {
        id: '3',
        name: 'Varilla de Acero Corrugada 12mm x 12m',
        brand: 'Novacero',
        minPrice: 9.20,
        maxPrice: 10.10,
        image: '/assets/products/rebar_steel_rods_1777907600147.png',
        status: 'available',
        category: 'Hierro',
        tag: 'Norma INEN'
      },
      {
        id: '4',
        name: 'Pintura Látex Exterior Super Kem-Tone 5 Galones',
        brand: 'Sherwin Williams',
        minPrice: 65.00,
        maxPrice: 72.00,
        image: '/assets/products/pintura_sherwin_bucket_1777907574364.png',
        status: 'available',
        category: 'Pinturas',
        tag: 'Lavable'
      },
      {
        id: '5',
        name: 'Tubo PVC Sanitario Desagüe 4" x 3m con Campana',
        brand: 'Plastigama',
        minPrice: 8.50,
        maxPrice: 9.80,
        image: 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?q=80&w=600&auto=format&fit=crop',
        status: 'available',
        category: 'Plomería'
      },
      {
        id: '6',
        name: 'Amoladora Angular Bosch 4 1/2" 750W GWS 700',
        brand: 'Bosch',
        minPrice: 52.00,
        maxPrice: 58.00,
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=600&auto=format&fit=crop',
        status: 'available',
        category: 'Herramientas'
      },
      {
        id: '7',
        name: 'Bloque de Cemento Alivianado 15x20x40cm',
        brand: 'Prefabricados',
        minPrice: 0.48,
        maxPrice: 0.55,
        image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=600&auto=format&fit=crop',
        status: 'available',
        category: 'Cemento'
      },
      {
        id: '8',
        name: 'Combo Sanitario y Lavamanos Blanco Edesa Glaciar',
        brand: 'Edesa',
        minPrice: 115.00,
        maxPrice: 130.00,
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop',
        status: 'available',
        category: 'Plomería'
      },
      {
        id: '9',
        name: 'Rollo Cable Eléctrico Cobre THHN #12 AWG 100m',
        brand: 'Phelps Dodge',
        minPrice: 42.00,
        maxPrice: 48.00,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop',
        status: 'available',
        category: 'Eléctrico'
      },
      {
        id: '10',
        name: 'Sierra Circular Stanley 7 1/4" 1600W SC16',
        brand: 'Stanley',
        minPrice: 88.00,
        maxPrice: 98.00,
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=600&auto=format&fit=crop',
        status: 'available',
        category: 'Herramientas'
      },
      {
        id: '11',
        name: 'Impermeabilizante Acrílico Techos SikaFill 5kg',
        brand: 'Sika',
        minPrice: 24.50,
        maxPrice: 28.00,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop',
        status: 'available',
        category: 'Pinturas'
      },
      {
        id: '12',
        name: 'Caja de Herramientas Plástica 19" Organizador',
        brand: 'Stanley',
        minPrice: 22.00,
        maxPrice: 26.00,
        image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600&auto=format&fit=crop',
        status: 'available',
        category: 'Herramientas'
      }
    ];
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
    try {
      const { data, error } = await this.supabaseClient
        .from('solicitudes_credito')
        .select('*')
        .eq('tienda_id', tiendaId)
        .order('fecha_solicitud', { ascending: false });

      if (!error && data && data.length > 0) {
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
            const pInfo = perfilesMap.get(d.cliente_id) || { full_name: 'Cliente', avatar_url: '' };
            d.perfiles = pInfo;
            d.profiles = pInfo;
          });
        }
        return data;
      }
    } catch (error) {
      console.warn('obtenerSolicitudesTienda: Error o timeout, usando demo', error);
    }
    return this.obtenerSolicitudesTiendaDemo();
  }

  obtenerSolicitudesTiendaDemo(): any[] {
    return [
      {
        id: 'sol-101',
        cliente_id: 'cli-04',
        monto_solicitado: 600.00,
        plazo_meses: 4,
        ingresos_mensuales: 1100.00,
        fecha_solicitud: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        estado: 'pendiente',
        perfiles: {
          full_name: 'Maestro Jorge Cedeño',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
          telefono: '0991122334',
          ciudad: 'Portoviejo'
        },
        profiles: {
          full_name: 'Maestro Jorge Cedeño',
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
          telefono: '0991122334',
          ciudad: 'Portoviejo'
        }
      }
    ];
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
    try {
      const { data, error } = await this.supabaseClient
        .from('creditos_activos')
        .select('*')
        .eq('tienda_id', tiendaId);
      
      if (!error && data && data.length > 0) {
        const creditos = data;
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
    } catch (err) {
      console.warn('Error en cartera credito Supabase, usando demo', err);
    }
    return this.obtenerCarteraCreditoDemo();
  }

  obtenerCarteraCreditoDemo(): any {
    return {
      totalPrestado: 4850.00,
      cobradoMes: 1280.00,
      carteraVencida: 320.00,
      clientesMora: 1,
      lista: [
        {
          id: 'cred-1',
          cliente_id: 'cli-01',
          nombre_cliente: 'Arq. Juan Cevallos',
          monto_aprobado: 1500.00,
          saldo_pendiente: 420.00,
          plazo_meses: 6,
          tasa_interes: 2.5,
          estado: 'al_dia',
          proxima_cuota: '2026-11-20',
          cuota_mensual: 275.00
        },
        {
          id: 'cred-2',
          cliente_id: 'cli-02',
          nombre_cliente: 'Maestro Pedro Párraga',
          monto_aprobado: 800.00,
          saldo_pendiente: 150.00,
          plazo_meses: 3,
          tasa_interes: 2.0,
          estado: 'al_dia',
          proxima_cuota: '2026-11-15',
          cuota_mensual: 280.00
        },
        {
          id: 'cred-3',
          cliente_id: 'cli-03',
          nombre_cliente: 'Ing. Andrés Moreira',
          monto_aprobado: 1200.00,
          saldo_pendiente: 320.00,
          plazo_meses: 4,
          tasa_interes: 2.5,
          estado: 'en_mora',
          proxima_cuota: '2026-10-30',
          cuota_mensual: 320.00
        }
      ]
    };
  }

  async obtenerConfigCredito(tiendaId: string | number): Promise<any> {
    try {
      const { data, error } = await this.supabaseClient
        .from('creditos_configuracion')
        .select('*')
        .eq('tienda_id', tiendaId)
        .maybeSingle();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Error fetching config credito Supabase, usando demo', e);
    }
    return {
      tasa_interes_mensual: 2.5,
      monto_maximo_credito: 2500,
      plazo_maximo_meses: 6
    };
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
    try {
      const { data: userData } = await this.supabaseClient.auth.getUser();
      const clienteId = userData?.user?.id;
      if (clienteId) {
        const { data: solicitudes } = await this.supabaseClient
          .from('solicitudes_credito')
          .select('*')
          .eq('cliente_id', clienteId)
          .order('fecha_solicitud', { ascending: false });

        const { data: activos } = await this.supabaseClient
          .from('creditos_activos')
          .select('*')
          .eq('cliente_id', clienteId)
          .order('fecha_aprobacion', { ascending: false });

        if ((solicitudes && solicitudes.length > 0) || (activos && activos.length > 0)) {
          const tiendaIds = [...new Set([
            ...(solicitudes || []).map((s: any) => s.tienda_id),
            ...(activos || []).map((a: any) => a.tienda_id)
          ])].filter(Boolean);

          let perfilesMap = new Map();
          if (tiendaIds.length > 0) {
            const { data: tiendas } = await this.supabaseClient
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
      }
    } catch (e) {
      console.warn('Error fetching creditos cliente Supabase, usando demo', e);
    }
    return this.obtenerMisCreditosDemo();
  }

  obtenerMisCreditosDemo(): { solicitudes: any[], activos: any[] } {
    return {
      solicitudes: [
        {
          id: 'sol-cli-201',
          tienda_id: '8',
          nombre_tienda: 'El Panameño Ferretero',
          monto_solicitado: 350.00,
          plazo_meses: 3,
          estado: 'pendiente',
          fecha_solicitud: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
        }
      ],
      activos: [
        {
          id: 'cred-cli-301',
          tienda_id: '1',
          nombre_tienda: 'Ferretería Zambrano',
          monto_aprobado: 500.00,
          saldo_pendiente: 340.00,
          plazo_meses: 6,
          tasa_interes: 2.5,
          estado: 'al_dia',
          proxima_cuota: '2026-11-20',
          fecha_aprobacion: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
        }
      ]
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
    try {
      const { data: userData } = await this.supabaseClient.auth.getUser();
      if (userData?.user) {
        const { data, error } = await this.supabaseClient
          .from('pedidos')
          .select('*, pedidos_items(*), tiendas(nombre, telefono)')
          .eq('cliente_id', userData.user.id)
          .order('fecha_pedido', { ascending: false });
        if (!error && data && data.length > 0) return data;
      }
    } catch (err) {
      console.warn('Error fetching mis pedidos Supabase, usando demo', err);
    }
    return this.obtenerMisPedidosDemo();
  }

  obtenerMisPedidosDemo(): any[] {
    return [
      {
        id: 'ord-cli-101',
        fecha_pedido: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        estado: 'aprobado',
        total: 128.25,
        direccion: 'Av. Reales Tamarindos y Paulo Emilio Macías',
        tiendas: {
          nombre: 'Ferretería Zambrano',
          telefono: '0983195610'
        },
        pedidos_items: [
          { cantidad: 4, nombre_producto: 'Cemento Holcim Fuerte 50kg', precio_unitario: 8.25 },
          { cantidad: 1, nombre_producto: 'Amoladora Angular Bosch 4 1/2" 750W GWS 700', precio_unitario: 54.00 }
        ]
      },
      {
        id: 'ord-cli-102',
        fecha_pedido: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        estado: 'entregado',
        total: 68.40,
        direccion: 'Obra Residencial Los Ceibos, Mz 4 V 12',
        tiendas: {
          nombre: 'El Panameño Ferretero',
          telefono: '0998888888'
        },
        pedidos_items: [
          { cantidad: 6, nombre_producto: 'Varilla de Acero Corrugada 12mm x 12m', precio_unitario: 9.90 },
          { cantidad: 1, nombre_producto: 'Tubo PVC Sanitario Desagüe 4" x 3m con Campana', precio_unitario: 9.00 }
        ]
      },
      {
        id: 'ord-cli-103',
        fecha_pedido: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        estado: 'pendiente',
        total: 72.00,
        direccion: 'Av. Reales Tamarindos y Paulo Emilio Macías',
        tiendas: {
          nombre: 'FerriMax Guayaquil',
          telefono: '042987654'
        },
        pedidos_items: [
          { cantidad: 1, nombre_producto: 'Pintura Látex Exterior Super Kem-Tone 5 Galones', precio_unitario: 72.00 }
        ]
      }
    ];
  }

  async obtenerPedidosTienda(tiendaId: string | number): Promise<any[]> {
    try {
      const { data, error } = await this.supabaseClient
        .from('pedidos')
        .select('*, pedidos_items(*)')
        .eq('tienda_id', tiendaId)
        .order('fecha_pedido', { ascending: false });
        
      if (!error && data && data.length > 0) {
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
        return data;
      }
    } catch (e) {
      console.warn('Error fetching pedidos tienda Supabase, usando demo', e);
    }
    return this.obtenerPedidosDemoTienda();
  }

  obtenerPedidosDemoTienda(): any[] {
    return [
      {
        id: 'ord-1042',
        fecha_pedido: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        estado: 'pendiente',
        total: 64.50,
        direccion: 'Calle Olmedo y Sucre, Obra Edificio Azul',
        profiles: {
          nombre_completo: 'Ing. Marcos Villavicencio',
          telefono: '0987654321'
        },
        pedidos_items: [
          { cantidad: 4, nombre_producto: 'Cemento Holcim Fuerte 50kg', precio_unitario: 8.25 },
          { cantidad: 3, nombre_producto: 'Varilla Corrugada 12mm x 12m', precio_unitario: 10.50 }
        ]
      },
      {
        id: 'ord-1039',
        fecha_pedido: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        estado: 'confirmado',
        total: 145.00,
        direccion: 'Av. América #302, Urbanización Las Colinas',
        profiles: {
          nombre_completo: 'Maestro Jorge Cedeño',
          telefono: '0991122334'
        },
        pedidos_items: [
          { cantidad: 1, nombre_producto: 'Taladro Percutor DeWalt 20V Max XR Brushless', precio_unitario: 145.00 }
        ]
      },
      {
        id: 'ord-1025',
        fecha_pedido: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        estado: 'entregado',
        total: 130.00,
        direccion: 'Retiro directo en local',
        profiles: {
          nombre_completo: 'Lucía Moreira (Cliente)',
          telefono: '0955443322'
        },
        pedidos_items: [
          { cantidad: 2, nombre_producto: 'Pintura Látex Exterior Super Kem-Tone 5 Galones', precio_unitario: 65.00 }
        ]
      }
    ];
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
    const isDemo = localStorage.getItem('ferrecompara_demo_session') !== null;
    if (isDemo) {
      return this.obtenerExpertosDemo(tiendaId);
    }
    try {
      let query = this.supabaseClient.from('expertos').select('*, tiendas(nombre)');
      if (tiendaId) {
        query = query.eq('tienda_id', tiendaId);
      }
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout expertos Supabase')), 2500)
      );
      const res: any = await Promise.race([
        query.order('created_at', { ascending: false }),
        timeoutPromise
      ]);
      if (!res.error && res.data && res.data.length > 0) {
        return res.data;
      }
    } catch (error) {
      console.warn('Error fetching expertos Supabase, usando demo:', error);
    }
    return this.obtenerExpertosDemo(tiendaId);
  }

  obtenerExpertosDemo(tiendaId?: number | string): any[] {
    const todos = [
      {
        id: 'exp-1',
        tienda_id: '1',
        nombre: 'Carlos Mendoza',
        profesion: 'Albañil',
        categoria: 'Albañil',
        telefono: '0987654321',
        bio: 'Especialista en estructuras de hormigón armado, encofrados, fundición de losas y mampostería con más de 12 años de experiencia.',
        rating: 4.9,
        reviews: 42,
        total_resenas: 42,
        foto_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=300&auto=format&fit=crop',
        activo: true,
        verificado: true,
        tiendas: { nombre: 'Ferretería Zambrano' }
      },
      {
        id: 'exp-2',
        tienda_id: '1',
        nombre: 'Miguel Ángel Zambrano',
        profesion: 'Electricista',
        categoria: 'Electricista',
        telefono: '0991122334',
        bio: 'Instalaciones eléctricas residenciales e industriales, tableros de breakers, iluminación LED y certificación SEC.',
        rating: 4.8,
        reviews: 35,
        total_resenas: 35,
        foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
        activo: true,
        verificado: true,
        tiendas: { nombre: 'Ferretería Zambrano' }
      },
      {
        id: 'exp-3',
        tienda_id: '8',
        nombre: 'Luis Alberto Vera',
        profesion: 'Plomero',
        categoria: 'Plomero',
        telefono: '0955443322',
        bio: 'Redes de agua potable, bombas de presión hidroneumáticas, desagües sanitarios y detección no destructiva de fugas.',
        rating: 4.7,
        reviews: 28,
        total_resenas: 28,
        foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
        activo: true,
        verificado: true,
        tiendas: { nombre: 'El Panameño Ferretero' }
      },
      {
        id: 'exp-4',
        tienda_id: '1',
        nombre: 'Roberto Cárdenas',
        profesion: 'Pintor',
        categoria: 'Pintor',
        telefono: '0984455667',
        bio: 'Pintura residencial y comercial, acabados finos en interiores, empaste liso, impermeabilización de terrazas y fachadas.',
        rating: 4.9,
        reviews: 31,
        total_resenas: 31,
        foto_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop',
        activo: true,
        verificado: true,
        tiendas: { nombre: 'Ferretería Zambrano' }
      },
      {
        id: 'exp-5',
        tienda_id: '2',
        nombre: 'Manuel Intriago',
        profesion: 'Carpintero',
        categoria: 'Carpintero',
        telefono: '0993344556',
        bio: 'Muebles de cocina a medida en melamina RH, puertas tamboradas, closets empotrados y encofrados de madera tratada.',
        rating: 4.8,
        reviews: 24,
        total_resenas: 24,
        foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop',
        activo: true,
        verificado: true,
        tiendas: { nombre: 'FerriMax Guayaquil' }
      },
      {
        id: 'exp-6',
        tienda_id: '4',
        nombre: 'Fabricio Macías',
        profesion: 'Soldador',
        categoria: 'Soldador',
        telefono: '0981122889',
        bio: 'Fabricación y montaje de estructuras metálicas pesadas, cubiertas de galvalume, puertas corredizas, rejas y cerrajería.',
        rating: 4.9,
        reviews: 19,
        total_resenas: 19,
        foto_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop',
        activo: true,
        verificado: true,
        tiendas: { nombre: 'Megaferretería Quito' }
      }
    ];

    if (tiendaId != null && tiendaId !== '') {
      const filtrados = todos.filter(e => String(e.tienda_id) === String(tiendaId));
      return filtrados.length > 0 ? filtrados : todos.slice(0, 3);
    }
    return todos;
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
        .select();
        
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
