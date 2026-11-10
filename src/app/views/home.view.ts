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
    <div class="pb-24 animate-in fade-in duration-500 relative max-w-7xl mx-auto">
      <!-- GLOBAL FULLSCREEN LOADER -->
      <div *ngIf="store.cargando() && store.products().length === 0" class="fixed inset-0 z-[999] bg-[#07080b] flex flex-col items-center justify-center">
        <div class="w-14 h-14 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p class="text-xs font-mono font-bold text-zinc-400 mt-4 tracking-widest uppercase animate-pulse">Sincronizando red de precios...</p>
      </div>

      <!-- Hero Banner (Vessa / Code and Chill style) -->
      @if (!store.searchQuery()) {
        <section class="px-4 pt-6">
          <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121520] via-[#0d1017] to-[#07080b] border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <!-- macOS Window Dots & Badge -->
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-red-500/80"></span>
                <span class="w-2 h-2 rounded-full bg-amber-500/80"></span>
                <span class="w-2 h-2 rounded-full bg-emerald-500/80"></span>
                <span class="text-[10px] font-mono text-zinc-500 ml-2">ferrecompara.terminal/live</span>
              </div>
              <span class="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                En Tiempo Real
              </span>
            </div>

            <div class="relative z-10 max-w-xl">
              <h2 class="text-2xl sm:text-3xl font-black leading-tight text-white tracking-tight">
                {{ store.ferreterias().length }} ferreterías locales<br/>conectadas en tu sector
              </h2>
              <p class="text-xs sm:text-sm text-zinc-400 font-medium mt-2">
                Consulta y cotiza materiales al mejor precio entre depósitos y distribuidores verificados.
              </p>
            </div>

            <div class="absolute right-[-20px] top-[-20px] opacity-5 pointer-events-none rotate-12 text-white">
              <lucide-icon [name]="ConstructionIcon" size="220"></lucide-icon>
            </div>
          </div>
        </section>
      }

      <!-- Categories & Filters -->
      <section class="pt-6">
        <div class="flex overflow-x-auto gap-2 px-4 hide-scrollbar">
          <button 
            (click)="store.setSearchQuery('Cemento')"
            [class]="'flex-shrink-0 px-4 py-2 rounded-full font-mono text-xs flex items-center gap-2 transition-all ' + 
              (store.searchQuery() === 'Cemento' 
                ? 'bg-orange-500/15 border border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.25)]' 
                : 'bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20')"
          >
            <lucide-icon [name]="ConstructionIcon" size="14"></lucide-icon>
            Cemento
          </button>
          @for (cat of ['Hierro', 'Pinturas', 'Herramientas', 'Eléctrico', 'Plomería']; track cat) {
            <button 
              (click)="store.setSearchQuery(cat)"
              [class]="'flex-shrink-0 px-4 py-2 rounded-full font-mono text-xs transition-all ' + 
                (store.searchQuery() === cat 
                  ? 'bg-orange-500/15 border border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.25)]' 
                  : 'bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20')"
            >
              {{ cat }}
            </button>
          }
        </div>
      </section>

      <!-- Popular Brands Filters -->
      <section class="px-4 mt-6">
        <div class="flex items-center justify-between mb-2.5 px-1">
          <h3 class="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Marcas Homologadas</h3>
        </div>
        <div class="flex gap-2 overflow-x-auto hide-scrollbar">
          @for (brand of ['Holcim', 'Stanley', 'DeWalt', 'Plastigama', 'Ideal', 'Sika']; track brand) {
            <button 
              (click)="store.setSearchQuery(brand)"
              class="flex-shrink-0 bg-zinc-900/60 border border-white/[0.06] hover:border-white/20 rounded-xl px-3 py-1.5 text-[11px] font-mono font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
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
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="text-lg font-bold text-white tracking-tight">
                {{ 'Resultados para "' + store.searchQuery() + '"' }}
              </h3>
              <p class="text-xs text-zinc-400 font-mono">{{ store.filteredProducts().length }} productos indexados</p>
            </div>
            <button (click)="store.clearFilters()" class="text-orange-400 hover:text-orange-300 font-mono text-xs uppercase underline">
              Restablecer
            </button>
          </div>

          @if (store.filteredProducts().length > 0) {
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              @for (product of store.filteredProducts(); track product.id) {
                <app-product-card [product]="product"></app-product-card>
              }
            </div>
          } @else {
            <div class="py-14 text-center bg-[#0e1118]/60 rounded-3xl border border-white/[0.06]">
              <lucide-icon [name]="FilterIcon" size="36" class="text-zinc-600 mx-auto mb-3"></lucide-icon>
              <p class="text-zinc-400 text-sm font-medium">No se encontraron productos con estos términos.</p>
              <button (click)="store.clearFilters()" class="mt-3 text-orange-400 font-mono text-xs uppercase underline">Limpiar filtros</button>
            </div>
          }
        } @else {
          <!-- Home Mode (Default Most Searched) -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white tracking-tight">Catálogo Destacado</h3>
            <button class="text-orange-400 font-mono text-xs flex items-center gap-1 hover:text-orange-300 transition-colors">
              Ver todo <lucide-icon [name]="ChevronIcon" size="14"></lucide-icon>
            </button>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @if (store.filteredProducts().length === 0) {
              <div class="col-span-4 py-12 text-center text-zinc-500">
                <p class="font-mono text-xs uppercase tracking-widest">No hay productos en esta selección</p>
              </div>
            } @else {
              @for (product of store.filteredProducts(); track product.id) {
                <app-product-card [product]="product"></app-product-card>
              }
            }
          </div>
        }
      </section>

      <!-- Trust Bento Grid -->
      @if (!store.searchQuery()) {
        <section class="px-4 mt-12 grid grid-cols-1 md:grid-cols-3 gap-3">
          @for (item of trustItems; track item.title) {
            <div class="bg-[#0e1118]/80 backdrop-blur-xl p-5 rounded-2xl border border-white/[0.08] hover:border-white/20 transition-all flex items-start gap-4 shadow-sm">
              <div class="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-2.5 rounded-xl shrink-0">
                <lucide-icon [name]="item.icon" size="20"></lucide-icon>
              </div>
              <div>
                <h5 class="font-bold text-sm text-zinc-100">{{ item.title }}</h5>
                <p class="text-xs text-zinc-400 mt-1 leading-relaxed">{{ item.desc }}</p>
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
