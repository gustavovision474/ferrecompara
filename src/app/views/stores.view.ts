import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Star, MapPin, Phone, MessageCircle, Navigation, Search } from 'lucide-angular';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-stores-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="pb-24 animate-in fade-in duration-500">
      <!-- Header -->
      <section class="px-6 pt-8 pb-4">
        <h1 class="text-3xl font-black text-gray-900 leading-tight">Ferreterías en {{ store.userCity() }}</h1>
        <p class="text-sm font-medium text-gray-500 mt-1">Explora la cobertura en la ciudad y contacta al instante.</p>
      </section>

      <!-- Search Bar -->
      <div class="px-6 mt-1 mb-4">
        <div class="relative w-full">
          <input 
            class="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all shadow-sm text-xs font-bold" 
            placeholder="Buscar ferretería cercana..." 
            type="text" 
          />
          <lucide-icon [name]="SearchIcon" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size="20"></lucide-icon>
        </div>
      </div>

      <!-- MAPA REAL DE PORTOVIEJO / CIUDAD EMBEBIDO -->
      <section class="px-6 mb-6">
        <div class="bg-gray-100 rounded-[32px] overflow-hidden border border-gray-200 shadow-xl relative h-[320px] w-full">
          <!-- Iframe nativo de OpenStreetMap centrado exactamente en el corazón de Portoviejo, Manabí -->
          <iframe 
            width="100%" 
            height="100%" 
            frameborder="0" 
            scrolling="no" 
            marginheight="0" 
            marginwidth="0" 
            src="https://www.openstreetmap.org/export/embed.html?bbox=-80.4850%2C-1.0750%2C-80.4250%2C-1.0350&amp;layer=mapnik" 
            class="w-full h-full absolute inset-0 filter saturate-[0.85] contrast-[1.05]"
          ></iframe>

          <!-- Indicador Flotante Superior (pointer-events-none para permitir arrastrar y explorar las calles de Portoviejo debajo) -->
          <div class="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-gray-100 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2 pointer-events-none z-10">
            <span class="w-2 h-2 rounded-full bg-[#E8541C] animate-pulse"></span>
            <span class="text-[9px] font-black text-gray-900 uppercase tracking-wider">Mapa Satelital: {{ store.userCity() }}</span>
          </div>

          <!-- Capa Informativa Inferior -->
          <div class="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-gray-100 shadow-lg flex items-center justify-between z-10">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                <lucide-icon [name]="PinIcon" size="20" class="text-[#E8541C]"></lucide-icon>
              </div>
              <div>
                <p class="text-[10px] font-black text-gray-900 uppercase tracking-tight">Red de Distribuidores</p>
                <p class="text-[10px] font-bold text-gray-500">{{ store.ferreterias().length }} Locales verificados en {{ store.userCity() }}</p>
              </div>
            </div>
            <button (click)="abrirMapaGrande()" class="bg-[#E8541C] text-white text-[10px] font-black px-3 py-2 rounded-xl shadow-sm hover:bg-orange-600 transition-colors active:scale-95 cursor-pointer">
              Ampliar Mapa
            </button>
          </div>
        </div>
      </section>

      <!-- Stores List Clásico e Inmaculado -->
      <section class="px-6 space-y-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-sm font-black uppercase tracking-widest text-gray-400">Locales Disponibles</h2>
          <span class="text-[10px] font-bold text-gray-500">{{ store.filteredFerreterias().length }} Tiendas</span>
        </div>

        @for (item of store.filteredFerreterias(); track item.id) {
          <div 
            (click)="store.selectStore(item.id)"
            class="bg-white border border-gray-100 rounded-[32px] p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group cursor-pointer relative mb-4"
          >
            <div class="flex gap-4">
              <img [src]="item.image" class="w-20 h-20 rounded-2xl object-cover shadow-sm border border-gray-50 shrink-0" />
              
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start gap-2">
                  <div class="min-w-0">
                    <h3 class="font-black text-base text-gray-900 leading-tight truncate">{{ item.name }}</h3>
                    <div class="flex items-center gap-1 mt-1 text-gray-400">
                      <lucide-icon [name]="PinIcon" size="12" class="shrink-0"></lucide-icon>
                      <span class="text-[10px] font-bold uppercase tracking-wider truncate">{{ item.address }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg shrink-0">
                    <lucide-icon [name]="StarIcon" size="12" class="text-orange-500 fill-current"></lucide-icon>
                    <span class="text-xs font-black text-orange-700">4.8</span>
                  </div>
                </div>

                <!-- Botones de Acción Directos -->
                <div class="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button (click)="$event.stopPropagation(); llamar(item)" class="bg-gray-50 text-gray-700 font-bold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-gray-100">
                    <lucide-icon [name]="PhoneIcon" size="12"></lucide-icon>
                    Llamar
                  </button>
                  <button (click)="$event.stopPropagation(); whatsapp(item)" class="bg-green-50 text-green-700 font-bold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-green-100">
                    <lucide-icon [name]="WhatsappIcon" size="12"></lucide-icon>
                    Chat
                  </button>
                  <button (click)="$event.stopPropagation(); ruta(item)" class="bg-[#E8541C] text-white font-bold text-[10px] py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-orange-600">
                    <lucide-icon [name]="NavIcon" size="12"></lucide-icon>
                    Llegar
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
