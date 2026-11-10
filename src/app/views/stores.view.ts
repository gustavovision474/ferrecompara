import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Star, MapPin, Phone, MessageCircle, Navigation, Search } from 'lucide-angular';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-stores-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="pb-24 animate-in fade-in duration-500 relative max-w-7xl mx-auto">
      <!-- GLOBAL FULLSCREEN LOADER -->
      <div *ngIf="store.cargando() && store.ferreterias().length === 0" class="fixed inset-0 z-[999] bg-[#07080b] flex flex-col items-center justify-center">
        <div class="w-14 h-14 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p class="text-xs font-mono font-bold text-zinc-400 mt-4 tracking-widest uppercase animate-pulse">Cargando red de tiendas...</p>
      </div>

      <!-- Header with macOS style window dots -->
      <section class="px-6 pt-6 pb-4">
        <div class="flex items-center gap-1.5 mb-2">
          <span class="w-2 h-2 rounded-full bg-red-500/80"></span>
          <span class="w-2 h-2 rounded-full bg-amber-500/80"></span>
          <span class="w-2 h-2 rounded-full bg-emerald-500/80"></span>
          <span class="text-[10px] font-mono text-zinc-500 ml-2">ferrecompara.terminal/stores</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-white leading-tight">Ferreterías en {{ store.userCity() }}</h1>
        <p class="text-xs sm:text-sm font-medium text-zinc-400 mt-1">Directorio de sucursales autorizadas y centros de distribución.</p>
      </section>

      <!-- Search Bar -->
      <div class="px-6 mt-1 mb-4">
        <div class="relative w-full">
          <input 
            class="w-full h-11 bg-zinc-900/90 border border-white/10 rounded-full pl-11 pr-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 outline-none transition-all shadow-inner text-xs font-mono text-zinc-100 placeholder-zinc-500" 
            placeholder="Filtrar por nombre o dirección..." 
            type="text" 
          />
          <lucide-icon [name]="SearchIcon" class="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size="16"></lucide-icon>
        </div>
      </div>

      <!-- MAPA REAL EMBEBIDO (Dark container) -->
      <section class="px-6 mb-6">
        <div class="bg-[#0b0d14] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative h-[300px] w-full">
          <iframe 
            width="100%" 
            height="100%" 
            frameborder="0" 
            scrolling="no" 
            marginheight="0" 
            marginwidth="0" 
            src="https://www.openstreetmap.org/export/embed.html?bbox=-80.4850%2C-1.0750%2C-80.4250%2C-1.0350&amp;layer=mapnik" 
            class="w-full h-full absolute inset-0 filter invert-[0.9] hue-rotate-[180deg] contrast-[1.2] opacity-80"
          ></iframe>

          <!-- Indicador Flotante Superior -->
          <div class="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none z-10">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
            <span class="text-[9px] font-mono font-bold text-zinc-200 uppercase tracking-wider">Radar: {{ store.userCity() }}</span>
          </div>

          <!-- Capa Informativa Inferior -->
          <div class="absolute bottom-4 left-4 right-4 bg-[#0d1017]/90 backdrop-blur-xl rounded-2xl p-3 border border-white/10 shadow-xl flex items-center justify-between z-10">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                <lucide-icon [name]="PinIcon" size="16" class="text-orange-400"></lucide-icon>
              </div>
              <div>
                <p class="text-[10px] font-bold text-white uppercase tracking-tight">Red de Distribuidores</p>
                <p class="text-[10px] font-mono text-zinc-400">{{ store.ferreterias().length }} Locales activos en {{ store.userCity() }}</p>
              </div>
            </div>
            <button (click)="abrirMapaGrande()" class="bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-400 text-[10px] font-mono font-bold px-3 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.15)]">
              Ampliar Mapa
            </button>
          </div>
        </div>
      </section>

      <!-- Stores List -->
      <section class="px-6 space-y-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">Locales Disponibles</h2>
          <span class="text-[10px] font-mono text-zinc-400">{{ store.filteredFerreterias().length }} Tiendas</span>
        </div>

        @for (item of store.filteredFerreterias(); track item.id) {
          <div 
            (click)="store.selectStore(item.id)"
            class="bg-[#0e1118]/85 backdrop-blur-xl border border-white/[0.08] hover:border-white/20 rounded-3xl p-5 shadow-lg transition-all duration-300 group cursor-pointer relative mb-4 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
          >
            <div class="flex gap-4">
              <img [src]="item.image" (error)="$any($event.target).src='https://images.unsplash.com/photo-1513467655676-561b7d489a88?q=80&w=600&auto=format&fit=crop'" class="w-20 h-20 rounded-2xl object-cover shadow-sm border border-white/5 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity" />
              
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start gap-2">
                  <div class="min-w-0">
                    <h3 class="font-bold text-base text-white leading-tight truncate group-hover:text-orange-400 transition-colors">{{ item.name }}</h3>
                    <div class="flex items-center gap-1.5 mt-1 text-zinc-400">
                      <lucide-icon [name]="PinIcon" size="12" class="shrink-0 text-zinc-500"></lucide-icon>
                      <span class="text-[10px] font-mono truncate">{{ item.address }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 bg-white/[0.05] border border-white/10 px-2 py-0.5 rounded-full shrink-0">
                    <lucide-icon [name]="StarIcon" size="11" class="text-amber-400 fill-current"></lucide-icon>
                    <span class="text-[11px] font-mono font-bold text-zinc-200">4.8</span>
                  </div>
                </div>

                <!-- Botones de Acción Directos -->
                <div class="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                  <button (click)="$event.stopPropagation(); llamar(item)" class="bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 font-mono text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 border border-white/[0.06] transition-all">
                    <lucide-icon [name]="PhoneIcon" size="12"></lucide-icon>
                    Llamar
                  </button>
                  <button (click)="$event.stopPropagation(); whatsapp(item)" class="bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 font-mono text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 border border-emerald-500/20 transition-all">
                    <lucide-icon [name]="WhatsappIcon" size="12"></lucide-icon>
                    WhatsApp
                  </button>
                  <button (click)="$event.stopPropagation(); ruta(item)" class="bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 font-mono text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 border border-orange-500/30 transition-all">
                    <lucide-icon [name]="NavIcon" size="12"></lucide-icon>
                    Ruta
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </section>
    </div>
  `
})
export class StoresViewComponent {
  protected store = inject(StoreService);

  readonly StarIcon = Star;
  readonly PinIcon = MapPin;
  readonly PhoneIcon = Phone;
  readonly WhatsappIcon = MessageCircle;
  readonly NavIcon = Navigation;
  readonly SearchIcon = Search;

  abrirMapaGrande() {
    window.open('https://maps.google.com/?q=ferreterias+en+' + encodeURIComponent(this.store.userCity()), '_blank');
  }

  llamar(item: any) {
    if (item.phone) {
      window.open('tel:' + item.phone, '_self');
    } else {
      window.open('tel:0999999999', '_self');
    }
  }

  whatsapp(item: any) {
    if (item.phone) {
      window.open('https://wa.me/' + item.phone.replace(/[^0-9]/g, ''), '_blank');
    } else {
      window.open('https://wa.me/593999999999', '_blank');
    }
  }

  ruta(item: any) {
    if (item.address) {
      window.open('https://maps.google.com/?q=' + encodeURIComponent(item.address + ', ' + this.store.userCity()), '_blank');
    } else {
      window.open('https://maps.google.com', '_blank');
    }
  }
}
