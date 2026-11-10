import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronRight, TrendingUp, Filter, Search, Star } from 'lucide-angular';
import { StoreService } from '../store.service';
import { ProductCardComponent } from '../components/product-card.component';

@Component({
  selector: 'app-search-results-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ProductCardComponent],
  template: `
    <div class="pb-16 animate-in slide-in-from-right duration-500 max-w-7xl mx-auto">
      <!-- Context Header -->
      <div class="bg-[#0e1118]/85 backdrop-blur-xl px-6 py-6 border-b border-white/[0.08] shadow-lg">
        <div class="flex items-center gap-2 text-zinc-400 mb-2 font-mono">
          <lucide-icon [name]="ChevronIcon" class="rotate-180 cursor-pointer text-orange-400" size="16" (click)="store.setTab('home')"></lucide-icon>
          <span class="text-[10px] uppercase tracking-widest text-zinc-400">
            {{ store.searchQuery() ? 'Resultados para: ' + store.searchQuery() : 'Todos los productos' }}
          </span>
        </div>
        
        @if (store.searchQuery()) {
          <h2 class="text-2xl font-black text-white leading-tight">
            {{ store.filteredProducts().length }} productos indexados
          </h2>
        } @else {
          <h2 class="text-2xl font-black text-white leading-tight">Catálogo General</h2>
        }

        @if (store.filteredProducts().length > 0 && store.searchQuery()) {
          <div class="mt-4 bg-orange-500/10 rounded-2xl p-4 flex justify-between items-center border border-orange-500/30">
            <div class="flex items-center gap-3">
              <div class="bg-orange-500/20 text-orange-400 p-2 rounded-xl">
                <lucide-icon [name]="TrendingIcon" size="18"></lucide-icon>
              </div>
              <div>
                <p class="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-wider">Ahorro Promedio</p>
                <p class="font-mono font-bold text-lg text-white leading-none">15%</p>
              </div>
            </div>
            <div class="h-8 w-[1px] bg-white/10"></div>
            <div class="text-right">
              <p class="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Sincronización</p>
              <p class="font-mono text-zinc-400 leading-none text-xs">En vivo</p>
            </div>
          </div>
        }
      </div>

      <!-- Filters -->
      <div class="sticky top-0 bg-[#07080b]/85 backdrop-blur-xl z-30 border-b border-white/[0.08] px-6 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
        <button class="flex items-center gap-2 bg-orange-500/15 border border-orange-500/40 text-orange-400 px-4 py-2 rounded-full text-xs font-mono font-bold shadow-[0_0_12px_rgba(249,115,22,0.2)]">
          <lucide-icon [name]="FilterIcon" size="13"></lucide-icon>
          Filtros
        </button>
        @for (filter of ['Categoría', 'Marca', 'Precio', 'Distancia']; track filter) {
          <button class="bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white px-4 py-2 rounded-full text-xs font-mono whitespace-nowrap active:bg-zinc-800 transition-colors">
            {{ filter }}
          </button>
        }
      </div>

      <!-- Results Grid -->
      <div class="px-4 py-6">
        @if (store.filteredProducts().length > 0) {
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            @for (product of store.filteredProducts(); track product.id) {
              <app-product-card [product]="product"></app-product-card>
            }
          </div>
        } @else {
          <div class="py-20 text-center animate-in zoom-in duration-500">
            <div class="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <lucide-icon [name]="SearchIcon" size="40" class="text-gray-300"></lucide-icon>
            </div>
            <h3 class="font-black text-gray-900 text-lg">No encontramos resultados</h3>
            <p class="text-sm text-gray-500 mt-2 max-w-xs mx-auto">Prueba con palabras más generales como "cemento" o "herramientas".</p>
            <button 
              (click)="store.setSearchQuery('')"
              class="mt-8 text-[#E8541C] font-black text-sm uppercase tracking-widest"
            >
              LIMPIAR BÚSQUEDA
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class SearchResultsViewComponent {
  protected store = inject(StoreService);

  readonly ChevronIcon = ChevronRight;
  readonly TrendingIcon = TrendingUp;
  readonly FilterIcon = Filter;
  readonly SearchIcon = Search;
  readonly StarIcon = Star;
}
