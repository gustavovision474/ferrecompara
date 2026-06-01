import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Star, CheckCircle, MessageSquare, Phone, MapPin, Wrench } from 'lucide-angular';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-experts-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="pb-24 animate-in fade-in duration-500 relative">
      <!-- GLOBAL FULLSCREEN LOADER -->
      <div *ngIf="cargando()" class="fixed inset-0 z-[999] bg-gray-50 flex flex-col items-center justify-center">
        <div class="w-16 h-16 border-4 border-[#E8541C] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-black text-gray-400 mt-4 tracking-widest uppercase animate-pulse">Cargando...</p>
      </div>
      <!-- Header -->
      <section class="px-6 pt-8 pb-4">
        <h1 class="text-3xl font-black text-gray-900 leading-tight">Expertos en Instalación</h1>
        <p class="text-sm font-medium text-gray-500 mt-2">Profesionales referidos por tus ferreterías de confianza.</p>
      </section>

      <!-- Category Chips -->
      <div class="flex gap-2 overflow-x-auto px-6 py-4 hide-scrollbar">
        @for (cat of categorias; track cat) {
          <button 
            (click)="categoriaActiva.set(cat)"
            [class]="'flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ' + (categoriaActiva() === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')"
          >
            {{ cat }}
          </button>
        }
      </div>

      <!-- Experts List -->
      <section class="px-6 space-y-6 mt-4">
        @for (expert of expertosFiltrados(); track expert.id) {
          <div class="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex gap-4">
              <div class="relative">
                <img [src]="expert.foto_url || 'https://images.unsplash.com/photo-1540560085022-730894593bc1?auto=format&fit=crop&q=80&w=200'" class="w-16 h-16 rounded-2xl object-cover" />
                @if (expert.activo || expert.verificado) {
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <lucide-icon [name]="CheckIcon" size="14" class="text-blue-500 fill-current"></lucide-icon>
                  </div>
                }
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-black text-lg text-gray-900 leading-none">{{ expert.nombre }}</h3>
                    <p class="text-[10px] font-bold text-[#E8541C] uppercase tracking-widest mt-1">{{ expert.profesion || expert.categoria }}</p>
                  </div>
                  <div class="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                    <lucide-icon [name]="StarIcon" size="12" class="text-orange-500 fill-current"></lucide-icon>
                    <span class="text-xs font-black text-orange-700">{{ expert.rating || '5.0' }}</span>
                  </div>
                </div>
                
                <div class="flex items-center gap-3 mt-3 text-gray-500">
                  <div class="flex items-center gap-1">
                    <lucide-icon [name]="PinIcon" size="12"></lucide-icon>
                    <span class="text-[10px] font-bold">{{ expert.tiendas?.nombre || 'Independiente' }}</span>
                  </div>
                  <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [name]="WrenchIcon" size="12"></lucide-icon>
                    <span class="text-[10px] font-bold">{{ expert.total_resenas || 0 }} reseñas</span>
                  </div>
                </div>
              </div>
            </div>

            <p class="text-xs text-gray-500 mt-4 line-clamp-2 leading-relaxed" *ngIf="expert.experiencia_anios">
              {{ expert.experiencia_anios }} años de experiencia profesional.
            </p>

            <div class="flex gap-3 mt-6">
              <a [href]="'tel:' + expert.telefono" class="flex-1 bg-gray-50 text-gray-900 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                <lucide-icon [name]="PhoneIcon" size="16"></lucide-icon>
                Llamar
              </a>
              <a [href]="'https://wa.me/' + expert.telefono" target="_blank" class="flex-1 bg-[#E8541C] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-100 active:scale-95 transition-all">
                <lucide-icon [name]="ChatIcon" size="16"></lucide-icon>
                WhatsApp
              </a>
            </div>
          </div>
        }

        @if (expertosFiltrados().length === 0 && !cargando()) {
          <div class="text-center py-10 bg-gray-50 rounded-3xl border border-gray-100">
            <h3 class="text-gray-900 font-black text-lg">Aún no hay expertos</h3>
            <p class="text-gray-500 text-xs mt-2 px-6">Las ferreterías aún no han referido expertos para esta categoría.</p>
          </div>
        }
      </section>
    </div>
  `
})
export class ExpertsViewComponent implements OnInit {
  private supabase = inject(SupabaseService);

  cargando = signal(true);
  expertos = signal<any[]>([]);
  categoriaActiva = signal('Todos');
  readonly categorias = ['Todos', 'Plomero', 'Electricista', 'Pintor', 'Albañil', 'Carpintero'];

  readonly StarIcon = Star;
  readonly CheckIcon = CheckCircle;
  readonly ChatIcon = MessageSquare;
  readonly PhoneIcon = Phone;
  readonly PinIcon = MapPin;
  readonly WrenchIcon = Wrench;

  expertosFiltrados = computed(() => {
    const todos = this.expertos();
    const cat = this.categoriaActiva();
    if (cat === 'Todos') return todos;
    return todos.filter(e => {
      const profesion = (e.profesion || e.categoria || '').toLowerCase();
      return profesion.includes(cat.toLowerCase());
    });
  });

  async ngOnInit() {
    this.cargando.set(true);
    try {
      const data = await this.supabase.getExpertos();
      this.expertos.set(data);
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando.set(false);
    }
  }
}
