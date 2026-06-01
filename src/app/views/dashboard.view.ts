import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Settings, Package, CreditCard, Bell, Shield, LogOut, ChevronRight, MapPin, ArrowLeft, Construction, Lock, Save, CheckCircle, Camera, XCircle, MessageCircle } from 'lucide-angular';
import { AuthService } from '../auth.service';
import { StoreService } from '../store.service';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="pb-24 bg-gray-50 min-h-screen relative">
      <!-- GLOBAL FULLSCREEN LOADER -->
      <div *ngIf="cargandoGlobal()" class="fixed inset-0 z-[999] bg-gray-50 flex flex-col items-center justify-center">
        <div class="w-16 h-16 border-4 border-[#E8541C] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-black text-gray-400 mt-4 tracking-widest uppercase animate-pulse">Cargando...</p>
      </div>
      @if (activeView() === 'main') {
        <div class="animate-in slide-in-from-bottom duration-500">
          <!-- Profile Header -->
          <section class="px-6 pt-6 pb-10 bg-white border-b border-gray-100 shadow-sm">
            <div class="flex items-center gap-5">
              <div class="relative shrink-0">
                <img 
                  [src]="auth.profile()?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'" 
                  class="w-20 h-20 rounded-3xl object-cover ring-4 ring-orange-50 shadow-lg" 
                />
                <button 
                  (click)="abrirEdicion()"
                  class="absolute -bottom-1 -right-1 bg-[#E8541C] text-white p-1.5 rounded-xl shadow-md hover:scale-110 transition-transform"
                >
                  <lucide-icon [name]="SettingsIcon" size="14"></lucide-icon>
                </button>
              </div>
              <div class="min-w-0">
                <h1 class="text-2xl font-black text-gray-900 leading-tight truncate">
                  {{ auth.profile()?.nombre_completo || 'Usuario' }}
                </h1>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">Cliente</p>
                <div class="flex items-center gap-1.5 mt-2 text-emerald-600 truncate">
                  <lucide-icon [name]="PinIcon" size="12" class="shrink-0"></lucide-icon>
                  <span class="text-[10px] font-bold uppercase truncate">{{ auth.profile()?.ciudad || 'Ecuador' }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- User Stats -->
          <section class="px-6 -mt-6 grid grid-cols-2 gap-3 relative z-10">
            <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-md text-center">
              <p class="text-xl font-black text-gray-900 leading-none">{{ pedidosData().length || 0 }}</p>
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1.5">Órdenes</p>
            </div>
            <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-md text-center">
              <p class="text-xl font-black text-gray-900 leading-none">{{ store.favorites().length || 0 }}</p>
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1.5">Favoritos</p>
            </div>
          </section>

          <!-- Menu Options -->
          <section class="px-6 mt-8 space-y-2">
            <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Configuración de Cuenta</h2>
            
            @for (item of menuItems; track item.label) {
              <button 
                (click)="seleccionarMenu(item.label)"
                class="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all hover:border-gray-300 shadow-sm"
              >
                <div class="flex items-center gap-4">
                  <div [class]="'p-2.5 rounded-xl ' + item.bg + ' ' + item.color">
                    <lucide-icon [name]="item.icon" size="20"></lucide-icon>
                  </div>
                  <div class="text-left">
                    <p class="font-bold text-sm text-gray-900 leading-none">{{ item.label }}</p>
                    <p class="text-[10px] text-gray-400 mt-1">{{ item.desc }}</p>
                  </div>
                </div>
                <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#E8541C] group-hover:text-white transition-colors">
                  <lucide-icon [name]="ChevronIcon" size="16" class="text-gray-400 group-hover:text-white transition-colors"></lucide-icon>
                </div>
              </button>
            }
          </section>

          <!-- Danger Zone -->
          <section class="px-6 mt-10">
            <button 
              (click)="onLogout()"
              class="w-full bg-white border border-red-100 text-red-600 rounded-2xl p-4 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95 transition-all hover:bg-red-50 shadow-sm"
            >
              <lucide-icon [name]="LogoutIcon" size="18"></lucide-icon>
              Cerrar Sesión
            </button>
          </section>
        </div>
      } 
      
      <!-- VISTA: EDITAR PERFIL -->
      @else if (activeView() === 'Editar Perfil') {
        <div class="animate-in slide-in-from-right duration-300 bg-gray-50 min-h-screen">
          <header class="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <button (click)="activeView.set('main')" class="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full">
              <lucide-icon [name]="ArrowLeftIcon" size="20"></lucide-icon>
            </button>
            <h2 class="text-sm font-black uppercase tracking-widest text-gray-900">Editar Perfil</h2>
            <div class="w-8"></div>
          </header>

          <div class="p-6 space-y-6">
            <!-- Avatar -->
            <div class="flex flex-col items-center gap-3">
              <div class="relative group cursor-pointer" (click)="avatarInput.click()">
                <img 
                  [src]="avatarPreview || auth.profile()?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'" 
                  class="w-24 h-24 rounded-3xl object-cover ring-4 ring-orange-50 shadow-lg group-hover:ring-orange-200 transition-all"
                />
                <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-[#E8541C] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <lucide-icon [name]="CameraIcon" size="14"></lucide-icon>
                </div>
                <input #avatarInput type="file" (change)="onAvatarSelected($event)" accept="image/*" class="hidden" />
              </div>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Foto de Perfil</p>
            </div>

            <!-- Formulario -->
            <div class="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  name="nombre"
                  [(ngModel)]="perfilForm.nombre" 
                  placeholder="Tu nombre" 
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#E8541C] focus:border-transparent outline-none transition-all" 
                />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  [value]="auth.profile()?.email || ''"
                  disabled
                  class="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-400 outline-none cursor-not-allowed" 
                />
                <p class="text-[9px] text-gray-400 mt-1 ml-1">* El email no puede cambiarse desde aquí</p>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Teléfono</label>
                <input 
                  type="tel" 
                  name="telefono"
                  [(ngModel)]="perfilForm.telefono" 
                  placeholder="+593 ..." 
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#E8541C] focus:border-transparent outline-none transition-all" 
                />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Ciudad</label>
                <input 
                  type="text"
                  name="ciudad"
                  [(ngModel)]="perfilForm.ciudad" 
                  placeholder="Ej: Guayaquil" 
                  class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#E8541C] focus:border-transparent outline-none transition-all" 
                />
              </div>
            </div>

            <!-- Toast de éxito -->
            @if (guardadoExitoso()) {
              <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in duration-300">
                <lucide-icon [name]="CheckCircleIcon" size="20"></lucide-icon>
                <p class="text-sm font-bold">¡Perfil actualizado con éxito!</p>
              </div>
            }

            <!-- Botón Guardar -->
            <button 
              (click)="guardarPerfil()"
              [disabled]="guardando()"
              class="w-full bg-gray-900 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <lucide-icon [name]="SaveIcon" size="18" [class.animate-pulse]="guardando()"></lucide-icon>
              {{ guardando() ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      }
      
      @else {
        <!-- SUB-VISTAS genéricas -->
        <div class="animate-in slide-in-from-right duration-300 bg-gray-50 min-h-screen">
          <header class="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <button (click)="activeView.set('main')" class="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full">
              <lucide-icon [name]="ArrowLeftIcon" size="20"></lucide-icon>
            </button>
            <h2 class="text-sm font-black uppercase tracking-widest text-gray-900">{{ activeView() }}</h2>
            <div class="w-8"></div>
          </header>

          <div class="p-6">
            @if (activeView() === 'Seguridad') {
              <div class="space-y-6">
                <!-- Tarjeta de Contraseña -->
                <div class="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                  <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                      <lucide-icon [name]="LockIcon" size="18"></lucide-icon>
                    </div>
                    <div>
                      <h3 class="text-sm font-black text-gray-900 uppercase">Cambiar Contraseña</h3>
                      <p class="text-[10px] text-gray-400 font-bold">Protege tu cuenta con una clave segura</p>
                    </div>
                  </div>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Contraseña Actual</label>
                      <input type="password" placeholder="••••••••" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Nueva Contraseña</label>
                      <input type="password" placeholder="••••••••" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Confirmar Contraseña</label>
                      <input type="password" placeholder="••••••••" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <button class="w-full bg-indigo-600 text-white rounded-xl py-4 font-black text-[11px] uppercase tracking-widest mt-4 shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                      <lucide-icon [name]="ShieldIcon" size="16"></lucide-icon>
                      Actualizar Seguridad
                    </button>
                  </div>
                </div>

                <!-- Autenticación en 2 pasos -->
                <div class="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-black text-gray-900">Autenticación en 2 pasos</h3>
                    <p class="text-[10px] text-gray-400 font-bold mt-1">Añade una capa extra de seguridad</p>
                  </div>
                  <div class="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                    <div class="w-5 h-5 bg-white rounded-full shadow absolute top-0.5 left-0.5"></div>
                  </div>
                </div>
              </div>
            } @else if (activeView() === 'Mis Créditos') {
              <div class="space-y-6">
                <!-- Estado de Solicitudes -->
                <div>
                  <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Mis Solicitudes</h3>
                  
                  <div *ngIf="cargandoCreditos()" class="flex justify-center py-8">
                    <div class="w-6 h-6 border-2 border-[#E8541C] border-t-transparent rounded-full animate-spin"></div>
                  </div>

                  <div *ngIf="!cargandoCreditos() && creditosData().solicitudes.length === 0" class="bg-white p-6 rounded-3xl border border-gray-100 text-center shadow-sm">
                    <p class="text-xs font-bold text-gray-400">No has solicitado ningún crédito.</p>
                  </div>

                  <div *ngIf="!cargandoCreditos()" class="space-y-3">
                    <div *ngFor="let sol of creditosData().solicitudes" class="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
                      <div>
                        <h4 class="text-xs font-black text-gray-900">{{ sol.nombre_tienda }}</h4>
                        <p class="text-[10px] font-medium text-gray-500 mt-0.5">{{ sol.monto_solicitado | currency }} a {{ sol.plazo_meses }} meses</p>
                      </div>
                      <div class="text-right shrink-0">
                        <span 
                          [ngClass]="{
                            'bg-yellow-50 text-yellow-600 border-yellow-200': sol.estado === 'pendiente',
                            'bg-emerald-50 text-emerald-600 border-emerald-200': sol.estado === 'aprobada',
                            'bg-red-50 text-red-600 border-red-200': sol.estado === 'rechazada'
                          }"
                          class="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border"
                        >
                          {{ sol.estado }}
                        </span>
                        <p class="text-[9px] text-gray-400 font-medium mt-1">{{ sol.fecha_solicitud | date:'shortDate' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Créditos Activos -->
                <div>
                  <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Créditos Activos</h3>
                  
                  <div *ngIf="!cargandoCreditos() && creditosData().activos.length === 0" class="bg-white p-6 rounded-3xl border border-gray-100 text-center shadow-sm">
                    <p class="text-xs font-bold text-gray-400">No tienes créditos activos.</p>
                  </div>

                  <div *ngIf="!cargandoCreditos()" class="space-y-3">
                    <div *ngFor="let cred of creditosData().activos" class="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
                      <div class="flex items-start justify-between mb-3">
                        <div>
                          <h4 class="text-sm font-black text-emerald-900 uppercase">{{ cred.nombre_tienda }}</h4>
                          <p class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Línea Aprobada</p>
                        </div>
                        <lucide-icon [name]="CheckCircleIcon" size="20" class="text-emerald-500"></lucide-icon>
                      </div>
                      <div class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-emerald-200/50">
                        <div>
                          <p class="text-[9px] font-bold text-emerald-600/70 uppercase">Monto Total</p>
                          <p class="text-xs font-black text-emerald-900">{{ cred.monto_aprobado | currency }}</p>
                        </div>
                        <div class="text-right">
                          <p class="text-[9px] font-bold text-emerald-600/70 uppercase">Saldo Pendiente</p>
                          <p class="text-xs font-black text-red-600">{{ cred.saldo_pendiente | currency }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            } @else if (activeView() === 'Mis Pedidos') {
              <div class="space-y-6">
                <div>
                  <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Mis Compras</h3>
                  
                  <div *ngIf="cargandoPedidos()" class="flex justify-center py-8">
                    <div class="w-6 h-6 border-2 border-[#E8541C] border-t-transparent rounded-full animate-spin"></div>
                  </div>

                  <div *ngIf="!cargandoPedidos() && pedidosData().length === 0" class="bg-white p-6 rounded-3xl border border-gray-100 text-center shadow-sm">
                    <p class="text-xs font-bold text-gray-400">Aún no has realizado pedidos.</p>
                  </div>

                  <div *ngIf="!cargandoPedidos()" class="space-y-4">
                    <div *ngFor="let pedido of pedidosData()" class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                      <div class="flex items-center justify-between mb-3">
                        <div>
                          <h4 class="text-xs font-black text-gray-900">{{ pedido.tiendas?.nombre || 'Ferretería' }}</h4>
                          <p class="text-[10px] font-medium text-gray-500 mt-0.5">{{ pedido.fecha_pedido | date:'short' }}</p>
                        </div>
                        <div class="text-right">
                          <span 
                            [ngClass]="{
                              'bg-yellow-50 text-yellow-600 border-yellow-200': pedido.estado === 'pendiente',
                              'bg-blue-50 text-blue-600 border-blue-200': pedido.estado === 'aprobado' || pedido.estado === 'confirmado',
                              'bg-emerald-50 text-emerald-600 border-emerald-200': pedido.estado === 'entregado',
                              'bg-red-50 text-red-600 border-red-200': pedido.estado === 'rechazado'
                            }"
                            class="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border"
                          >
                            {{ pedido.estado }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="space-y-2 mb-3 bg-gray-50 rounded-xl p-3">
                        <div *ngFor="let item of pedido.pedidos_items" class="flex justify-between items-center text-[11px]">
                          <span class="text-gray-700 font-medium">{{ item.cantidad }}x {{ item.nombre_producto }}</span>
                          <span class="text-gray-900 font-bold">{{ item.precio_unitario * item.cantidad | currency }}</span>
                        </div>
                        <div *ngIf="pedido.direccion" class="flex justify-between items-center text-[11px] pt-2 border-t border-gray-200 mt-2">
                          <span class="text-[#E8541C] font-bold flex items-center gap-1"><lucide-icon [name]="PinIcon" size="10"></lucide-icon> Envío a Domicilio</span>
                          <span class="text-gray-900 font-bold">
                            {{ getCostoEnvio(pedido) > 0 ? (getCostoEnvio(pedido) | currency) : (pedido.estado === 'pendiente' ? 'Por cotizar' : 'Gratis') }}
                          </span>
                        </div>
                      </div>

                      <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span class="text-[10px] font-bold text-gray-400 uppercase">Total {{ pedido.estado === 'pendiente' ? 'Materiales' : 'Final' }}</span>
                        <span class="text-lg font-black text-[#E8541C]">{{ pedido.total | currency }}</span>
                      </div>
                      
                      <!-- Dirección de entrega -->
                      <div *ngIf="pedido.direccion" class="mt-3 bg-orange-50 border border-orange-100 p-2.5 rounded-xl flex items-start gap-2">
                        <lucide-icon [name]="PinIcon" size="14" class="text-[#E8541C] mt-0.5 shrink-0"></lucide-icon>
                        <div>
                          <p class="text-[9px] font-bold text-[#E8541C] uppercase tracking-widest mb-0.5">Entregar en:</p>
                          <p class="text-xs font-medium text-orange-900 leading-tight">{{ pedido.direccion }}</p>
                        </div>
                      </div>

                      <!-- Botones de Acción (Cliente) -->
                      <div *ngIf="pedido.estado === 'aprobado' || pedido.estado === 'pendiente'" class="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-2">
                        
                        <!-- Botón WhatsApp si está pendiente -->
                        <button 
                          *ngIf="pedido.estado === 'pendiente' && pedido.direccion"
                          (click)="contactarFerreteria(pedido)"
                          class="bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C7E] hover:bg-[#25D366]/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                        >
                          <lucide-icon [name]="MessageCircleIcon" size="14"></lucide-icon>
                          Cotizar Envío (WhatsApp)
                        </button>
                        
                        <!-- Botón Cancelar -->
                        <button 
                          (click)="cancelarPedido(pedido)"
                          [disabled]="cancelandoPedido === pedido.id"
                          class="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <lucide-icon [name]="XCircleIcon" size="14" [class.animate-spin]="cancelandoPedido === pedido.id"></lucide-icon>
                          Cancelar Pedido
                        </button>

                        <!-- Botón Aceptar Precio si está aprobado -->
                        <button 
                          *ngIf="pedido.estado === 'aprobado'"
                          (click)="aceptarPrecio(pedido)"
                          [disabled]="aceptandoPedido === pedido.id"
                          class="bg-blue-600 text-white hover:bg-blue-700 shadow-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <lucide-icon [name]="CheckCircleIcon" size="14" [class.animate-spin]="aceptandoPedido === pedido.id"></lucide-icon>
                          Aceptar Precio
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } @else if (activeView() === 'Direcciones') {
              <div class="space-y-6">
                <!-- Agregar Nueva Dirección -->
                <div class="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
                  <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                      <lucide-icon [name]="PinIcon" size="18"></lucide-icon>
                    </div>
                    <div>
                      <h3 class="text-sm font-black text-gray-900 uppercase">Nueva Dirección</h3>
                      <p class="text-[10px] text-gray-400 font-bold">Añade un punto de entrega exacto</p>
                    </div>
                  </div>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Calle principal y número</label>
                      <input type="text" [(ngModel)]="nuevaDireccion.calle" placeholder="Ej. Av. 9 de Octubre y Boyacá" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">Referencia o Link de Google Maps</label>
                      <input type="text" [(ngModel)]="nuevaDireccion.referencia" placeholder="Ej. Frente al parque / https://maps.app.goo.gl/..." class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                    </div>
                    
                    <button (click)="obtenerUbicacionGPS()" class="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl py-3 font-black text-[10px] uppercase tracking-widest mt-2 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                      <lucide-icon [name]="PinIcon" size="14"></lucide-icon>
                      Obtener mi Ubicación GPS (Precisión Alta)
                    </button>
                    
                    <p *ngIf="nuevaDireccion.lat && nuevaDireccion.lng" class="text-[10px] font-bold text-emerald-600 text-center mt-2 bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
                      ✅ Coordenadas: {{ nuevaDireccion.lat | number:'1.4-4' }}, {{ nuevaDireccion.lng | number:'1.4-4' }}
                    </p>

                    <button (click)="guardarDireccion()" class="w-full bg-emerald-600 text-white rounded-xl py-4 font-black text-[11px] uppercase tracking-widest mt-4 shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                      <lucide-icon [name]="SaveIcon" size="16"></lucide-icon>
                      Guardar Dirección
                    </button>
                  </div>
                </div>

                <!-- Lista de Direcciones -->
                <div>
                  <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Mis Direcciones Guardadas</h3>
                  <div *ngIf="direccionesGuardadas().length === 0" class="bg-white p-6 rounded-3xl border border-gray-100 text-center shadow-sm">
                    <p class="text-xs font-bold text-gray-400">Aún no has guardado ninguna dirección.</p>
                  </div>
                  
                  <div class="space-y-3">
                    <div *ngFor="let dir of direccionesGuardadas()" class="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex items-start gap-3 relative overflow-hidden group">
                      <div class="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                      <div class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <lucide-icon [name]="PinIcon" size="14" class="text-emerald-500"></lucide-icon>
                      </div>
                      <div class="flex-1">
                        <h4 class="text-xs font-black text-gray-900">{{ dir.calle }}</h4>
                        <p class="text-[10px] font-medium text-gray-500 mt-0.5">{{ dir.referencia || 'Sin referencia' }}</p>
                        <p *ngIf="dir.lat && dir.lng" class="text-[9px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                          <lucide-icon [name]="PinIcon" size="8"></lucide-icon> GPS Exacto Capturado
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } @else if (activeView() === 'Notificaciones') {
              <div class="space-y-4">
                <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Centro de Notificaciones</h3>
                
                <!-- Notificación Tipo: Aprobación -->
                <div class="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm flex items-start gap-4">
                  <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <lucide-icon [name]="CheckCircleIcon" size="20"></lucide-icon>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-black text-gray-900">¡Crédito Aprobado!</h4>
                    <p class="text-xs text-gray-500 mt-1 leading-snug">Tu solicitud de crédito en <strong>Ferretería Central</strong> por $500 ha sido aprobada. Ya puedes usarlo para tus compras.</p>
                    <span class="text-[9px] font-bold text-gray-400 mt-2 block">Hace 2 horas</span>
                  </div>
                </div>

                <!-- Notificación Tipo: Pedido -->
                <div class="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex items-start gap-4 relative overflow-hidden">
                  <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <lucide-icon [name]="PackageIcon" size="20"></lucide-icon>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-black text-gray-900">Pedido en Camino</h4>
                    <p class="text-xs text-gray-500 mt-1 leading-snug">Tu pedido <strong>#864FAC</strong> está en ruta hacia tu dirección de entrega. Llegará pronto.</p>
                    <span class="text-[9px] font-bold text-gray-400 mt-2 block">Ayer, 15:30</span>
                  </div>
                </div>

                <!-- Notificación Tipo: Rechazo / Alerta -->
                <div class="bg-white border border-red-100 rounded-2xl p-4 shadow-sm flex items-start gap-4">
                  <div class="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <lucide-icon [name]="XCircleIcon" size="20"></lucide-icon>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-black text-gray-900">Producto sin stock</h4>
                    <p class="text-xs text-gray-500 mt-1 leading-snug">Lamentamos informarte que el producto <em>Amoladora DeWalt</em> de tu carrito ya no está disponible en la tienda.</p>
                    <span class="text-[9px] font-bold text-gray-400 mt-2 block">Ayer, 09:15</span>
                  </div>
                </div>

                <!-- Notificación Tipo: Promoción -->
                <div class="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 shadow-sm flex items-start gap-4">
                  <div class="w-10 h-10 rounded-full bg-orange-100 text-[#E8541C] flex items-center justify-center shrink-0">
                    <lucide-icon [name]="BellIcon" size="20"></lucide-icon>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-black text-gray-900">Descuento Especial</h4>
                    <p class="text-xs text-gray-600 mt-1 leading-snug">Tienes un <strong>15% de descuento</strong> en toda la categoría de Herramientas Eléctricas válido por 24 horas.</p>
                    <span class="text-[9px] font-bold text-gray-500 mt-2 block">Hace 3 días</span>
                  </div>
                </div>

              </div>
            } @else {
              <!-- Pantalla genérica para las demás opciones -->
              <div class="flex flex-col items-center justify-center text-center mt-12">
                <div class="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 text-gray-300 border-4 border-gray-50">
                  <lucide-icon [name]="ConstructionIcon" size="40"></lucide-icon>
                </div>
                <h3 class="text-xl font-black text-gray-900 tracking-tight">Próximamente</h3>
                <p class="text-sm text-gray-500 mt-2 font-medium max-w-[250px]">Estamos trabajando para habilitar la sección de <span class="font-bold text-gray-900">{{ activeView() }}</span> muy pronto.</p>
                
                <button (click)="activeView.set('main')" class="mt-8 bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-sm hover:bg-gray-50">
                  Volver al Perfil
                </button>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardViewComponent implements OnInit, OnDestroy {
  protected auth = inject(AuthService);
  protected store = inject(StoreService);
  private supabase = inject(SupabaseService);

  activeView = signal<string>('main');
  guardando = signal<boolean>(false);
  guardadoExitoso = signal<boolean>(false);

  avatarPreview = '';
  selectedAvatarFile: File | null = null;

  cargandoGlobal = computed(() => 
    this.cargandoCreditos() || 
    this.cargandoPedidos() || 
    this.guardando()
  );

  // Formulario de edición
  perfilForm = {
    nombre: '',
    telefono: '',
    ciudad: ''
  };

  readonly SettingsIcon = Settings;
  readonly PinIcon = MapPin;
  readonly ChevronIcon = ChevronRight;
  readonly LogoutIcon = LogOut;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ConstructionIcon = Construction;
  readonly LockIcon = Lock;
  readonly ShieldIcon = Shield;
  readonly SaveIcon = Save;
  readonly CheckCircleIcon = CheckCircle;
  readonly CameraIcon = Camera;
  readonly DollarSignIcon = CreditCard; 
  readonly BellIcon = Bell;
  readonly PackageIcon = Package;
  readonly XCircleIcon = XCircle;
  readonly MessageCircleIcon = MessageCircle;

  readonly menuItems = [
    { label: 'Mis Créditos', desc: 'Gestiona tus solicitudes y créditos', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Editar Perfil', desc: 'Cambia tu nombre, teléfono y ciudad', icon: User, color: 'text-[#E8541C]', bg: 'bg-orange-50' },
    { label: 'Mis Pedidos', desc: 'Sigue tus compras y envíos', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Direcciones', desc: 'Gestiona tus puntos de entrega', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Notificaciones', desc: 'Alertas de precios y ofertas', icon: Bell, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Seguridad', desc: 'Contraseña y verificación', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  creditosData = signal<{ solicitudes: any[], activos: any[] }>({ solicitudes: [], activos: [] });
  cargandoCreditos = signal(false);

  pedidosData = signal<any[]>([]);
  cargandoPedidos = signal(false);
  cancelandoPedido: string | null = null;
  aceptandoPedido: string | null = null;

  nuevaDireccion = {
    calle: '',
    referencia: '',
    lat: null as number | null,
    lng: null as number | null
  };
  direccionesGuardadas = signal<any[]>([]);

  realtimeChannel: any;

  ngOnInit() {
    this.cargarPedidos();
    this.suscribirseAPedidos();
    
    const savedDirs = localStorage.getItem('ferrecompara_direcciones');
    if (savedDirs) {
      try {
        this.direccionesGuardadas.set(JSON.parse(savedDirs));
      } catch (e) {
        console.error('Error parseando direcciones locales', e);
      }
    }
  }

  ngOnDestroy() {
    if (this.realtimeChannel) {
      this.supabase.getClient().removeChannel(this.realtimeChannel);
    }
  }

  suscribirseAPedidos() {
    this.realtimeChannel = this.supabase.getClient()
      .channel('cliente-pedidos-cambios')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        (payload: any) => {
          // Recarga silenciosa
          this.supabase.obtenerMisPedidos().then(res => {
            this.pedidosData.set(res);
          });
        }
      )
      .subscribe();
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

  guardarDireccion() {
    if (!this.nuevaDireccion.calle) {
      alert('Por favor, ingresa al menos la calle principal.');
      return;
    }
    const nueva = { ...this.nuevaDireccion };
    const nuevasDirecciones = [...this.direccionesGuardadas(), nueva];
    this.direccionesGuardadas.set(nuevasDirecciones);
    
    // Persist to local storage
    localStorage.setItem('ferrecompara_direcciones', JSON.stringify(nuevasDirecciones));
    
    this.nuevaDireccion = { calle: '', referencia: '', lat: null, lng: null };
    alert('¡Dirección guardada exitosamente!');
  }

  seleccionarMenu(menu: string) {
    this.activeView.set(menu);
    if (menu === 'Mis Créditos') {
      this.cargarCreditos();
    } else if (menu === 'Mis Pedidos') {
      this.cargarPedidos();
    }
  }

  async cargarCreditos() {
    this.cargandoCreditos.set(true);
    try {
      const res = await this.supabase.obtenerMisCreditos();
      this.creditosData.set(res);
    } catch (error) {
      console.error('Error al cargar créditos', error);
    } finally {
      this.cargandoCreditos.set(false);
    }
  }

  async cargarPedidos() {
    this.cargandoPedidos.set(true);
    try {
      const res = await this.supabase.obtenerMisPedidos();
      this.pedidosData.set(res);
    } catch (error) {
      console.error('Error al cargar pedidos', error);
    } finally {
      this.cargandoPedidos.set(false);
    }
  }

  getSubtotal(pedido: any): number {
    if (!pedido.pedidos_items) return 0;
    return pedido.pedidos_items.reduce((sum: number, item: any) => sum + (item.precio_unitario * item.cantidad), 0);
  }

  getCostoEnvio(pedido: any): number {
    return Math.max(0, pedido.total - this.getSubtotal(pedido));
  }

  async cancelarPedido(pedido: any) {
    if (!confirm('¿Deseas cancelar este pedido?')) return;
    
    this.cancelandoPedido = pedido.id;
    try {
      await this.supabase.actualizarEstadoPedido(pedido.id, 'rechazado', 0);
      const newList = this.pedidosData().map(p => p.id === pedido.id ? { ...p, estado: 'rechazado' } : p);
      this.pedidosData.set(newList);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al cancelar el pedido.');
    } finally {
      this.cancelandoPedido = null;
    }
  }

  async aceptarPrecio(pedido: any) {
    this.aceptandoPedido = pedido.id;
    try {
      await this.supabase.actualizarEstadoPedido(pedido.id, 'aprobado', 0);
      const newList = this.pedidosData().map(p => p.id === pedido.id ? { ...p, estado: 'confirmado' } : p);
      this.pedidosData.set(newList);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al aceptar el precio.');
    } finally {
      this.aceptandoPedido = null;
    }
  }

  contactarFerreteria(pedido: any) {
    const phone = pedido.tiendas?.telefono?.replace(/\D/g, '') || '593';
    
    const listaProductos = pedido.pedidos_items
      ?.map((i: any) => `• ${i.cantidad}x ${i.nombre_producto}`)
      .join('\n') || '';

    // Si está pendiente de cotización de envío
    const direccionText = pedido.direccion ? `a la dirección:\n📍 *${pedido.direccion}*` : `en su local`;
    
    let msg = `Hola *${pedido.tiendas?.nombre || 'Ferretería'}*, tengo un pedido *PENDIENTE (#${pedido.id.substring(0,6).toUpperCase()})*.\n\n*Artículos:*\n${listaProductos}\n\nPara entregar ${direccionText}.\n\n¿Me podrían confirmar el costo del envío para poder aprobarlo desde mi perfil?`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  abrirEdicion() {
    // Pre-llenar el formulario con los datos actuales
    const p = this.auth.profile();
    this.perfilForm = {
      nombre: p?.nombre_completo || '',
      telefono: p?.telefono || '',
      ciudad: p?.ciudad || ''
    };
    this.avatarPreview = p?.avatar_url || '';
    this.selectedAvatarFile = null;
    this.activeView.set('Editar Perfil');
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.avatarPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  async guardarPerfil() {
    this.guardando.set(true);
    this.guardadoExitoso.set(false);
    try {
      const user = this.auth.user();
      if (!user) throw new Error('No user');

      let avatarUrl = this.avatarPreview;

      // 1. Si se seleccionó una foto nueva, la subimos primero
      if (this.selectedAvatarFile) {
        const res = await this.supabase.subirAvatarCliente(user.id, this.selectedAvatarFile);
        avatarUrl = res.url;
      }

      // 2. Actualizamos el perfil mediante la API
      await this.supabase.actualizarPerfilUsuario({
        nombre: this.perfilForm.nombre,
        telefono: this.perfilForm.telefono,
        ciudad: this.perfilForm.ciudad,
        avatarUrl: avatarUrl
      });

      // Refrescamos la sesión para que el perfil actualizado aparezca de inmediato
      await this.auth.inicializar();
      this.guardadoExitoso.set(true);

      // Sincronizar ciudad con StoreService
      if (this.perfilForm.ciudad) {
        this.store.setUserCity(this.perfilForm.ciudad);
      }

      // Ocultar el mensaje de éxito después de 3 segundos
      setTimeout(() => this.guardadoExitoso.set(false), 3000);
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      alert('Hubo un error al guardar los cambios.');
    } finally {
      this.guardando.set(false);
    }
  }

  async onLogout() {
    await this.auth.signOut();
    this.store.setTab('home');
  }
}
