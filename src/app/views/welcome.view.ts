import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Store, Wrench, ArrowRight, Hammer, Sparkles, Zap } from 'lucide-angular';
import type { UserRole } from '../auth.service';

@Component({
  selector: 'app-welcome-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-12 lg:px-8 relative overflow-hidden">
      <!-- Decorative blobs -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">

        <!-- Logo -->
        <div class="flex flex-col items-center justify-center mb-6">
          <img src="assets/images/ferrecompara-logo.png" alt="FerreExpress Logo" class="h-28 object-contain drop-shadow-xl" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'; this.nextElementSibling.nextElementSibling.style.display='block';">
          <div class="w-16 h-16 bg-[#E8541C] rounded-2xl hidden items-center justify-center shadow-lg shadow-orange-200 rotate-3">
            <lucide-icon [name]="WrenchIcon" size="32" class="text-white -rotate-3"></lucide-icon>
          </div>
          <h2 class="hidden text-center text-3xl font-black tracking-tight text-gray-900 uppercase mt-4">
            FerreExpress
          </h2>
        </div>
        <p class="mt-2 text-center text-sm text-gray-500 font-medium">
          ¿Cómo vas a usar la app?
        </p>

        <!-- Cards -->
        <div class="mt-8 space-y-3.5 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <!-- CLIENTE -->
          <button
            type="button"
            (click)="elegirRol('cliente')"
            class="w-full group bg-white border-2 border-gray-100 hover:border-[#E8541C] rounded-2xl p-4.5 transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-orange-100"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-orange-50 group-hover:bg-[#E8541C] rounded-xl flex items-center justify-center transition-colors duration-300 flex-shrink-0">
                <lucide-icon [name]="SearchIcon" size="24" class="text-[#E8541C] group-hover:text-white transition-colors duration-300"></lucide-icon>
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-black text-gray-900 uppercase tracking-tight">Soy un Cliente</p>
                <p class="text-xs text-gray-500 font-medium mt-0.5">Quiero buscar y comparar precios</p>
              </div>
              <lucide-icon [name]="ArrowRightIcon" size="18" class="text-gray-300 group-hover:text-[#E8541C] group-hover:translate-x-1 transition-all duration-300"></lucide-icon>
            </div>
          </button>

          <!-- TIENDA -->
          <button
            type="button"
            (click)="elegirRol('tienda')"
            class="w-full group bg-white border-2 border-gray-100 hover:border-gray-900 rounded-2xl p-4.5 transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-xl hover:shadow-gray-200"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gray-100 group-hover:bg-gray-900 rounded-xl flex items-center justify-center transition-colors duration-300 flex-shrink-0">
                <lucide-icon [name]="StoreIcon" size="24" class="text-gray-700 group-hover:text-white transition-colors duration-300"></lucide-icon>
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-black text-gray-900 uppercase tracking-tight">Soy una Ferretería</p>
                <p class="text-xs text-gray-500 font-medium mt-0.5">Quiero vender mis productos</p>
              </div>
              <lucide-icon [name]="ArrowRightIcon" size="18" class="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all duration-300"></lucide-icon>
            </div>
          </button>

        </div>

        <!-- ACCESO DIRECTO MODO DEMO -->
        <div class="mt-8 pt-6 border-t border-gray-200/80">
          <div class="flex items-center justify-center gap-1.5 mb-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-orange-100/80 text-orange-900 border border-orange-200">
              <lucide-icon [name]="ZapIcon" size="13" class="text-[#E8541C]"></lucide-icon>
              Probar Demo Instantánea (Sin Registro)
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-3">
            <!-- Botón Demo Cliente -->
            <button
              type="button"
              (click)="entrarDemo('cliente')"
              class="flex flex-col items-center justify-center p-3.5 bg-white border-2 border-orange-200 hover:border-[#E8541C] rounded-2xl hover:shadow-md transition-all active:scale-95 group text-center"
            >
              <div class="w-10 h-10 rounded-xl bg-orange-50 text-[#E8541C] flex items-center justify-center mb-2 group-hover:bg-[#E8541C] group-hover:text-white transition-colors">
                <lucide-icon [name]="SearchIcon" size="20"></lucide-icon>
              </div>
              <span class="text-xs font-black text-gray-900 leading-tight">Demo Cliente</span>
              <span class="text-[10px] text-gray-500 font-medium mt-0.5">Comparador & Carrito</span>
            </button>

            <!-- Botón Demo Ferretería -->
            <button
              type="button"
              (click)="entrarDemo('tienda')"
              class="flex flex-col items-center justify-center p-3.5 bg-white border-2 border-gray-200 hover:border-gray-900 rounded-2xl hover:shadow-md transition-all active:scale-95 group text-center"
            >
              <div class="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center mb-2 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                <lucide-icon [name]="StoreIcon" size="20"></lucide-icon>
              </div>
              <span class="text-xs font-black text-gray-900 leading-tight">Demo Ferretería</span>
              <span class="text-[10px] text-gray-500 font-medium mt-0.5">Dashboard & Catálogo</span>
            </button>
          </div>
        </div>

        <!-- Login link -->
        <p class="mt-8 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?
          <button
            (click)="iniciarSesion.emit()"
            class="font-black text-[#E8541C] hover:text-orange-500 transition-colors ml-1 uppercase tracking-wide text-xs"
          >
            Iniciar Sesión
          </button>
        </p>

      </div>
    </div>
  `
})
export class WelcomeViewComponent {
  // Icons
  readonly SearchIcon = Search;
  readonly StoreIcon = Store;
  readonly WrenchIcon = Wrench;
  readonly ArrowRightIcon = ArrowRight;
  readonly HammerIcon = Hammer;
  readonly SparklesIcon = Sparkles;
  readonly ZapIcon = Zap;

  // Outputs (eventos hacia el padre)
  rolElegido = output<UserRole>();
  iniciarSesion = output<void>();
  demoElegida = output<UserRole>();

  elegirRol(rol: UserRole) {
    this.rolElegido.emit(rol);
  }

  entrarDemo(rol: UserRole) {
    this.demoElegida.emit(rol);
  }
}
