import { Component, inject } from '@angular/core';
import { LucideAngularModule, Menu, MapPin, Search } from 'lucide-angular';
import { StoreService } from '../store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule, FormsModule],
  styles: [`
    :host {
      display: block;
      width: 100%;
      position: sticky;
      top: 0;
      z-index: 100;
    }
  `],
  template: `
    <header class="bg-[#07080b]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.6)] w-full transition-colors">
      <div class="flex items-center justify-between px-4 sm:px-6 h-16 w-full max-w-7xl mx-auto">
        <div class="flex items-center gap-3">
          <!-- macOS style window dots (Code and Chill aesthetic) -->
          <div class="hidden sm:flex items-center gap-1.5 mr-1 py-1 px-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/90 shadow-[0_0_8px_rgba(255,95,86,0.5)]"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/90 shadow-[0_0_8px_rgba(255,189,46,0.5)]"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-[#27c93f]/90 shadow-[0_0_8px_rgba(39,201,63,0.5)]"></span>
          </div>

          <button (click)="store.toggleSidebar(true)" class="text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/10 transition-all px-2.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-mono">
            <lucide-icon [name]="MenuIcon" size="16"></lucide-icon>
            <span class="text-[11px] font-bold hidden sm:block">Ciudades</span>
          </button>

          <div 
            (click)="store.setTab('home')" 
            class="flex items-center gap-2 cursor-pointer select-none group"
          >
            <img src="assets/images/ferrecompara-logo.png" alt="FerreCompara" class="h-8 md:h-9 object-contain drop-shadow-md brightness-110" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <span class="text-lg font-black tracking-tighter text-white uppercase hidden group-hover:text-orange-400 transition-colors">
              FerreCompara
            </span>
          </div>
        </div>
        
        <!-- Desktop Pill Search -->
        <div class="hidden md:flex flex-1 max-w-md mx-6">
          <div class="relative w-full">
            <input 
              [ngModel]="store.searchQuery()"
              (ngModelChange)="store.setSearchQuery($event); store.setTab('home')"
              class="w-full bg-zinc-900/90 border border-white/10 rounded-full py-2 pr-4 text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all shadow-inner" 
              style="padding-left: 44px;"
              placeholder="Buscar cemento, varillas, taladros..." 
              type="text" 
            />
            <lucide-icon [name]="SearchIcon" class="absolute top-1/2 -translate-y-1/2 text-zinc-400" style="left: 16px;" size="16"></lucide-icon>
          </div>
        </div>

        <!-- City Indicator Pill -->
        <button 
          (click)="store.toggleSidebar(true)"
          class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 hover:border-orange-500/40 text-zinc-200 transition-all text-xs font-mono shadow-sm group"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
          <lucide-icon [name]="MapPinIcon" size="14" class="text-orange-400"></lucide-icon>
          <span class="font-bold text-zinc-200 group-hover:text-white">{{ store.userCity() }}</span>
        </button>
      </div>
      
      <!-- Mobile Pill Search -->
      <div class="px-4 pb-3 md:hidden">
        <div class="relative w-full">
          <input 
            [ngModel]="store.searchQuery()"
            (ngModelChange)="store.setSearchQuery($event); store.setTab('home')"
            class="w-full h-10 bg-zinc-900/90 border border-white/10 rounded-full pr-4 text-xs font-medium text-zinc-100 placeholder-zinc-500 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all" 
            style="padding-left: 42px;"
            placeholder="Buscar cemento, varillas, taladros..." 
            type="text" 
          />
          <lucide-icon [name]="SearchIcon" class="absolute top-1/2 -translate-y-1/2 text-zinc-400" style="left: 15px;" size="16"></lucide-icon>
        </div>
      </div>

      <!-- Location Sidebar Overlay (Dark Glass Luxury) -->
      @if (store.isSidebarOpen()) {
        <div class="fixed inset-0 z-[200] flex">
          <!-- Backdrop -->
          <div (click)="store.toggleSidebar(false)" class="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in"></div>
          
          <!-- Sidebar -->
          <div class="relative w-3/4 max-w-sm bg-[#0d1017]/95 border-r border-white/10 h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col text-zinc-100">
            <div class="p-6 border-b border-white/[0.08]">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-2 h-2 rounded-full bg-orange-400"></span>
                <span class="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Territorio Ecuador</span>
              </div>
              <h2 class="text-xl font-black text-white">Seleccionar Ciudad</h2>
              <p class="text-xs text-zinc-400 mt-1">Cotizaciones y tiendas en tiempo real según tu localidad.</p>
            </div>
            
            <div class="p-4 flex-1 overflow-y-auto space-y-2">
              @for (city of ['Guayaquil', 'Quito', 'Cuenca', 'Manta', 'Portoviejo', 'Machala']; track city) {
                <button 
                  (click)="store.setUserCity(city); store.toggleSidebar(false)"
                  [class]="'w-full flex items-center justify-between p-3.5 rounded-2xl transition-all font-mono text-xs ' + (store.userCity() === city ? 'bg-orange-500/10 border border-orange-500/40 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'bg-zinc-900/60 border border-white/[0.05] text-zinc-300 hover:bg-zinc-800/60 hover:text-white')"
                >
                  <div class="flex items-center gap-3">
                    <lucide-icon [name]="MapPinIcon" size="16" [class]="store.userCity() === city ? 'text-orange-400' : 'text-zinc-500'"></lucide-icon>
                    <span class="font-bold">{{ city }}</span>
                  </div>
                  @if (store.userCity() === city) {
                    <div class="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                  }
                </button>
              }
            </div>
          </div>
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  protected store = inject(StoreService);
  
  readonly MenuIcon = Menu;
  readonly MapPinIcon = MapPin;
  readonly SearchIcon = Search;
}
