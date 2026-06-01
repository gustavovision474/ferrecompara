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
    <div class="min-h-screen bg-gray-50 pb-32 relative">
      <!-- GLOBAL FULLSCREEN LOADER -->
      <div *ngIf="isProcessing()" class="fixed inset-0 z-[999] bg-gray-50 flex flex-col items-center justify-center">
        <div class="w-16 h-16 border-4 border-[#E8541C] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-black text-gray-400 mt-4 tracking-widest uppercase animate-pulse">Procesando...</p>
      </div>
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
          <button (click)="confirmClear()" class="text-red-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50" [disabled]="isProcessing()">
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
      <div class="fixed bottom-[72px] left-4 right-4 z-40 flex flex-col gap-2">
        <div class="bg-[#E8541C] rounded-[28px] p-2 flex flex-col gap-2 shadow-2xl shadow-orange-500/40">
          <div class="flex items-center px-4 pt-2">
            <div class="flex-1">
              <p class="text-[10px] font-black text-white/70 uppercase tracking-widest">Total estimado</p>
              <p class="text-xl font-black text-white leading-none">\${{ cart.totalPrice().toFixed(2) }}</p>
            </div>
          </div>
          <div class="flex gap-2 px-2 pb-2">
            <button (click)="compartirCarrito()" class="flex-1 bg-white/20 text-white px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-transform flex justify-center items-center gap-2">
              <lucide-icon [name]="MsgIcon" size="14"></lucide-icon> Compartir
            </button>
            <button (click)="iniciarProcesoPedido()" [disabled]="isProcessing()" class="flex-[2] bg-white text-[#E8541C] px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-transform disabled:opacity-50 flex justify-center items-center gap-2">
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
                
                <p *ngIf="nuevaDireccion.lat && nuevaDireccion.lng" class="text-[10px] font-bold text-emerald-600 text-center mt-1 bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
                  ✅ Coordenadas: {{ nuevaDireccion.lat | number:'1.4-4' }}, {{ nuevaDireccion.lng | number:'1.4-4' }}
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
      
    const textoEnvio = this.direccionSeleccionada() ? `\n🛵 Envío a domicilio: Por favor cotizar` : '';

    const msg = encodeURIComponent(
      `Hola, vi sus productos en FerreExpress y quiero cotizar:\n\n${lista}${textoEnvio}\n\nSubtotal Materiales: $${subtotalTienda.toFixed(2)}`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  }

  compartirCarrito() {
    const lista = this.cart.items()
      .map(i => `• ${i.product.name} (${i.storeName}) x${i.quantity} = $${(i.product.minPrice * i.quantity).toFixed(2)}`)
      .join('\n');
    
    const textoEnvio = this.direccionSeleccionada() ? `\n🛵 Envío a domicilio: (Cotizar precio)` : '';
    const total = this.cart.totalPrice();
    
    const texto = `🔨 Mi lista de materiales - FerreExpress\n\n${lista}${textoEnvio}\n\n💰 Subtotal Materiales: $${total.toFixed(2)}`;

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
