import { Component, Input, inject } from '@angular/core';
import { LucideAngularModule, Heart, TrendingUp, ShoppingCart } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { Product } from '../types';
import { StoreService } from '../store.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div 
      (click)="store.selectProduct(product.id)"
      class="group relative bg-white border border-gray-100 rounded-[32px] p-3 transition-all hover:shadow-2xl hover:shadow-gray-100 hover:-translate-y-1 cursor-pointer"
    >
      <div class="relative aspect-square overflow-hidden rounded-[24px] bg-gray-50 mb-3">
        <img 
          [src]="product.image" 
          [alt]="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        

        <button 
          (click)="$event.stopPropagation(); store.toggleFavorite(product.id)"
          class="absolute top-3 right-3 w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center transition-all active:scale-90"
        >
          <lucide-icon 
            [name]="HeartIcon" 
            [class]="store.isFavorite(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'" 
            size="18"
          ></lucide-icon>
        </button>
      </div>
      
      <div class="px-1 pb-1">
        <span class="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">{{ product.brand }}</span>
        <h4 class="font-black text-gray-900 text-[13px] leading-tight mt-1 line-clamp-2 min-h-[2.5rem]">{{ product.name }}</h4>
        
        <div class="mt-4 flex items-center gap-1.5 text-primary-accent opacity-80">
          <lucide-icon [name]="TrendingUpIcon" size="12" class="animate-pulse"></lucide-icon>
          <span class="text-[9px] font-black uppercase tracking-widest">Tendencia hoy</span>
        </div>
        
        <div class="flex items-end justify-between mt-2">
          <div class="flex flex-col">
            <p class="text-[18px] font-black text-[#E8541C] leading-none tracking-tight">
              \${{ product.minPrice.toFixed(2) }} - \${{ product.maxPrice.toFixed(2) }}
            </p>
          </div>
          <button class="bg-[#E8541C] text-white w-9 h-9 rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-orange-100">
            <lucide-icon [name]="CartIcon" size="18"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  @Input() product!: Product;
  protected store = inject(StoreService);
  
  readonly HeartIcon = Heart;
  readonly TrendingUpIcon = TrendingUp;
  readonly CartIcon = ShoppingCart;
}
