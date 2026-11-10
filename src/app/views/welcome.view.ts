import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, Store, Wrench, ArrowRight, Hammer, Sparkles, Zap } from 'lucide-angular';
import type { UserRole } from '../auth.service';

@Component({
  selector: 'app-welcome-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col justify-center px-6 py-12 lg:px-8 relative overflow-hidden">
      <!-- Ambient glow lights -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-0 right-0 w-[400px] h-[300px] bg-slate-800/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">

        <!-- macOS style window dots & terminal header -->
        <div class="flex items-center justify-center gap-1.5 mb-6">
          <div class="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <span class="w-2 h-2 rounded-full bg-red-500/80"></span>
            <span class="w-2 h-2 rounded-full bg-amber-500/80"></span>
            <span class="w-2 h-2 rounded-full bg-emerald-500/80"></span>
            <span class="text-[10px] font-mono text-zinc-400 ml-2">ferrecompara.vessa/onboarding</span>
          </div>
        </div>

        <!-- Logo -->
        <div class="flex flex-col items-center justify-center mb-6">
          <img src="assets/images/ferrecompara-logo.png" alt="FerreExpress Logo" class="h-24 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] brightness-110" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'; this.nextElementSibling.nextElementSibling.style.display='block';">
          <div class="w-14 h-14 bg-orange-500/15 border border-orange-500/40 rounded-2xl hidden items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <lucide-icon [name]="WrenchIcon" size="28" class="text-orange-400"></lucide-icon>
          </div>
          <h2 class="hidden text-center text-2xl font-black tracking-tight text-white uppercase mt-4">
            FerreCompara
          </h2>
        </div>
        <p class="text-center text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Plataforma B2B & Comparador de Materiales
        </p>

        <!-- Cards -->
        <div class="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <!-- CLIENTE -->
          <button
            type="button"
            (click)="elegirRol('cliente')"
            class="w-full group bg-[#0e1118]/85 hover:bg-[#121520] border border-white/[0.08] hover:border-orange-500/40 rounded-2xl p-4.5 transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-[0_10px_30px_rgba(249,115,22,0.1)] text-left"
          >
            <div class="flex items-center gap-4">
              <div class="w-11 h-11 bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500/20 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0">
                <lucide-icon [name]="SearchIcon" size="20" class="text-orange-400"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-bold text-white tracking-tight">Soy un Cliente / Constructor</p>
                <p class="text-xs text-zinc-400 font-normal mt-0.5">Buscar materiales y comparar precios al instante</p>
              </div>
              <lucide-icon [name]="ArrowRightIcon" size="16" class="text-zinc-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all duration-300"></lucide-icon>
            </div>
          </button>

          <!-- TIENDA -->
          <button
            type="button"
            (click)="elegirRol('tienda')"
            class="w-full group bg-[#0e1118]/85 hover:bg-[#121520] border border-white/[0.08] hover:border-white/30 rounded-2xl p-4.5 transition-all duration-300 active:scale-[0.98] shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-left"
          >
            <div class="flex items-center gap-4">
              <div class="w-11 h-11 bg-white/[0.05] border border-white/10 group-hover:bg-white/[0.1] rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0">
                <lucide-icon [name]="StoreIcon" size="20" class="text-zinc-200"></lucide-icon>
              </div>
              <div class="flex-1">
                <p class="text-sm font-bold text-white tracking-tight">Soy una Ferretería / Depósito</p>
                <p class="text-xs text-zinc-400 font-normal mt-0.5">Control de almacén, cotizaciones y ventas directas</p>
              </div>
              <lucide-icon [name]="ArrowRightIcon" size="16" class="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300"></lucide-icon>
            </div>
          </button>

        </div>

        <!-- ACCESO DIRECTO MODO DEMO -->
        <div class="mt-8 pt-6 border-t border-white/[0.08]">
          <div class="flex items-center justify-center gap-1.5 mb-3">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
              Probar Demo Instantánea (Sin Registro)
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-3">
            <!-- Botón Demo Cliente -->
            <button
              type="button"
              (click)="entrarDemo('cliente')"
              class="flex flex-col items-center justify-center p-3.5 bg-[#0e1118]/85 border border-white/[0.08] hover:border-orange-500/40 rounded-2xl hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] transition-all active:scale-95 group text-center"
            >
              <div class="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-2 group-hover:bg-orange-500/20 transition-colors">
                <lucide-icon [name]="SearchIcon" size="18"></lucide-icon>
              </div>
              <span class="text-xs font-bold text-white leading-tight">Demo Cliente</span>
              <span class="text-[10px] font-mono text-zinc-500 mt-0.5">Comparador & Carrito</span>
            </button>

            <!-- Botón Demo Ferretería -->
            <button
              type="button"
              (click)="entrarDemo('tienda')"
              class="flex flex-col items-center justify-center p-3.5 bg-[#0e1118]/85 border border-white/[0.08] hover:border-white/30 rounded-2xl hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all active:scale-95 group text-center"
            >
              <div class="w-9 h-9 rounded-xl bg-white/[0.05] text-zinc-300 flex items-center justify-center mb-2 group-hover:bg-white/[0.1] transition-colors">
                <lucide-icon [name]="StoreIcon" size="18"></lucide-icon>
              </div>
              <span class="text-xs font-bold text-white leading-tight">Demo Ferretería</span>
              <span class="text-[10px] font-mono text-zinc-500 mt-0.5">WMS & Catálogo</span>
            </button>
          </div>
        </div>

        <!-- Login link -->
        <p class="mt-8 text-center text-xs font-mono text-zinc-500">
          ¿Ya tienes cuenta?
          <button
            (click)="iniciarSesion.emit()"
            class="font-bold text-orange-400 hover:text-orange-300 transition-colors ml-1 uppercase tracking-wide"
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
