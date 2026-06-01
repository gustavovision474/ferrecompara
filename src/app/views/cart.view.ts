import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Phone, MessageCircle, PackageCheck, ShoppingBag } from 'lucide-angular';
import { CartService } from '../cart.service';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 pb-32">
      <!-- Header -->
      <div class="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <lucide-icon [name]="CartIcon" class="text-[#E8541C]" size="22"></lucide-icon>
          </div>
          <div>
            <h1 class="text-base font-black text-gray-900 leading-none">Mi Carrito</h1>
            <p class="text-[10px] font-medium text-gray-400 mt-0.5">{{ cart.totalItems() }} producto{{ cart.totalItems() !== 1 ? 's' : '' }}</p>
          </div>
        </div>
        @if (!cart.isEmpty()) {
          <button (click)="confirmClear()" class="text-red-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
            <lucide-icon [name]="TrashIcon" size="20"></lucide-icon>
          </button>
        }
      </div>

      <!-- Empty State -->
      @if (cart.isEmpty()) {
        <div class="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
          <div class="w-28 h-28 bg-orange-50 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
            <lucide-icon [name]="BagIcon" class="text-[#E8541C]" size="52"></lucide-icon>
          </div>
          <h2 class="text-2xl font-black text-gray-900 mb-3">Tu carrito está vacío</h2>
          <p class="text-sm text-gray-400 font-medium leading-relaxed mb-8">
            Explora el catálogo y agrega los productos que necesitas para tu obra.
          </p>
          <button
            (click)="store.setTab('home')"
            class="bg-[#E8541C] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/30 active:scale-95 transition-all"
          >
            Explorar productos
          </button>
        </div>
      }

      <!-- Cart Items -->
      @if (!cart.isEmpty()) {
        <div class="px-4 pt-6 space-y-4">
          @for (item of cart.items(); track item.product.id + item.storeName) {
            <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-in slide-in-from-bottom duration-300">
              <div class="p-4 flex gap-4">
                <!-- Product Image -->
                <div class="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img [src]="item.product.image" [alt]="item.product.name" class="w-full h-full object-contain p-1" onerror="this.style.display='none'" />
                </div>
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ item.product.category }}</p>
                  <h3 class="text-sm font-black text-gray-900 leading-tight mt-0.5 truncate">{{ item.product.name }}</h3>
                  <p class="text-[10px] font-bold text-gray-400 mt-0.5 flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
                    {{ item.storeName }}
                  </p>
                  <p class="text-lg font-black text-[#E8541C] mt-2 leading-none">
                    \${{ (item.product.minPrice * item.quantity).toFixed(2) }}
                  </p>
                </div>
                <!-- Delete -->
                <button
                  (click)="cart.removeItem(item.product.id, item.storeName)"
                  class="self-start p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <lucide-icon [name]="TrashIcon" size="16"></lucide-icon>
                </button>
              </div>
              <!-- Quantity Controls -->
              <div class="px-4 pb-4 flex items-center justify-between">
                <div class="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
                  <button
                    (click)="cart.decreaseQty(item.product.id, item.storeName)"
                    class="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-700 font-black active:scale-95 transition-transform"
                  >
                    <lucide-icon [name]="MinusIcon" size="14"></lucide-icon>
                  </button>
                  <span class="w-10 text-center text-sm font-black text-gray-900">{{ item.quantity }}</span>
                  <button
                    (click)="cart.increaseQty(item.product.id, item.storeName)"
                    class="w-8 h-8 bg-[#E8541C] rounded-xl flex items-center justify-center shadow-sm text-white font-black active:scale-95 transition-transform"
                  >
                    <lucide-icon [name]="PlusIcon" size="14"></lucide-icon>
                  </button>
                </div>
                <p class="text-[10px] font-bold text-gray-400">
                  \${{ item.product.minPrice.toFixed(2) }} c/u
                </p>
              </div>

              <!-- Contact Actions -->
              @if (item.storePhone) {
                <div class="mx-4 mb-4 flex gap-2">
                  <a [href]="'tel:' + item.storePhone" class="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-green-100 transition-colors">
                    <lucide-icon [name]="PhoneIcon" size="14"></lucide-icon>
                    Llamar
                  </a>
                  <a [href]="getWhatsappLink(item)" target="_blank" class="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors">
                    <lucide-icon [name]="MsgIcon" size="14"></lucide-icon>
                    WhatsApp
                  </a>
                </div>
              }
            </div>
          }
        </div>

        <!-- Order Summary -->
        <div class="mx-4 mt-6 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
            <lucide-icon [name]="CheckIcon" class="text-green-500" size="18"></lucide-icon>
            Resumen del pedido
          </h3>
          <div class="space-y-3">
            @for (item of cartByStore(); track item.storeName) {
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-bold text-gray-700">{{ item.storeName }}</p>
                  <p class="text-[10px] text-gray-400">{{ item.totalItems }} producto{{ item.totalItems !== 1 ? 's' : '' }}</p>
                </div>
                <p class="text-sm font-black text-gray-900">\${{ item.subtotal.toFixed(2) }}</p>
              </div>
            }
            <div class="border-t border-gray-100 pt-3 mt-3 flex items-center justify-between">
              <p class="text-base font-black text-gray-900">Total estimado</p>
              <p class="text-xl font-black text-[#E8541C]">\${{ cart.totalPrice().toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <!-- Disclaimer -->
        <p class="text-center text-[10px] text-gray-400 font-medium px-8 mt-4">
          * Los precios son referenciales. El precio final lo confirma cada ferretería al momento del pedido.
        </p>
      }
    </div>

    <!-- Sticky Bottom CTA -->
    @if (!cart.isEmpty()) {
      <div class="fixed bottom-[72px] left-4 right-4 z-40">
        <div class="bg-[#E8541C] rounded-[28px] h-[68px] flex items-center px-6 shadow-2xl shadow-orange-500/40">
          <div class="flex-1">
            <p class="text-[10px] font-black text-white/70 uppercase tracking-widest">Total estimado</p>
            <p class="text-xl font-black text-white leading-none">\${{ cart.totalPrice().toFixed(2) }}</p>
          </div>
          <div class="h-10 w-px bg-white/20 mx-4"></div>
          <button (click)="compartirCarrito()" class="bg-white text-[#E8541C] px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider active:scale-95 transition-transform shadow-sm">
            Compartir lista
          </button>
        </div>
      </div>
    }
  `
})
export class CartViewComponent {
  protected cart = inject(CartService);
  protected store = inject(StoreService);

  readonly CartIcon = ShoppingCart;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly BackIcon = ArrowLeft;
  readonly PhoneIcon = Phone;
  readonly MsgIcon = MessageCircle;
  readonly CheckIcon = PackageCheck;
  readonly BagIcon = ShoppingBag;

  cartByStore() {
    const map = new Map<string, { storeName: string; subtotal: number; totalItems: number; phone: string }>();
    for (const item of this.cart.items()) {
      const prev = map.get(item.storeName);
      if (prev) {
        prev.subtotal += item.product.minPrice * item.quantity;
        prev.totalItems += item.quantity;
      } else {
        map.set(item.storeName, {
          storeName: item.storeName,
          subtotal: item.product.minPrice * item.quantity,
          totalItems: item.quantity,
          phone: item.storePhone
        });
      }
    }
    return Array.from(map.values());
  }

  getWhatsappLink(item: any): string {
    const phone = item.storePhone?.replace(/\D/g, '') || '593';
    const lista = this.cart.items()
      .filter(i => i.storeName === item.storeName)
      .map(i => `• ${i.product.name} x${i.quantity} = $${(i.product.minPrice * i.quantity).toFixed(2)}`)
      .join('\n');
    const msg = encodeURIComponent(
      `Hola, vi sus productos en FerreExpress y quiero cotizar:\n\n${lista}\n\nTotal: $${this.cart.totalPrice().toFixed(2)}`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  }

  compartirCarrito() {
    const lista = this.cart.items()
      .map(i => `• ${i.product.name} (${i.storeName}) x${i.quantity} = $${(i.product.minPrice * i.quantity).toFixed(2)}`)
      .join('\n');
    const texto = `🔨 Mi lista de materiales - FerreExpress\n\n${lista}\n\n💰 Total: $${this.cart.totalPrice().toFixed(2)}`;

    if (navigator.share) {
      navigator.share({ title: 'Mi carrito FerreExpress', text: texto });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      alert('Lista copiada al portapapeles ✓');
    }
  }

  confirmClear() {
    if (confirm('¿Vaciar el carrito?')) this.cart.clearCart();
  }
}
