import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Star, CheckCircle, MessageSquare, Phone, MapPin, Wrench } from 'lucide-angular';

@Component({
  selector: 'app-experts-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="pb-24 animate-in fade-in duration-500">
      <!-- Header -->
      <section class="px-6 pt-8 pb-4">
        <h1 class="text-3xl font-black text-gray-900 leading-tight">Expertos en Instalación</h1>
        <p class="text-sm font-medium text-gray-500 mt-2">Profesionales calificados para tus proyectos de construcción y hogar.</p>
      </section>

      <!-- Category Chips -->
      <div class="flex gap-2 overflow-x-auto px-6 py-4 hide-scrollbar">
        @for (cat of ['Todos', 'Plomería', 'Electricidad', 'Albañilería', 'Pintura', 'Carpintería']; track cat) {
          <button 
            [class]="'flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ' + (cat === 'Todos' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')"
          >
            {{ cat }}
          </button>
        }
      </div>

      <!-- Experts List -->
      <section class="px-6 space-y-6 mt-4">
        @for (expert of EXPERTS; track expert.id) {
          <div class="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex gap-4">
              <div class="relative">
                <img [src]="expert.avatar" class="w-16 h-16 rounded-2xl object-cover" />
                @if (expert.verified) {
                  <div class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <lucide-icon [name]="CheckIcon" size="14" class="text-blue-500 fill-current"></lucide-icon>
                  </div>
                }
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-black text-lg text-gray-900 leading-none">{{ expert.name }}</h3>
                    <p class="text-[10px] font-bold text-[#E8541C] uppercase tracking-widest mt-1">{{ expert.category }}</p>
                  </div>
                  <div class="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                    <lucide-icon [name]="StarIcon" size="12" class="text-orange-500 fill-current"></lucide-icon>
                    <span class="text-xs font-black text-orange-700">{{ expert.rating }}</span>
                  </div>
                </div>
                
                <div class="flex items-center gap-3 mt-3 text-gray-500">
                  <div class="flex items-center gap-1">
                    <lucide-icon [name]="PinIcon" size="12"></lucide-icon>
                    <span class="text-[10px] font-bold">{{ expert.location }}</span>
                  </div>
                  <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div class="flex items-center gap-1">
                    <lucide-icon [name]="WrenchIcon" size="12"></lucide-icon>
                    <span class="text-[10px] font-bold">{{ expert.jobs }} trabajos</span>
                  </div>
                </div>
              </div>
            </div>

            <p class="text-xs text-gray-500 mt-4 line-clamp-2 leading-relaxed">
              {{ expert.bio }}
            </p>

            <div class="flex gap-3 mt-6">
              <button class="flex-1 bg-gray-50 text-gray-900 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                <lucide-icon [name]="ChatIcon" size="16"></lucide-icon>
                Mensaje
              </button>
              <button class="flex-1 bg-[#E8541C] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-100 active:scale-95 transition-all">
                <lucide-icon [name]="PhoneIcon" size="16"></lucide-icon>
                Contratar
              </button>
            </div>
          </div>
        }
      </section>
    </div>
  `
})
export class ExpertsViewComponent {
  readonly StarIcon = Star;
  readonly CheckIcon = CheckCircle;
  readonly ChatIcon = MessageSquare;
  readonly PhoneIcon = Phone;
  readonly PinIcon = MapPin;
  readonly WrenchIcon = Wrench;

  readonly EXPERTS = [
    {
      id: '1',
      name: 'Carlos Mendoza',
      category: 'Maestro Plomero',
      rating: 4.9,
      jobs: 145,
      location: 'Norte de Guayaquil',
      verified: true,
      bio: 'Especialista en instalaciones sanitarias y detección de fugas. 15 años de experiencia con certificación técnica.',
      avatar: 'https://images.unsplash.com/photo-1540560085022-730894593bc1?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: '2',
      name: 'Jorge Luis Rivera',
      category: 'Electricista Autorizado',
      rating: 4.8,
      jobs: 92,
      location: 'Vía a la Costa',
      verified: true,
      bio: 'Instalaciones eléctricas residenciales e industriales. Especialista en domótica y ahorro de energía.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    },
    {
      id: '3',
      name: 'Elena Martínez',
      category: 'Decoradora & Pintura',
      rating: 5.0,
      jobs: 64,
      location: 'Samborondón',
      verified: false,
      bio: 'Acabados de lujo, pintura decorativa y asesoría en color. Transformo espacios con técnicas modernas.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
    }
  ];
}
