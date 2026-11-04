import { Component, inject, signal, computed, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Warehouse,
  Package,
  Wrench,
  Boxes,
  ArrowLeftRight,
  Clock,
  QrCode,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  ArrowLeft,
  CheckCircle,
  Phone,
  MapPin,
  DollarSign,
  FileSpreadsheet,
  Download,
  Truck,
  Eye,
  Users,
  RefreshCw,
  Calendar,
  Tag,
  FileText,
  Layers
} from 'lucide-angular';
import { WarehouseService } from '../warehouse.service';
import {
  Tool,
  Consumable,
  Loan,
  Warehouse as WarehouseType,
  Location,
  Supplier,
  Purchase,
  Contact,
  ToolCondition
} from '../types';

export type WarehouseSubTab = 'dashboard' | 'inventario' | 'prestamos' | 'bodegas' | 'proveedores' | 'tablas' | 'contactos';

@Component({
  selector: 'app-warehouse-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 text-gray-900 pb-24">
      
      <!-- SUB-HEADER DE CONTROL WMS -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div class="flex items-center gap-3">
            <button 
              type="button"
              (click)="volverAlDashboard()" 
              class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition active:scale-95"
              title="Volver al Dashboard"
            >
              <lucide-icon [name]="ArrowLeftIcon" size="18"></lucide-icon>
            </button>
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#E8541C] flex items-center justify-center font-black">
                <lucide-icon [name]="WarehouseIcon" size="20"></lucide-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-sm sm:text-base font-black text-gray-900 tracking-tight leading-none">
                    Control de Almacén & WMS
                  </h1>
                  <span class="bg-orange-100 text-[#E8541C] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    FerreCompara Pro
                  </span>
                </div>
                <p class="text-[11px] text-gray-500 mt-0.5">
                  Herramientas, maquinaria, préstamos a expertos y materiales
                </p>
              </div>
            </div>
          </div>

          <!-- ACCIONES RÁPIDAS TOP -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button 
              (click)="abrirModalNuevoPrestamo()" 
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition active:scale-95 whitespace-nowrap"
            >
              <lucide-icon [name]="ArrowLeftRightIcon" size="15"></lucide-icon>
              <span>Prestar Maquinaria</span>
            </button>

            <button 
              (click)="abrirModalNuevaHerramienta()" 
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition active:scale-95 whitespace-nowrap"
            >
              <lucide-icon [name]="PlusIcon" size="15"></lucide-icon>
              <span>+ Herramienta</span>
            </button>

            <button 
              (click)="abrirModalNuevoConsumible()" 
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition active:scale-95 whitespace-nowrap"
            >
              <lucide-icon [name]="PackageIcon" size="15"></lucide-icon>
              <span>+ Material</span>
            </button>

            <button 
              (click)="abrirModalNuevaCompra()" 
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition active:scale-95 whitespace-nowrap"
            >
              <lucide-icon [name]="FileTextIcon" size="15"></lucide-icon>
              <span>+ Factura Compra</span>
            </button>
          </div>

        </div>

        <!-- TABS DE NAVEGACIÓN SECUNDARIA -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-gray-100">
          <button 
            *ngFor="let tab of tabsList"
            (click)="currentTab.set(tab.id)"
            [class]="currentTab() === tab.id 
              ? 'border-[#E8541C] text-[#E8541C] font-black' 
              : 'border-transparent text-gray-500 hover:text-gray-900 font-semibold'"
            class="flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs transition whitespace-nowrap cursor-pointer"
          >
            <lucide-icon [name]="tab.icon" size="15"></lucide-icon>
            <span>{{ tab.label }}</span>
            <span *ngIf="tab.badge !== undefined && tab.badge > 0" 
                  [class]="tab.badgeClass || 'bg-gray-200 text-gray-700'"
                  class="px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {{ tab.badge }}
            </span>
          </button>
        </div>
      </div>

      <!-- ALERTA GLOBAL DE PRÉSTAMOS VENCIDOS -->
      <div *ngIf="stats().loans.overdue_loans_out > 0" class="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <div class="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-red-500/20 text-red-600 flex items-center justify-center shrink-0">
              <lucide-icon [name]="ShieldAlertIcon" size="20" class="animate-pulse"></lucide-icon>
            </div>
            <div>
              <h3 class="text-xs sm:text-sm font-bold text-red-700">
                Atención: Tienes {{ stats().loans.overdue_loans_out }} herramienta(s) con fecha de devolución vencida
              </h3>
              <p class="text-[11px] text-red-600/90 mt-0.5">
                Revisa los préstamos asignados a expertos o clientes para coordinar el retorno inmediato a bodega.
              </p>
            </div>
          </div>
          <button 
            (click)="currentTab.set('prestamos')" 
            class="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-auto whitespace-nowrap"
          >
            Ver Préstamos Vencidos →
          </button>
        </div>
      </div>

      <!-- CONTENIDO PRINCIPAL POR SUB-TAB -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        <!-- ==================================================== -->
        <!-- TAB 1: DASHBOARD GENERAL WMS                         -->
        <!-- ==================================================== -->
        <div *ngIf="currentTab() === 'dashboard'" class="space-y-6">
          
          <!-- RESUMEN DE MÉTRICAS -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Herramientas Totales -->
            <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Herramientas & Maquinaria</span>
                <div class="w-8 h-8 rounded-lg bg-orange-50 text-[#E8541C] flex items-center justify-center">
                  <lucide-icon [name]="WrenchIcon" size="16"></lucide-icon>
                </div>
              </div>
              <p class="text-2xl font-black text-gray-900">{{ stats().tools.total_units }}</p>
              <div class="flex items-center gap-2 mt-2 text-[11px]">
                <span class="text-emerald-600 font-bold">{{ stats().tools.available_units }} disponibles</span>
                <span class="text-gray-300">•</span>
                <span class="text-[#E8541C] font-bold">{{ stats().tools.lent_units }} prestadas</span>
              </div>
            </div>

            <!-- Materiales & Consumibles -->
            <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Materiales en Bodega</span>
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <lucide-icon [name]="PackageIcon" size="16"></lucide-icon>
                </div>
              </div>
              <p class="text-2xl font-black text-gray-900">{{ stats().consumables.total_distinct }} <span class="text-xs font-normal text-gray-500">ítems</span></p>
              <div class="flex items-center gap-2 mt-2 text-[11px]">
                <span *ngIf="stats().consumables.low_stock_count > 0" class="text-amber-600 font-bold">
                  ⚠️ {{ stats().consumables.low_stock_count }} en stock bajo
                </span>
                <span *ngIf="stats().consumables.low_stock_count === 0" class="text-emerald-600 font-bold">
                  ✓ Stock óptimo
                </span>
              </div>
            </div>

            <!-- Préstamos a Expertos / Clientes -->
            <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition cursor-pointer" (click)="currentTab.set('prestamos')">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Préstamos Activos</span>
                <div class="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <lucide-icon [name]="ArrowLeftRightIcon" size="16"></lucide-icon>
                </div>
              </div>
              <p class="text-2xl font-black text-gray-900">{{ stats().loans.active_loans_out }}</p>
              <div class="flex items-center gap-2 mt-2 text-[11px]">
                <span [class]="stats().loans.overdue_loans_out > 0 ? 'text-red-600 font-bold' : 'text-gray-500'">
                  {{ stats().loans.overdue_loans_out }} fuera de plazo
                </span>
                <span class="text-gray-300">•</span>
                <span class="text-gray-500">{{ stats().loans.total_returned_loans }} devueltos</span>
              </div>
            </div>

            <!-- Valorización Total de Almacén -->
            <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition">
              <div class="flex items-center justify-between mb-3">
                <span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Valorización Almacén</span>
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <lucide-icon [name]="DollarSignIcon" size="16"></lucide-icon>
                </div>
              </div>
              <p class="text-2xl font-black text-gray-900">
                \${{ (stats().tools.total_inventory_value + stats().consumables.total_stock_value) | number:'1.2-2' }}
              </p>
              <div class="flex items-center gap-2 mt-2 text-[11px] text-gray-500">
                <span>Maq: \${{ stats().tools.total_inventory_value | number:'1.0-0' }}</span>
                <span>•</span>
                <span>Mat: \${{ stats().consumables.total_stock_value | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>

          <!-- SECCIÓN: PRÉSTAMOS URGENTES Y MOVIMIENTOS RECIENTES -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- TARJETA: PRÉSTAMOS RECIENTES / EN CURSO -->
            <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between border-b border-gray-100 pb-3">
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="ClockIcon" size="18" class="text-[#E8541C]"></lucide-icon>
                  <h2 class="text-sm font-black text-gray-900 uppercase tracking-wider">Préstamos en Curso</h2>
                </div>
                <button (click)="currentTab.set('prestamos')" class="text-xs font-bold text-[#E8541C] hover:underline">
                  Ver todos ({{ service.loans().length }})
                </button>
              </div>

              <div class="space-y-3">
                <div *ngFor="let loan of service.loans().slice(0, 4)" 
                     class="p-3.5 rounded-xl border border-gray-100 hover:border-orange-200 bg-gray-50/50 flex items-center justify-between gap-3 transition">
                  <div class="flex items-center gap-3">
                    <div [class]="loan.status === 'overdue' ? 'bg-red-100 text-red-600' : (loan.status === 'returned' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-[#E8541C]')"
                         class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black">
                      <lucide-icon [name]="loan.status === 'returned' ? CheckCircleIcon : WrenchIcon" size="18"></lucide-icon>
                    </div>
                    <div>
                      <h4 class="text-xs font-bold text-gray-900 leading-tight">{{ loan.tool_name }}</h4>
                      <p class="text-[11px] text-gray-500 mt-0.5">
                        Prestado a: <b class="text-gray-800">{{ loan.contact_name }}</b> 
                        <span *ngIf="loan.contact_role === 'experto'" class="ml-1 bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded text-[9px] font-bold">Experto</span>
                      </p>
                      <p class="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                        <lucide-icon [name]="MapPinIcon" size="11"></lucide-icon>
                        {{ loan.destination_location || 'Obra' }}
                      </p>
                    </div>
                  </div>

                  <div class="text-right shrink-0">
                    <span [class]="loan.status === 'overdue' ? 'bg-red-100 text-red-700 border-red-200' : (loan.status === 'returned' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-orange-100 text-orange-800 border-orange-200')"
                          class="inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border mb-1">
                      {{ loan.status === 'overdue' ? '¡Vencido!' : (loan.status === 'returned' ? 'Devuelto' : 'Activo') }}
                    </span>
                    <p class="text-[10px] text-gray-400">Vence: {{ loan.due_date || 'Sin fecha' }}</p>
                    <button 
                      *ngIf="loan.status !== 'returned'"
                      (click)="abrirModalDevolucion(loan)"
                      class="mt-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline block"
                    >
                      Registrar Devolución
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- TARJETA: MOVIMIENTOS RECIENTES DE ALMACÉN -->
            <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div class="flex items-center justify-between border-b border-gray-100 pb-3">
                <div class="flex items-center gap-2">
                  <lucide-icon [name]="RefreshCwIcon" size="18" class="text-blue-600"></lucide-icon>
                  <h2 class="text-sm font-black text-gray-900 uppercase tracking-wider">Movimientos de Almacén</h2>
                </div>
                <span class="text-xs text-gray-400 font-bold">Bitácora en vivo</span>
              </div>

              <div class="space-y-3">
                <div *ngFor="let m of service.movements().slice(0, 5)" 
                     class="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span class="font-bold text-gray-900">{{ m.item_name }}</span>
                    <p class="text-[11px] text-gray-500 mt-0.5">{{ m.details }}</p>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="px-2 py-0.5 rounded bg-gray-200 text-gray-700 font-bold text-[10px]">
                      {{ m.quantity }} unid.
                    </span>
                    <p class="text-[10px] text-gray-400 mt-1">{{ m.timestamp | date:'shortTime' }}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- TARJETA: RESUMEN DE CATEGORÍAS DE MAQUINARIA -->
          <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h2 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Distribución de Maquinaria y Equipos por Categoría
            </h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div *ngFor="let cat of stats().categoriesSummary" class="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p class="text-[11px] font-bold text-gray-500 uppercase truncate">{{ cat.category }}</p>
                <p class="text-lg font-black text-gray-900 mt-1">{{ cat.total_units }} <span class="text-xs font-normal text-gray-500">unids</span></p>
              </div>
            </div>
          </div>

        </div>

        <!-- ==================================================== -->
        <!-- TAB 2: INVENTARIO (HERRAMIENTAS & CONSUMIBLES)       -->
        <!-- ==================================================== -->
        <div *ngIf="currentTab() === 'inventario'" class="space-y-5">
          
          <!-- SUB-SWITCH ENTRE HERRAMIENTAS Y MATERIALES -->
          <div class="flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
            <div class="flex items-center gap-2">
              <button 
                (click)="inventarioSubTab.set('herramientas')"
                [class]="inventarioSubTab() === 'herramientas' ? 'bg-[#E8541C] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer"
              >
                <lucide-icon [name]="WrenchIcon" size="15"></lucide-icon>
                <span>Herramientas & Maquinaria ({{ service.tools().length }})</span>
              </button>

              <button 
                (click)="inventarioSubTab.set('consumibles')"
                [class]="inventarioSubTab() === 'consumibles' ? 'bg-[#E8541C] text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer"
              >
                <lucide-icon [name]="PackageIcon" size="15"></lucide-icon>
                <span>Materiales & Consumibles ({{ service.consumables().length }})</span>
              </button>
            </div>

            <!-- BUSCADOR -->
            <div class="relative w-full sm:w-72">
              <lucide-icon [name]="SearchIcon" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></lucide-icon>
              <input 
                type="text" 
                [(ngModel)]="busquedaInventario"
                placeholder="Buscar por nombre, marca o serie..."
                class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#E8541C] outline-none transition"
              />
            </div>
          </div>

          <!-- VISTA: HERRAMIENTAS & MAQUINARIA -->
          <div *ngIf="inventarioSubTab() === 'herramientas'" class="space-y-4">
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let tool of filteredTools()" 
                   class="bg-white border border-gray-200 hover:border-orange-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                
                <div>
                  <!-- IMAGEN Y ESTADO -->
                  <div class="relative h-40 -mx-4 -mt-4 mb-3 rounded-t-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img [src]="tool.image_url" [alt]="tool.name" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <span [class]="getConditionBadge(tool.condition)" 
                          class="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm">
                      {{ tool.condition }}
                    </span>
                    <span [class]="tool.available_quantity > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'"
                          class="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                      {{ tool.available_quantity > 0 ? tool.available_quantity + ' Disponibles' : 'Sin Stock' }}
                    </span>
                  </div>

                  <!-- DATOS PRINCIPALES -->
                  <div class="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                    <span>{{ tool.category }}</span>
                    <span *ngIf="tool.brand">• {{ tool.brand }}</span>
                  </div>
                  <h3 class="text-sm font-black text-gray-900 leading-snug">{{ tool.name }}</h3>
                  <p *ngIf="tool.model" class="text-xs text-gray-500 mt-0.5">Modelo: {{ tool.model }}</p>

                  <div class="mt-3 py-2 px-2.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-[11px]">
                    <div class="flex justify-between text-gray-600">
                      <span>Ubicación:</span>
                      <b class="text-gray-900 truncate max-w-[170px]">{{ tool.location_name || tool.warehouse_name }}</b>
                    </div>
                    <div class="flex justify-between text-gray-600">
                      <span>Costo compra:</span>
                      <b class="text-gray-900">\${{ tool.purchase_price || 0 }}</b>
                    </div>
                    <div class="flex justify-between text-gray-600">
                      <span>Préstamos activos:</span>
                      <b class="text-[#E8541C]">{{ tool.active_loans_count || 0 }}</b>
                    </div>
                  </div>
                </div>

                <!-- BOTONES DE ACCIÓN -->
                <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button 
                    (click)="prestarEstaHerramienta(tool)"
                    [disabled]="tool.available_quantity <= 0"
                    class="flex-1 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/20"
                  >
                    <lucide-icon [name]="ArrowLeftRightIcon" size="14"></lucide-icon>
                    <span>Prestar</span>
                  </button>

                  <button 
                    (click)="abrirModalVerQR(tool)" 
                    class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
                    title="Ver Código QR / Ficha"
                  >
                    <lucide-icon [name]="QrCodeIcon" size="16"></lucide-icon>
                  </button>

                  <button 
                    (click)="editarHerramienta(tool)" 
                    class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
                    title="Editar"
                  >
                    <lucide-icon [name]="EditIcon" size="16"></lucide-icon>
                  </button>

                  <button 
                    (click)="eliminarHerramienta(tool.id)" 
                    class="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition"
                    title="Eliminar"
                  >
                    <lucide-icon [name]="TrashIcon" size="16"></lucide-icon>
                  </button>
                </div>

              </div>
            </div>

          </div>

          <!-- VISTA: CONSUMIBLES & MATERIALES -->
          <div *ngIf="inventarioSubTab() === 'consumibles'" class="space-y-4">
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let item of filteredConsumables()"
                   class="bg-white border border-gray-200 hover:border-orange-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {{ item.category }}
                    </span>
                    <span *ngIf="item.is_low_stock" class="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                      ⚠️ Stock Bajo
                    </span>
                  </div>

                  <h3 class="text-sm font-black text-gray-900 leading-snug">{{ item.name }}</h3>
                  
                  <div class="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <div>
                      <span class="text-[10px] text-gray-400 font-bold uppercase">Stock Actual</span>
                      <p class="font-black text-gray-900 text-sm">{{ item.stock_quantity }} {{ item.unit }}</p>
                    </div>
                    <div>
                      <span class="text-[10px] text-gray-400 font-bold uppercase">Costo Unitario</span>
                      <p class="font-black text-emerald-600 text-sm">\${{ item.unit_cost | number:'1.2-2' }}</p>
                    </div>
                    <div>
                      <span class="text-[10px] text-gray-400 font-bold uppercase">Mín. Alerta</span>
                      <p class="font-bold text-gray-700">{{ item.min_stock_alert }} {{ item.unit }}</p>
                    </div>
                    <div>
                      <span class="text-[10px] text-gray-400 font-bold uppercase">Valor en Bodega</span>
                      <p class="font-bold text-gray-900">\${{ (item.stock_quantity * item.unit_cost) | number:'1.2-2' }}</p>
                    </div>
                  </div>

                  <p class="text-[11px] text-gray-500 mt-2 flex items-center gap-1">
                    <lucide-icon [name]="WarehouseIcon" size="13" class="text-gray-400"></lucide-icon>
                    {{ item.warehouse_name }} • {{ item.location_name || 'Almacén general' }}
                  </p>
                </div>

                <div class="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button 
                    (click)="abrirModalDespacho(item)" 
                    class="flex-1 py-2 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-[#E8541C] text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <lucide-icon [name]="TruckIcon" size="14"></lucide-icon>
                    <span>Despacho Obra</span>
                  </button>

                  <button 
                    (click)="abrirModalNuevaCompra({ type: 'consumable', id: item.id })" 
                    class="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <lucide-icon [name]="PlusIcon" size="14"></lucide-icon>
                    <span>Comprar</span>
                  </button>

                  <button 
                    (click)="eliminarConsumible(item.id)" 
                    class="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-400 flex items-center justify-center transition"
                  >
                    <lucide-icon [name]="TrashIcon" size="16"></lucide-icon>
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>

        <!-- ==================================================== -->
        <!-- TAB 3: PRÉSTAMOS & ALQUILERES                        -->
        <!-- ==================================================== -->
        <div *ngIf="currentTab() === 'prestamos'" class="space-y-5">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <h2 class="text-sm font-black text-gray-900 uppercase tracking-wider">
                Préstamos y Alquileres de Maquinaria
              </h2>
              <p class="text-xs text-gray-500 mt-0.5">
                Seguimiento exacto de herramientas entregadas a expertos y clientes
              </p>
            </div>

            <!-- FILTRO DE ESTADO -->
            <div class="flex items-center gap-2 overflow-x-auto">
              <button 
                *ngFor="let fil of ['todos', 'activos', 'vencidos', 'devueltos']"
                (click)="filtroPrestamos.set(fil)"
                [class]="filtroPrestamos() === fil ? 'bg-zinc-900 text-white font-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold'"
                class="px-3 py-1.5 rounded-xl text-xs capitalize transition cursor-pointer"
              >
                {{ fil }}
              </button>
            </div>
          </div>

          <!-- LISTA DE PRÉSTAMOS -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let loan of filteredLoans()" 
                 class="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                 [class.border-red-300]="loan.status === 'overdue'"
                 [class.border-gray-200]="loan.status !== 'overdue'">
              
              <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span [class]="loan.status === 'overdue' ? 'bg-red-100 text-red-700 border-red-300' : (loan.status === 'returned' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-orange-100 text-orange-800 border-orange-300')"
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border">
                    {{ loan.status === 'overdue' ? '⚠️ FUERA DE PLAZO' : (loan.status === 'returned' ? 'DEVUELTO' : 'EN PRÉSTAMO') }}
                  </span>
                  <span class="text-xs font-bold text-gray-500">
                    Cant: <b class="text-gray-900">{{ loan.quantity }} unid.</b>
                  </span>
                </div>

                <h3 class="text-sm font-black text-gray-900 leading-snug">{{ loan.tool_name }}</h3>
                <p *ngIf="loan.tool_brand" class="text-xs text-gray-500">{{ loan.tool_brand }} {{ loan.tool_model || '' }}</p>

                <!-- DETALLE DEL CONTACTO (EXPERTO / CLIENTE) -->
                <div class="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] text-gray-400 font-bold uppercase">Prestatario:</span>
                    <div class="flex items-center gap-1.5">
                      <b class="text-gray-900">{{ loan.contact_name }}</b>
                      <span *ngIf="loan.contact_role === 'experto'" class="bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded text-[9px] font-black">
                        Experto
                      </span>
                    </div>
                  </div>

                  <div *ngIf="loan.destination_location" class="flex items-center justify-between text-gray-600">
                    <span class="text-[10px] text-gray-400 font-bold uppercase">Obra / Destino:</span>
                    <span class="truncate max-w-[200px] font-medium">{{ loan.destination_location }}</span>
                  </div>

                  <div class="flex items-center justify-between text-gray-600">
                    <span class="text-[10px] text-gray-400 font-bold uppercase">Fecha de Entrega:</span>
                    <span>{{ loan.loan_date }}</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-[10px] text-gray-400 font-bold uppercase">Fecha Límite:</span>
                    <b [class.text-red-600]="loan.status === 'overdue'" class="text-gray-900">
                      {{ loan.due_date || 'No definida' }}
                    </b>
                  </div>
                </div>

                <p *ngIf="loan.notes" class="text-[11px] text-gray-500 italic mt-2">
                  "{{ loan.notes }}"
                </p>
              </div>

              <!-- ACCIONES DE PRÉSTAMO -->
              <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <a 
                  *ngIf="loan.contact_phone"
                  [href]="'https://wa.me/593' + loan.contact_phone.replace('0', '').replace(/\\s/g, '')"
                  target="_blank"
                  class="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <lucide-icon [name]="PhoneIcon" size="14"></lucide-icon>
                  <span>WhatsApp</span>
                </a>

                <button 
                  *ngIf="loan.status !== 'returned'"
                  (click)="abrirModalDevolucion(loan)"
                  class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <lucide-icon [name]="CheckCircleIcon" size="14"></lucide-icon>
                  <span>Reingresar Stock</span>
                </button>

                <div *ngIf="loan.status === 'returned'" class="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <lucide-icon [name]="CheckCircleIcon" size="15"></lucide-icon>
                  <span>Devuelto el {{ loan.returned_date }}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- ==================================================== -->
        <!-- TAB 4: BODEGAS & UBICACIONES                         -->
        <!-- ==================================================== -->
        <div *ngIf="currentTab() === 'bodegas'" class="space-y-6">
          
          <div class="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div>
              <h2 class="text-sm font-black text-gray-900 uppercase tracking-wider">Bodegas y Almacenes Físicos</h2>
              <p class="text-xs text-gray-500 mt-0.5">Organización física del patio de materiales, estanterías y vehículos</p>
            </div>
            <div class="flex items-center gap-2">
              <button 
                (click)="abrirModalNuevaUbicacion()" 
                class="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition"
              >
                + Nueva Estantería/Rack
              </button>
              <button 
                (click)="abrirModalNuevaBodega()" 
                class="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-sm"
              >
                + Nueva Bodega
              </button>
            </div>
          </div>

          <!-- TARJETAS DE BODEGAS -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div *ngFor="let wh of service.warehouses()" 
                 class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-orange-300 transition flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-xl bg-orange-50 text-[#E8541C] flex items-center justify-center font-black mb-3">
                  <lucide-icon [name]="WarehouseIcon" size="20"></lucide-icon>
                </div>
                <span class="text-[10px] font-black uppercase text-gray-400 tracking-wider">{{ wh.code }}</span>
                <h3 class="text-sm font-black text-gray-900 mt-0.5">{{ wh.name }}</h3>
                <p class="text-xs text-gray-500 mt-1 leading-relaxed">{{ wh.description }}</p>
                
                <p class="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                  <lucide-icon [name]="MapPinIcon" size="12"></lucide-icon>
                  {{ wh.address || 'Portoviejo, Manabí' }}
                </p>
              </div>

              <div class="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-600">
                <span>{{ getLocationsForWarehouse(wh.id).length }} Ubicaciones</span>
                <button (click)="eliminarBodega(wh.id)" class="text-red-500 hover:text-red-700 text-[11px]">Eliminar</button>
              </div>
            </div>
          </div>

          <!-- LISTADO DE ESTANTERÍAS / RACKS / UBICACIONES -->
          <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest">
              Estanterías, Pasillos y Patios de Almacenamiento
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div *ngFor="let loc of service.locations()" class="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-bold text-gray-900">{{ loc.name }}</h4>
                  <p class="text-[10px] text-gray-400 mt-0.5">{{ loc.warehouse_name }}</p>
                </div>
                <button (click)="eliminarUbicacion(loc.id)" class="text-gray-400 hover:text-red-500 transition">
                  <lucide-icon [name]="TrashIcon" size="14"></lucide-icon>
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- ==================================================== -->
        <!-- TAB 5: PROVEEDORES & COMPRAS                         -->
        <!-- ==================================================== -->
        <div *ngIf="currentTab() === 'proveedores'" class="space-y-6">
          
          <div class="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div class="flex items-center gap-2">
              <button 
                (click)="proveedoresSubTab.set('proveedores')"
                [class]="proveedoresSubTab() === 'proveedores' ? 'bg-zinc-900 text-white font-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold'"
                class="px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Directorio Proveedores ({{ service.suppliers().length }})
              </button>
              <button 
                (click)="proveedoresSubTab.set('compras')"
                [class]="proveedoresSubTab() === 'compras' ? 'bg-zinc-900 text-white font-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold'"
                class="px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Facturas de Compra ({{ service.purchases().length }})
              </button>
            </div>

            <button 
              *ngIf="proveedoresSubTab() === 'proveedores'"
              (click)="abrirModalNuevoProveedor()" 
              class="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-sm"
            >
              + Nuevo Proveedor
            </button>
            <button 
              *ngIf="proveedoresSubTab() === 'compras'"
              (click)="abrirModalNuevaCompra()" 
              class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
              + Registrar Factura
            </button>
          </div>

          <!-- SUB-VIEW: PROVEEDORES -->
          <div *ngIf="proveedoresSubTab() === 'proveedores'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let sup of service.suppliers()" class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black uppercase text-gray-400 tracking-wider">RUC: {{ sup.tax_id || '9999999999001' }}</span>
                <span class="bg-orange-50 text-[#E8541C] text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                  {{ sup.payment_terms || 'Crédito' }}
                </span>
              </div>
              <h3 class="text-sm font-black text-gray-900">{{ sup.name }}</h3>
              <p class="text-xs text-gray-500">Contacto: {{ sup.contact_name || 'Ventas' }}</p>
              
              <div class="py-2 px-3 rounded-xl bg-gray-50 border border-gray-100 text-xs flex justify-between">
                <span class="text-gray-500">Total facturado:</span>
                <b class="text-gray-900">\${{ sup.total_purchased || 0 | number:'1.2-2' }}</b>
              </div>

              <div class="pt-2 flex items-center justify-between text-xs">
                <a *ngIf="sup.phone" [href]="'tel:' + sup.phone" class="text-blue-600 font-bold hover:underline">
                  📞 {{ sup.phone }}
                </a>
                <button (click)="eliminarProveedor(sup.id)" class="text-red-500 hover:text-red-700 text-[11px]">
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          <!-- SUB-VIEW: FACTURAS DE COMPRA -->
          <div *ngIf="proveedoresSubTab() === 'compras'" class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-gray-50 border-b border-gray-200 text-gray-500 font-black uppercase text-[10px] tracking-wider">
                  <tr>
                    <th class="py-3 px-4">Factura</th>
                    <th class="py-3 px-4">Fecha</th>
                    <th class="py-3 px-4">Proveedor</th>
                    <th class="py-3 px-4">Ítem / Mercadería</th>
                    <th class="py-3 px-4">Cantidad</th>
                    <th class="py-3 px-4">Total</th>
                    <th class="py-3 px-4">Estado Pago</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr *ngFor="let p of service.purchases()" class="hover:bg-gray-50/50 transition">
                    <td class="py-3.5 px-4 font-bold text-gray-900">{{ p.invoice_number }}</td>
                    <td class="py-3.5 px-4 text-gray-500">{{ p.purchase_date }}</td>
                    <td class="py-3.5 px-4 font-bold text-gray-800">{{ p.supplier_name }}</td>
                    <td class="py-3.5 px-4 text-gray-700">{{ p.item_name }}</td>
                    <td class="py-3.5 px-4 font-bold text-gray-900">{{ p.quantity }}</td>
                    <td class="py-3.5 px-4 font-black text-emerald-600">\${{ p.total_cost | number:'1.2-2' }}</td>
                    <td class="py-3.5 px-4">
                      <span [class]="p.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                            class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                        {{ p.payment_status === 'paid' ? 'Pagado' : 'A Crédito' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- ==================================================== -->
        <!-- TAB 6: TABLAS RÁPIDAS (EXCEL SPREADSHEET VIEW)       -->
        <!-- ==================================================== -->
        <div *ngIf="currentTab() === 'tablas'" class="space-y-4">
          
          <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <lucide-icon [name]="FileSpreadsheetIcon" size="20" class="text-emerald-600"></lucide-icon>
                <h2 class="text-sm font-black text-gray-900 uppercase tracking-wider">
                  Vista Hoja de Cálculo / Tablas Masivas
                </h2>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">Auditoría rápida y exportación de datos del almacén en CSV</p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button 
                *ngFor="let s of ['materiales', 'herramientas', 'prestamos', 'compras']"
                (click)="spreadsheetSheet.set(s)"
                [class]="spreadsheetSheet() === s ? 'bg-emerald-600 text-white font-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold'"
                class="px-3 py-1.5 rounded-xl text-xs capitalize transition cursor-pointer"
              >
                {{ s }}
              </button>

              <button 
                (click)="descargarCsvActual()" 
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition shadow-sm cursor-pointer ml-2"
              >
                <lucide-icon [name]="DownloadIcon" size="14"></lucide-icon>
                <span>Descargar CSV</span>
              </button>
            </div>
          </div>

          <!-- TABLA DILIGENTE ESTILO EXCEL -->
          <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
              
              <!-- HOJA: MATERIALES -->
              <table *ngIf="spreadsheetSheet() === 'materiales'" class="w-full text-left text-xs">
                <thead class="bg-gray-100 text-gray-600 font-black uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th class="py-2.5 px-3">ID</th>
                    <th class="py-2.5 px-3">Material / Consumible</th>
                    <th class="py-2.5 px-3">Categoría</th>
                    <th class="py-2.5 px-3">Stock Actual</th>
                    <th class="py-2.5 px-3">Unidad</th>
                    <th class="py-2.5 px-3">Costo Unit.</th>
                    <th class="py-2.5 px-3">Valor Total</th>
                    <th class="py-2.5 px-3">Bodega</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 font-mono text-[11px]">
                  <tr *ngFor="let c of service.consumables()" class="hover:bg-amber-50/50 transition">
                    <td class="py-2 px-3 text-gray-400">{{ c.id }}</td>
                    <td class="py-2 px-3 font-bold text-gray-900 font-sans">{{ c.name }}</td>
                    <td class="py-2 px-3 text-gray-500 font-sans">{{ c.category }}</td>
                    <td class="py-2 px-3 font-bold" [class.text-amber-600]="c.is_low_stock">{{ c.stock_quantity }}</td>
                    <td class="py-2 px-3 text-gray-500">{{ c.unit }}</td>
                    <td class="py-2 px-3 text-emerald-600">\${{ c.unit_cost | number:'1.2-2' }}</td>
                    <td class="py-2 px-3 font-bold text-gray-900">\${{ (c.stock_quantity * c.unit_cost) | number:'1.2-2' }}</td>
                    <td class="py-2 px-3 text-gray-500 font-sans">{{ c.warehouse_name }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- HOJA: HERRAMIENTAS -->
              <table *ngIf="spreadsheetSheet() === 'herramientas'" class="w-full text-left text-xs">
                <thead class="bg-gray-100 text-gray-600 font-black uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th class="py-2.5 px-3">ID</th>
                    <th class="py-2.5 px-3">Herramienta</th>
                    <th class="py-2.5 px-3">Marca / Modelo</th>
                    <th class="py-2.5 px-3">Total</th>
                    <th class="py-2.5 px-3">Disponibles</th>
                    <th class="py-2.5 px-3">Condición</th>
                    <th class="py-2.5 px-3">Costo Compra</th>
                    <th class="py-2.5 px-3">Ubicación</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 font-mono text-[11px]">
                  <tr *ngFor="let t of service.tools()" class="hover:bg-orange-50/50 transition">
                    <td class="py-2 px-3 text-gray-400">{{ t.id }}</td>
                    <td class="py-2 px-3 font-bold text-gray-900 font-sans">{{ t.name }}</td>
                    <td class="py-2 px-3 text-gray-500 font-sans">{{ t.brand }} {{ t.model || '' }}</td>
                    <td class="py-2 px-3 font-bold">{{ t.total_quantity }}</td>
                    <td class="py-2 px-3 font-bold text-emerald-600">{{ t.available_quantity }}</td>
                    <td class="py-2 px-3 font-sans capitalize">{{ t.condition }}</td>
                    <td class="py-2 px-3">\${{ t.purchase_price || 0 }}</td>
                    <td class="py-2 px-3 text-gray-500 font-sans">{{ t.warehouse_name }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- HOJA: PRÉSTAMOS -->
              <table *ngIf="spreadsheetSheet() === 'prestamos'" class="w-full text-left text-xs">
                <thead class="bg-gray-100 text-gray-600 font-black uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-gray-200">
                  <tr>
                    <th class="py-2.5 px-3">Herramienta</th>
                    <th class="py-2.5 px-3">Prestatario (Experto / Cliente)</th>
                    <th class="py-2.5 px-3">Cant.</th>
                    <th class="py-2.5 px-3">Fecha Salida</th>
                    <th class="py-2.5 px-3">Fecha Límite</th>
                    <th class="py-2.5 px-3">Estado</th>
                    <th class="py-2.5 px-3">Destino / Obra</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 font-mono text-[11px]">
                  <tr *ngFor="let l of service.loans()" class="hover:bg-purple-50/50 transition">
                    <td class="py-2 px-3 font-bold text-gray-900 font-sans">{{ l.tool_name }}</td>
                    <td class="py-2 px-3 font-sans">{{ l.contact_name }} ({{ l.contact_role }})</td>
                    <td class="py-2 px-3 font-bold">{{ l.quantity }}</td>
                    <td class="py-2 px-3">{{ l.loan_date }}</td>
                    <td class="py-2 px-3">{{ l.due_date || 'N/A' }}</td>
                    <td class="py-2 px-3 font-sans capitalize font-bold">{{ l.status }}</td>
                    <td class="py-2 px-3 font-sans text-gray-500">{{ l.destination_location }}</td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>

        </div>

      </div>

      <!-- ==================================================== -->
      <!-- MODALES DE CREACIÓN Y EDICIÓN                        -->
      <!-- ==================================================== -->

      <!-- MODAL: NUEVA / EDITAR HERRAMIENTA -->
      <div *ngIf="mostrarModalHerramienta()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div class="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 class="font-black text-sm text-gray-900 uppercase tracking-wider">
              {{ herramientaEditando() ? 'Editar Herramienta' : 'Añadir Nueva Herramienta / Maquinaria' }}
            </h3>
            <button (click)="cerrarModales()" class="text-gray-400 hover:text-gray-600">
              <lucide-icon [name]="XIcon" size="20"></lucide-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-gray-500 mb-1">Nombre del equipo</label>
              <input type="text" [(ngModel)]="toolForm.name" placeholder="Ej. Rotomartillo SDS Max 1500W" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#E8541C]" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-500 mb-1">Marca</label>
                <input type="text" [(ngModel)]="toolForm.brand" placeholder="Ej. Bosch, DeWalt" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#E8541C]" />
              </div>
              <div>
                <label class="block font-bold text-gray-500 mb-1">Modelo</label>
                <input type="text" [(ngModel)]="toolForm.model" placeholder="Ej. GBH 8-45" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-[#E8541C]" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-500 mb-1">Categoría</label>
                <select [(ngModel)]="toolForm.category" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none">
                  <option value="Herramientas Eléctricas">Herramientas Eléctricas</option>
                  <option value="Estructuras y Altura">Estructuras y Altura</option>
                  <option value="Soldadura y Metales">Soldadura y Metales</option>
                  <option value="Generación Eléctrica">Generación Eléctrica</option>
                  <option value="Herramientas Manuales">Herramientas Manuales</option>
                  <option value="Neumática y Pintura">Neumática y Pintura</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-gray-500 mb-1">Condición</label>
                <select [(ngModel)]="toolForm.condition" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none">
                  <option value="new">Nueva (100%)</option>
                  <option value="good">Buen Estado</option>
                  <option value="fair">Regular / Desgaste</option>
                  <option value="maintenance">En Mantenimiento</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-500 mb-1">Cantidad Total</label>
                <input type="number" [(ngModel)]="toolForm.total_quantity" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
              </div>
              <div>
                <label class="block font-bold text-gray-500 mb-1">Costo de Compra ($)</label>
                <input type="number" [(ngModel)]="toolForm.purchase_price" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-500 mb-1">Bodega Asignada</label>
              <select [(ngModel)]="toolForm.warehouse_id" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none">
                <option *ngFor="let wh of service.warehouses()" [value]="wh.id">{{ wh.name }}</option>
              </select>
            </div>
          </div>

          <button (click)="guardarHerramienta()" class="w-full bg-[#E8541C] text-white py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition">
            Guardar Herramienta
          </button>
        </div>
      </div>

      <!-- MODAL: NUEVO PRÉSTAMO / ALQUILER -->
      <div *ngIf="mostrarModalPrestamo()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div class="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 class="font-black text-sm text-gray-900 uppercase tracking-wider">
              Registrar Préstamo / Alquiler de Maquinaria
            </h3>
            <button (click)="cerrarModales()" class="text-gray-400 hover:text-gray-600">
              <lucide-icon [name]="XIcon" size="20"></lucide-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-gray-500 mb-1">Seleccionar Herramienta / Maquinaria</label>
              <select [(ngModel)]="prestamoForm.tool_id" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none">
                <option *ngFor="let t of herramientasDisponiblesParaPrestar()" [value]="t.id">
                  {{ t.name }} (Disponibles: {{ t.available_quantity }})
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-500 mb-1">Prestatario (Experto o Cliente)</label>
              <select [(ngModel)]="prestamoForm.contact_id" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none">
                <option *ngFor="let c of service.contacts()" [value]="c.id">
                  {{ c.name }} • {{ c.relationship || c.role }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-500 mb-1">Cantidad a Prestar</label>
                <input type="number" [(ngModel)]="prestamoForm.quantity" min="1" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
              </div>
              <div>
                <label class="block font-bold text-gray-500 mb-1">Fecha Límite Retorno</label>
                <input type="date" [(ngModel)]="prestamoForm.due_date" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-500 mb-1">Destino / Dirección de la Obra</label>
              <input type="text" [(ngModel)]="prestamoForm.destination_location" placeholder="Ej. Obra Calle 15 y Av. Manabí" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
            </div>

            <div>
              <label class="block font-bold text-gray-500 mb-1">Notas de inspección inicial</label>
              <textarea [(ngModel)]="prestamoForm.notes" rows="2" placeholder="Accesorios entregados, brocas, mangueras, estado inicial..." class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium outline-none"></textarea>
            </div>
          </div>

          <button (click)="guardarPrestamo()" class="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition">
            Confirmar Entrega de Maquinaria
          </button>
        </div>
      </div>

      <!-- MODAL: REGISTRAR DEVOLUCIÓN -->
      <div *ngIf="prestamoADevolver()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div class="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 class="font-black text-sm text-gray-900 uppercase tracking-wider">
              Registrar Devolución & Inspección
            </h3>
            <button (click)="prestamoADevolver.set(null)" class="text-gray-400 hover:text-gray-600">
              <lucide-icon [name]="XIcon" size="20"></lucide-icon>
            </button>
          </div>

          <div class="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
            <p class="font-black text-gray-900">{{ prestamoADevolver()!.tool_name }}</p>
            <p class="text-gray-500">Devuelve: <b>{{ prestamoADevolver()!.contact_name }}</b></p>
            <p class="text-gray-500">Cantidad: {{ prestamoADevolver()!.quantity }} unidad(es)</p>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-gray-500 mb-1">Condición al recibir</label>
              <select [(ngModel)]="devolucionForm.condition_in" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none">
                <option value="good">Buen estado (Listo para préstamo)</option>
                <option value="fair">Desgaste normal de obra</option>
                <option value="maintenance">Requiere limpieza / servicio técnico</option>
                <option value="damaged">Dañado / Faltan piezas</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-500 mb-1">Observaciones de retorno</label>
              <textarea [(ngModel)]="devolucionForm.return_notes" rows="2" placeholder="Observaciones de limpieza, prueba de encendido..." class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium outline-none"></textarea>
            </div>
          </div>

          <button (click)="confirmarDevolucion()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition">
            Reingresar a Inventario Disponible
          </button>
        </div>
      </div>

      <!-- MODAL: NUEVO CONSUMIBLE / MATERIAL -->
      <div *ngIf="mostrarModalConsumible()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div class="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 class="font-black text-sm text-gray-900 uppercase tracking-wider">
              Nuevo Material / Consumible
            </h3>
            <button (click)="cerrarModales()" class="text-gray-400 hover:text-gray-600">
              <lucide-icon [name]="XIcon" size="20"></lucide-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-gray-500 mb-1">Nombre del material</label>
              <input type="text" [(ngModel)]="consumableForm.name" placeholder="Ej. Cemento Holcim 50kg" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-500 mb-1">Categoría</label>
                <select [(ngModel)]="consumableForm.category" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none">
                  <option value="Materiales Básicos">Materiales Básicos</option>
                  <option value="Aceros y Varillas">Aceros y Varillas</option>
                  <option value="Químicos y Pegas">Químicos y Pegas</option>
                  <option value="Plomería y Tuberías">Plomería y Tuberías</option>
                  <option value="Electricidad">Electricidad</option>
                  <option value="Pinturas y Acabados">Pinturas y Acabados</option>
                  <option value="Consumibles Abrasivos">Consumibles Abrasivos</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-gray-500 mb-1">Unidad de Medida</label>
                <select [(ngModel)]="consumableForm.unit" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none">
                  <option value="saco">Saco</option>
                  <option value="pz">Pieza (pz)</option>
                  <option value="tubo">Tubo (3m / 6m)</option>
                  <option value="rollo">Rollo</option>
                  <option value="gal">Galón</option>
                  <option value="kg">Kilogramo (kg)</option>
                  <option value="m">Metro (m)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-bold text-gray-500 mb-1">Stock Inicial</label>
                <input type="number" [(ngModel)]="consumableForm.stock_quantity" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
              </div>
              <div>
                <label class="block font-bold text-gray-500 mb-1">Alerta Mínimo</label>
                <input type="number" [(ngModel)]="consumableForm.min_stock_alert" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
              </div>
              <div>
                <label class="block font-bold text-gray-500 mb-1">Costo Unit. ($)</label>
                <input type="number" [(ngModel)]="consumableForm.unit_cost" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-500 mb-1">Bodega</label>
              <select [(ngModel)]="consumableForm.warehouse_id" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none">
                <option *ngFor="let wh of service.warehouses()" [value]="wh.id">{{ wh.name }}</option>
              </select>
            </div>
          </div>

          <button (click)="guardarConsumible()" class="w-full bg-[#E8541C] text-white py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition">
            Guardar Material en Inventario
          </button>
        </div>
      </div>

      <!-- MODAL: REGISTRAR COMPRA / FACTURA -->
      <div *ngIf="mostrarModalCompra()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div class="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 class="font-black text-sm text-gray-900 uppercase tracking-wider">
              Registrar Factura de Compra
            </h3>
            <button (click)="cerrarModales()" class="text-gray-400 hover:text-gray-600">
              <lucide-icon [name]="XIcon" size="20"></lucide-icon>
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-500 mb-1">Nº Factura</label>
                <input type="text" [(ngModel)]="compraForm.invoice_number" placeholder="FAC-001-XXXX" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
              </div>
              <div>
                <label class="block font-bold text-gray-500 mb-1">Fecha</label>
                <input type="date" [(ngModel)]="compraForm.purchase_date" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-500 mb-1">Proveedor</label>
              <select [(ngModel)]="compraForm.supplier_id" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none">
                <option *ngFor="let s of service.suppliers()" [value]="s.id">{{ s.name }}</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-gray-500 mb-1">Detalle / Ítem Comprado</label>
              <input type="text" [(ngModel)]="compraForm.item_name" placeholder="Ej. Lote Cemento 200 sacos" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-gray-500 mb-1">Cantidad</label>
                <input type="number" [(ngModel)]="compraForm.quantity" min="1" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
              </div>
              <div>
                <label class="block font-bold text-gray-500 mb-1">Costo Unitario ($)</label>
                <input type="number" [(ngModel)]="compraForm.unit_cost" step="0.01" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none" />
              </div>
            </div>

            <div class="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
              <div class="flex justify-between">
                <span>Subtotal:</span>
                <b>\${{ (compraForm.quantity * compraForm.unit_cost) | number:'1.2-2' }}</b>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>IVA (15%):</span>
                <b>\${{ ((compraForm.quantity * compraForm.unit_cost) * 0.15) | number:'1.2-2' }}</b>
              </div>
              <div class="flex justify-between text-emerald-600 font-black text-sm pt-1 border-t border-gray-200">
                <span>Total Compra:</span>
                <span>\${{ ((compraForm.quantity * compraForm.unit_cost) * 1.15) | number:'1.2-2' }}</span>
              </div>
            </div>

            <div>
              <label class="block font-bold text-gray-500 mb-1">Condición de Pago</label>
              <select [(ngModel)]="compraForm.payment_status" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold outline-none">
                <option value="paid">Pagado al Contado</option>
                <option value="credit">A Crédito (30 días)</option>
                <option value="pending">Pendiente de Aprobación</option>
              </select>
            </div>
          </div>

          <button (click)="guardarCompra()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-emerald-600/20 active:scale-95 transition">
            Registrar Factura en Almacén
          </button>
        </div>
      </div>

      <!-- MODAL: VER CÓDIGO QR / FICHA DE HERRAMIENTA -->
      <div *ngIf="herramientaQR()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
        <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4">
          <div class="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 class="font-black text-xs text-gray-400 uppercase tracking-widest">Ficha Técnica & QR</h3>
            <button (click)="herramientaQR.set(null)" class="text-gray-400 hover:text-gray-600">
              <lucide-icon [name]="XIcon" size="18"></lucide-icon>
            </button>
          </div>

          <!-- MOCK QR RENDER -->
          <div class="p-6 bg-white border-2 border-dashed border-gray-300 rounded-2xl inline-block shadow-inner">
            <div class="w-40 h-40 bg-zinc-950 p-2 rounded-xl flex items-center justify-center text-white">
              <div class="text-center font-mono text-[9px] leading-tight opacity-90">
                <p class="font-bold text-orange-400 mb-1">FERRECOMPARA WMS</p>
                <p>ID: {{ herramientaQR()!.id }}</p>
                <p class="truncate max-w-[130px] font-bold text-white">{{ herramientaQR()!.name }}</p>
                <p class="text-gray-400 mt-1">SN: {{ herramientaQR()!.serial_number }}</p>
                <p class="text-emerald-400 mt-1 font-bold">● VÁLIDO PARA ALQUILER</p>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-black text-sm text-gray-900">{{ herramientaQR()!.name }}</h4>
            <p class="text-xs text-gray-500 mt-0.5">Código de Barras: {{ herramientaQR()!.barcode }}</p>
            <p class="text-xs text-gray-500">Bodega: {{ herramientaQR()!.warehouse_name }}</p>
          </div>

          <button (click)="herramientaQR.set(null)" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition">
            Cerrar
          </button>
        </div>
      </div>

    </div>
  `
})
export class WarehouseViewComponent implements OnInit {
  service = inject(WarehouseService);

  @Input() initialTab: WarehouseSubTab = 'dashboard';
  @Output() volver = new EventEmitter<void>();

  currentTab = signal<WarehouseSubTab>('dashboard');
  inventarioSubTab = signal<'herramientas' | 'consumibles'>('herramientas');
  proveedoresSubTab = signal<'proveedores' | 'compras'>('proveedores');
  spreadsheetSheet = signal<'materiales' | 'herramientas' | 'prestamos' | 'compras'>('materiales');
  filtroPrestamos = signal<string>('todos');
  busquedaInventario = '';

  stats = this.service.stats;

  // Modales
  mostrarModalHerramienta = signal(false);
  herramientaEditando = signal<Tool | null>(null);
  mostrarModalPrestamo = signal(false);
  prestamoADevolver = signal<Loan | null>(null);
  mostrarModalConsumible = signal(false);
  mostrarModalCompra = signal(false);
  herramientaQR = signal<Tool | null>(null);

  // Forms
  toolForm: Partial<Tool> = {
    name: '',
    brand: '',
    model: '',
    category: 'Herramientas Eléctricas',
    condition: 'good',
    total_quantity: 1,
    purchase_price: 150,
    warehouse_id: 1
  };

  prestamoForm = {
    tool_id: 1,
    contact_id: 1,
    quantity: 1,
    loan_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    destination_location: 'Obra Portoviejo Centro',
    notes: ''
  };

  devolucionForm = {
    condition_in: 'good',
    return_notes: ''
  };

  consumableForm: Partial<Consumable> = {
    name: '',
    category: 'Materiales Básicos',
    unit: 'saco',
    stock_quantity: 50,
    min_stock_alert: 15,
    unit_cost: 8.50,
    warehouse_id: 2
  };

  compraForm = {
    invoice_number: `FAC-001-${Math.floor(1000 + Math.random() * 9000)}`,
    purchase_date: new Date().toISOString().split('T')[0],
    supplier_id: 1,
    item_name: 'Lote Cemento Holcim 50kg',
    quantity: 100,
    unit_cost: 7.50,
    payment_status: 'paid' as any
  };

  // Iconos
  readonly WarehouseIcon = Warehouse;
  readonly PackageIcon = Package;
  readonly WrenchIcon = Wrench;
  readonly BoxesIcon = Boxes;
  readonly ArrowLeftRightIcon = ArrowLeftRight;
  readonly ClockIcon = Clock;
  readonly QrCodeIcon = QrCode;
  readonly ShieldAlertIcon = ShieldAlert;
  readonly SparklesIcon = Sparkles;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly PlusIcon = Plus;
  readonly SearchIcon = Search;
  readonly TrashIcon = Trash2;
  readonly EditIcon = Edit;
  readonly XIcon = X;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CheckCircleIcon = CheckCircle;
  readonly PhoneIcon = Phone;
  readonly MapPinIcon = MapPin;
  readonly DollarSignIcon = DollarSign;
  readonly FileSpreadsheetIcon = FileSpreadsheet;
  readonly DownloadIcon = Download;
  readonly TruckIcon = Truck;
  readonly EyeIcon = Eye;
  readonly UsersIcon = Users;
  readonly RefreshCwIcon = RefreshCw;
  readonly CalendarIcon = Calendar;
  readonly TagIcon = Tag;
  readonly FileTextIcon = FileText;
  readonly LayersIcon = Layers;

  get tabsList() {
    return [
      { id: 'dashboard' as WarehouseSubTab, label: 'Dashboard WMS', icon: this.WarehouseIcon },
      { id: 'inventario' as WarehouseSubTab, label: 'Inventario & Herramientas', icon: this.WrenchIcon, badge: this.service.tools().length },
      { id: 'prestamos' as WarehouseSubTab, label: 'Préstamos & Alquileres', icon: this.ArrowLeftRightIcon, badge: this.stats().loans.active_loans_out, badgeClass: this.stats().loans.overdue_loans_out > 0 ? 'bg-red-500 text-white' : 'bg-orange-100 text-[#E8541C]' },
      { id: 'bodegas' as WarehouseSubTab, label: 'Bodegas & Ubicaciones', icon: this.BoxesIcon, badge: this.service.warehouses().length },
      { id: 'proveedores' as WarehouseSubTab, label: 'Proveedores & Compras', icon: this.TruckIcon, badge: this.service.suppliers().length },
      { id: 'tablas' as WarehouseSubTab, label: 'Tablas Rápidas (Excel)', icon: this.FileSpreadsheetIcon }
    ];
  }

  ngOnInit() {
    if (this.initialTab) {
      this.currentTab.set(this.initialTab);
    }
  }

  volverAlDashboard() {
    this.volver.emit();
  }

  filteredTools() {
    const list = this.service.tools();
    if (!this.busquedaInventario) return list;
    const term = this.busquedaInventario.toLowerCase();
    return list.filter(t => 
      t.name.toLowerCase().includes(term) ||
      (t.brand && t.brand.toLowerCase().includes(term)) ||
      (t.serial_number && t.serial_number.toLowerCase().includes(term))
    );
  }

  filteredConsumables() {
    const list = this.service.consumables();
    if (!this.busquedaInventario) return list;
    const term = this.busquedaInventario.toLowerCase();
    return list.filter(c => 
      c.name.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term)
    );
  }

  filteredLoans() {
    const list = this.service.loans();
    const f = this.filtroPrestamos();
    if (f === 'activos') return list.filter(l => l.status === 'active');
    if (f === 'vencidos') return list.filter(l => l.status === 'overdue');
    if (f === 'devueltos') return list.filter(l => l.status === 'returned');
    return list;
  }

  herramientasDisponiblesParaPrestar() {
    return this.service.tools().filter(t => t.available_quantity > 0);
  }

  getLocationsForWarehouse(warehouseId: number) {
    return this.service.locations().filter(l => l.warehouse_id === warehouseId);
  }

  getConditionBadge(c: ToolCondition): string {
    switch (c) {
      case 'new': return 'bg-emerald-500/90 text-white';
      case 'good': return 'bg-blue-600/90 text-white';
      case 'fair': return 'bg-orange-500/90 text-white';
      case 'damaged': return 'bg-red-600/90 text-white';
      case 'maintenance': return 'bg-purple-600/90 text-white';
      default: return 'bg-zinc-800 text-white';
    }
  }

  // Modales
  abrirModalNuevaHerramienta() {
    this.herramientaEditando.set(null);
    this.toolForm = {
      name: '',
      brand: '',
      model: '',
      category: 'Herramientas Eléctricas',
      condition: 'good',
      total_quantity: 1,
      purchase_price: 150,
      warehouse_id: 1
    };
    this.mostrarModalHerramienta.set(true);
  }

  editarHerramienta(tool: Tool) {
    this.herramientaEditando.set(tool);
    this.toolForm = { ...tool };
    this.mostrarModalHerramienta.set(true);
  }

  guardarHerramienta() {
    if (!this.toolForm.name) return;
    if (this.herramientaEditando()) {
      this.service.updateTool(this.herramientaEditando()!.id, this.toolForm);
    } else {
      this.service.addTool(this.toolForm);
    }
    this.cerrarModales();
  }

  eliminarHerramienta(id: number) {
    if (confirm('¿Eliminar esta herramienta del almacén?')) {
      this.service.deleteTool(id);
    }
  }

  abrirModalNuevoPrestamo(tool?: Tool) {
    if (tool) {
      this.prestamoForm.tool_id = tool.id;
    } else {
      const avail = this.herramientasDisponiblesParaPrestar();
      if (avail.length > 0) this.prestamoForm.tool_id = avail[0].id;
    }
    const contacts = this.service.contacts();
    if (contacts.length > 0) this.prestamoForm.contact_id = contacts[0].id;
    this.mostrarModalPrestamo.set(true);
  }

  prestarEstaHerramienta(tool: Tool) {
    this.abrirModalNuevoPrestamo(tool);
  }

  guardarPrestamo() {
    this.service.createLoan({
      tool_id: Number(this.prestamoForm.tool_id),
      contact_id: Number(this.prestamoForm.contact_id),
      loan_type: 'lent_to_others',
      quantity: Number(this.prestamoForm.quantity) || 1,
      loan_date: this.prestamoForm.loan_date,
      due_date: this.prestamoForm.due_date,
      destination_location: this.prestamoForm.destination_location,
      notes: this.prestamoForm.notes
    });
    this.cerrarModales();
    this.currentTab.set('prestamos');
  }

  abrirModalDevolucion(loan: Loan) {
    this.prestamoADevolver.set(loan);
    this.devolucionForm = { condition_in: 'good', return_notes: '' };
  }

  confirmarDevolucion() {
    const loan = this.prestamoADevolver();
    if (!loan) return;
    this.service.returnLoan(loan.id, this.devolucionForm);
    this.prestamoADevolver.set(null);
  }

  abrirModalNuevoConsumible() {
    this.consumableForm = {
      name: '',
      category: 'Materiales Básicos',
      unit: 'saco',
      stock_quantity: 50,
      min_stock_alert: 15,
      unit_cost: 8.50,
      warehouse_id: 2
    };
    this.mostrarModalConsumible.set(true);
  }

  guardarConsumible() {
    if (!this.consumableForm.name) return;
    this.service.addConsumable(this.consumableForm);
    this.cerrarModales();
  }

  eliminarConsumible(id: number) {
    if (confirm('¿Eliminar este material del inventario?')) {
      this.service.deleteConsumable(id);
    }
  }

  abrirModalDespacho(item: Consumable) {
    const qtyStr = prompt(`¿Cuántas unidades (${item.unit}) deseas despachar a obra de "${item.name}"? (Stock actual: ${item.stock_quantity})`, '5');
    if (!qtyStr) return;
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty <= 0) return;
    const reason = prompt('Indica el nombre de la obra o destino del despacho:', 'Obra Portoviejo');
    this.service.registerConsumption(item.id, qty, undefined, reason || undefined);
    alert(`Se despacharon ${qty} ${item.unit} de ${item.name} exitosamente.`);
  }

  abrirModalNuevaCompra(pre?: { type: 'tool' | 'consumable', id?: number }) {
    this.compraForm = {
      invoice_number: `FAC-001-${Math.floor(1000 + Math.random() * 9000)}`,
      purchase_date: new Date().toISOString().split('T')[0],
      supplier_id: 1,
      item_name: pre?.type === 'consumable' ? 'Reposición Material' : 'Herramienta Nueva',
      quantity: 50,
      unit_cost: 7.50,
      payment_status: 'paid'
    };
    this.mostrarModalCompra.set(true);
  }

  guardarCompra() {
    this.service.addPurchase({
      invoice_number: this.compraForm.invoice_number,
      purchase_date: this.compraForm.purchase_date,
      supplier_id: Number(this.compraForm.supplier_id),
      supplier_name: this.service.suppliers().find(s => s.id === Number(this.compraForm.supplier_id))?.name || 'Proveedor General',
      item_name: this.compraForm.item_name,
      quantity: Number(this.compraForm.quantity) || 1,
      unit_cost: Number(this.compraForm.unit_cost) || 0,
      payment_status: this.compraForm.payment_status
    });
    this.cerrarModales();
  }

  abrirModalVerQR(tool: Tool) {
    this.herramientaQR.set(tool);
  }

  abrirModalNuevaBodega() {
    const nombre = prompt('Nombre de la nueva bodega:', 'Bodega Norte Manta');
    if (!nombre) return;
    const direccion = prompt('Dirección física:', 'Vía Circunvalación');
    this.service.addWarehouse({ name: nombre, address: direccion });
  }

  eliminarBodega(id: number) {
    if (confirm('¿Eliminar esta bodega?')) {
      this.service.deleteWarehouse(id);
    }
  }

  abrirModalNuevaUbicacion() {
    const nombre = prompt('Nombre de la estantería / pasillo / rack:', 'Estante B3 - Pernos y Clavos');
    if (!nombre) return;
    this.service.addLocation({ name: nombre, warehouse_id: 1 });
  }

  eliminarUbicacion(id: number) {
    if (confirm('¿Eliminar esta ubicación?')) {
      this.service.deleteLocation(id);
    }
  }

  abrirModalNuevoProveedor() {
    const nombre = prompt('Nombre de la empresa proveedora:', 'Cables y Alambres del Ecuador S.A.');
    if (!nombre) return;
    const ruc = prompt('RUC / Identificación:', '1790019283001');
    const telefono = prompt('Teléfono de ventas:', '0981234567');
    this.service.addSupplier({ name: nombre, tax_id: ruc, phone: telefono });
  }

  eliminarProveedor(id: number) {
    if (confirm('¿Eliminar este proveedor?')) {
      this.service.deleteSupplier(id);
    }
  }

  cerrarModales() {
    this.mostrarModalHerramienta.set(false);
    this.herramientaEditando.set(null);
    this.mostrarModalPrestamo.set(false);
    this.prestamoADevolver.set(null);
    this.mostrarModalConsumible.set(false);
    this.mostrarModalCompra.set(false);
    this.herramientaQR.set(null);
  }

  descargarCsvActual() {
    const sheet = this.spreadsheetSheet();
    let csv = '';
    let filename = `ferrecompara_${sheet}_${new Date().toISOString().split('T')[0]}.csv`;

    if (sheet === 'materiales') {
      csv = 'ID,Nombre,Categoria,Stock,Unidad,CostoUnit,ValorTotal,Bodega\n';
      this.service.consumables().forEach(c => {
        csv += `${c.id},"${c.name}","${c.category}",${c.stock_quantity},"${c.unit}",${c.unit_cost},${c.stock_quantity * c.unit_cost},"${c.warehouse_name}"\n`;
      });
    } else if (sheet === 'herramientas') {
      csv = 'ID,Herramienta,Marca,Modelo,Total,Disponibles,Condicion,PrecioCompra,Bodega\n';
      this.service.tools().forEach(t => {
        csv += `${t.id},"${t.name}","${t.brand || ''}","${t.model || ''}",${t.total_quantity},${t.available_quantity},"${t.condition}",${t.purchase_price || 0},"${t.warehouse_name}"\n`;
      });
    } else if (sheet === 'prestamos') {
      csv = 'ID,Herramienta,Prestatario,Rol,Cantidad,FechaSalida,FechaRetorno,Estado,Destino\n';
      this.service.loans().forEach(l => {
        csv += `${l.id},"${l.tool_name}","${l.contact_name}","${l.contact_role || ''}",${l.quantity},"${l.loan_date}","${l.due_date || ''}","${l.status}","${l.destination_location || ''}"\n`;
      });
    } else {
      csv = 'Factura,Fecha,Proveedor,Item,Cantidad,Total,Estado\n';
      this.service.purchases().forEach(p => {
        csv += `"${p.invoice_number}","${p.purchase_date}","${p.supplier_name}","${p.item_name}",${p.quantity},${p.total_cost},"${p.payment_status}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
