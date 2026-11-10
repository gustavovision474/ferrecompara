import { Component, inject } from '@angular/core';
import { LucideAngularModule, Home, Wrench, User, Store, ShoppingCart } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { StoreService } from '../store.service';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <nav class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 sm:gap-2 px-3 py-2 bg-[#0b0d14]/90 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)] max-w-[94vw] sm:max-w-md">
      @for (tab of tabs; track tab.id) {
        <button
          (click)="store.setTab(tab.id)"
          [class]="'relative flex items-center gap-1.5 py-2 px-3.5 rounded-full transition-all duration-300 font-mono active:scale-95 ' + 
            (store.activeTab() === tab.id 
              ? 'bg-white/[0.08] text-orange-400 border border-white/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent')"
        >
          @if (tab.id === 'cart' && cart.totalItems() > 0) {
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(249,115,22,0.8)]">
              <span class="text-white text-[9px] font-bold leading-none">{{ cart.totalItems() > 9 ? '9+' : cart.totalItems() }}</span>
            </div>
          }
          <lucide-icon [name]="tab.icon" size="18" [color]="store.activeTab() === tab.id ? '#f97316' : 'currentColor'"></lucide-icon>
          <span class="text-[11px] font-bold uppercase tracking-wider" [class.hidden]="store.activeTab() !== tab.id && tabs.length > 4" class="sm:inline-block">
            {{ tab.label }}
          </span>
        </button>
      }
    </nav>
  `
})
export class BottomNavComponent {
  protected store = inject(StoreService);
  protected cart = inject(CartService);

  readonly tabs = [
    { id: 'home' as const, label: 'Inicio', icon: Home },
    { id: 'stores' as const, label: 'Tiendas', icon: Store },
    { id: 'cart' as const, label: 'Carrito', icon: ShoppingCart },
    { id: 'experts' as const, label: 'Expertos', icon: Wrench },
    { id: 'profile' as const, label: 'Perfil', icon: User },
  ];
}

