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
    <div class="pb-12 animate-in slide-in-from-right duration-500">
      <!-- Context Header -->
      <div class="bg-white px-4 py-6 border-b border-gray-100">
        <div class="flex items-center gap-2 text-gray-400 mb-2">
          <lucide-icon [name]="ChevronIcon" class="rotate-180" size="18" (click)="store.setTab('home')" class="cursor-pointer"></lucide-icon>
          <span class="text-[10px] font-bold uppercase tracking-widest">
            {{ store.searchQuery() ? 'Resultados para: ' + store.searchQuery() : 'Todos los productos' }}
          </span>
        </div>
        
        @if (store.searchQuery()) {
          <h2 class="text-2xl font-black text-gray-900 leading-tight">
            {{ store.filteredProducts().length }} productos encontrados
          </h2>
        } @else {
          <h2 class="text-2xl font-black text-gray-900 leading-tight">Catálogo Completo</h2>
        }

        @if (store.filteredProducts().length > 0 && store.searchQuery()) {
          <div class="mt-4 bg-orange-50 rounded-xl p-4 flex justify-between items-center border border-orange-100">
            <div class="flex items-center gap-3">
              <div class="bg-[#E8541C] text-white p-2 rounded-lg">
                <lucide-icon [name]="TrendingIcon" size="20"></lucide-icon>
              </div>
              <div>
                <p class="text-[10px] font-bold text-[#E8541C] uppercase tracking-wider">Ahorro Promedio</p>
                <p class="font-black text-lg text-[#E8541C] leading-none">15%</p>
              </div>
            </div>
            <div class="h-8 w-[1px] bg-orange-200"></div>
            <div class="text-right">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Última actualización</p>
              <p class="font-bold text-gray-500 leading-none text-xs">Hace 5 min</p>
            </div>
          </div>
        }
      </div>

      <!-- Filters -->
      <div class="sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100 px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
        <button class="flex items-center gap-2 bg-[#E8541C] text-white px-4 py-2 rounded-full text-[11px] font-bold shadow-lg shadow-orange-100">
          <lucide-icon [name]="FilterIcon" size="14"></lucide-icon>
          Filtros
        </button>
        @for (filter of ['Categoría', 'Marca', 'Precio', 'Distancia']; track filter) {
          <button class="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap active:bg-gray-100">
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
