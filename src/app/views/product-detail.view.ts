import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeft, MapPin, Star, ShieldCheck, Phone, Navigation, Info, ShoppingCart, Check } from 'lucide-angular';
import { StoreService } from '../store.service';
import { CartService } from '../cart.service';
@Component({
  selector: 'app-product-detail-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (store.selectedProduct(); as product) {
      <div class="bg-white min-h-screen pb-56 animate-in slide-in-from-right duration-500">
        <!-- Sticky Top Bar -->
        <div class="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 h-16 flex items-center justify-between">
          <button (click)="store.selectProduct(null)" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <lucide-icon [name]="BackIcon" size="24"></lucide-icon>
          </button>
          <span class="text-xl font-black text-[#E8541C] uppercase tracking-tighter">FerreExpress</span>
          <div class="flex items-center gap-1 text-gray-400">
            <lucide-icon [name]="PinIcon" size="18"></lucide-icon>
            <span class="text-[10px] font-bold">{{ store.userCity() || 'Ecuador' }}</span>
          </div>
        </div>

        <!-- Product Hero Image -->
        <div class="px-6 py-6">
          <div class="bg-gray-50 rounded-[40px] p-8 flex items-center justify-center relative overflow-hidden group">
            <img [src]="product.image" class="w-full h-64 object-contain group-hover:scale-105 transition-transform duration-700" />
            <div class="absolute top-4 left-4 flex flex-col gap-2">
              <span class="px-3 py-1 bg-white/90 backdrop-blur-sm text-[9px] font-black uppercase rounded-full shadow-sm">Construcción</span>
              <span class="px-3 py-1 bg-[#E8541C] text-white text-[9px] font-black uppercase rounded-full shadow-md">{{ product.category }}</span>
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="px-6">
          <h1 class="text-3xl font-black text-gray-900 leading-[1.1]">{{ product.name }}</h1>
          
          <div class="mt-4 flex items-center gap-3">
            <div class="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl flex items-center gap-2">
              <lucide-icon [name]="InfoIcon" size="14"></lucide-icon>
              <span class="text-xs font-bold">Ideal para cimentaciones y estructuras</span>
            </div>
          </div>

          <p class="mt-6 text-sm text-gray-500 leading-relaxed font-medium">
            Producto de uso general diseñado para construcciones que requieren propiedades especiales. Ofrece excelente trabajabilidad y resistencia, cumpliendo con las normativas técnicas internacionales.
          </p>

        </div>

        <!-- Mini Map Section -->
        <div class="mt-12 px-6">
          <h2 class="text-2xl font-black text-gray-900 mb-6">Ubicación de la tienda</h2>
          <div class="bg-gray-100 rounded-[40px] h-64 overflow-hidden relative group">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover opacity-60 grayscale group-hover:scale-105 transition-transform duration-700" />
            
            <!-- Map Markers Simulation -->
            <div class="absolute top-1/4 left-1/3 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center animate-pulse">
              <div class="w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
            </div>
            <div class="absolute top-1/2 left-1/2 w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center">
              <div class="w-3 h-3 bg-gray-600 rounded-full border-2 border-white"></div>
            </div>

            <!-- Floating Map Card -->
            <div class="absolute bottom-4 left-4 right-4 bg-white rounded-3xl p-4 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom duration-700">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                  <lucide-icon [name]="PinIcon" class="text-orange-600" size="24"></lucide-icon>
                </div>
                <div>
                  <h4 class="text-xs font-black text-gray-900">{{ getPrimaryOffer()?.store || 'Ferretería local' }}</h4>
                  <p class="text-[9px] font-medium text-gray-500 mt-0.5">{{ getPrimaryOffer()?.direccion || getPrimaryOffer()?.distance || 'Dirección disponible en tienda' }}</p>
                  <p class="text-xs font-black text-[#E8541C] mt-1">\${{ product.minPrice.toFixed(2) }}</p>
                </div>
              </div>
              <button (click)="abrirMapa(getPrimaryOffer())" class="bg-orange-50 text-[#E8541C] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-orange-100 transition-colors">Cómo Llegar</button>
            </div>
          </div>
        </div>

        <!-- Sticky Bottom Action Button -->
        <div class="fixed bottom-6 left-6 right-6 z-[60]">
          @if (getPrimaryOffer(); as offer) {
            <button (click)="llamar(offer)" class="w-full bg-[#E8541C] text-white h-20 rounded-[32px] shadow-2xl shadow-orange-500/30 flex items-center px-6 group active:scale-95 transition-all overflow-hidden relative">
              <div class="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
              <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <lucide-icon [name]="PhoneIcon" size="24"></lucide-icon>
              </div>
              <div class="ml-4 text-left">
                <p class="text-[10px] font-black uppercase tracking-widest opacity-80">
                  {{ offer.isCurrentStore ? 'Llamar a tienda' : 'Llamar a la mejor opción' }}
                </p>
                <p class="text-lg font-black leading-none mt-1">{{ offer.store }}</p>
              </div>
              <div class="ml-auto border-l border-white/20 pl-6 text-right">
                <p class="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">Precio</p>
                <p class="text-2xl font-black mt-1 leading-none">\${{ offer.minPrice.toFixed(2) }}</p>
              </div>
            </button>
          }

          <!-- Add to Cart Button -->
          <button
            (click)="agregarAlCarrito(product)"
            class="w-full mt-3 border-2 flex items-center justify-center gap-3 h-14 rounded-[24px] font-black text-sm uppercase tracking-wider active:scale-95 transition-all"
            [class]="cart.isInCart(product.id)
              ? 'border-green-500 text-green-600 bg-green-50'
              : 'border-[#E8541C] text-[#E8541C] bg-white'"
          >
            @if (!cart.isInCart(product.id)) {
              <lucide-icon [name]="CartIcon" size="20"></lucide-icon>
            }
            {{ cart.isInCart(product.id) ? 'En tu carrito ✓' : 'Agregar al carrito' }}
          </button>
        </div>
      </div>
    }
  `
})
export class ProductDetailViewComponent {
  protected store = inject(StoreService);
  protected cart = inject(CartService);
  
  readonly BackIcon = ArrowLeft;
  readonly PinIcon = MapPin;
  readonly StarIcon = Star;
  readonly VerifiedIcon = ShieldCheck;
  readonly PhoneIcon = Phone;
  readonly NavIcon = Navigation;
  readonly InfoIcon = Info;
  readonly CartIcon = ShoppingCart;
  readonly CheckIcon = Check;

  getPrimaryOffer(): any {
    const offers = this.store.realProductOffers();
    if (offers.length === 0) return null;
    
    // Si el usuario entró desde una tienda específica, priorizar esa tienda
    const selectedStoreId = this.store.selectedStoreId();
    if (selectedStoreId) {
      // Necesitamos asegurar que el id de la tienda viene en la oferta para poder comparar
      const currentStoreOffer = offers.find(o => o.storeId == selectedStoreId);
      if (currentStoreOffer) return currentStoreOffer;
    }
    
    return offers[0];
  }

  agregarAlCarrito(product: any) {
    const offer = this.getPrimaryOffer();
    const storeName = offer?.store || 'Ferretería local';
    const storePhone = offer?.phone || '';
    this.cart.addItem(product, storeName, storePhone);
  }

  abrirMapa(ferreteria: any) {
    if (ferreteria.latitud && ferreteria.longitud) {
      window.open(`https://www.google.com/maps?q=${ferreteria.latitud},${ferreteria.longitud}`, '_blank');
    } else {
      const query = encodeURIComponent(`${ferreteria.store || ferreteria.nombre} ${ferreteria.direccion || ferreteria.distance || ''}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  }

  contactarWhatsApp(ferreteria: any, producto: any) {
    const telefono = (ferreteria.phone || ferreteria.telefono)?.replace(/\D/g, '') || '593';
    const mensaje = encodeURIComponent(`Hola, estoy interesado en el producto ${producto.name} que vi en FerreExpress.`);
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
  }

  llamar(ferreteria: any) {
    const telefono = (ferreteria.phone || ferreteria.telefono)?.replace(/\D/g, '');
    if (telefono) {
      window.location.href = `tel:${telefono}`;
    }
  }

  getStockClass(stock: string): string {
    const base = 'w-2 h-2 rounded-full ';
    if (stock === 'Agotado') return base + 'bg-red-400';
    if (stock.includes('15')) return base + 'bg-orange-400';
    return base + 'bg-green-400';
  }
}
