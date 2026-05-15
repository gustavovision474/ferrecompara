import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from './types';
import { SupabaseService, TiendaUI } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // 🔌 Inyectar Servicios
  private supabase = inject(SupabaseService);

  // State
  private _favorites = signal<Set<string>>(new Set());
  private _searchQuery = signal<string>('');
  private _activeTab = signal<'home' | 'search' | 'experts' | 'favorites' | 'profile' | 'stores' | 'cart'>('home');
  private _selectedProductId = signal<string | null>(null);
  private _selectedStoreId = signal<string | null>(null);
  private _userCity = signal<string>('Guayaquil');
  private _isSidebarOpen = signal<boolean>(false);
  
  // Signals de estado local (Sin Auth)
  isAuthenticated = signal<boolean>(false);
  userRole = signal<'cliente' | 'tienda'>('cliente');
  
  // Filters
  private _sortByPrice = signal<boolean>(false);
  private _onlyNearby = signal<boolean>(false);
  private _onlyInStock = signal<boolean>(false);
  
  // Selectors
  readonly products = this.supabase.productos;
  readonly ferreterias = this.supabase.tiendas;
  readonly cargando = this.supabase.cargando;
  readonly favorites = computed(() => Array.from(this._favorites()));
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();
  readonly userCity = this._userCity.asReadonly();
  readonly isSidebarOpen = this._isSidebarOpen.asReadonly();
  readonly sortByPrice = this._sortByPrice.asReadonly();
  readonly onlyNearby = this._onlyNearby.asReadonly();
  readonly onlyInStock = this._onlyInStock.asReadonly();

  readonly filteredFerreterias = computed(() => {
    const tiendas = this.supabase.tiendas();
    const city = this._userCity();
    return tiendas.filter(t => t.city === city || !city);
  });

  readonly favoriteProducts = computed(() => 
    this.supabase.productos().filter(p => this._favorites().has(p.id))
  );

  readonly filteredProducts = computed(() => {
    let prods = this.supabase.productos();
    const query = this._searchQuery().toLowerCase();

    if (query) {
      prods = prods.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query)
      );
    }

    if (this._sortByPrice()) {
      prods = [...prods].sort((a, b) => a.minPrice - b.minPrice);
    }

    return prods;
  });

  readonly selectedProduct = computed(() => 
    this.supabase.productos().find(p => p.id === this._selectedProductId()) || null
  );

  readonly selectedStore = computed(() => 
    this.supabase.tiendas().find(t => t.id === this._selectedStoreId()) || null
  );

  readonly trendingProducts = computed(() => 
    this.supabase.productos().slice(0, 6)
  );

  readonly categories = computed(() => {
    const cats = this.supabase.productos().map(p => p.category);
    return Array.from(new Set(cats));
  });

  private _storeProducts = signal<Product[]>([]);

  readonly storeProducts = this._storeProducts.asReadonly();

  readonly selectedProductOffers = computed(() => {
    const product = this.selectedProduct();
    if (!product) return [];
    
    const currentStore = this.selectedStore();
    if (currentStore) {
      return [{
        store: currentStore.name,
        logo: currentStore.name.charAt(0),
        verified: true,
        distance: currentStore.address || currentStore.city,
        price: product.minPrice,
        minPrice: product.minPrice,
        phone: currentStore.phone,
        stock: 'Disponible',
        isCurrentStore: true,
        latitud: currentStore.latitud,
        longitud: currentStore.longitud,
        direccion: currentStore.address
      }];
    }

    // Buscar ferreterías locales asignadas a la ciudad del usuario
    const tiendasLocales = this.supabase.tiendas().filter(t => !this._userCity() || t.city === this._userCity());
    const tiendaDestacada = tiendasLocales.length > 0 ? tiendasLocales[0] : this.supabase.tiendas()[0];

    if (tiendaDestacada) {
      return [{
        store: tiendaDestacada.name,
        logo: tiendaDestacada.name.charAt(0),
        verified: true,
        distance: tiendaDestacada.address || tiendaDestacada.city,
        price: product.minPrice,
        minPrice: product.minPrice,
        phone: tiendaDestacada.phone,
        stock: 'Disponible',
        isCurrentStore: false,
        latitud: tiendaDestacada.latitud,
        longitud: tiendaDestacada.longitud,
        direccion: tiendaDestacada.address
      }];
    }

    return [{
      store: 'Tienda Local',
      logo: 'F',
      verified: true,
      distance: this._userCity(),
      price: product.minPrice,
      minPrice: product.minPrice,
      phone: '',
      stock: 'Disponible',
      isCurrentStore: false
    }];
  });

  // Actions
  async cargarDatos() {
    await this.supabase.cargarProductos(this._searchQuery(), this._userCity());
    await this.supabase.cargarTiendas(this._userCity());
  }

  setTab(tab: 'home' | 'search' | 'experts' | 'favorites' | 'profile' | 'stores' | 'cart') {
    this._activeTab.set(tab);
    this._selectedProductId.set(null);
    this._selectedStoreId.set(null);
  }

  setAuthenticated(status: boolean) {
    this.isAuthenticated.set(status);
  }

  setUserRole(role: 'cliente' | 'tienda') {
    this.userRole.set(role);
  }

  setSearchQuery(query: string) {
    this._searchQuery.set(query);
  }

  toggleFavorite(productId: string) {
    this._favorites.update(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }

  selectProduct(productId: string | null) {
    this._selectedProductId.set(productId);
    if (productId) {
      this._activeTab.set('search');
    }
  }

  async selectStore(storeId: string | null) {
    this._selectedStoreId.set(storeId);
    if (storeId) {
      this._activeTab.set('stores');
      const storeProducts = await this.supabase.cargarProductosPorTiendaApi(storeId);
      this._storeProducts.set(storeProducts);
    } else {
      this._storeProducts.set([]);
    }
  }

  toggleSidebar(value?: boolean) {
    if (value !== undefined) {
      this._isSidebarOpen.set(value);
    } else {
      this._isSidebarOpen.update(v => !v);
    }
  }

  setSortByPrice(value: boolean) {
    this._sortByPrice.set(value);
  }

  setUserCity(city: string) {
    this._userCity.set(city);
    this.cargarDatos();
  }

  isFavorite(productId: string): boolean {
    return this._favorites().has(productId);
  }
}
