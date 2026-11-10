import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Star, CheckCircle, MessageSquare, Phone, MapPin, Wrench } from 'lucide-angular';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-experts-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="pb-24 animate-in fade-in duration-500 relative max-w-7xl mx-auto">
      <!-- GLOBAL FULLSCREEN LOADER -->
      <div *ngIf="cargando() && expertos().length === 0" class="fixed inset-0 z-[999] bg-[#07080b] flex flex-col items-center justify-center">
        <div class="w-14 h-14 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p class="text-xs font-mono font-bold text-zinc-400 mt-4 tracking-widest uppercase animate-pulse">Sincronizando técnicos y maestros...</p>
      </div>

      <!-- Header with macOS style window dots -->
      <section class="px-6 pt-6 pb-4">
        <div class="flex items-center gap-1.5 mb-2">
          <span class="w-2 h-2 rounded-full bg-red-500/80"></span>
          <span class="w-2 h-2 rounded-full bg-amber-500/80"></span>
          <span class="w-2 h-2 rounded-full bg-emerald-500/80"></span>
          <span class="text-[10px] font-mono text-zinc-500 ml-2">ferrecompara.terminal/experts</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-white leading-tight">Expertos en Instalación</h1>
        <p class="text-xs sm:text-sm font-medium text-zinc-400 mt-1">Profesionales y contratistas avalados por las ferreterías locales.</p>
      </section>

      <!-- Category Chips -->
      <div class="flex gap-2 overflow-x-auto px-6 py-2 hide-scrollbar">
        @for (cat of categorias; track cat) {
          <button 
            (click)="categoriaActiva.set(cat)"
            [class]="'flex-shrink-0 px-4 py-2 rounded-full font-mono text-xs transition-all ' + 
              (categoriaActiva() === cat 
                ? 'bg-orange-500/15 border border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.25)]' 
                : 'bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20')"
          >
            {{ cat }}
          </button>
        }
      </div>

      <!-- Experts List -->
      <section class="px-6 space-y-4 mt-4">
        @for (expert of expertosFiltrados(); track expert.id) {
          <div class="bg-[#0e1118]/85 backdrop-blur-xl border border-white/[0.08] hover:border-white/20 rounded-3xl p-5 shadow-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] transition-all duration-300">
            <div class="flex gap-4">
              <div class="relative">
                <img [src]="expert.foto_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=300&auto=format&fit=crop'" (error)="$any($event.target).src='https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=300&auto=format&fit=crop'" class="w-16 h-16 rounded-2xl object-cover border border-white/10" />
                @if (expert.activo || expert.verificado) {
                  <div class="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5 border border-blue-500/50">
                    <lucide-icon [name]="CheckIcon" size="14" class="text-blue-400 fill-current"></lucide-icon>
                  </div>
                }
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-bold text-base text-white leading-none">{{ expert.nombre }}</h3>
                    <p class="text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest mt-1.5">{{ expert.profesion || expert.categoria }}</p>
                  </div>
                  <div class="flex items-center gap-1 bg-white/[0.05] border border-white/10 px-2 py-0.5 rounded-full">
                    <lucide-icon [name]="StarIcon" size="12" class="text-amber-400 fill-current"></lucide-icon>
                    <span class="text-xs font-mono font-bold text-zinc-200">{{ expert.rating || '5.0' }}</span>
                  </div>
                </div>
                
                <div class="flex items-center gap-3 mt-3 text-zinc-400 text-xs font-mono">
                  <div class="flex items-center gap-1">
                    <lucide-icon [name]="PinIcon" size="12" class="text-zinc-500"></lucide-icon>
                    <span class="text-[10px]">{{ expert.tiendas?.nombre || 'Independiente' }}</span>
                  </div>
                  <div class="w-1 h-1 bg-zinc-600 rounded-full"></div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [name]="WrenchIcon" size="12" class="text-zinc-500"></lucide-icon>
                    <span class="text-[10px]">{{ expert.total_resenas || 0 }} reseñas</span>
                  </div>
                </div>
              </div>
            </div>

            <p class="text-xs text-zinc-400 mt-3.5 line-clamp-2 leading-relaxed" *ngIf="expert.experiencia_anios">
              {{ expert.experiencia_anios }} años de experiencia profesional en obras y reformas.
            </p>

            <div class="flex gap-2.5 mt-5">
              <a [href]="'tel:' + expert.telefono" class="flex-1 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-mono text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 border border-white/[0.06] transition-all">
                <lucide-icon [name]="PhoneIcon" size="14"></lucide-icon>
                Llamar
              </a>
              <a [href]="'https://wa.me/' + expert.telefono" target="_blank" class="flex-1 bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 font-mono text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 border border-orange-500/30 transition-all shadow-[0_0_12px_rgba(249,115,22,0.15)]">
                <lucide-icon [name]="ChatIcon" size="14"></lucide-icon>
                WhatsApp
              </a>
            </div>
          </div>
        }

        @if (expertosFiltrados().length === 0 && !cargando()) {
          <div class="text-center py-12 bg-[#0e1118]/60 rounded-3xl border border-white/[0.06]">
            <h3 class="text-white font-bold text-base">Aún no hay expertos disponibles</h3>
            <p class="text-zinc-400 text-xs mt-1.5 px-6">Las ferreterías aliadas están verificando nuevos contratistas en esta categoría.</p>
          </div>
        }
      </section>
    </div>
  `
})
export class ExpertsViewComponent implements OnInit {
  private supabase = inject(SupabaseService);

  cargando = signal(false);
  expertos = signal<any[]>(this.supabase.obtenerExpertosDemo());
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
    const isDemo = localStorage.getItem('ferrecompara_demo_session') !== null;
    if (isDemo) {
      this.expertos.set(this.supabase.obtenerExpertosDemo());
      this.cargando.set(false);
      return;
    }
    try {
      const data = await this.supabase.getExpertos();
      if (data && data.length > 0) {
        this.expertos.set(data);
      }
    } catch (e) {
      this.expertos.set(this.supabase.obtenerExpertosDemo());
    } finally {
      this.cargando.set(false);
    }
  }
}
