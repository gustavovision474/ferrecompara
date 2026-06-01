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
    <header class="bg-white border-b border-gray-200 shadow-sm w-full">
      <div class="flex items-center justify-between px-4 h-16 w-full max-w-7xl mx-auto">
        <div class="flex items-center gap-3">
          <button (click)="store.toggleSidebar(true)" class="text-gray-500 hover:bg-gray-50 transition-colors p-2 rounded-lg">
            <lucide-icon [name]="MenuIcon" size="24"></lucide-icon>
          </button>
          <div 
            (click)="store.setTab('home')" 
            class="flex items-center cursor-pointer select-none"
          >
            <img src="assets/images/ferrecompara-logo.png" alt="FerreCompara" class="h-8 md:h-10 object-contain drop-shadow-sm" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <span class="text-xl font-black text-[#E8541C] uppercase tracking-tighter hidden">
              FerreCompara
            </span>
          </div>
        </div>
        
        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <input 
              [ngModel]="store.searchQuery()"
              (ngModelChange)="store.setSearchQuery($event); store.setTab('home')"
              class="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-[#E8541C] outline-none" 
              placeholder="Busca cemento, varillas, herramientas..." 
              type="text" 
            />
            <lucide-icon [name]="SearchIcon" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="18"></lucide-icon>
          </div>
        </div>

        <div class="flex items-center gap-1 text-[#E8541C]">
          <lucide-icon [name]="MapPinIcon" size="20"></lucide-icon>
          <span class="text-sm font-semibold hidden sm:block">{{ store.userCity() }}</span>
        </div>
      </div>
      
      <!-- Mobile Search -->
      <div class="px-4 pb-3 md:hidden">
        <div class="relative w-full">
          <input 
            [ngModel]="store.searchQuery()"
            (ngModelChange)="store.setSearchQuery($event); store.setTab('home')"
            class="w-full h-11 bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 focus:ring-2 focus:ring-[#E8541C] outline-none" 
            placeholder="Busca cemento, varillas..." 
            type="text" 
          />
          <lucide-icon [name]="SearchIcon" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="18"></lucide-icon>
        </div>
      </div>

      <!-- Location Sidebar Overlay -->
      @if (store.isSidebarOpen()) {
        <div class="fixed inset-0 z-[200] flex">
          <!-- Backdrop -->
          <div (click)="store.toggleSidebar(false)" class="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"></div>
          
          <!-- Sidebar -->
          <div class="relative w-3/4 max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div class="p-6 border-b border-gray-100">
              <h2 class="text-xl font-black text-gray-900">Ubicación</h2>
              <p class="text-xs text-gray-500 mt-1">Selecciona tu ciudad para ver tiendas y precios locales.</p>
            </div>
            
            <div class="p-4 flex-1 overflow-y-auto">
              <div class="space-y-2">
                @for (city of ['Guayaquil', 'Quito', 'Cuenca', 'Manta', 'Portoviejo', 'Machala']; track city) {
                  <button 
                    (click)="store.setUserCity(city); store.toggleSidebar(false)"
                    [class]="'w-full flex items-center justify-between p-4 rounded-2xl transition-all ' + (store.userCity() === city ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-transparent hover:bg-gray-100')"
                  >
                    <div class="flex items-center gap-3">
                      <lucide-icon [name]="MapPinIcon" size="18" [class]="store.userCity() === city ? 'text-[#E8541C]' : 'text-gray-400'"></lucide-icon>
                      <span [class]="'font-bold ' + (store.userCity() === city ? 'text-[#E8541C]' : 'text-gray-700')">{{ city }}</span>
                    </div>
                    @if (store.userCity() === city) {
                      <div class="w-2 h-2 rounded-full bg-[#E8541C]"></div>
                    }
                  </button>
                }
              </div>
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
