import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Phone, MessageCircle, PackageCheck, ShoppingBag, X, MapPin, CreditCard, ShieldCheck, Lock, Banknote, Landmark } from 'lucide-angular';
import { CartService } from '../cart.service';
import { StoreService } from '../store.service';
import { SupabaseService } from '../supabase.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#07080b] text-zinc-100 pb-36 relative max-w-4xl mx-auto">
      <!-- GLOBAL FULLSCREEN LOADER -->
      <div *ngIf="isProcessing()" class="fixed inset-0 z-[999] bg-[#07080b] flex flex-col items-center justify-center">
        <div class="w-14 h-14 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <p class="text-xs font-mono font-bold text-zinc-400 mt-4 tracking-widest uppercase animate-pulse">Procesando orden...</p>
      </div>

      <!-- Header with macOS window dots -->
      <div class="sticky top-0 z-40 bg-[#07080b]/85 backdrop-blur-2xl border-b border-white/[0.08] px-6 h-16 flex items-center justify-between shadow-lg">
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-1.5 mr-1 py-1 px-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span class="w-2 h-2 rounded-full bg-red-500/80"></span>
            <span class="w-2 h-2 rounded-full bg-amber-500/80"></span>
            <span class="w-2 h-2 rounded-full bg-emerald-500/80"></span>
          </div>
          <div class="w-9 h-9 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
            <lucide-icon [name]="CartIcon" class="text-orange-400" size="18"></lucide-icon>
          </div>
          <div>
            <h1 class="text-sm font-bold text-white leading-none">Mi Carrito de Compras</h1>
            <p class="text-[10px] font-mono text-zinc-500 mt-0.5">{{ cart.totalItems() }} ítem{{ cart.totalItems() !== 1 ? 's' : '' }} en orden</p>
          </div>
        </div>
        @if (!cart.isEmpty()) {
          <button (click)="confirmClear()" class="text-zinc-500 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-white/[0.05]" [disabled]="isProcessing()">
            <lucide-icon [name]="TrashIcon" size="18"></lucide-icon>
          </button>
        }
      </div>

      <!-- Empty State -->
      @if (cart.isEmpty()) {
        <div class="flex flex-col items-center justify-center min-h-[65vh] px-8 text-center">
          <div class="w-20 h-20 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center mb-5">
            <lucide-icon [name]="BagIcon" class="text-orange-400" size="36"></lucide-icon>
          </div>
          <h2 class="text-xl font-bold text-white mb-2">Tu carrito está vacío</h2>
          <p class="text-xs text-zinc-400 font-normal leading-relaxed mb-6 max-w-sm">
            Explora las ferreterías locales y añade materiales o herramientas para cotizar.
          </p>
          <button
            (click)="store.setTab('home')"
            class="bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-full font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.2)] active:scale-95 transition-all"
          >
            Explorar catálogo
          </button>
        </div>
      }

      <!-- Cart Items -->
      @if (!cart.isEmpty()) {
        <div class="px-4 pt-6 space-y-3.5">
          @for (item of cart.items(); track item.product.id + item.storeName) {
            <div class="bg-[#0e1118]/85 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg border border-white/[0.08] hover:border-white/20 transition-all">
              <div class="p-4 flex gap-4">
                <!-- Product Image -->
                <div class="w-16 h-16 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img [src]="item.product.image" [alt]="item.product.name" class="w-full h-full object-contain p-1" onerror="this.style.display='none'" />
                </div>
                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{{ item.product.category }}</p>
                  <h3 class="text-sm font-bold text-white leading-tight mt-0.5 truncate">{{ item.product.name }}</h3>
                  <p class="text-[10px] font-mono text-zinc-400 mt-1 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"></span>
                    {{ item.storeName }}
                  </p>
                  <p class="text-base font-mono font-bold text-white mt-1.5 leading-none">
                    \${{ (item.product.minPrice * item.quantity).toFixed(2) }}
                  </p>
                </div>
                <!-- Delete -->
                <button
                  (click)="cart.removeItem(item.product.id, item.storeName)"
                  class="self-start p-2 text-zinc-500 hover:text-red-400 hover:bg-white/[0.05] rounded-xl transition-colors"
                >
                  <lucide-icon [name]="TrashIcon" size="16"></lucide-icon>
                </button>
              </div>
              <!-- Quantity Controls -->
              <div class="px-4 pb-4 flex items-center justify-between border-t border-white/[0.04] pt-3">
                <div class="flex items-center gap-1 bg-zinc-900/90 border border-white/10 rounded-2xl p-1">
                  <button
                    (click)="cart.decreaseQty(item.product.id, item.storeName)"
                    class="w-7 h-7 bg-white/[0.05] hover:bg-white/10 rounded-xl flex items-center justify-center text-zinc-300 font-bold active:scale-95 transition-all"
                  >
                    <lucide-icon [name]="MinusIcon" size="12"></lucide-icon>
                  </button>
                  <span class="w-8 text-center text-xs font-mono font-bold text-white">{{ item.quantity }}</span>
                  <button
                    (click)="cart.increaseQty(item.product.id, item.storeName)"
                    class="w-7 h-7 bg-orange-500 hover:bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold active:scale-95 transition-all shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                  >
                    <lucide-icon [name]="PlusIcon" size="12"></lucide-icon>
                  </button>
                </div>
                <p class="text-[10px] font-mono text-zinc-500">
                  \${{ item.product.minPrice.toFixed(2) }} c/u
                </p>
              </div>

              <!-- Contact Actions -->
              @if (item.storePhone) {
                <div class="mx-4 mb-4 flex gap-2">
                  <a [href]="'tel:' + item.storePhone" class="flex-1 flex items-center justify-center gap-1.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider border border-white/[0.06] transition-all">
                    <lucide-icon [name]="PhoneIcon" size="12"></lucide-icon>
                    Llamar
                  </a>
                  <a [href]="getWhatsappLink(item)" target="_blank" class="flex-1 flex items-center justify-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider border border-emerald-500/20 transition-all">
                    <lucide-icon [name]="MsgIcon" size="12"></lucide-icon>
                    WhatsApp
                  </a>
                </div>
              }
            </div>
          }
        </div>

        <!-- Order Summary -->
        <div class="mx-4 mt-6 bg-[#0e1118]/85 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/[0.08]">
          <h3 class="text-sm font-mono font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
            Resumen del pedido
          </h3>
          <div class="space-y-3 font-mono text-xs">
            @for (item of cartByStore(); track item.storeName) {
              <div class="flex items-center justify-between text-zinc-400">
                <div>
                  <p class="font-bold text-zinc-200">{{ item.storeName }}</p>
                  <p class="text-[10px] text-zinc-500">{{ item.totalItems }} producto{{ item.totalItems !== 1 ? 's' : '' }}</p>
                </div>
                <p class="font-bold text-white">\${{ item.subtotal.toFixed(2) }}</p>
              </div>
            }
            <div class="border-t border-white/[0.08] pt-3 mt-3 flex items-center justify-between">
              <p class="text-sm font-bold text-white">Total estimado</p>
              <p class="text-lg font-bold text-orange-400">\${{ cart.totalPrice().toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <!-- Disclaimer -->
        <p class="text-center text-[10px] font-mono text-zinc-500 px-8 mt-4">
          Precios referenciales proporcionados por cada ferretería aliada.
        </p>
      }
    </div>

    <!-- Sticky Bottom CTA -->
    @if (!cart.isEmpty()) {
      <div class="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto">
        <div class="bg-[#0b0d14]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 flex flex-col gap-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <div class="flex items-center justify-between px-3 pt-1">
            <p class="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Total Orden</p>
            <p class="text-lg font-mono font-bold text-white leading-none">\${{ cart.totalPrice().toFixed(2) }}</p>
          </div>
          <div class="flex gap-2">
            <button (click)="compartirCarrito()" class="flex-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 px-3 py-2.5 rounded-2xl text-[11px] font-mono uppercase tracking-wider border border-white/10 active:scale-95 transition-all flex justify-center items-center gap-1.5">
              <lucide-icon [name]="MsgIcon" size="14"></lucide-icon> Compartir
            </button>
            <button (click)="iniciarProcesoPedido()" [disabled]="isProcessing()" class="flex-[2] bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-2xl text-[11px] font-mono font-bold uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.35)]">
              @if(isProcessing()) {
                <span class="animate-pulse">Procesando...</span>
              } @else {
                <lucide-icon [name]="CheckIcon" size="14"></lucide-icon> Confirmar Pedido
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Address Selection Modal -->
    @if (showAddressSelection()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="showAddressSelection.set(false)"></div>
        <div class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
          <div class="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-sm font-black text-gray-900 uppercase">Selecciona tu Dirección</h3>
            <button (click)="showAddressSelection.set(false)" class="text-gray-400 hover:text-gray-600">
              <lucide-icon [name]="XIcon" size="20"></lucide-icon>
            </button>
          </div>
          <div class="p-5 max-h-[60vh] overflow-y-auto space-y-3">
            @if (direccionesGuardadas().length === 0 && !isAddingAddress()) {
              <div class="text-center py-4">
                <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                  <lucide-icon [name]="PinIcon" size="24"></lucide-icon>
                </div>
                <p class="text-xs font-bold text-gray-400">No tienes direcciones guardadas.</p>
              </div>
            }

            @for (dir of direccionesGuardadas(); track dir.calle) {
              <div 
                (click)="direccionSeleccionada.set(dir)"
                [class]="'p-4 rounded-2xl border cursor-pointer transition-all ' + (direccionSeleccionada() === dir ? 'border-[#E8541C] bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-300')"
              >
                <div class="flex items-center gap-3">
                  <lucide-icon [name]="PinIcon" size="18" [class]="direccionSeleccionada() === dir ? 'text-[#E8541C]' : 'text-gray-400'"></lucide-icon>
                  <div>
                    <p class="text-sm font-black text-gray-900 leading-tight">{{ dir.calle }}</p>
                    <p class="text-[10px] text-gray-500 mt-1">{{ dir.referencia || 'Sin referencia' }}</p>
                    <p *ngIf="dir.lat && dir.lng" class="text-[9px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                      <lucide-icon [name]="PinIcon" size="8"></lucide-icon> GPS Exacto Capturado
                    </p>
                  </div>
                </div>
              </div>
            }

            @if (!isAddingAddress()) {
              <button 
                (click)="isAddingAddress.set(true)"
                class="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:border-[#E8541C] hover:text-[#E8541C] hover:bg-orange-50 transition-all mt-2"
              >
                <lucide-icon [name]="PlusIcon" size="16"></lucide-icon> Añadir Nueva Dirección
              </button>
            } @else {
              <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 mt-2 space-y-3 animate-in slide-in-from-top-2 duration-300">
                <div class="flex items-center justify-between">
                  <h4 class="text-[10px] font-black text-gray-900 uppercase tracking-widest">Nueva Dirección</h4>
                  <button *ngIf="direccionesGuardadas().length > 0" (click)="isAddingAddress.set(false)" class="text-gray-400 hover:text-gray-900">
                    <lucide-icon [name]="XIcon" size="14"></lucide-icon>
                  </button>
                </div>
                <div>
                  <label class="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Calle principal y número</label>
                  <input type="text" [(ngModel)]="nuevaDireccion.calle" placeholder="Ej. Av. 9 de Octubre" class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all" />
                </div>
                <div>
                  <label class="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1">Referencia</label>
                  <input type="text" [(ngModel)]="nuevaDireccion.referencia" placeholder="Frente al parque..." class="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all" />
                </div>
                
                <button (click)="obtenerUbicacionGPS()" class="w-full bg-orange-50 text-orange-700 border border-orange-200 rounded-xl py-3 font-black text-[10px] uppercase tracking-widest mt-2 hover:bg-orange-100 transition-colors flex items-center justify-center gap-2">
                  <lucide-icon [name]="PinIcon" size="14"></lucide-icon>
                  Obtener mi Ubicación GPS
                </button>
                
                <p *ngIf="nuevaDireccion.lat && nuevaDireccion.lng" class="text-[10px] font-bold text-emerald-400 text-center mt-1 bg-emerald-950/40 py-1.5 rounded-lg border border-emerald-500/30 flex items-center justify-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Coordenadas: {{ nuevaDireccion.lat | number:'1.4-4' }}, {{ nuevaDireccion.lng | number:'1.4-4' }}
                </p>
                <button 
                  (click)="guardarNuevaDireccion()" 
                  class="w-full bg-gray-900 text-white rounded-xl py-3 font-black text-[10px] uppercase tracking-widest mt-2 hover:bg-black transition-colors"
                >
                  Guardar y Seleccionar
                </button>
              </div>
            }
          </div>
          <div class="p-5 border-t border-gray-100 bg-white flex flex-col gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button 
              (click)="confirmarConDireccion()" 
              [disabled]="!direccionSeleccionada()"
              class="w-full bg-[#E8541C] text-white py-3 rounded-xl font-black text-[11px] uppercase tracking-wider disabled:opacity-50"
            >
              Continuar al Pago Seguro
            </button>
            <button (click)="irAPago(null)" class="text-[10px] font-bold text-gray-400 uppercase underline text-center w-full">
              Continuar sin dirección (Retiro en local)
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Payment Modal (Kushki Mock) -->
    @if (showPaymentModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="!isProcessing() && showPaymentModal.set(false)"></div>
        <div class="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 duration-300">
          <!-- Header -->
          <div class="bg-gray-900 p-5 flex justify-between items-center relative overflow-hidden">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
            <h3 class="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
              <lucide-icon [name]="LockIcon" size="16" class="text-emerald-400"></lucide-icon> Pago Seguro
            </h3>
            <button *ngIf="!isProcessing()" (click)="showPaymentModal.set(false)" class="text-gray-400 hover:text-white transition-colors">
              <lucide-icon [name]="XIcon" size="20"></lucide-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6">
            <div class="flex items-center gap-2 mb-6 justify-center">
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered by</span>
              <img src="https://kushkipagos.com/images/logo_kushki.svg" alt="Kushki" class="h-4 opacity-50 grayscale" onerror="this.style.display='none'">
              <span class="text-xs font-black text-gray-900 ml-1">KUSHKI</span>
            </div>

            <!-- SELECTOR DE MÉTODO DE PAGO -->
            <div class="flex gap-1.5 mb-6 bg-gray-50 p-1.5 rounded-2xl">
              <button type="button" (click)="metodoPago.set('tarjeta')" [class]="'flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ' + (metodoPago() === 'tarjeta' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')">
                <lucide-icon [name]="CreditCardIcon" size="16"></lucide-icon> Tarjeta
              </button>
              <button type="button" (click)="metodoPago.set('transferencia')" [class]="'flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ' + (metodoPago() === 'transferencia' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')">
                <lucide-icon [name]="LandmarkIcon" size="16"></lucide-icon> Transf.
              </button>
              <button type="button" (click)="metodoPago.set('efectivo')" [class]="'flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ' + (metodoPago() === 'efectivo' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')">
                <lucide-icon [name]="BanknoteIcon" size="16"></lucide-icon> Efectivo
              </button>
            </div>

            <form class="space-y-4" (ngSubmit)="procesarPagoYPedido()">
              @if (metodoPago() === 'tarjeta') {
                <div class="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Número de Tarjeta</label>
                    <div class="relative">
                      <input type="text" placeholder="0000 0000 0000 0000" maxlength="19" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 pl-12 text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all tracking-widest" />
                      <lucide-icon [name]="CreditCardIcon" size="18" class="text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"></lucide-icon>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Vencimiento</label>
                      <input type="text" placeholder="MM/AA" maxlength="5" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all text-center tracking-widest" />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">CVC/CVV</label>
                      <div class="relative">
                        <input type="password" placeholder="***" maxlength="4" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all text-center tracking-widest" />
                        <lucide-icon [name]="ShieldCheckIcon" size="16" class="text-gray-400 absolute right-4 top-1/2 -translate-y-1/2"></lucide-icon>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Nombre del Titular</label>
                    <input type="text" placeholder="JUAN PEREZ" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 outline-none transition-all uppercase" />
                  </div>
                </div>
              } @else if (metodoPago() === 'transferencia') {
                <div class="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl text-center space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <lucide-icon [name]="LandmarkIcon" size="24"></lucide-icon>
                  </div>
                  <h4 class="text-sm font-black text-indigo-900 uppercase">Transferencia Bancaria</h4>
                  <p class="text-xs text-indigo-700/80 font-medium leading-relaxed">Al confirmar el pedido, recibirás los datos de la cuenta bancaria de la ferretería por WhatsApp para realizar el depósito.</p>
                </div>
              } @else {
                <div class="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-center space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <lucide-icon [name]="BanknoteIcon" size="24"></lucide-icon>
                  </div>
                  <h4 class="text-sm font-black text-emerald-900 uppercase">Pago en Efectivo</h4>
                  <p class="text-xs text-emerald-700/80 font-medium leading-relaxed">Pagarás el total exacto en efectivo al momento de recibir tus materiales o retirarlos en el local.</p>
                </div>
              }

              <div class="mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2 text-xs font-bold text-gray-700">
                <div class="flex justify-between">
                  <span>Subtotal Materiales:</span>
                  <span>{{ cart.totalPrice() | currency }}</span>
                </div>
                <div *ngIf="direccionSeleccionada()" class="flex justify-between text-[#E8541C]">
                  <span>Envío a domicilio:</span>
                  <span class="text-[10px]">Por cotizar</span>
                </div>
                <div class="flex justify-between text-gray-900 text-sm border-t border-gray-200 pt-2 mt-1">
                  <span>Total Estimado:</span>
                  <span>{{ cart.totalPrice() | currency }}</span>
                </div>
              </div>

              <button 
                type="submit" 
                [disabled]="isProcessing()"
                class="w-full bg-gray-900 text-white rounded-xl py-4 font-black text-sm tracking-widest flex flex-col items-center justify-center gap-1 hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-wait shadow-xl shadow-gray-200"
              >
                @if (isProcessing()) {
                  <span class="flex items-center gap-2"><div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> PROCESANDO...</span>
                } @else {
                  <span class="flex items-center gap-2">{{ metodoPago() === 'tarjeta' ? 'PAGAR' : 'CONFIRMAR' }} {{ cart.totalPrice() | currency }}</span>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class CartViewComponent implements OnInit {
  protected cart = inject(CartService);
  protected store = inject(StoreService);
  protected supabase = inject(SupabaseService);
  readonly CartIcon = ShoppingCart;
  readonly TrashIcon = Trash2;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly BackIcon = ArrowLeft;
  readonly PhoneIcon = Phone;
  readonly MsgIcon = MessageCircle;
  readonly CheckIcon = PackageCheck;
  readonly BagIcon = ShoppingBag;
  readonly XIcon = X;
  readonly PinIcon = MapPin;
  readonly CreditCardIcon = CreditCard;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly LockIcon = Lock;
  readonly BanknoteIcon = Banknote;
  readonly LandmarkIcon = Landmark;

  isProcessing = signal(false);
  showAddressSelection = signal(false);
  showPaymentModal = signal(false);
  pendingAddressText = signal<string | null>(null);
  metodoPago = signal<'tarjeta' | 'efectivo' | 'transferencia'>('tarjeta');
  direccionesGuardadas = signal<any[]>([]);
  direccionSeleccionada = signal<any | null>(null);

  isAddingAddress = signal(false);
  nuevaDireccion = {
    calle: '',
    referencia: '',
    lat: null as number | null,
    lng: null as number | null
  };

  ngOnInit() {
    const savedDirs = localStorage.getItem('ferrecompara_direcciones');
    if (savedDirs) {
      try {
        this.direccionesGuardadas.set(JSON.parse(savedDirs));
      } catch (e) {
        console.error('Error parsing saved addresses', e);
      }
    }
  }

  obtenerUbicacionGPS() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.nuevaDireccion.lat = position.coords.latitude;
          this.nuevaDireccion.lng = position.coords.longitude;
          this.nuevaDireccion.referencia = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
          alert('Ubicación GPS capturada con éxito.');
        },
        (error) => {
          alert('Error al obtener la ubicación. Asegúrate de dar permisos a tu navegador.');
          console.error(error);
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  }

  iniciarProcesoPedido() {
    this.showAddressSelection.set(true);
    if (this.direccionesGuardadas().length === 0) {
      this.isAddingAddress.set(true);
    }
  }

  guardarNuevaDireccion() {
    if (!this.nuevaDireccion.calle) {
      alert('Por favor, ingresa al menos la calle principal.');
      return;
    }
    const nueva = { ...this.nuevaDireccion };
    const nuevasDirecciones = [...this.direccionesGuardadas(), nueva];
    this.direccionesGuardadas.set(nuevasDirecciones);
    
    localStorage.setItem('ferrecompara_direcciones', JSON.stringify(nuevasDirecciones));
    
    this.nuevaDireccion = { calle: '', referencia: '', lat: null, lng: null };
    this.isAddingAddress.set(false);
    this.direccionSeleccionada.set(nueva);
  }

  confirmarConDireccion() {
    this.showAddressSelection.set(false);
    const dir = this.direccionSeleccionada();
    const direccionText = dir ? `${dir.calle} ${dir.referencia ? '(' + dir.referencia + ')' : ''}` : null;
    this.irAPago(direccionText);
  }

  irAPago(direccion: string | null) {
    this.pendingAddressText.set(direccion);
    this.showAddressSelection.set(false);
    this.showPaymentModal.set(true);
  }

  async procesarPagoYPedido() {
    this.isProcessing.set(true);
    
    // Si es con tarjeta, simulamos la tokenización
    if (this.metodoPago() === 'tarjeta') {
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      // Pequeño delay de UX
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.showPaymentModal.set(false);
    
    const metodoString = this.metodoPago() === 'tarjeta' ? 'Tarjeta (Kushki)' : (this.metodoPago() === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo');
    const direccionActual = this.pendingAddressText();
    const direccionConPago = direccionActual ? `${direccionActual} | Pago: ${metodoString}` : `Retiro en local | Pago: ${metodoString}`;
    
    await this.procesarPedido(direccionConPago);
  }
  cartByStore() {
    const map = new Map<string, { storeId: string; storeName: string; subtotal: number; totalItems: number; phone: string; items: any[] }>();
    for (const item of this.cart.items()) {
      const prev = map.get(item.storeName);
      if (prev) {
        prev.subtotal += item.product.minPrice * item.quantity;
        prev.totalItems += item.quantity;
        prev.items.push(item);
      } else {
        map.set(item.storeName, {
          storeId: (item as any).storeId || (item.product as any).tienda_id || '1', // fallback si no viene storeId
          storeName: item.storeName,
          subtotal: item.product.minPrice * item.quantity,
          totalItems: item.quantity,
          phone: item.storePhone,
          items: [item]
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
    const subtotalTienda = this.cart.items()
      .filter(i => i.storeName === item.storeName)
      .reduce((sum, i) => sum + (i.product.minPrice * i.quantity), 0);
      
    const textoEnvio = this.direccionSeleccionada() ? `\nEnvío a domicilio: Por favor cotizar` : '';

    const msg = encodeURIComponent(
      `Hola, vi sus productos en FerreExpress y quiero cotizar:\n\n${lista}${textoEnvio}\n\nSubtotal Materiales: $${subtotalTienda.toFixed(2)}`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  }

  compartirCarrito() {
    const lista = this.cart.items()
      .map(i => `• ${i.product.name} (${i.storeName}) x${i.quantity} = $${(i.product.minPrice * i.quantity).toFixed(2)}`)
      .join('\n');
    
    const textoEnvio = this.direccionSeleccionada() ? `\nEnvío a domicilio: (Cotizar precio)` : '';
    const total = this.cart.totalPrice();
    
    const texto = `Mi lista de materiales - FerreExpress\n\n${lista}${textoEnvio}\n\nSubtotal Materiales: $${total.toFixed(2)}`;

    if (navigator.share) {
      navigator.share({ title: 'Mi carrito FerreExpress', text: texto });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      alert('Lista copiada al portapapeles');
    }
  }

  confirmClear() {
    if (confirm('¿Vaciar el carrito?')) this.cart.clearCart();
  }

  async procesarPedido(direccionText: string | null = null) {
    this.isProcessing.set(true);
    try {
      const groupedItems = this.cartByStore().map(storeGroup => {
        return {
          tiendaId: Number(storeGroup.storeId) || 1,
          subtotal: storeGroup.subtotal,
          items: storeGroup.items
        };
      });
      
      await this.supabase.crearPedidos(groupedItems, direccionText);
      
      alert('¡Pedido procesado exitosamente!');
      this.cart.clearCart();
      this.store.setTab('profile'); // Send them to the profile to see it
    } catch (e) {
      console.error(e);
      alert('Ocurrió un error al procesar tu pedido. Verifica tu sesión o conexión.');
    } finally {
      this.isProcessing.set(false);
    }
  }
}
