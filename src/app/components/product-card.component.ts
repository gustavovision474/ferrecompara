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
      class="group relative bg-[#0e1118]/90 backdrop-blur-xl border border-white/[0.08] hover:border-white/20 rounded-[28px] p-3.5 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(249,115,22,0.12)] hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
    >
      <div class="relative aspect-square overflow-hidden rounded-[20px] bg-black/40 border border-white/[0.05] mb-3">
        <img 
          [src]="product.image" 
          [alt]="product.name"
          (error)="$any($event.target).src='https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600&auto=format&fit=crop'"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
        />
        
        <button 
          (click)="$event.stopPropagation(); store.toggleFavorite(product.id)"
          class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all active:scale-90 hover:border-white/30"
        >
          <lucide-icon 
            [name]="HeartIcon" 
            [class]="store.isFavorite(product.id) ? 'text-red-500 fill-current' : 'text-zinc-400'" 
            size="15"
          ></lucide-icon>
        </button>
      </div>
      
      <div class="px-1 pb-1 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{{ product.brand }}</span>
            <div class="flex items-center gap-1 text-orange-400">
              <span class="w-1 h-1 rounded-full bg-orange-400 animate-pulse"></span>
              <span class="text-[9px] font-mono uppercase tracking-wider text-zinc-400">En red</span>
            </div>
          </div>
          <h4 class="font-bold text-zinc-100 text-[13px] leading-tight mt-1 line-clamp-2 min-h-[2.4rem]">{{ product.name }}</h4>
        </div>
        
        <div class="flex items-end justify-between mt-3 pt-2 border-t border-white/[0.06]">
          <div class="flex flex-col">
            <span class="text-[9px] font-mono text-zinc-500 uppercase">Rango</span>
            <p class="text-[16px] font-mono font-bold text-white leading-none tracking-tight">
              \${{ product.minPrice.toFixed(2) }} - \${{ product.maxPrice.toFixed(2) }}
            </p>
          </div>
          <button class="bg-orange-500/10 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 w-8 h-8 rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-[0_0_12px_rgba(249,115,22,0.15)] group-hover:border-orange-500/60">
            <lucide-icon [name]="CartIcon" size="15"></lucide-icon>
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
