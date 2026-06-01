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
    <nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(31,41,55,0.08)]">
      @for (tab of tabs; track tab.id) {
        <button
          (click)="store.setTab(tab.id)"
          [class]="'relative flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all active:opacity-80 ' + (store.activeTab() === tab.id ? 'text-[#E8541C] bg-orange-50' : 'text-gray-500')"
        >
          @if (tab.id === 'cart' && cart.totalItems() > 0) {
            <div class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#E8541C] rounded-full flex items-center justify-center">
              <span class="text-white text-[10px] font-black leading-none">{{ cart.totalItems() > 9 ? '9+' : cart.totalItems() }}</span>
            </div>
          }
          <lucide-icon [name]="tab.icon" size="24" [color]="store.activeTab() === tab.id ? '#E8541C' : 'currentColor'"></lucide-icon>
          <span class="text-[11px] font-bold uppercase tracking-wider mt-1">{{ tab.label }}</span>
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

