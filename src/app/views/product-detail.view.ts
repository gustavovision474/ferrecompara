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
      <div class="bg-[#07080b] text-zinc-100 min-h-screen pb-56 animate-in slide-in-from-right duration-500 max-w-4xl mx-auto">
        <!-- Sticky Top Bar -->
        <div class="sticky top-0 z-50 bg-[#07080b]/85 backdrop-blur-2xl border-b border-white/[0.08] px-4 h-16 flex items-center justify-between">
          <button (click)="store.selectProduct(null)" class="p-2 hover:bg-white/[0.05] rounded-full transition-colors text-zinc-400 hover:text-white">
            <lucide-icon [name]="BackIcon" size="20"></lucide-icon>
          </button>
          <span class="text-base font-bold tracking-tight text-white uppercase font-mono">FerreCompara</span>
          <div class="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
            <lucide-icon [name]="PinIcon" size="14" class="text-orange-400"></lucide-icon>
            <span>{{ store.userCity() || 'Ecuador' }}</span>
          </div>
        </div>

        <!-- Product Hero Image -->
        <div class="px-6 py-6">
          <div class="bg-[#0e1118]/85 border border-white/[0.08] rounded-[32px] p-8 flex items-center justify-center relative overflow-hidden group shadow-2xl">
            <img [src]="product.image" (error)="$any($event.target).src='https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600&auto=format&fit=crop'" class="w-full h-64 object-contain group-hover:scale-105 transition-transform duration-700" />
            <div class="absolute top-4 left-4 flex flex-col gap-2">
              <span class="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono font-bold text-zinc-300 uppercase rounded-full">Construcción</span>
              <span class="px-3 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 text-[9px] font-mono font-bold uppercase rounded-full">{{ product.category }}</span>
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="px-6">
          <h1 class="text-2xl sm:text-3xl font-black text-white leading-tight">{{ product.name }}</h1>
          
          <div class="mt-4 flex items-center gap-3">
            <div class="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-2 rounded-2xl flex items-center gap-2">
              <lucide-icon [name]="InfoIcon" size="14"></lucide-icon>
              <span class="text-xs font-mono">Material estándar certificado para obras civiles</span>
            </div>
          </div>

          <p class="mt-5 text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
            Producto de alta calidad para construcción y remodelación. Suministrado directamente por depósitos y ferreterías asociadas con stock garantizado en tu zona.
          </p>
        </div>

        <!-- Mini Map Section -->
        <div class="mt-10 px-6">
          <h2 class="text-lg font-bold text-white mb-4 font-mono">Ubicación del Distribuidor</h2>
          <div class="bg-[#0b0d14] rounded-3xl h-60 overflow-hidden relative group border border-white/10 shadow-xl">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" class="w-full h-full object-cover opacity-40 grayscale group-hover:scale-105 transition-transform duration-700" />
            
            <!-- Map Markers Simulation -->
            <div class="absolute top-1/4 left-1/3 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center animate-pulse">
              <div class="w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
            </div>

            <!-- Floating Map Card -->
            <div class="absolute bottom-3 left-3 right-3 bg-[#0d1017]/90 backdrop-blur-xl rounded-2xl p-3.5 border border-white/10 shadow-2xl flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
                  <lucide-icon [name]="PinIcon" class="text-orange-400" size="18"></lucide-icon>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white">{{ getPrimaryOffer()?.store || 'Ferretería local' }}</h4>
                  <p class="text-[9px] font-mono text-zinc-400 mt-0.5">{{ getPrimaryOffer()?.direccion || getPrimaryOffer()?.distance || 'Dirección disponible en local' }}</p>
                  <p class="text-xs font-mono font-bold text-orange-400 mt-0.5">\${{ product.minPrice.toFixed(2) }}</p>
                </div>
              </div>
              <button (click)="abrirMapa(getPrimaryOffer())" class="bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-400 px-3.5 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all">Cómo Llegar</button>
            </div>
          </div>
        </div>

        <!-- Sticky Bottom Action Button -->
        <div class="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-[60] flex flex-col gap-2">
          @if (getPrimaryOffer(); as offer) {
            <button (click)="llamar(offer)" class="w-full bg-[#0b0d14]/95 backdrop-blur-2xl border border-white/10 hover:border-orange-500/40 text-white h-16 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.9)] flex items-center px-4 group active:scale-95 transition-all overflow-hidden relative">
              <div class="w-10 h-10 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-xl flex items-center justify-center shrink-0">
                <lucide-icon [name]="PhoneIcon" size="18"></lucide-icon>
              </div>
              <div class="ml-3 text-left">
                <p class="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                  {{ offer.isCurrentStore ? 'Llamar a tienda' : 'Llamar a la mejor opción' }}
                </p>
                <p class="text-sm font-bold text-white leading-tight mt-0.5">{{ offer.store }}</p>
              </div>
              <div class="ml-auto border-l border-white/10 pl-4 text-right">
                <p class="text-[9px] font-mono uppercase tracking-widest text-zinc-500">Precio</p>
                <p class="text-lg font-mono font-bold text-orange-400 leading-none mt-0.5">\${{ offer.minPrice.toFixed(2) }}</p>
              </div>
            </button>
          }

          <!-- Add to Cart Button -->
          <button
            (click)="agregarAlCarrito(product)"
            class="w-full flex items-center justify-center gap-2 h-12 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
            [class]="cart.isInCart(product.id)
              ? 'border border-emerald-500/40 text-emerald-400 bg-emerald-950/40'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.35)]'"
          >
            @if (!cart.isInCart(product.id)) {
              <lucide-icon [name]="CartIcon" size="16"></lucide-icon>
            }
            {{ cart.isInCart(product.id) ? 'En tu carrito' : 'Agregar al carrito' }}
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
