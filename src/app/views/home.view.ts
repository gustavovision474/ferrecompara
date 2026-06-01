import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Construction, ChevronRight, TrendingUp, Navigation, Star, MapPin, Package, Filter } from 'lucide-angular';
import { ProductCardComponent } from '../components/product-card.component';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-home-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ProductCardComponent],
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  template: `
    <div class="pb-12 animate-in fade-in duration-500 relative">
      <!-- GLOBAL FULLSCREEN LOADER -->
      <div *ngIf="store.cargando()" class="fixed inset-0 z-[999] bg-gray-50 flex flex-col items-center justify-center">
        <div class="w-16 h-16 border-4 border-[#E8541C] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-black text-gray-400 mt-4 tracking-widest uppercase animate-pulse">Cargando...</p>
      </div>
      <!-- Banner (Only show when not searching) -->
      @if (!store.searchQuery()) {
        <section class="px-4 pt-6">
          <div class="relative overflow-hidden rounded-2xl bg-[#E8541C] text-white p-6 shadow-xl min-h-[160px] flex flex-col justify-center">
            <div class="relative z-10">
              <span class="bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block">Cerca de ti</span>
              <h2 class="text-2xl font-black leading-tight mb-1">
                {{ store.ferreterias().length }} ferreterías<br/>conectadas en tu zona
              </h2>
              <p class="text-sm text-white/90 font-medium">Compara precios en tiempo real y ahorra hoy.</p>
            </div>
            <div class="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none rotate-12">
              <lucide-icon [name]="ConstructionIcon" size="200"></lucide-icon>
            </div>
          </div>
        </section>
      }

      <!-- Categories & Filters (Always show) -->
      <section class="pt-8">
        <div class="flex overflow-x-auto gap-3 px-4 hide-scrollbar">
          <button 
            (click)="store.setSearchQuery('Cemento')"
            [class]="'flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all ' + (store.searchQuery() === 'Cemento' ? 'bg-[#E8541C] text-white shadow-lg shadow-orange-100' : 'bg-white border border-gray-200 text-on-surface hover:bg-gray-50')"
          >
            <lucide-icon [name]="ConstructionIcon" size="18"></lucide-icon>
            Cemento
          </button>
          @for (cat of ['Hierro', 'Pinturas', 'Herramientas', 'Eléctrico', 'Plomería']; track cat) {
            <button 
              (click)="store.setSearchQuery(cat)"
              [class]="'flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all ' + (store.searchQuery() === cat ? 'bg-[#E8541C] text-white shadow-lg shadow-orange-100' : 'bg-white border border-gray-200 text-on-surface hover:bg-gray-50')"
            >
              {{ cat }}
            </button>
          }
        </div>
      </section>



      <!-- Popular Brands Filters -->
      <section class="px-4 mt-6">
        <div class="flex items-center justify-between mb-3 px-1">
          <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Marcas Populares</h3>
        </div>
        <div class="flex gap-2 overflow-x-auto hide-scrollbar">
          @for (brand of ['Holcim', 'Stanley', 'DeWalt', 'Plastigama', 'Ideal', 'Sika']; track brand) {
            <button 
              (click)="store.setSearchQuery(brand)"
              class="flex-shrink-0 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-[11px] font-bold text-gray-500 active:bg-gray-200 transition-colors"
            >
              {{ brand }}
            </button>
          }
        </div>
      </section>

      <!-- Main Content -->
      <section class="px-4 mt-8">
        @if (store.searchQuery()) {
          <!-- Results Mode -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-black text-on-surface">
                {{ store.searchQuery() ? 'Resultados para "' + store.searchQuery() + '"' : 'Productos filtrados' }}
              </h3>
              <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">{{ store.filteredProducts().length }} productos encontrados</p>
            </div>
          </div>

          @if (store.filteredProducts().length > 0) {
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              @for (product of store.filteredProducts(); track product.id) {
                <app-product-card [product]="product"></app-product-card>
              }
            </div>
          } @else {
            <div class="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
              <lucide-icon [name]="FilterIcon" size="48" class="text-gray-200 mx-auto mb-4"></lucide-icon>
              <p class="text-gray-400 font-bold">No se encontraron productos con estos filtros.</p>
              <button (click)="store.clearFilters()" class="mt-4 text-[#E8541C] font-black text-xs uppercase underline">Limpiar filtros</button>
            </div>
          }
        } @else {
          <!-- Home Mode (Default Most Searched) -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-black text-on-surface">Productos más buscados</h3>
            <button class="text-[#E8541C] font-bold text-sm flex items-center gap-1 group">
              Ver todo <lucide-icon [name]="ChevronIcon" size="16" class="group-hover:translate-x-1 transition-transform"></lucide-icon>
            </button>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @if (store.filteredProducts().length === 0) {
              <div class="col-span-4 py-12 text-center text-gray-400">
                <p class="font-black text-xs uppercase tracking-widest">No se encontraron productos</p>
              </div>
            } @else {
              @for (product of store.filteredProducts(); track product.id) {
                <app-product-card [product]="product"></app-product-card>
              }
            }
          </div>
        }
      </section>

      <!-- Trust Bento Grid (Only show when not searching) -->
      @if (!store.searchQuery()) {
        <section class="px-4 mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (item of trustItems; track item.title) {
            <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-start gap-4">
              <div class="bg-orange-100 text-[#E8541C] p-3 rounded-xl">
                <lucide-icon [name]="item.icon" size="24"></lucide-icon>
              </div>
              <div>
                <h5 class="font-bold text-sm">{{ item.title }}</h5>
                <p class="text-xs text-gray-500 mt-1">{{ item.desc }}</p>
              </div>
            </div>
          }
        </section>
      }
    </div>
  `
})
export class HomeViewComponent implements OnInit {
  protected store = inject(StoreService);
  // Los productos ahora vienen del signal store.filteredProducts (API de C# vía SupabaseService)
  
  // UI State
  isFilterMenuOpen = false;

  ngOnInit() {
    this.store.cargarDatos();
  }

  readonly ConstructionIcon = Construction;
  readonly ChevronIcon = ChevronRight;
  readonly TrendingIcon = TrendingUp;
  readonly PinIcon = MapPin;
  readonly StarIcon = Star;
  readonly BoxIcon = Package;
  readonly FilterIcon = Filter;

  readonly trustItems = [
    { title: 'Precios Transparentes', desc: 'Compara precios finales sin comisiones ocultas.', icon: TrendingUp },
    { title: 'Logística Directa', desc: 'Coordinación directa con el flete de la ferretería.', icon: Navigation },
    { title: 'Compra Segura', desc: 'Solo ferreterías calificadas y verificadas.', icon: Star }
  ];

  toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }
}
