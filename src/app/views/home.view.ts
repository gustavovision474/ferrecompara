import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Construction, ChevronRight, TrendingUp, Navigation, Star, MapPin, Package, Filter, Search, Terminal, Activity, Wifi, Battery } from 'lucide-angular';
import { ProductCardComponent } from '../components/product-card.component';
import { StoreService } from '../store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ProductCardComponent, FormsModule],
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    @keyframes pulse-slow {
      0%, 100% { transform: scale(1); opacity: 0.9; }
      50% { transform: scale(1.04); opacity: 1; }
    }
    .animate-radar-pulse {
      animation: pulse-slow 4s ease-in-out infinite;
    }
  `],
  template: `
    <div class="pb-28 animate-in fade-in duration-500 relative max-w-5xl mx-auto px-4 sm:px-6">
      <!-- GLOBAL FULLSCREEN LOADER -->
      <div *ngIf="store.cargando() && store.products().length === 0" class="fixed inset-0 z-[999] bg-[#07080b] flex flex-col items-center justify-center">
        <div class="w-14 h-14 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p class="text-xs font-mono font-bold text-zinc-400 mt-4 tracking-widest uppercase animate-pulse">Sincronizando red de precios...</p>
      </div>

      <!-- ======================================================== -->
      <!-- VESSA / CODE AND CHILL SCREEN HEADER BAR                -->
      <!-- ======================================================== -->
      <div class="flex items-center justify-between py-3 border-b border-white/[0.06] font-mono text-xs text-zinc-400 mt-2">
        <!-- macOS Window Dots -->
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/90 shadow-[0_0_8px_rgba(255,95,86,0.6)]"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/90 shadow-[0_0_8px_rgba(255,189,46,0.6)]"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-[#27c93f]/90 shadow-[0_0_8px_rgba(39,201,63,0.6)]"></span>
        </div>

        <!-- Center Tech Stack Tabs (As seen in Code and Chill) -->
        <div class="flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-zinc-400">
          <span class="hover:text-white cursor-pointer transition-colors" (click)="activeTechTab.set('asc')" [class.text-white]="activeTechTab() === 'asc'">ASC</span>
          <span class="hover:text-white cursor-pointer transition-colors" (click)="activeTechTab.set('html')" [class.text-white]="activeTechTab() === 'html'">HTML</span>
          <span class="hover:text-white cursor-pointer transition-colors" (click)="activeTechTab.set('css')" [class.text-white]="activeTechTab() === 'css'">CSS</span>
          <span class="hover:text-white cursor-pointer transition-colors" (click)="activeTechTab.set('js')" [class.text-white]="activeTechTab() === 'js'">JS</span>
        </div>

        <!-- Right System Indicators -->
        <div class="flex items-center gap-2 text-zinc-500">
          <span class="text-[10px]">09:41</span>
          <lucide-icon [name]="WifiIcon" size="12"></lucide-icon>
          <lucide-icon [name]="BatteryIcon" size="14"></lucide-icon>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- ICONIC "Home" TITLE & FLOATING CAPSULE BAR              -->
      <!-- ======================================================== -->
      <div class="text-center pt-8 pb-4">
        <h1 class="text-5xl sm:text-7xl font-bold tracking-tight text-white font-sans drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          Home
        </h1>
        <p class="text-xs font-mono text-zinc-400 mt-2 uppercase tracking-widest">
          Red de Suministro Ferretero en Tiempo Real
        </p>

        <!-- Floating Capsule Pill Search (Exact match to Vessa photo) -->
        <div class="max-w-md mx-auto mt-6">
          <div class="relative flex items-center bg-[#0d1017]/95 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div class="flex items-center gap-2 pl-3 flex-1">
              <lucide-icon [name]="SearchIcon" class="text-zinc-400" size="16"></lucide-icon>
              <input 
                [ngModel]="store.searchQuery()"
                (ngModelChange)="store.setSearchQuery($event)"
                class="w-full bg-transparent text-xs font-mono text-white placeholder-zinc-500 outline-none pr-2"
                placeholder="Buscar cemento, varillas, taladro..." 
                type="text" 
              />
            </div>
            <button 
              *ngIf="store.searchQuery()"
              (click)="store.clearFilters()"
              class="text-zinc-500 hover:text-white p-1 text-xs font-mono mr-1"
            >
              ✕
            </button>
            <button 
              class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] active:scale-95"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- GOLDEN RADIAL SPIDER CLOCK / NETWORK (From left screen)  -->
      <!-- ======================================================== -->
      @if (!store.searchQuery()) {
        <section class="my-8">
          <div class="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#11131a] via-[#090b10] to-[#06070a] border border-white/[0.08] p-6 sm:p-8 shadow-2xl flex flex-col items-center">
            
            <!-- Dial Header -->
            <div class="w-full flex items-center justify-between pb-3 border-b border-white/[0.06] text-[10px] font-mono text-zinc-500 mb-6">
              <span class="uppercase tracking-widest text-amber-400/90 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Mesh Radar / 12 Nodos Activos
              </span>
              <span>LATAM: ECUADOR (USD)</span>
            </div>

            <!-- Radial Spider / Clock Graphic -->
            <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center animate-radar-pulse">
              <!-- Golden Orbital Rings -->
              <div class="absolute inset-0 rounded-full border border-amber-500/20"></div>
              <div class="absolute inset-8 rounded-full border border-amber-500/15 border-dashed"></div>
              <div class="absolute inset-16 rounded-full border border-amber-500/10"></div>
              
              <!-- Subtle radial golden glow in center -->
              <div class="absolute w-24 h-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none"></div>

              <!-- Numbers 1 through 12 in radial arrangement -->
              <span class="absolute top-1 font-mono text-xs font-bold text-amber-300">12</span>
              <span class="absolute top-5 right-14 font-mono text-xs font-bold text-amber-300/80">1</span>
              <span class="absolute top-16 right-5 font-mono text-xs font-bold text-amber-300/80">2</span>
              <span class="absolute right-2 font-mono text-xs font-bold text-amber-300">3</span>
              <span class="absolute bottom-16 right-5 font-mono text-xs font-bold text-amber-300/80">4</span>
              <span class="absolute bottom-5 right-14 font-mono text-xs font-bold text-amber-300/80">5</span>
              <span class="absolute bottom-1 font-mono text-xs font-bold text-amber-300">6</span>
              <span class="absolute bottom-5 left-14 font-mono text-xs font-bold text-amber-300/80">7</span>
              <span class="absolute bottom-16 left-5 font-mono text-xs font-bold text-amber-300/80">8</span>
              <span class="absolute left-2 font-mono text-xs font-bold text-amber-300">9</span>
              <span class="absolute top-16 left-5 font-mono text-xs font-bold text-amber-300/80">10</span>
              <span class="absolute top-5 left-14 font-mono text-xs font-bold text-amber-300/80">11</span>

              <!-- Central Golden Spider / Nexus SVG -->
              <svg class="w-32 h-32 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]" viewBox="0 0 100 100" fill="none">
                <!-- Center Core Node -->
                <circle cx="50" cy="50" r="5" fill="#fbbf24" />
                <circle cx="50" cy="50" r="8" stroke="#fbbf24" stroke-width="0.8" opacity="0.6" />
                
                <!-- Spider / Filament Arms connecting to nodes -->
                <line x1="50" y1="50" x2="50" y2="15" stroke="#fbbf24" stroke-width="1" opacity="0.7" />
                <line x1="50" y1="50" x2="75" y2="25" stroke="#fbbf24" stroke-width="0.9" opacity="0.6" />
                <line x1="50" y1="50" x2="85" y2="50" stroke="#fbbf24" stroke-width="1" opacity="0.7" />
                <line x1="50" y1="50" x2="75" y2="75" stroke="#fbbf24" stroke-width="0.9" opacity="0.6" />
                <line x1="50" y1="50" x2="50" y2="85" stroke="#fbbf24" stroke-width="1" opacity="0.7" />
                <line x1="50" y1="50" x2="25" y2="75" stroke="#fbbf24" stroke-width="0.9" opacity="0.6" />
                <line x1="50" y1="50" x2="15" y2="50" stroke="#fbbf24" stroke-width="1" opacity="0.7" />
                <line x1="50" y1="50" x2="25" y2="25" stroke="#fbbf24" stroke-width="0.9" opacity="0.6" />

                <!-- Spider Joint Web Connections -->
                <polygon points="50,28 65,36 72,50 65,64 50,72 35,64 28,50 35,36" stroke="#fbbf24" stroke-width="0.6" opacity="0.4" fill="none" />
                <polygon points="50,38 58,43 62,50 58,57 50,62 42,57 38,50 42,43" stroke="#fbbf24" stroke-width="0.8" opacity="0.5" fill="none" />

                <!-- Micro Store Dots -->
                <circle cx="50" cy="15" r="2.5" fill="#fbbf24" />
                <circle cx="75" cy="25" r="2.5" fill="#fbbf24" />
                <circle cx="85" cy="50" r="2.5" fill="#fbbf24" />
                <circle cx="75" cy="75" r="2.5" fill="#fbbf24" />
                <circle cx="50" cy="85" r="2.5" fill="#fbbf24" />
                <circle cx="25" cy="75" r="2.5" fill="#fbbf24" />
                <circle cx="15" cy="50" r="2.5" fill="#fbbf24" />
                <circle cx="25" cy="25" r="2.5" fill="#fbbf24" />
              </svg>
            </div>

            <!-- Live Status Ticker -->
            <div class="mt-4 text-center">
              <span class="text-xs font-mono font-bold text-zinc-300">
                {{ store.ferreterias().length }} Ferreterías conectadas en {{ store.userCity() }}
              </span>
              <p class="text-[11px] font-mono text-zinc-500 mt-0.5">
                Precios de Holcim, Novacero, Plastigama y DeWalt sincronizados al instante
              </p>
            </div>
          </div>
        </section>
      }

      <!-- ======================================================== -->
      <!-- 3 CODE / TERMINAL CARDS (INDEX.PHP, STYLE.CSS, APP.JS)  -->
      <!-- ======================================================== -->
      @if (!store.searchQuery()) {
        <section class="grid grid-cols-1 md:grid-cols-3 gap-3 my-6">
          
          <!-- Card 1: INDEX.PHP (Cyan Dot) -->
          <div class="bg-[#0b0d13]/90 backdrop-blur-xl border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl p-4 font-mono text-xs transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(6,182,212,0.1)]">
            <div class="flex items-center gap-2 pb-2 mb-3 border-b border-white/[0.06] text-cyan-400">
              <span class="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
              <span class="text-[10px] uppercase font-bold tracking-wider">INDEX.PHP · SUPPLY QUERY</span>
            </div>
            <pre class="text-[11px] leading-relaxed text-zinc-400 overflow-x-auto hide-scrollbar"><code><span class="text-cyan-300">&lt;?php</span>
<span class="text-zinc-500">// Consulta en tiempo real</span>
<span class="text-yellow-400">$mesh</span> = FerreCompara::<span class="text-blue-400">node</span>();
<span class="text-yellow-400">$rates</span> = <span class="text-yellow-400">$mesh</span>-&gt;<span class="text-blue-400">getBestRates</span>([
  <span class="text-emerald-400">'sku'</span> =&gt; <span class="text-emerald-400">'HOLCIM-50KG'</span>,
  <span class="text-emerald-400">'zone'</span> =&gt; <span class="text-emerald-400">'{{ store.userCity() }}'</span>
]);
<span class="text-orange-400">return</span> <span class="text-yellow-400">$rates</span>-&gt;<span class="text-blue-400">min</span>(); <span class="text-zinc-500">// $7.80</span>
<span class="text-cyan-300">?&gt;</span></code></pre>
          </div>

          <!-- Card 2: STYLE.CSS (Purple Dot) -->
          <div class="bg-[#0b0d13]/90 backdrop-blur-xl border border-white/[0.08] hover:border-purple-500/40 rounded-2xl p-4 font-mono text-xs transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(168,85,247,0.1)]">
            <div class="flex items-center gap-2 pb-2 mb-3 border-b border-white/[0.06] text-purple-400">
              <span class="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
              <span class="text-[10px] uppercase font-bold tracking-wider">STYLE.CSS · DESIGN TOKENS</span>
            </div>
            <pre class="text-[11px] leading-relaxed text-zinc-400 overflow-x-auto hide-scrollbar"><code><span class="text-purple-300">:root</span> {{ '{' }}
  <span class="text-zinc-500">/* Luxury Dark Theme Vessa */</span>
  <span class="text-purple-400">--bg-terminal</span>: <span class="text-amber-300">#07080b</span>;
  <span class="text-purple-400">--primary-glow</span>: <span class="text-amber-300">#ea580c</span>;
  <span class="text-purple-400">--iva-ecuador</span>: <span class="text-emerald-400">15%</span>;
  <span class="text-purple-400">--glass-blur</span>: <span class="text-cyan-300">24px</span>;
  <span class="text-purple-400">--border-subtle</span>: <span class="text-zinc-500">rgba(255,255,255,0.08)</span>;
{{ '}' }}</code></pre>
          </div>

          <!-- Card 3: APP.JS (Rose/Pink Dot) -->
          <div class="bg-[#0b0d13]/90 backdrop-blur-xl border border-white/[0.08] hover:border-rose-500/40 rounded-2xl p-4 font-mono text-xs transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(244,63,94,0.1)]">
            <div class="flex items-center gap-2 pb-2 mb-3 border-b border-white/[0.06] text-rose-400">
              <span class="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
              <span class="text-[10px] uppercase font-bold tracking-wider">APP.JS · REALTIME SRI WS</span>
            </div>
            <pre class="text-[11px] leading-relaxed text-zinc-400 overflow-x-auto hide-scrollbar"><code><span class="text-rose-400">const</span> ws = <span class="text-rose-400">new</span> <span class="text-blue-400">WebSocket</span>(<span class="text-emerald-400">'wss://sri.ec/v2'</span>);
ws.<span class="text-blue-400">on</span>(<span class="text-emerald-400">'rate_change'</span>, (<span class="text-yellow-400">e</span>) =&gt; {{ '{' }}
  <span class="text-yellow-400">cpp</span>.<span class="text-blue-400">recalculate</span>(<span class="text-yellow-400">e</span>.delta);
  <span class="text-blue-400">notifyStore</span>(<span class="text-emerald-400">'Stock óptimo garantizado'</span>);
{{ '}' }});
<span class="text-zinc-500">// Status: 200 OK connected</span></code></pre>
          </div>

        </section>
      }

      <!-- ======================================================== -->
      <!-- CATEGORY PILLS (High Density Micro-pills)                -->
      <!-- ======================================================== -->
      <section class="pt-4">
        <div class="flex items-center justify-between mb-2 px-1">
          <h3 class="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Líneas de Material</h3>
        </div>
        <div class="flex overflow-x-auto gap-2 hide-scrollbar">
          <button 
            (click)="store.setSearchQuery('Cemento')"
            [class]="'flex-shrink-0 px-4 py-2 rounded-full font-mono text-xs flex items-center gap-2 transition-all ' + 
              (store.searchQuery() === 'Cemento' 
                ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
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
                  ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                  : 'bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20')"
            >
              {{ cat }}
            </button>
          }
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- POPULAR BRANDS                                           -->
      <!-- ======================================================== -->
      <section class="mt-5">
        <div class="flex items-center justify-between mb-2 px-1">
          <h3 class="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Fabricantes Verificados</h3>
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

      <!-- ======================================================== -->
      <!-- PRODUCT GRID (Vessa Luxury Dark Cards)                   -->
      <!-- ======================================================== -->
      <section class="mt-8">
        @if (store.searchQuery()) {
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
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white tracking-tight">Catálogo Destacado</h3>
            <span class="text-xs font-mono text-zinc-500">
              Precios en tiempo real
            </span>
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
        <section class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-3">
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
  
  // Tab selector for ASC, HTML, CSS, JS
  activeTechTab = signal<'asc' | 'html' | 'css' | 'js'>('asc');

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
  readonly SearchIcon = Search;
  readonly TerminalIcon = Terminal;
  readonly ActivityIcon = Activity;
  readonly WifiIcon = Wifi;
  readonly BatteryIcon = Battery;

  readonly trustItems = [
    { title: 'Precios Transparentes', desc: 'Compara precios finales sin comisiones ocultas.', icon: TrendingUp },
    { title: 'Logística Directa', desc: 'Coordinación directa con el flete de la ferretería.', icon: Navigation },
    { title: 'Compra Segura', desc: 'Solo ferreterías calificadas y verificadas.', icon: Star }
  ];
}
