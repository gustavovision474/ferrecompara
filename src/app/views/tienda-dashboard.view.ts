import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Package, Edit, TrendingUp, LogOut, Camera, Image, Save, X, ArrowLeft, Menu, MapPin, List, Search, Trash2, MessageSquare, Send, UploadCloud, FileSpreadsheet } from 'lucide-angular';
import { AuthService } from '../auth.service';
import { SupabaseService } from '../supabase.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatService, ChatConversation } from '../chat.service';
import { UploadResultDto, PreviewResultDto } from '../types';

type Tab = 'dashboard' | 'nuevo-producto' | 'catalogo' | 'perfil' | 'mensajes' | 'revision-catalogo';

@Component({
  selector: 'app-tienda-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col relative" [class.pb-24]="activeTab() !== 'mensajes' || !chatActual()">
      
      <!-- HEADER GLOBAL -->
      <header class="bg-white px-6 py-5 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-orange-100 text-[#E8541C] rounded-xl flex items-center justify-center">
            <lucide-icon [name]="PackageIcon" size="20"></lucide-icon>
          </div>
          <div>
            <h1 class="text-sm font-black text-gray-900 leading-none">Mi Tienda</h1>
            <p class="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{{ nombreTiendaActual() }}</p>
          </div>
        </div>
        <button (click)="onLogout()" class="w-10 h-10 bg-gray-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
          <lucide-icon [name]="LogoutIcon" size="18"></lucide-icon>
        </button>
      </header>

      <!-- VISTA: DASHBOARD PRINCIPAL -->
      <div *ngIf="activeTab() === 'dashboard'" class="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div class="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center mb-3">
              <lucide-icon [name]="TrendingUpIcon" size="16"></lucide-icon>
            </div>
            <p class="text-2xl font-black text-gray-900">124</p>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Visitas hoy</p>
          </div>
          <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div class="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center mb-3">
              <lucide-icon [name]="PackageIcon" size="16"></lucide-icon>
            </div>
            <p class="text-2xl font-black text-gray-900">{{ misProductos().length }}</p>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Productos</p>
          </div>
        </div>

        <h2 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Acciones Rápidas</h2>
        <div class="space-y-3">
          <button 
            (click)="abrirFormularioNuevo()"
            class="w-full bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between group hover:border-[#E8541C] transition-all shadow-sm active:scale-[0.98]"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-orange-50 text-[#E8541C] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon [name]="PlusIcon" size="24"></lucide-icon>
              </div>
              <div class="text-left">
                <h3 class="font-bold text-sm text-gray-900">Añadir Producto</h3>
                <p class="text-[10px] text-gray-400">Publicar un nuevo artículo</p>
              </div>
            </div>
            <div class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-[#E8541C] group-hover:text-white transition-colors">
              <lucide-icon [name]="ArrowLeftIcon" size="16" class="rotate-180"></lucide-icon>
            </div>
          </button>

          <button 
            (click)="abrirCatalogo()"
            class="w-full bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between group hover:border-emerald-500 transition-all shadow-sm active:scale-[0.98]"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon [name]="ListIcon" size="24"></lucide-icon>
              </div>
              <div class="text-left">
                <h3 class="font-bold text-sm text-gray-900">Mi Catálogo</h3>
                <p class="text-[10px] text-gray-400">Ver y editar tus productos</p>
              </div>
            </div>
            <div class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <lucide-icon [name]="ArrowLeftIcon" size="16" class="rotate-180"></lucide-icon>
            </div>
          </button>

          <button 
            (click)="abrirMensajes()"
            class="w-full bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between group hover:border-purple-500 transition-all shadow-sm active:scale-[0.98] relative"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon [name]="ChatIcon" size="24"></lucide-icon>
              </div>
              <div class="text-left">
                <h3 class="font-bold text-sm text-gray-900">Mensajes</h3>
                <p class="text-[10px] text-gray-400">Chat en vivo con clientes</p>
              </div>
            </div>
            <div class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <lucide-icon [name]="ArrowLeftIcon" size="16" class="rotate-180"></lucide-icon>
            </div>
          </button>

          <button 
            (click)="abrirPerfil()"
            class="w-full bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-all shadow-sm active:scale-[0.98]"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <lucide-icon [name]="EditIcon" size="24"></lucide-icon>
              </div>
              <div class="text-left">
                <h3 class="font-bold text-sm text-gray-900">Perfil de Tienda</h3>
                <p class="text-[10px] text-gray-400">Actualizar logo y horarios</p>
              </div>
            </div>
            <div class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <lucide-icon [name]="ArrowLeftIcon" size="16" class="rotate-180"></lucide-icon>
            </div>
          </button>
        </div>
      </div>

      <!-- VISTA: BANDEJA DE MENSAJES -->
      <div *ngIf="activeTab() === 'mensajes'" class="animate-in fade-in duration-300 flex-1 flex flex-col">
        <div *ngIf="!chatActual()" class="px-6 py-4 flex items-center justify-between bg-gray-50 sticky top-[81px] z-10 border-b border-gray-200">
          <div class="flex items-center gap-4">
            <button (click)="volverAlDashboard()" class="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-sm">
              <lucide-icon [name]="ArrowLeftIcon" size="20"></lucide-icon>
            </button>
            <h2 class="text-sm font-black uppercase tracking-widest text-gray-900">Bandeja de Entrada</h2>
          </div>
        </div>

        <div *ngIf="!chatActual()" class="p-6 space-y-3">
          <div *ngIf="conversacionesList().length === 0" class="text-center py-12 px-4">
            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3">
              <lucide-icon [name]="ChatIcon" size="24"></lucide-icon>
            </div>
            <p class="text-xs font-bold text-gray-500">Aún no tienes mensajes de clientes.</p>
          </div>
          
          <div *ngIf="conversacionesList().length > 0">
            <div 
              *ngFor="let conv of conversacionesList()"
              (click)="seleccionarConversacion(conv)"
              class="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4 cursor-pointer hover:border-blue-500 transition-all active:scale-[0.99] mb-3"
            >
              <div class="flex items-center gap-3 overflow-hidden flex-1">
                <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {{ getIniciales(conv.cliente?.nombre_completo) }}
                </div>
                <div class="overflow-hidden flex-1">
                  <h4 class="text-xs font-black text-gray-900 truncate">{{ conv.cliente?.nombre_completo || 'Cliente' }}</h4>
                  <p class="text-[10px] font-medium text-gray-500 truncate mt-0.5">{{ conv.ultimo_mensaje }}</p>
                </div>
              </div>
              <span class="text-[8px] font-bold text-gray-400 shrink-0">Hoy</span>
            </div>
          </div>
        </div>

        <div *ngIf="chatActual()" class="fixed inset-0 z-50 flex flex-col bg-gray-50 animate-in slide-in-from-bottom duration-300">
          <div class="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-2">
              <button (click)="cerrarConversacionActual()" class="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full">
                <lucide-icon [name]="ArrowLeftIcon" size="18"></lucide-icon>
              </button>
              <span class="text-xs font-black text-gray-900">{{ nombreClienteActual() }}</span>
            </div>
            <span class="text-[9px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded-full">En Vivo</span>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div 
              *ngFor="let msg of mensajesList()"
              class="flex"
              [class.justify-end]="isMyMessage(msg.sender_id)"
              [class.justify-start]="!isMyMessage(msg.sender_id)"
            >
              <div 
                class="max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-medium shadow-sm"
                [class.bg-blue-600]="isMyMessage(msg.sender_id)"
                [class.text-white]="isMyMessage(msg.sender_id)"
                [class.rounded-br-none]="isMyMessage(msg.sender_id)"
                [class.bg-white]="!isMyMessage(msg.sender_id)"
                [class.text-gray-800]="!isMyMessage(msg.sender_id)"
                [class.rounded-bl-none]="!isMyMessage(msg.sender_id)"
              >
                <p class="break-words leading-relaxed">{{ msg.contenido }}</p>
                <span 
                  class="text-[8px] block text-right mt-1 opacity-70 font-semibold"
                  [class.text-white]="isMyMessage(msg.sender_id)"
                  [class.text-gray-400]="!isMyMessage(msg.sender_id)"
                >
                  {{ formatTime(msg.created_at) }}
                </span>
              </div>
            </div>
          </div>

          <div class="bg-white border-t border-gray-200 p-3 flex items-center gap-2 sticky bottom-0">
            <input 
              type="text" 
              [(ngModel)]="mensajeRespuesta" 
              (keyup.enter)="enviarRespuesta()"
              placeholder="Responde al cliente..." 
              class="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button 
              (click)="enviarRespuesta()" 
              class="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center active:scale-95"
            >
              <lucide-icon [name]="SendIcon" size="14"></lucide-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- VISTA: MI CATÁLOGO -->
      <div *ngIf="activeTab() === 'catalogo'" class="animate-in fade-in duration-300">
        <div class="px-6 py-4 flex items-center justify-between bg-gray-50 sticky top-[81px] z-10">
          <div class="flex items-center gap-4">
            <button (click)="volverAlDashboard()" class="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-sm">
              <lucide-icon [name]="ArrowLeftIcon" size="20"></lucide-icon>
            </button>
            <h2 class="text-sm font-black uppercase tracking-widest text-gray-900 hidden sm:block">Mi Catálogo</h2>
          </div>
          <div class="flex items-center gap-2">
            <button (click)="showConfirmModalVaciar.set(true)" *ngIf="misProductos().length > 0" class="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 transition-colors shadow-md border border-red-200">
              <lucide-icon [name]="TrashIcon" size="14"></lucide-icon> Vaciar
            </button>
            <button (click)="abrirModalCargaMasiva()" class="bg-gray-800 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-900 transition-colors shadow-md">
              <lucide-icon [name]="FileSpreadsheetIcon" size="14"></lucide-icon> Carga Masiva
            </button>
            <button (click)="abrirFormularioNuevo()" class="bg-[#E8541C] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md shadow-orange-100">
              <lucide-icon [name]="PlusIcon" size="14"></lucide-icon> Añadir
            </button>
          </div>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 gap-4">
            <div *ngFor="let prod of misProductos()" class="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex gap-4 items-center">
              <img [src]="prod.image" class="w-16 h-16 rounded-2xl object-cover bg-gray-50 shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[9px] font-black text-[#E8541C] uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md">{{ prod.category || 'General' }}</span>
                  <span class="text-xs font-black text-gray-900">USD {{ prod.minPrice }}</span>
                </div>
                <h3 class="font-black text-xs text-gray-900 truncate mt-1">{{ prod.name }}</h3>
                <p class="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{{ prod.descripcion || 'Sin descripción' }}</p>
                
                <div class="flex items-center gap-3 mt-2">
                  <span class="text-[10px] font-bold flex items-center gap-1" [class.text-green-500]="prod.stock > 0" [class.text-red-500]="prod.stock === 0">
                    ● {{ prod.stock > 0 ? prod.stock + ' unidades en stock' : 'Agotado' }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-2 shrink-0 border-l border-gray-50 pl-3">
                <button (click)="editarProducto(prod)" class="p-2 text-gray-400 hover:text-blue-500 rounded-xl hover:bg-gray-50 transition-colors">
                  <lucide-icon [name]="EditIcon" size="16"></lucide-icon>
                </button>
                <button (click)="eliminarProducto(prod)" class="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-50 transition-colors">
                  <lucide-icon [name]="TrashIcon" size="16"></lucide-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL DE CARGA MASIVA -->
        <div *ngIf="mostrarModalCarga()" class="fixed inset-0 z-[100] flex items-center justify-center">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" (click)="cerrarModalCarga()"></div>
          <div class="relative bg-white w-[90%] max-w-md rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <button (click)="cerrarModalCarga()" class="absolute top-5 right-5 p-2 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <lucide-icon [name]="XIcon" size="18"></lucide-icon>
            </button>
            
            <div class="flex flex-col items-center text-center mt-2">
              <div class="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <lucide-icon [name]="UploadCloudIcon" size="32"></lucide-icon>
              </div>
              <h3 class="text-lg font-black text-gray-900">Subir Catálogo</h3>
              <p class="text-[11px] font-medium text-gray-500 mt-2 px-4 leading-relaxed">
                Selecciona tu archivo <span class="font-bold text-gray-700">Excel (.xlsx)</span> o <span class="font-bold text-gray-700">CSV</span> con tu lista de productos, precios y stock.
              </p>

              <div class="w-full mt-6 mb-4">
                <div class="relative group cursor-pointer" (click)="excelInput.click()">
                  <div class="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 group-hover:border-blue-500 group-hover:bg-blue-50/50 transition-all">
                    <lucide-icon [name]="FileSpreadsheetIcon" size="32" class="text-gray-400 group-hover:text-blue-500 mb-3 transition-colors"></lucide-icon>
                    <span class="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
                      {{ archivoExcel() ? archivoExcel()!.name : 'Toca para buscar archivo' }}
                    </span>
                  </div>
                  <input #excelInput type="file" (change)="onExcelSelected($event)" accept=".xlsx, .csv" class="hidden" />
                </div>
              </div>

              <div *ngIf="resultadoCarga()" class="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 text-left">
                <p class="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">✅ Archivo procesado: {{ resultadoCarga()!.rowCount }} productos detectados</p>
                <div class="space-y-1 mb-3">
                  <div *ngFor="let entry of resultadoCarga()!.suggestedMapping | keyvalue" class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">{{ entry.key }}</span>
                    <span class="text-[10px] text-gray-400">→</span>
                    <span class="text-[10px] font-medium text-gray-700">{{ entry.value }}</span>
                  </div>
                </div>
                <p class="text-[10px] text-gray-400 italic">Próximamente: vas a poder confirmar y aplicar estos productos a tu inventario.</p>
                <button
                  (click)="continuarConPreview()"
                  [disabled]="cargandoPreview()"
                  class="w-full mt-3 bg-gray-800 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all hover:bg-gray-900"
                >
                  <div *ngIf="cargandoPreview()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{{ cargandoPreview() ? 'Analizando productos...' : 'Continuar y analizar productos →' }}</span>
                </button>
                <div *ngIf="errorPreview()" class="mt-2 text-xs font-medium text-red-600">{{ errorPreview() }}</div>
              </div>

              <div *ngIf="errorCarga()" class="w-full bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-left">
                <p class="text-xs font-bold text-red-600">{{ errorCarga() }}</p>
              </div>

              <button 
                (click)="procesarCargaMasiva()" 
                [disabled]="!archivoExcel() || subiendoExcel()"
                class="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div *ngIf="subiendoExcel()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ subiendoExcel() ? 'Subiendo...' : 'Procesar Archivo' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- VISTA: NUEVO PRODUCTO O EDITAR -->
      <div *ngIf="activeTab() === 'nuevo-producto'" class="animate-in fade-in duration-300">
        <div class="px-6 py-4 flex items-center justify-between bg-gray-50 sticky top-[81px] z-10">
          <button (click)="volverAlDashboard()" class="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-sm">
            <lucide-icon [name]="ArrowLeftIcon" size="20"></lucide-icon>
          </button>
          <h2 class="text-sm font-black uppercase tracking-widest text-gray-900">{{ modoEdicion() ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
          <div class="w-10"></div>
        </div>

        <div class="p-6 space-y-6 max-w-lg mx-auto">
          <div class="flex flex-col items-center gap-3">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Foto del Producto</p>
            <div class="relative group cursor-pointer" (click)="fileInput.click()">
              <div class="w-32 h-32 bg-white border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center overflow-hidden group-hover:border-[#E8541C] transition-colors shadow-sm">
                <img *ngIf="productImagePreview" [src]="productImagePreview" class="w-full h-full object-cover" />
                <div *ngIf="!productImagePreview" class="flex flex-col items-center">
                  <lucide-icon [name]="CameraIcon" size="32" class="text-gray-300 group-hover:text-[#E8541C] transition-colors"></lucide-icon>
                  <span class="text-[10px] font-bold text-gray-400 mt-2">Subir foto</span>
                </div>
              </div>
              <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" class="hidden" />
            </div>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Nombre del Artículo</label>
              <input type="text" [(ngModel)]="productForm.nombre" placeholder="Ej. Cemento Holcim Fuerte 50kg" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Precio Final ($)</label>
                <input type="number" step="0.01" [(ngModel)]="productForm.precio" placeholder="0.00" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Cantidad en Stock</label>
                <input type="number" min="0" [(ngModel)]="productForm.stock" placeholder="Ej. 25" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Categoría</label>
              <select [(ngModel)]="productForm.categoriaId" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all">
                <option [ngValue]="0">-- Seleccionar Categoría --</option>
                <option *ngFor="let cat of categorias()" [ngValue]="cat.id">{{ cat.nombre }}</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Descripción Detallada</label>
              <textarea [(ngModel)]="productForm.descripcion" rows="3" placeholder="Detalles técnicos, usos recomendados, marca..." class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all resize-none"></textarea>
            </div>

            <button 
              (click)="guardarNuevoProducto()" 
              [disabled]="estaGuardando()"
              class="w-full bg-[#E8541C] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-100 active:scale-95 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              <div *ngIf="estaGuardando()" class="flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </div>
              <div *ngIf="!estaGuardando()" class="flex items-center gap-2">
                <lucide-icon [name]="SaveIcon" size="16"></lucide-icon>
                {{ modoEdicion() ? 'Guardar Cambios' : 'Publicar Producto' }}
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- VISTA: REVISIÓN DE CATÁLOGO -->
      <div *ngIf="activeTab() === 'revision-catalogo' && previewCatalogo()" class="animate-in fade-in duration-300 pb-32">

        <!-- Header sticky -->
        <div class="px-6 py-4 bg-gray-50 sticky top-[81px] z-10 border-b border-gray-100">
          <div class="flex items-center gap-4">
            <button (click)="volverAlCatalogo()" class="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-sm">
              <lucide-icon [name]="ArrowLeftIcon" size="20"></lucide-icon>
            </button>
            <div>
              <h2 class="text-sm font-black uppercase tracking-widest text-gray-900">Revisión de carga</h2>
              <p class="text-[10px] text-gray-400 font-medium">{{ previewCatalogo()!.totalRows }} productos analizados</p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex bg-white border-b border-gray-100">
          <button
            (click)="tabPreviewActivo.set('nuevos')"
            [ngClass]="{ 'text-[#E8541C] border-b-2 border-[#E8541C]': tabPreviewActivo() === 'nuevos', 'text-gray-400': tabPreviewActivo() !== 'nuevos' }"
            class="flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all"
          >Nuevos ({{ previewCatalogo()!.resumen.nuevosCount }})</button>
          <button
            (click)="tabPreviewActivo.set('existentes')"
            [ngClass]="{ 'text-[#E8541C] border-b-2 border-[#E8541C]': tabPreviewActivo() === 'existentes', 'text-gray-400': tabPreviewActivo() !== 'existentes' }"
            class="flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all"
          >Existentes ({{ previewCatalogo()!.resumen.existentesCount }})</button>
          <button
            (click)="tabPreviewActivo.set('errores')"
            [ngClass]="{ 'text-red-500 border-b-2 border-red-500': tabPreviewActivo() === 'errores', 'text-gray-400': tabPreviewActivo() !== 'errores' }"
            class="flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all"
          >Errores ({{ previewCatalogo()!.resumen.erroresCount }})</button>
        </div>

        <!-- Contenido por tab -->
        <div class="p-6 space-y-3">

          <!-- Nuevos -->
          <ng-container *ngIf="tabPreviewActivo() === 'nuevos'">
            <div *ngIf="previewCatalogo()!.nuevos.length === 0" class="text-center py-10">
              <p class="text-xs text-gray-400 font-medium">No hay productos nuevos en esta carga.</p>
            </div>
            <div *ngFor="let prod of previewCatalogo()!.nuevos" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-xs font-black text-gray-900 truncate">{{ prod.nombre }}</p>
                <p class="text-[10px] text-gray-400 mt-0.5">{{ prod.sku || '—' }} · {{ prod.categoria || 'Sin categoría' }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs font-black text-gray-900">USD {{ prod.precio | number:'1.2-2' }}</p>
                <p class="text-[10px] text-gray-400">{{ prod.stock }} unidades</p>
              </div>
            </div>
          </ng-container>

          <!-- Existentes -->
          <ng-container *ngIf="tabPreviewActivo() === 'existentes'">
            <div *ngIf="previewCatalogo()!.existentes.length === 0" class="text-center py-10">
              <p class="text-xs text-gray-400 font-medium">No hay productos existentes en esta carga.</p>
            </div>
            <div *ngFor="let prod of previewCatalogo()!.existentes" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-xs font-black text-gray-900 truncate">{{ prod.nombre }}</p>
                <span *ngIf="prod.yaEnInventario" class="inline-block mt-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Ya en tu inventario</span>
                <span *ngIf="!prod.yaEnInventario" class="inline-block mt-1 text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Producto global, sin precio tuyo</span>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs font-black text-gray-900">USD {{ prod.precioNuevo | number:'1.2-2' }}</p>
                <p class="text-[10px] text-gray-400">{{ prod.stockNuevo }} unidades</p>
              </div>
            </div>
          </ng-container>

          <!-- Errores -->
          <ng-container *ngIf="tabPreviewActivo() === 'errores'">
            <div *ngIf="previewCatalogo()!.errores.length === 0" class="text-center py-10">
              <p class="text-xs text-gray-400 font-medium">No hay errores en esta carga.</p>
            </div>
            <div *ngFor="let err of previewCatalogo()!.errores" class="bg-red-50 rounded-2xl border border-red-100 shadow-sm p-4">
              <div class="flex items-start justify-between gap-2 mb-2">
                <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fila {{ err.rowNumber }}</p>
                <span class="text-[9px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-md">{{ err.motivo }}</span>
              </div>
              <p class="text-[10px] text-gray-400 leading-relaxed">
                <ng-container *ngFor="let kv of err.rawData | keyvalue; let last = last">
                  {{ kv.key }}: '{{ kv.value }}'<ng-container *ngIf="!last"> · </ng-container>
                </ng-container>
              </p>
            </div>
          </ng-container>

        </div>

        <!-- Botones fijos abajo -->
        <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-3 z-10 shadow-lg">
          <button
            (click)="volverAlCatalogo()"
            class="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all hover:bg-gray-200"
          >Volver al catálogo</button>
          <button
            disabled
            class="flex-1 bg-gray-100 text-gray-400 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] cursor-not-allowed"
          >Aplicar al inventario</button>
        </div>
      </div>

      <!-- VISTA: PERFIL DE TIENDA -->
      <div *ngIf="activeTab() === 'perfil'" class="animate-in fade-in duration-300">
        <div class="px-6 py-4 flex items-center justify-between bg-gray-50 sticky top-[81px] z-10">
          <button (click)="volverAlDashboard()" class="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-sm">
            <lucide-icon [name]="ArrowLeftIcon" size="20"></lucide-icon>
          </button>
          <h2 class="text-sm font-black uppercase tracking-widest text-gray-900">Perfil de Tienda</h2>
          <div class="w-10"></div>
        </div>

        <div class="p-6">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div class="flex flex-col items-center gap-3">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logo de la Ferretería</p>
              <div class="relative group cursor-pointer" (click)="logoInput.click()">
                <div class="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-full flex flex-col items-center justify-center overflow-hidden group-hover:border-blue-500 transition-colors">
                  <img *ngIf="tiendaLogoPreview" [src]="tiendaLogoPreview" class="w-full h-full object-cover" />
                  <lucide-icon *ngIf="!tiendaLogoPreview" [name]="ImageIcon" size="28" class="text-gray-300 group-hover:text-blue-500 transition-colors"></lucide-icon>
                </div>
                <input #logoInput type="file" (change)="onLogoSelected($event)" accept="image/*" class="hidden" />
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Nombre Comercial</label>
                <input type="text" [(ngModel)]="perfilTiendaForm.nombre" placeholder="Nombre de tu ferretería" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              
              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Dirección Física</label>
                <input type="text" [(ngModel)]="perfilTiendaForm.direccion" placeholder="Calle principal y transversal" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>

              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Ciudad</label>
                <select [(ngModel)]="perfilTiendaForm.ciudad" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="">-- Selecciona la ciudad --</option>
                  <option value="Portoviejo">Portoviejo</option>
                  <option value="Manta">Manta</option>
                  <option value="Guayaquil">Guayaquil</option>
                  <option value="Quito">Quito</option>
                  <option value="Cuenca">Cuenca</option>
                  <option value="Santo Domingo">Santo Domingo</option>
                  <option value="Machala">Machala</option>
                  <option value="Duran">Durán</option>
                  <option value="Daule">Daule</option>
                  <option value="Samborondon">Samborondón</option>
                  <option value="Ambato">Ambato</option>
                  <option value="Riobamba">Riobamba</option>
                  <option value="Loja">Loja</option>
                  <option value="Ibarra">Ibarra</option>
                  <option value="Esmeraldas">Esmeraldas</option>
                  <option value="Quevedo">Quevedo</option>
                  <option value="Babahoyo">Babahoyo</option>
                  <option value="Milagro">Milagro</option>
                  <option value="Santa Elena">Santa Elena</option>
                  <option value="La Libertad">La Libertad</option>
                  <option value="Salinas">Salinas</option>
                  <option value="Tulcan">Tulcán</option>
                  <option value="Latacunga">Latacunga</option>
                  <option value="Azogues">Azogues</option>
                  <option value="Puyo">Puyo</option>
                  <option value="Tena">Tena</option>
                  <option value="Macas">Macas</option>
                  <option value="Zamora">Zamora</option>
                  <option value="Nueva Loja">Nueva Loja</option>
                  <option value="Puerto Baquerizo Moreno">Puerto Baquerizo Moreno</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Teléfono / WhatsApp</label>
                <input type="tel" [(ngModel)]="perfilTiendaForm.telefono" placeholder="099..." class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>

              <!-- HORARIOS DE ATENCIÓN INTERACTIVOS -->
              <div class="pt-4 border-t border-gray-100">
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Horarios de Atención</label>
                <div class="space-y-2.5">
                  <div *ngFor="let h of horarios" class="flex items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 transition-colors hover:bg-gray-100/50">
                    <div class="flex items-center gap-2 w-28 shrink-0">
                      <input 
                        type="checkbox" 
                        [id]="'dia_' + h.diaSemana"
                        [checked]="!h.estaCerrado"
                        (change)="h.estaCerrado = !$event.target.checked"
                        class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <label [for]="'dia_' + h.diaSemana" class="text-xs font-bold text-gray-900 select-none cursor-pointer">{{ h.nombre }}</label>
                    </div>

                    <div *ngIf="!h.estaCerrado" class="flex items-center gap-2 flex-1 justify-end animate-in fade-in duration-200">
                      <input 
                        type="time" 
                        [(ngModel)]="h.horaApertura" 
                        class="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-900 outline-none w-24 text-center focus:ring-2 focus:ring-blue-500"
                      />
                      <span class="text-xs font-bold text-gray-400">a</span>
                      <input 
                        type="time" 
                        [(ngModel)]="h.horaCierre" 
                        class="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-900 outline-none w-24 text-center focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div *ngIf="h.estaCerrado" class="flex-1 text-right pr-2 animate-in fade-in duration-200">
                      <span class="text-[10px] font-black text-red-500 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-md border border-red-100">Cerrado</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                (click)="guardarPerfilTienda()" 
                [disabled]="guardandoPerfil()"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              >
                <div *ngIf="guardandoPerfil()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ guardandoPerfil() ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL DE CONFIRMACIÓN -->
      <div *ngIf="showConfirmModal()" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center animate-in scale-in-95 duration-300">
          <div class="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <lucide-icon [name]="TrashIcon" size="24"></lucide-icon>
          </div>
          <div>
            <h3 class="font-black text-gray-900 text-sm">¿Eliminar Producto?</h3>
          </div>
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button (click)="cancelarConfirmacion()" class="bg-gray-50 text-gray-700 py-3 rounded-xl font-bold text-xs">Cancelar</button>
            <button (click)="confirmarEliminacion()" class="bg-red-500 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-red-100">Sí, Eliminar</button>
          </div>
        </div>
      </div>

      <!-- MODAL VACIAR CATÁLOGO -->
      <div *ngIf="showConfirmModalVaciar()" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center animate-in scale-in-95 duration-300">
          <div class="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <lucide-icon [name]="TrashIcon" size="24"></lucide-icon>
          </div>
          <div>
            <h3 class="font-black text-gray-900 text-sm">¿Vaciar TODO el Catálogo?</h3>
            <p class="text-[10px] font-medium text-gray-500 mt-2 leading-relaxed">Esta acción <span class="font-bold">no se puede deshacer</span>. Se eliminarán permanentemente los {{ misProductos().length }} productos de tu inventario.</p>
          </div>
          <div class="grid grid-cols-2 gap-3 pt-2">
            <button (click)="showConfirmModalVaciar.set(false)" class="bg-gray-50 text-gray-700 py-3 rounded-xl font-bold text-xs">Cancelar</button>
            <button (click)="ejecutarVaciadoCatalogo()" [disabled]="vaciandoCatalogo()" class="bg-red-500 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-red-100 flex items-center justify-center gap-2">
              <div *ngIf="vaciandoCatalogo()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ vaciandoCatalogo() ? 'Borrando...' : 'Sí, Vaciar Todo' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- TOAST SUCCESS -->
      <div *ngIf="successToast().show" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
        <span class="text-xs font-bold">{{ successToast().msg }}</span>
      </div>
    </div>
  `
})
export class TiendaDashboardView implements OnInit {
  protected auth = inject(AuthService);
  protected supabase = inject(SupabaseService);
  protected http = inject(HttpClient);
  protected chatService = inject(ChatService);

  activeTab = signal<Tab>('dashboard');
  
  misProductos = signal<any[]>([]);
  categorias = signal<any[]>([]);
  
  modoEdicion = signal(false);
  estaGuardando = signal(false);
  productForm = { id: 0, nombre: '', precio: 0, stock: 1, descripcion: '', categoriaId: 0 };
  productImagePreview = '';
  selectedFile: File | null = null;

  showConfirmModal = signal(false);
  showConfirmModalVaciar = signal(false);
  vaciandoCatalogo = signal(false);
  itemAEliminar = signal<any>(null);
  successToast = signal<{ show: boolean, msg: string }>({ show: false, msg: '' });

  guardandoPerfil = signal(false);
  tiendaLogoPreview = '';
  selectedLogoFile: File | null = null;
  perfilTiendaForm = { nombre: '', direccion: '', telefono: '', ciudad: '' };

  chatActual = signal<ChatConversation | null>(null);
  mensajeRespuesta = '';

  // Inicialización completa de los 7 días de la semana listos para Supabase
  horarios = [
    { diaSemana: 1, nombre: 'Lunes',     estaCerrado: false, horaApertura: '08:00', horaCierre: '18:00' },
    { diaSemana: 2, nombre: 'Martes',    estaCerrado: false, horaApertura: '08:00', horaCierre: '18:00' },
    { diaSemana: 3, nombre: 'Miércoles', estaCerrado: false, horaApertura: '08:00', horaCierre: '18:00' },
    { diaSemana: 4, nombre: 'Jueves',    estaCerrado: false, horaApertura: '08:00', horaCierre: '18:00' },
    { diaSemana: 5, nombre: 'Viernes',   estaCerrado: false, horaApertura: '08:00', horaCierre: '18:00' },
    { diaSemana: 6, nombre: 'Sábado',    estaCerrado: false, horaApertura: '08:00', horaCierre: '13:00' },
    { diaSemana: 0, nombre: 'Domingo',   estaCerrado: true,  horaApertura: '08:00', horaCierre: '13:00' }
  ];

  readonly PlusIcon = Plus;
  readonly PackageIcon = Package;
  readonly EditIcon = Edit;
  readonly TrendingUpIcon = TrendingUp;
  readonly LogoutIcon = LogOut;
  readonly CameraIcon = Camera;
  readonly ImageIcon = Image;
  readonly SaveIcon = Save;
  readonly XIcon = X;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly MenuIcon = Menu;
  readonly MapPinIcon = MapPin;
  readonly ListIcon = List;
  readonly SearchIcon = Search;
  readonly TrashIcon = Trash2;
  readonly ChatIcon = MessageSquare;
  readonly SendIcon = Send;

  ngOnInit() {
    this.cargarMisProductos();
    this.cargarCategorias();
  }

  nombreTiendaActual(): string {
    const p = this.auth.profile();
    if (!p) return 'Ferretería';
    return p.nombre_completo || p.nombre_tienda || 'Ferretería';
  }

  nombreClienteActual(): string {
    const c = this.chatActual();
    return c?.cliente?.nombre_completo || 'Cliente';
  }

  conversacionesList() {
    return this.chatService.conversations();
  }

  mensajesList() {
    return this.chatService.messages();
  }

  volverAlDashboard() {
    this.activeTab.set('dashboard');
  }

  cancelarConfirmacion() {
    this.showConfirmModal.set(false);
  }

  getIniciales(nombre?: string): string {
    if (!nombre) return 'C';
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  async cargarCategorias() {
    const cats = await this.supabase.cargarCategorias();
    this.categorias.set(cats);
  }

  async abrirCatalogo() {
    this.activeTab.set('catalogo');
    await this.cargarMisProductos();
  }

  abrirFormularioNuevo() {
    this.modoEdicion.set(false);
    this.productForm = { id: 0, nombre: '', precio: 0, stock: 10, descripcion: '', categoriaId: 0 };
    this.productImagePreview = '';
    this.selectedFile = null;
    this.activeTab.set('nuevo-producto');
  }

  async cargarMisProductos() {
    try {
      const productos = await this.supabase.cargarMisProductosApi();
      this.misProductos.set(productos);
    } catch (e) {
      console.error('Error cargando catálogo', e);
    }
  }

  async abrirMensajes() {
    this.activeTab.set('mensajes');
    this.chatActual.set(null);
    
    try {
      const p = this.auth.profile();
      let tId = p?.tienda_id ? Number(p.tienda_id) : null;
      
      if (!tId && p?.id) {
        // Buscar el tienda_id más reciente asignado en la base de datos
        const { data: profLive } = await this.supabase.getClient()
          .from('profiles')
          .select('tienda_id')
          .eq('id', p.id)
          .single();
        if (profLive?.tienda_id) {
          tId = Number(profLive.tienda_id);
        }
      }

      await this.chatService.loadStoreConversations(tId || 1);
    } catch (e) {
      console.warn('Aviso cargando historial de chat:', e);
    }
  }

  async seleccionarConversacion(conv: ChatConversation) {
    this.chatActual.set(conv);
    await this.chatService.loadMessagesAndSubscribe(conv.id);
  }

  cerrarConversacionActual() {
    this.chatActual.set(null);
    this.chatService.closeChat();
    const p = this.auth.profile();
    if (p && p.tienda_id) {
      this.chatService.loadStoreConversations(p.tienda_id);
    }
  }

  async enviarRespuesta() {
    const conv = this.chatActual();
    if (!conv || !this.mensajeRespuesta.trim()) return;

    const msg = this.mensajeRespuesta;
    this.mensajeRespuesta = '';
    await this.chatService.sendMessage(conv.id, msg);
  }

  isMyMessage(senderId: string): boolean {
    const p = this.auth.profile();
    return p ? senderId === p.id : false;
  }

  editarProducto(prod: any) {
    this.modoEdicion.set(true);
    const catEncontrada = this.categorias().find(c => c.nombre === prod.category);
    this.productForm = {
      id: prod.id,
      nombre: prod.name,
      precio: prod.minPrice,
      stock: prod.stock !== undefined ? Number(prod.stock) : 10,
      descripcion: prod.descripcion || '',
      categoriaId: catEncontrada ? catEncontrada.id : 0
    };
    this.productImagePreview = prod.image;
    this.selectedFile = null;
    this.activeTab.set('nuevo-producto');
  }

  async eliminarProducto(prod: any) {
    this.itemAEliminar.set(prod);
    this.showConfirmModal.set(true);
  }

  async confirmarEliminacion() {
    const prod = this.itemAEliminar();
    if (!prod) return;

    try {
      await this.supabase.eliminarProducto(Number(prod.id));
      this.showConfirmModal.set(false);
      this.mostrarToast(`"${prod.name}" eliminado`);
      await this.cargarMisProductos();
    } catch (e) {
      alert('❌ Error al eliminar');
      console.error(e);
    }
  }

  async ejecutarVaciadoCatalogo() {
    this.vaciandoCatalogo.set(true);
    try {
      const productos = this.misProductos();
      const chunkSize = 10;
      
      for (let i = 0; i < productos.length; i += chunkSize) {
        const chunk = productos.slice(i, i + chunkSize);
        await Promise.all(chunk.map(p => this.supabase.eliminarProducto(Number(p.id))));
      }

      this.showConfirmModalVaciar.set(false);
      this.mostrarToast('✅ Catálogo vaciado completamente');
      await this.cargarMisProductos();
    } catch (e) {
      alert('❌ Error al vaciar catálogo');
      console.error(e);
    } finally {
      this.vaciandoCatalogo.set(false);
    }
  }

  mostrarToast(msg: string) {
    this.successToast.set({ show: true, msg });
    setTimeout(() => this.successToast.set({ show: false, msg: '' }), 3000);
  }

  async abrirPerfil() {
    const p = this.auth.profile();
    this.perfilTiendaForm = {
      nombre: p?.nombre_completo || p?.nombre_tienda || '',
      direccion: p?.direccion || '',
      telefono: p?.telefono || '',
      ciudad: p?.ciudad || ''
    };
    this.tiendaLogoPreview = p?.avatar_url || '';

    if (p && p.tienda_id) {
      try {
        // 1. Cargar metadatos reales de la tienda guardada
        const { data: tiendaData } = await this.supabase.getClient()
          .from('tiendas')
          .select('*')
          .eq('id', p.tienda_id)
          .single();

        if (tiendaData) {
          if (tiendaData.city) this.perfilTiendaForm.ciudad = tiendaData.city;
          if (tiendaData.imagen_portada_url) this.tiendaLogoPreview = tiendaData.imagen_portada_url;
          if (tiendaData.direccion) this.perfilTiendaForm.direccion = tiendaData.direccion;
          if (tiendaData.telefono) this.perfilTiendaForm.telefono = tiendaData.telefono;
          if (tiendaData.nombre) this.perfilTiendaForm.nombre = tiendaData.nombre;
        }

        // 2. Cargar horarios guardados
        const horariosGuardados = await this.supabase.cargarHorariosTienda(p.tienda_id);
        if (horariosGuardados && horariosGuardados.length > 0) {
          this.horarios = this.horarios.map(dia => {
            const guardado = horariosGuardados.find((h: any) => h.dia_semana === dia.diaSemana);
            if (guardado) {
              return {
                ...dia,
                estaCerrado: guardado.esta_cerrado ?? false,
                horaApertura: guardado.hora_apertura ?? '08:00',
                horaCierre: guardado.hora_cierre ?? '18:00'
              };
            }
            return dia;
          });
        }
      } catch (e) {
        console.error('Error cargando datos de la tienda y horarios', e);
      }
    }

    this.activeTab.set('perfil');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.productImagePreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedLogoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.tiendaLogoPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  async guardarPerfilTienda() {
    if (!this.perfilTiendaForm.nombre) return alert('El nombre es requerido');
    
    this.guardandoPerfil.set(true);
    try {
      await this.supabase.actualizarPerfilTienda({
        nombre: this.perfilTiendaForm.nombre,
        direccion: this.perfilTiendaForm.direccion,
        telefono: this.perfilTiendaForm.telefono,
        city: this.perfilTiendaForm.ciudad,
        horarios: this.horarios.map(h => ({
          diaSemana: h.diaSemana,
          horaApertura: h.estaCerrado ? null : h.horaApertura,
          horaCierre: h.estaCerrado ? null : h.horaCierre,
          estaCerrado: h.estaCerrado
        }))
      });

      if (this.selectedLogoFile) {
        const { url } = await this.supabase.subirImagenTienda(this.selectedLogoFile);
        this.tiendaLogoPreview = url;
      }

      await this.auth.inicializar();
      await this.abrirPerfil();
      this.mostrarToast('✅ Perfil guardado con éxito');
      this.activeTab.set('dashboard');
    } catch (e: any) {
      const serverError = e?.error ? JSON.stringify(e.error) : e?.message;
      alert(`❌ Error del backend al guardar:\n\n${serverError}\n\nRevisa la consola de tu terminal donde corre la API .NET para ver la excepción exacta.`);
      console.error('Error detallado guardando perfil:', e);
    } finally {
      this.guardandoPerfil.set(false);
    }
  }

  async guardarNuevoProducto() {
    if (!this.productForm.nombre || (!this.selectedFile && !this.modoEdicion())) return alert('Completa los datos');
    this.estaGuardando.set(true);
    try {
      let imageUrl = this.productImagePreview;

      if (this.selectedFile) {
        const { url } = await this.supabase.subirImagenProducto(this.selectedFile);
        imageUrl = url;
      }

      const payload = {
        nombre: this.productForm.nombre,
        precioInicial: Number(this.productForm.precio),
        tieneStock: Number(this.productForm.stock),
        imagenUrl: imageUrl,
        descripcion: this.productForm.descripcion,
        categoriaId: this.productForm.categoriaId === 0 ? null : this.productForm.categoriaId
      };

      if (this.modoEdicion()) {
        await this.supabase.actualizarProducto(this.productForm.id, payload);
        this.mostrarToast('✅ Producto actualizado');
      } else {
        await firstValueFrom(this.http.post(`${environment.apiUrl}/Products`, payload));
        this.mostrarToast('✅ Producto publicado');
      }

      this.productImagePreview = '';
      this.selectedFile = null;
      this.productForm = { id: 0, nombre: '', precio: 0, stock: 10, descripcion: '', categoriaId: 0 };
      this.modoEdicion.set(false);
      this.activeTab.set('catalogo');
      
      setTimeout(async () => {
        await this.supabase.cargarProductos();
        await this.cargarMisProductos();
      }, 800);

    } catch (e) {
      alert('❌ Error al procesar producto');
      console.error(e);
    } finally {
      this.estaGuardando.set(false);
    }
  }

  async onLogout() {
    await this.auth.signOut();
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  // ==========================================
  // LÓGICA DE CARGA MASIVA (EXCEL/CSV)
  // ==========================================
  mostrarModalCarga = signal<boolean>(false);
  archivoExcel = signal<File | null>(null);
  subiendoExcel = signal<boolean>(false);
  resultadoCarga = signal<UploadResultDto | null>(null);
  errorCarga = signal<string | null>(null);

  previewCatalogo = signal<PreviewResultDto | null>(null);
  cargandoPreview = signal(false);
  errorPreview = signal<string | null>(null);
  tabPreviewActivo = signal<'nuevos' | 'existentes' | 'errores'>('nuevos');

  readonly UploadCloudIcon = UploadCloud;
  readonly FileSpreadsheetIcon = FileSpreadsheet;

  abrirModalCargaMasiva() {
    this.archivoExcel.set(null);
    this.resultadoCarga.set(null);
    this.errorCarga.set(null);
    this.mostrarModalCarga.set(true);
  }

  cerrarModalCarga() {
    this.mostrarModalCarga.set(false);
  }

  onExcelSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx' && ext !== 'csv') {
        alert('Por favor selecciona un archivo .xlsx o .csv');
        return;
      }
      this.archivoExcel.set(file);
      this.resultadoCarga.set(null); // Limpiamos el resultado anterior
    }
  }

  async procesarCargaMasiva() {
    const file = this.archivoExcel();
    if (!file) return;

    this.errorCarga.set(null);
    this.resultadoCarga.set(null);
    this.subiendoExcel.set(true);
    try {
      const res = await this.supabase.subirCatalogo(file);
      this.resultadoCarga.set(res);
    } catch (e: any) {
      this.errorCarga.set(e?.message ?? 'Error al subir el archivo.');
    } finally {
      this.subiendoExcel.set(false);
    }
  }

  async continuarConPreview() {
    const upload = this.resultadoCarga();
    if (!upload?.uploadId) return;

    this.errorPreview.set(null);
    this.cargandoPreview.set(true);
    try {
      const res = await this.supabase.previewCatalogo(upload.uploadId);
      this.previewCatalogo.set(res);
      this.tabPreviewActivo.set(
        res.resumen.nuevosCount > 0 ? 'nuevos' :
        res.resumen.erroresCount > 0 ? 'errores' : 'existentes'
      );
      this.cerrarModalCarga();
      this.activeTab.set('revision-catalogo');
    } catch (e: any) {
      this.errorPreview.set(e?.message ?? 'Error al analizar la carga.');
    } finally {
      this.cargandoPreview.set(false);
    }
  }

  volverAlCatalogo() {
    this.previewCatalogo.set(null);
    this.activeTab.set('catalogo');
  }
}
