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
  Layers,
  Building2,
  ShoppingCart,
  PackageOpen,
  Pencil,
  History,
  TrendingUp,
  TrendingDown,
  Calculator,
  ShieldCheck,
  Building,
  ExternalLink,
  ZoomIn,
  Receipt,
  Filter
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
              <div *ngFor="let tool of inventarioFilteredTools()" 
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
            <div *ngFor="let loan of prestamosFilteredLoans()" 
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
                  [href]="getWhatsAppUrl(loan.contact_phone)"
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
        <div *ngIf="currentTab() === 'tablas'" class="space-y-4 animate-in fade-in">
          
          <!-- Header Superior -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <lucide-icon [name]="FileSpreadsheetIcon" size="20"></lucide-icon>
                </span>
                <h1 class="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Tablas del Sistema
                </h1>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Registro dividido por materiales, ferreterías, compras, herramientas y saldos contables
              </p>
            </div>

            <div class="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                (click)="abrirModalNuevaCompra()"
                class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition cursor-pointer"
                title="Registrar una nueva compra o factura con IA"
              >
                <lucide-icon [name]="PlusIcon" size="16"></lucide-icon>
                <span>Agregar Compra</span>
              </button>
              <button
                type="button"
                (click)="exportCurrentSheetCsv()"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                title="Descargar datos en archivo (.csv)"
              >
                <lucide-icon [name]="DownloadIcon" size="16"></lucide-icon>
                <span>Exportar Tabla (.csv)</span>
              </button>
            </div>
          </div>

          <!-- Selector de Pestañas / Hojas de Cálculo (Estilo Pestañas de Excel) -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800 scrollbar-thin">
            <button
              *ngFor="let tab of spreadsheetSheetsList"
              type="button"
              (click)="setSpreadsheetSheet(tab.id)"
              [class]="spreadsheetSheet() === tab.id
                ? 'bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/25'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 font-semibold'"
              class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition shrink-0 cursor-pointer"
            >
              <lucide-icon [name]="tab.icon" size="14"></lucide-icon>
              <span>{{ tab.label }}</span>
              <span 
                [class]="spreadsheetSheet() === tab.id 
                  ? 'bg-black/20 text-white font-extrabold' 
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold'"
                class="text-[10px] px-1.5 py-0.5 rounded-full"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>

          <!-- Barra de Filtros y Búsqueda -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <lucide-icon [name]="SearchIcon" size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"></lucide-icon>
              <input
                type="text"
                [placeholder]="getSpreadsheetSearchPlaceholder()"
                [ngModel]="spreadsheetSearchTerm()"
                (ngModelChange)="spreadsheetSearchTerm.set($event)"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 transition shadow-sm"
              />
            </div>

            <!-- Filtro por almacén -->
            <select
              *ngIf="spreadsheetSheet() !== 'suppliers'"
              [ngModel]="spreadsheetWarehouse()"
              (ngModelChange)="spreadsheetWarehouse.set($event)"
              class="px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 shrink-0 shadow-sm"
            >
              <option value="all">Todos los Almacenes</option>
              <option *ngFor="let w of service.warehouses()" [value]="w.id.toString()">
                {{ w.name }} {{ w.code ? '(' + w.code + ')' : '' }}
              </option>
            </select>
          </div>

          <!-- ======================================================== -->
          <!-- HOJA 1: MATERIALES Y CONSUMIBLES                         -->
          <!-- ======================================================== -->
          <div *ngIf="spreadsheetSheet() === 'materials'" class="space-y-3">
            <!-- Tarjetas KPI Superiores -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Materiales Distintos</span>
                <p class="text-lg font-black text-zinc-900 dark:text-white">{{ filteredMaterials().length }}</p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Unidades en Existencia</span>
                <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {{ getMaterialsUnitsTotal() | number:'1.1-1' }}
                </p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Valor Total Invertido</span>
                <p class="text-lg font-black text-orange-600 dark:text-orange-400">
                  \${{ getMaterialsValueTotal() | number:'1.2-2' }}
                </p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Alertas de Bajo Stock</span>
                <p class="text-lg font-black text-red-500">
                  {{ getMaterialsLowStockCount() }}
                </p>
              </div>
            </div>

            <!-- Tabla Excel -->
            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div class="overflow-x-auto max-h-[600px] scrollbar-thin">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Material / Insumo</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Proveedor / Ferretería</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">N° Factura</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Fecha Compra</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Categoría</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Almacén</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Ubicación</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Stock</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-center">Unidad</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Costo Promedio</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Valor Total</th>
                      <th class="px-3.5 py-2.5 text-center border-r border-zinc-200 dark:border-zinc-700">Estado</th>
                      <th class="px-3.5 py-2.5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                    <tr *ngFor="let m of filteredMaterials()" class="hover:bg-emerald-500/5 transition">
                      <!-- Material / Insumo -->
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans font-bold text-zinc-900 dark:text-white">
                        <div class="flex flex-col">
                          <span>{{ m.name }}</span>
                          <span *ngIf="m.barcode" class="text-[10px] font-mono text-zinc-400 font-normal">{{ m.barcode }}</span>
                        </div>
                      </td>
                      <!-- Proveedor / Ferretería -->
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            (click)="abrirModalEditarConsumible(m)"
                            class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 transition cursor-pointer text-left group"
                            [title]="'Proveedor: ' + getConsumableMeta(m).supplier"
                          >
                            <lucide-icon [name]="Building2Icon" size="12" class="text-emerald-500 shrink-0"></lucide-icon>
                            <span class="truncate max-w-[130px]">{{ getConsumableMeta(m).supplier }}</span>
                            <lucide-icon [name]="PencilIcon" size="10" class="opacity-0 group-hover:opacity-100 text-emerald-600 transition"></lucide-icon>
                          </button>
                          <button
                            *ngIf="getConsumableMeta(m).suppliersCount > 1"
                            type="button"
                            (click)="abrirHistorialItem(m, 'consumable')"
                            class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition cursor-pointer inline-flex items-center gap-1 shrink-0"
                            [title]="getConsumableMeta(m).suppliersCount + ' proveedores registrados. Clic para ver historial.'"
                          >
                            <lucide-icon [name]="HistoryIcon" size="10"></lucide-icon>
                            <span>{{ getConsumableMeta(m).suppliersCount }} prov.</span>
                          </button>
                        </div>
                      </td>
                      <!-- N° Factura -->
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                        <span *ngIf="getConsumableMeta(m).invoiceNumber" class="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold">
                          {{ getConsumableMeta(m).invoiceNumber }}
                        </span>
                        <span *ngIf="!getConsumableMeta(m).invoiceNumber" class="text-zinc-400">—</span>
                      </td>
                      <!-- Fecha Compra -->
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {{ getConsumableMeta(m).purchaseDate || '—' }}
                      </td>
                      <!-- Categoría -->
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans text-zinc-600 dark:text-zinc-400">
                        {{ m.category }}
                      </td>
                      <!-- Almacén -->
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans text-zinc-600 dark:text-zinc-400">
                        {{ m.warehouse_name || 'Sin almacén' }}
                      </td>
                      <!-- Ubicación -->
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans text-zinc-600 dark:text-zinc-400">
                        {{ m.location_name || 'General' }}
                      </td>
                      <!-- Stock -->
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-bold text-zinc-900 dark:text-white">
                        {{ m.stock_quantity | number }}
                      </td>
                      <!-- Unidad -->
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-center uppercase text-zinc-500 font-semibold font-sans">
                        {{ m.unit }}
                      </td>
                      <!-- Costo Promedio -->
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-sans">
                        <button
                          type="button"
                          (click)="abrirHistorialItem(m, 'consumable')"
                          class="group inline-flex flex-col items-end text-right hover:opacity-80 transition cursor-pointer w-full"
                          title="Clic para ver el desglose del Costo Promedio Ponderado (CPP) y comparativa"
                        >
                          <div class="flex items-center justify-end gap-1 font-mono font-bold text-zinc-900 dark:text-white">
                            <span>\${{ m.unit_cost | number:'1.2-2' }}</span>
                            <lucide-icon [name]="CalculatorIcon" size="10" class="text-zinc-400 group-hover:text-emerald-500 transition"></lucide-icon>
                          </div>
                          <div *ngIf="getConsumableMeta(m).previousCost !== null" class="flex items-center gap-1 text-[10px] font-mono mt-0.5">
                            <span class="text-zinc-400">Ant: \${{ getConsumableMeta(m).previousCost | number:'1.2-2' }}</span>
                            <span 
                              *ngIf="getConsumableMeta(m).priceDiff !== null"
                              [class]="(getConsumableMeta(m).priceDiff || 0) <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'"
                              class="font-bold inline-flex items-center"
                            >
                              <lucide-icon *ngIf="(getConsumableMeta(m).priceDiff || 0) <= 0" [name]="TrendingDownIcon" size="10"></lucide-icon>
                              <lucide-icon *ngIf="(getConsumableMeta(m).priceDiff || 0) > 0" [name]="TrendingUpIcon" size="10"></lucide-icon>
                              <span>{{ (getConsumableMeta(m).priceDiff || 0) > 0 ? '+' : '' }}\${{ getConsumableMeta(m).priceDiff | number:'1.2-2' }}</span>
                            </span>
                          </div>
                        </button>
                      </td>
                      <!-- Valor Total -->
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        \${{ (m.stock_quantity * m.unit_cost) | number:'1.2-2' }}
                      </td>
                      <!-- Estado -->
                      <td class="px-3.5 py-2 text-center font-sans border-r border-zinc-200 dark:border-zinc-800">
                        <span *ngIf="m.stock_quantity <= m.min_stock_alert" class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                          Bajo Stock
                        </span>
                        <span *ngIf="m.stock_quantity > m.min_stock_alert" class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Disponible
                        </span>
                      </td>
                      <!-- Acciones -->
                      <td class="px-3.5 py-2 text-center font-sans">
                        <div class="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            (click)="abrirModalEditarConsumible(m)"
                            class="px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                            title="Editar datos y proveedor"
                          >
                            <lucide-icon [name]="PencilIcon" size="12" class="text-zinc-500"></lucide-icon>
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            (click)="abrirHistorialItem(m, 'consumable')"
                            class="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                            title="Ver historial de compras y CPP"
                          >
                            <lucide-icon [name]="HistoryIcon" size="12"></lucide-icon>
                            <span>Historial</span>
                          </button>
                          <button
                            type="button"
                            (click)="abrirModalNuevaCompra({ type: 'consumable', id: m.id })"
                            class="px-2 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                            title="Registrar nueva compra o factura"
                          >
                            <lucide-icon [name]="ShoppingCartIcon" size="12"></lucide-icon>
                            <span>Comprar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <!-- Fila de Totales Excel -->
                  <tfoot class="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700">
                    <tr>
                      <td colspan="7" class="px-3.5 py-2.5 text-right font-sans text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        TOTALES:
                      </td>
                      <td class="px-3.5 py-2.5 text-right font-mono text-zinc-900 dark:text-white border-r border-zinc-200 dark:border-zinc-700">
                        {{ getMaterialsUnitsTotal() | number:'1.0-0' }}
                      </td>
                      <td class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700"></td>
                      <td class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700"></td>
                      <td class="px-3.5 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 border-r border-zinc-200 dark:border-zinc-700">
                        \${{ getMaterialsValueTotal() | number:'1.2-2' }}
                      </td>
                      <td colspan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- HOJA 2: FERRETERÍAS Y PROVEEDORES                        -->
          <!-- ======================================================== -->
          <div *ngIf="spreadsheetSheet() === 'suppliers'" class="space-y-3">
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Proveedores Registrados</span>
                <p class="text-lg font-black text-zinc-900 dark:text-white">{{ filteredSuppliers().length }}</p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Total Facturado en Compras</span>
                <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  \${{ getSuppliersTotalFacturado() | number:'1.2-2' }}
                </p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Total Operaciones</span>
                <p class="text-lg font-black text-orange-600 dark:text-orange-400">
                  {{ getSuppliersTotalOperations() }} compras
                </p>
              </div>
            </div>

            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div class="overflow-x-auto max-h-[600px] scrollbar-thin">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Ferretería / Razón Social</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 whitespace-nowrap">RUC / Identificación</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Dirección</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 whitespace-nowrap">Teléfono / WhatsApp</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Representante</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 whitespace-nowrap">Condiciones Pago</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-center whitespace-nowrap">N° Compras</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right whitespace-nowrap">Total Facturado</th>
                      <th class="px-3.5 py-2.5 text-center whitespace-nowrap">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                    <tr 
                      *ngFor="let s of filteredSuppliers()" 
                      (click)="abrirDetalleProveedor(s)"
                      class="hover:bg-emerald-500/5 transition cursor-pointer group"
                    >
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                        <span>{{ s.name }}</span>
                        <span class="text-[10px] text-orange-500 opacity-0 group-hover:opacity-100 transition font-normal hidden sm:inline">
                          Ver detalle →
                        </span>
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-mono text-zinc-900 dark:text-white font-semibold whitespace-nowrap">
                        <span *ngIf="s.tax_id" class="text-orange-600 dark:text-orange-400 font-bold">{{ s.tax_id }}</span>
                        <span *ngIf="!s.tax_id" class="text-zinc-400 italic text-[11px]">Sin RUC</span>
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs max-w-[200px] truncate" [title]="s.address || ''">
                        {{ s.address || '—' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                        <a
                          *ngIf="s.phone"
                          [href]="'tel:' + s.phone"
                          (click)="$event.stopPropagation()"
                          class="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                        >
                          {{ s.phone }}
                        </a>
                        <span *ngIf="!s.phone" class="text-zinc-400 italic text-[11px]">—</span>
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {{ s.contact_name || '—' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 capitalize text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {{ s.payment_terms || 'Contado' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-center font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {{ getSupplierStats(s).count }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        \${{ getSupplierStats(s).total | number:'1.2-2' }}
                      </td>
                      <td class="px-3.5 py-2 text-center whitespace-nowrap" (click)="$event.stopPropagation()">
                        <div class="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            (click)="abrirDetalleProveedor(s)"
                            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-xs font-bold transition cursor-pointer"
                            title="Ver historial de facturas del proveedor"
                          >
                            <lucide-icon [name]="EyeIcon" size="12"></lucide-icon>
                            <span>Facturas</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700">
                    <tr>
                      <td colspan="6" class="px-3.5 py-2.5 text-right font-sans uppercase">TOTAL COMPRAS:</td>
                      <td class="px-3.5 py-2.5 text-center font-mono border-r border-zinc-200 dark:border-zinc-700">
                        {{ getSuppliersTotalOperations() }}
                      </td>
                      <td class="px-3.5 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 border-r border-zinc-200 dark:border-zinc-700">
                        \${{ getSuppliersTotalFacturado() | number:'1.2-2' }}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- HOJA 3: HERRAMIENTAS Y MAQUINARIA                        -->
          <!-- ======================================================== -->
          <div *ngIf="spreadsheetSheet() === 'tools'" class="space-y-3">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Herramientas</span>
                <p class="text-lg font-black text-zinc-900 dark:text-white">{{ filteredTools().length }}</p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Total Unidades</span>
                <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {{ getToolsTotalUnits() }}
                </p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">En Préstamo</span>
                <p class="text-lg font-black text-orange-500">
                  {{ getToolsLentUnits() }}
                </p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Valor Parque Herramientas</span>
                <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  \${{ getToolsTotalValue() | number:'1.2-2' }}
                </p>
              </div>
            </div>

            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div class="overflow-x-auto max-h-[600px] scrollbar-thin">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Herramienta</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Proveedor / Ferretería</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">N° Factura</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Fecha Compra</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Marca / Modelo</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Categoría</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Almacén</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Ubicación</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Total</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Disp.</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-center">Condición</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Precio Unit.</th>
                      <th class="px-3.5 py-2.5 text-right border-r border-zinc-200 dark:border-zinc-800 whitespace-nowrap">Valor Total</th>
                      <th class="px-3.5 py-2.5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                    <tr *ngFor="let t of filteredTools()" class="hover:bg-emerald-500/5 transition">
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans font-bold text-zinc-900 dark:text-white">
                        <div class="flex flex-col">
                          <span>{{ t.name }}</span>
                          <span *ngIf="t.barcode" class="text-[10px] font-mono text-zinc-400 font-normal">{{ t.barcode }}</span>
                        </div>
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            (click)="abrirModalEditarHerramienta(t)"
                            class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 transition cursor-pointer text-left group"
                            [title]="'Proveedor: ' + getToolMeta(t).supplier"
                          >
                            <lucide-icon [name]="Building2Icon" size="12" class="text-emerald-500 shrink-0"></lucide-icon>
                            <span class="truncate max-w-[130px]">{{ getToolMeta(t).supplier }}</span>
                            <lucide-icon [name]="PencilIcon" size="10" class="opacity-0 group-hover:opacity-100 text-emerald-600 transition"></lucide-icon>
                          </button>
                        </div>
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                        <span *ngIf="getToolMeta(t).invoiceNumber" class="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold">
                          {{ getToolMeta(t).invoiceNumber }}
                        </span>
                        <span *ngIf="!getToolMeta(t).invoiceNumber" class="text-zinc-400">—</span>
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {{ getToolMeta(t).purchaseDate || '—' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans text-zinc-600 dark:text-zinc-400">
                        {{ t.brand }} <span *ngIf="t.model">• {{ t.model }}</span>
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans text-zinc-600 dark:text-zinc-400">
                        {{ t.category }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans text-zinc-600 dark:text-zinc-400">
                        {{ t.warehouse_name || 'Sin almacén' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans text-zinc-600 dark:text-zinc-400">
                        {{ t.location_name || 'Sin asignar' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-bold text-zinc-900 dark:text-white">
                        {{ t.total_quantity }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {{ t.available_quantity }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-center font-sans capitalize text-zinc-600 dark:text-zinc-400">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                          {{ t.condition }}
                        </span>
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-sans">
                        <div class="flex items-center justify-end gap-1 font-mono font-bold text-zinc-900 dark:text-white">
                          <span>\${{ (t.purchase_price || 0) | number:'1.2-2' }}</span>
                        </div>
                      </td>
                      <td class="px-3.5 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400 border-r border-zinc-200 dark:border-zinc-800">
                        \${{ (t.total_quantity * (t.purchase_price || 0)) | number:'1.2-2' }}
                      </td>
                      <td class="px-3.5 py-2 text-center font-sans">
                        <div class="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            (click)="abrirModalEditarHerramienta(t)"
                            class="px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                            title="Editar datos y proveedor"
                          >
                            <lucide-icon [name]="PencilIcon" size="12" class="text-zinc-500"></lucide-icon>
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            (click)="abrirHistorialItem(t, 'tool')"
                            class="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                            title="Ver historial de compras"
                          >
                            <lucide-icon [name]="HistoryIcon" size="12"></lucide-icon>
                            <span>Historial</span>
                          </button>
                          <button
                            type="button"
                            (click)="abrirModalNuevaCompra({ type: 'tool', id: t.id })"
                            class="px-2 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                            title="Registrar nueva compra"
                          >
                            <lucide-icon [name]="ShoppingCartIcon" size="12"></lucide-icon>
                            <span>Comprar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700">
                    <tr>
                      <td colspan="8" class="px-3.5 py-2.5 text-right font-sans uppercase">TOTALES:</td>
                      <td class="px-3.5 py-2.5 text-right font-mono border-r border-zinc-200 dark:border-zinc-700">
                        {{ getToolsTotalUnits() }}
                      </td>
                      <td class="px-3.5 py-2.5 text-right font-mono border-r border-zinc-200 dark:border-zinc-700 text-emerald-600">
                        {{ service.stats().tools.available_units }}
                      </td>
                      <td colspan="2" class="border-r border-zinc-200 dark:border-zinc-700"></td>
                      <td class="px-3.5 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 border-r border-zinc-200 dark:border-zinc-700">
                        \${{ getToolsTotalValue() | number:'1.2-2' }}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- HOJA 4: FACTURAS Y COMPRAS                               -->
          <!-- ======================================================== -->
          <div *ngIf="spreadsheetSheet() === 'purchases'" class="space-y-3">
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">N° Facturas / Compras</span>
                <p class="text-lg font-black text-zinc-900 dark:text-white">{{ filteredPurchases().length }}</p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Cantidad Total</span>
                <p class="text-lg font-black text-orange-600 dark:text-orange-400">
                  {{ getPurchasesQuantityTotal() | number }} <span class="text-xs font-normal text-zinc-400">u.</span>
                </p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Subtotal Neto</span>
                <p class="text-lg font-black text-zinc-900 dark:text-white">
                  \${{ getPurchasesSubtotalTotal() | number:'1.2-2' }}
                </p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Total IVA Pagado</span>
                <p class="text-lg font-black text-orange-600 dark:text-orange-400">
                  +\${{ getPurchasesTaxTotal() | number:'1.2-2' }}
                </p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl col-span-2 sm:col-span-1">
                <span class="text-[11px] font-semibold text-zinc-500">Total General Facturado</span>
                <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  \${{ getPurchasesTotalFacturado() | number:'1.2-2' }}
                </p>
              </div>
            </div>

            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div class="overflow-x-auto max-h-[600px] scrollbar-thin">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 whitespace-nowrap">Factura / Folio</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 whitespace-nowrap">Fecha</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Ferretería / Proveedor</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Artículo Comprado</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Almacén</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Cantidad</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Costo Unit.</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Subtotal</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right whitespace-nowrap">IVA (%)</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right whitespace-nowrap">Monto IVA</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right whitespace-nowrap">Total Factura</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-center">Foto Factura</th>
                      <th class="px-3.5 py-2.5 text-center whitespace-nowrap">Estado / Acción</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                    <tr *ngFor="let p of filteredPurchases()" class="hover:bg-emerald-500/5 transition">
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                        {{ p.invoice_number || 'S/N' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {{ p.purchase_date }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans font-bold text-zinc-900 dark:text-white">
                        {{ p.supplier_name }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans font-semibold text-zinc-800 dark:text-zinc-200">
                        {{ p.item_name }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans text-zinc-600 dark:text-zinc-400">
                        {{ p.warehouse_name || 'Bodega Central' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                        {{ p.quantity | number }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right text-zinc-700 dark:text-zinc-300">
                        \${{ p.unit_cost | number:'1.2-2' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right text-zinc-700 dark:text-zinc-300">
                        \${{ p.subtotal_cost | number:'1.2-2' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right text-zinc-500">
                        {{ p.tax_rate }}%
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-medium text-orange-600 dark:text-orange-400">
                        +\${{ p.tax_amount | number:'1.2-2' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        \${{ p.total_cost | number:'1.2-2' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-center font-sans">
                        <button
                          *ngIf="p.invoice_image_url"
                          type="button"
                          (click)="abrirVisorFactura(p.invoice_image_url, 'Factura ' + (p.invoice_number || 'S/N'), p.supplier_name + ' • ' + p.purchase_date)"
                          class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-[11px] border border-orange-500/30 transition shadow-sm group cursor-pointer"
                          title="Click para ver comprobante / factura en pantalla completa"
                        >
                          <img
                            [src]="p.invoice_image_url"
                            alt="Factura"
                            class="w-5 h-5 rounded object-cover border border-orange-500/30"
                          />
                          <span>Ver Foto</span>
                          <lucide-icon [name]="EyeIcon" size="12" class="group-hover:scale-110 transition"></lucide-icon>
                        </button>
                        <span *ngIf="!p.invoice_image_url" class="text-[11px] text-zinc-400 italic">Sin foto</span>
                      </td>
                      <td class="px-3.5 py-2 text-center font-sans">
                        <span 
                          [class]="p.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'"
                          class="px-2 py-0.5 rounded text-[10px] font-bold border"
                        >
                          {{ p.payment_status === 'paid' ? 'Pagado' : 'A Crédito' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700">
                    <tr>
                      <td colspan="5" class="px-3.5 py-2.5 text-right font-sans uppercase">TOTALES:</td>
                      <td class="px-3.5 py-2.5 text-right font-mono font-black text-zinc-900 dark:text-white border-r border-zinc-200 dark:border-zinc-700">
                        {{ getPurchasesQuantityTotal() | number }}
                      </td>
                      <td class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-center font-mono text-zinc-400 text-xs">—</td>
                      <td class="px-3.5 py-2.5 text-right font-mono border-r border-zinc-200 dark:border-zinc-700">
                        \${{ getPurchasesSubtotalTotal() | number:'1.2-2' }}
                      </td>
                      <td class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-center font-mono text-zinc-400 text-xs">—</td>
                      <td class="px-3.5 py-2.5 text-right font-mono text-orange-600 dark:text-orange-400 border-r border-zinc-200 dark:border-zinc-700">
                        +\${{ getPurchasesTaxTotal() | number:'1.2-2' }}
                      </td>
                      <td class="px-3.5 py-2.5 text-right font-mono text-emerald-600 dark:text-emerald-400 border-r border-zinc-200 dark:border-zinc-700">
                        \${{ getPurchasesTotalFacturado() | number:'1.2-2' }}
                      </td>
                      <td colspan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- HOJA 5: SALIDAS Y CONSUMOS DE MATERIAL                   -->
          <!-- ======================================================== -->
          <div *ngIf="spreadsheetSheet() === 'consumptions'" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Salidas Registradas</span>
                <p class="text-lg font-black text-zinc-900 dark:text-white">{{ filteredConsumptions().length }}</p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Valor Total Descontado del Almacén</span>
                <p class="text-lg font-black text-red-500">
                  \${{ getConsumptionsTotalValue() | number:'1.2-2' }}
                </p>
              </div>
            </div>

            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div class="overflow-x-auto max-h-[600px] scrollbar-thin">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Fecha</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Material Consumido</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Cantidad</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Costo Unit.</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-right">Valor Total</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Almacén</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Responsable</th>
                      <th class="px-3.5 py-2.5">Motivo / Proyecto</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                    <tr *ngFor="let c of filteredConsumptions()" class="hover:bg-emerald-500/5 transition">
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {{ c.consumption_date }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans font-bold text-zinc-900 dark:text-white">
                        {{ c.consumable_name }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                        {{ c.quantity | number }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right text-zinc-700 dark:text-zinc-300">
                        \${{ c.unit_cost | number:'1.2-2' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-right font-bold text-red-500">
                        \${{ c.total_value | number:'1.2-2' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans text-zinc-600 dark:text-zinc-400">
                        {{ c.warehouse_name || 'Bodega Central' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-sans text-zinc-700 dark:text-zinc-300">
                        {{ c.contact_name || 'General' }}
                      </td>
                      <td class="px-3.5 py-2 font-sans text-zinc-600 dark:text-zinc-400">
                        {{ c.reason || 'Consumo operativo' }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700">
                    <tr>
                      <td colspan="4" class="px-3.5 py-2.5 text-right font-sans uppercase">TOTAL SALIDAS:</td>
                      <td class="px-3.5 py-2.5 text-right font-mono text-red-500 border-r border-zinc-200 dark:border-zinc-700">
                        \${{ getConsumptionsTotalValue() | number:'1.2-2' }}
                      </td>
                      <td colspan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- HOJA 6: PRÉSTAMOS ACTIVOS                                -->
          <!-- ======================================================== -->
          <div *ngIf="spreadsheetSheet() === 'loans'" class="space-y-3">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Préstamos Totales</span>
                <p class="text-lg font-black text-zinc-900 dark:text-white">{{ filteredLoans().length }}</p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Activos en Obra</span>
                <p class="text-lg font-black text-orange-500">
                  {{ getLoansActiveCount() }}
                </p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Vencidos</span>
                <p class="text-lg font-black text-red-500">
                  {{ getLoansOverdueCount() }}
                </p>
              </div>
              <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <span class="text-[11px] font-semibold text-zinc-500">Devueltos</span>
                <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {{ getLoansReturnedCount() }}
                </p>
              </div>
            </div>

            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
              <div class="overflow-x-auto max-h-[600px] scrollbar-thin">
                <table class="w-full text-left text-xs border-collapse">
                  <thead class="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-700">
                    <tr>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Herramienta</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Responsable</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-center">Cantidad</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Fecha Préstamo</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700">Fecha Límite</th>
                      <th class="px-3.5 py-2.5 border-r border-zinc-200 dark:border-zinc-700 text-center">Estado</th>
                      <th class="px-3.5 py-2.5">Destino / Obra</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                    <tr *ngFor="let l of filteredLoans()" class="hover:bg-emerald-500/5 transition">
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-white">
                        {{ l.tool_name }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-semibold text-zinc-800 dark:text-zinc-200">
                        {{ l.contact_name }} <span class="text-xs text-zinc-400 font-normal">({{ l.contact_role }})</span>
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-center font-mono font-bold">
                        {{ l.quantity }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-mono text-zinc-600 dark:text-zinc-400">
                        {{ l.loan_date }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 font-mono text-zinc-600 dark:text-zinc-400">
                        {{ l.due_date || '—' }}
                      </td>
                      <td class="px-3.5 py-2 border-r border-zinc-200 dark:border-zinc-800 text-center">
                        <span 
                          [class]="l.status === 'returned' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600' : (l.status === 'overdue' ? 'bg-red-500/20 text-red-600 font-extrabold' : 'bg-orange-500/20 text-orange-600 font-bold')"
                          class="px-2 py-0.5 rounded text-[10px]"
                        >
                          {{ l.status === 'returned' ? 'Devuelto' : (l.status === 'overdue' ? 'VENCIDO' : 'Activo') }}
                        </span>
                      </td>
                      <td class="px-3.5 py-2 text-zinc-600 dark:text-zinc-400">
                        {{ l.destination_location || '—' }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-zinc-100 dark:bg-zinc-800 font-bold border-t-2 border-zinc-300 dark:border-zinc-700">
                    <tr>
                      <td colspan="2" class="px-3.5 py-2.5 text-right font-sans uppercase">TOTAL PRÉSTAMOS:</td>
                      <td class="px-3.5 py-2.5 text-center font-mono border-r border-zinc-200 dark:border-zinc-700">
                        {{ filteredLoans().length }}
                      </td>
                      <td colspan="4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
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

      <!-- ======================================================== -->
      <!-- MODAL: VISOR DE FOTO / FACTURA EN PANTALLA COMPLETA      -->
      <!-- ======================================================== -->
      <div 
        *ngIf="invoicePreview()"
        (click)="invoicePreview.set(null)"
        class="fixed inset-0 z-[80] flex flex-col items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
      >
        <div 
          (click)="$event.stopPropagation()"
          class="w-full max-w-4xl flex items-center justify-between gap-4 mb-3 px-2 z-10"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-orange-400 shrink-0">
              <lucide-icon [name]="ZoomInIcon" size="16"></lucide-icon>
            </div>
            <div class="min-w-0">
              <h3 *ngIf="invoicePreview()?.title" class="text-sm sm:text-base font-bold text-white truncate leading-tight">
                {{ invoicePreview()?.title }}
              </h3>
              <p *ngIf="invoicePreview()?.subtitle" class="text-xs text-zinc-400 truncate mt-0.5">
                {{ invoicePreview()?.subtitle }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <a
              [href]="invoicePreview()?.url"
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir imagen original"
              class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition"
            >
              <lucide-icon [name]="ExternalLinkIcon" size="16"></lucide-icon>
            </a>
            <button
              type="button"
              (click)="invoicePreview.set(null)"
              title="Cerrar visor"
              class="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <lucide-icon [name]="XIcon" size="20"></lucide-icon>
            </button>
          </div>
        </div>

        <div 
          (click)="$event.stopPropagation()"
          class="relative max-w-4xl max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-black/40"
        >
          <img
            [src]="invoicePreview()?.url"
            [alt]="invoicePreview()?.title || 'Foto de Factura'"
            class="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-xl select-none"
          />
        </div>

        <p class="text-[11px] text-zinc-400 mt-3 text-center select-none">
          Haz clic fuera de la foto o en la cruz para cerrar el visor
        </p>
      </div>

      <!-- ======================================================== -->
      <!-- MODAL: HISTORIAL DE PROVEEDORES Y COSTO PROMEDIO (CPP)   -->
      <!-- ======================================================== -->
      <div 
        *ngIf="historyModalItem()"
        class="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
        (click)="historyModalItem.set(null)"
      >
        <div 
          class="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <lucide-icon [name]="HistoryIcon" size="20"></lucide-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                    Historial de Proveedores y Precios
                  </h2>
                  <span *ngIf="historyModalItem()?.item?.barcode" class="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[11px] font-semibold border border-zinc-200 dark:border-zinc-700">
                    Cód: {{ historyModalItem()?.item?.barcode }}
                  </span>
                </div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
                  <span class="font-semibold text-zinc-800 dark:text-zinc-200">{{ historyModalItem()?.item?.name }}</span>
                  <span>•</span>
                  <span><b>{{ getItemHistory(historyModalItem()!.item, historyModalItem()!.type).suppliersCount }}</b> proveedores registrados</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="historyModalItem.set(null)"
              class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <lucide-icon [name]="XIcon" size="20"></lucide-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="p-4 sm:p-6 overflow-y-auto space-y-4">
            <!-- Comparativa CPP -->
            <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent border border-orange-500/20">
              <div class="flex items-center justify-between mb-3.5">
                <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  <lucide-icon [name]="CalculatorIcon" size="14"></lucide-icon>
                  <span>Cálculo y Comparativa de Costo Promedio (CPP)</span>
                </div>
                <span class="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium">
                  Ponderado en Bodega
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <!-- Proveedor Actual -->
                <div class="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-zinc-800">
                  <div class="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                    <span>Último Proveedor</span>
                    <span class="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      Actual
                    </span>
                  </div>
                  <div class="font-bold text-sm text-zinc-900 dark:text-white truncate">
                    {{ getItemHistory(historyModalItem()!.item, historyModalItem()!.type).currentSupplier }}
                  </div>
                  <div class="mt-1 flex items-baseline gap-1">
                    <span class="text-base font-extrabold text-zinc-900 dark:text-white">
                      \${{ getItemHistory(historyModalItem()!.item, historyModalItem()!.type).currentCost | number:'1.2-2' }}
                    </span>
                    <span class="text-xs text-zinc-400 font-normal">/ {{ getItemHistory(historyModalItem()!.item, historyModalItem()!.type).unit }}</span>
                  </div>
                </div>

                <!-- Proveedor Anterior -->
                <div class="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-zinc-800">
                  <div class="text-[11px] text-zinc-500 mb-1">Proveedor Anterior</div>
                  <div class="font-bold text-sm text-zinc-900 dark:text-white truncate">
                    {{ getItemHistory(historyModalItem()!.item, historyModalItem()!.type).previousSupplier || 'Sin registrar' }}
                  </div>
                  <div class="mt-1 flex items-baseline gap-2">
                    <span *ngIf="getItemHistory(historyModalItem()!.item, historyModalItem()!.type).previousCost !== null" class="text-base font-extrabold text-zinc-900 dark:text-white">
                      \${{ getItemHistory(historyModalItem()!.item, historyModalItem()!.type).previousCost | number:'1.2-2' }}
                    </span>
                    <span *ngIf="getItemHistory(historyModalItem()!.item, historyModalItem()!.type).previousCost === null" class="text-xs text-zinc-400 italic">
                      —
                    </span>
                    <!-- Diferencia de Precio -->
                    <span 
                      *ngIf="getItemHistory(historyModalItem()!.item, historyModalItem()!.type).priceDiff !== null"
                      [class]="(getItemHistory(historyModalItem()!.item, historyModalItem()!.type).priceDiff || 0) <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'"
                      class="text-xs font-bold inline-flex items-center gap-0.5"
                    >
                      <lucide-icon *ngIf="(getItemHistory(historyModalItem()!.item, historyModalItem()!.type).priceDiff || 0) <= 0" [name]="TrendingDownIcon" size="12"></lucide-icon>
                      <lucide-icon *ngIf="(getItemHistory(historyModalItem()!.item, historyModalItem()!.type).priceDiff || 0) > 0" [name]="TrendingUpIcon" size="12"></lucide-icon>
                      <span>{{ (getItemHistory(historyModalItem()!.item, historyModalItem()!.type).priceDiff || 0) > 0 ? '+' : '' }}\${{ getItemHistory(historyModalItem()!.item, historyModalItem()!.type).priceDiff | number:'1.2-2' }}</span>
                    </span>
                  </div>
                </div>

                <!-- Costo Promedio Ponderado -->
                <div class="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-zinc-800">
                  <div class="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                    <span>Promedio Ponderado (CPP)</span>
                    <lucide-icon [name]="CalculatorIcon" size="12" class="text-orange-500"></lucide-icon>
                  </div>
                  <div class="font-bold text-sm text-zinc-900 dark:text-white">
                    Historial Compras
                  </div>
                  <div class="mt-1 flex items-baseline gap-1">
                    <span class="text-base font-extrabold text-orange-600 dark:text-orange-400">
                      \${{ getItemHistory(historyModalItem()!.item, historyModalItem()!.type).avgCost | number:'1.2-2' }}
                    </span>
                    <span class="text-xs text-zinc-400 font-normal">/ {{ getItemHistory(historyModalItem()!.item, historyModalItem()!.type).unit }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabla de Compras Anteriores -->
            <div>
              <h4 class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Registro de Facturas & Entradas
              </h4>
              <div class="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th class="py-2 px-3">Factura</th>
                      <th class="py-2 px-3">Fecha</th>
                      <th class="py-2 px-3">Proveedor</th>
                      <th class="py-2 px-3 text-right">Cantidad</th>
                      <th class="py-2 px-3 text-right">Costo Unit.</th>
                      <th class="py-2 px-3 text-right">Total</th>
                      <th class="py-2 px-3 text-center">Foto</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs">
                    <tr *ngFor="let rec of getItemHistory(historyModalItem()!.item, historyModalItem()!.type).records" class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td class="py-2 px-3 font-bold text-orange-600">{{ rec.invoice_number || 'S/N' }}</td>
                      <td class="py-2 px-3 text-zinc-500">{{ rec.purchase_date }}</td>
                      <td class="py-2 px-3 font-sans font-semibold text-zinc-900 dark:text-white">{{ rec.supplier_name }}</td>
                      <td class="py-2 px-3 text-right font-bold">{{ rec.quantity }}</td>
                      <td class="py-2 px-3 text-right">\${{ rec.unit_cost | number:'1.2-2' }}</td>
                      <td class="py-2 px-3 text-right font-bold text-emerald-600">\${{ rec.total_cost | number:'1.2-2' }}</td>
                      <td class="py-2 px-3 text-center font-sans">
                        <button
                          *ngIf="rec.invoice_image_url"
                          type="button"
                          (click)="abrirVisorFactura(rec.invoice_image_url, 'Factura ' + rec.invoice_number, rec.supplier_name + ' • ' + rec.purchase_date)"
                          class="p-1 rounded bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 text-[10px] font-bold cursor-pointer"
                        >
                          Ver Foto
                        </button>
                        <span *ngIf="!rec.invoice_image_url" class="text-zinc-400 text-[10px]">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer Modal -->
          <div class="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
            <button
              type="button"
              (click)="abrirModalNuevaCompra({ type: historyModalItem()!.type, id: historyModalItem()!.item.id }); historyModalItem.set(null)"
              class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              + Registrar Nueva Compra
            </button>
            <button
              type="button"
              (click)="historyModalItem.set(null)"
              class="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- MODAL: FACTURAS Y COMPRAS DEL PROVEEDOR                  -->
      <!-- ======================================================== -->
      <div 
        *ngIf="selectedSupplierForPurchases()"
        class="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
        (click)="selectedSupplierForPurchases.set(null)"
      >
        <div 
          class="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <lucide-icon [name]="Building2Icon" size="20"></lucide-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                    {{ selectedSupplierForPurchases()?.name }}
                  </h2>
                  <span *ngIf="selectedSupplierForPurchases()?.tax_id" class="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 font-mono text-[11px] font-bold border border-orange-500/20">
                    RUC: {{ selectedSupplierForPurchases()?.tax_id }}
                  </span>
                </div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {{ selectedSupplierForPurchases()?.phone || 'Sin teléfono' }} • {{ selectedSupplierForPurchases()?.address || 'Manabí, Ecuador' }}
                </p>
              </div>
            </div>
            <button
              type="button"
              (click)="selectedSupplierForPurchases.set(null)"
              class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <lucide-icon [name]="XIcon" size="20"></lucide-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="p-4 sm:p-6 overflow-y-auto space-y-4">
            <!-- Mini KPIs -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <span class="text-[11px] text-zinc-500 font-semibold">Total Compras</span>
                <p class="text-lg font-black text-zinc-900 dark:text-white">{{ getSupplierPurchases(selectedSupplierForPurchases()!).length }} facturas</p>
              </div>
              <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <span class="text-[11px] text-zinc-500 font-semibold">Total Facturado</span>
                <p class="text-lg font-black text-emerald-600">\${{ getSupplierStats(selectedSupplierForPurchases()!).total | number:'1.2-2' }}</p>
              </div>
              <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 col-span-2 sm:col-span-1">
                <span class="text-[11px] text-zinc-500 font-semibold">Condición</span>
                <p class="text-lg font-black text-orange-600 uppercase">{{ selectedSupplierForPurchases()?.payment_terms || 'Contado' }}</p>
              </div>
            </div>

            <!-- Tabla de Compras -->
            <div>
              <h4 class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Facturas emitidas por esta Ferretería / Proveedor
              </h4>
              <div class="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th class="py-2 px-3">Factura</th>
                      <th class="py-2 px-3">Fecha</th>
                      <th class="py-2 px-3">Artículo / Ítem</th>
                      <th class="py-2 px-3 text-right">Cant.</th>
                      <th class="py-2 px-3 text-right">Costo Unit.</th>
                      <th class="py-2 px-3 text-right">Total</th>
                      <th class="py-2 px-3 text-center">Foto Factura</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs">
                    <tr *ngFor="let p of getSupplierPurchases(selectedSupplierForPurchases()!)" class="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td class="py-2 px-3 font-bold text-orange-600">{{ p.invoice_number || 'S/N' }}</td>
                      <td class="py-2 px-3 text-zinc-500">{{ p.purchase_date }}</td>
                      <td class="py-2 px-3 font-sans font-semibold text-zinc-900 dark:text-white">{{ p.item_name }}</td>
                      <td class="py-2 px-3 text-right font-bold">{{ p.quantity }}</td>
                      <td class="py-2 px-3 text-right">\${{ p.unit_cost | number:'1.2-2' }}</td>
                      <td class="py-2 px-3 text-right font-bold text-emerald-600">\${{ p.total_cost | number:'1.2-2' }}</td>
                      <td class="py-2 px-3 text-center font-sans">
                        <button
                          *ngIf="p.invoice_image_url"
                          type="button"
                          (click)="abrirVisorFactura(p.invoice_image_url, 'Factura ' + p.invoice_number, selectedSupplierForPurchases()!.name + ' • ' + p.purchase_date)"
                          class="p-1 rounded bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 text-[10px] font-bold cursor-pointer"
                        >
                          Ver Foto
                        </button>
                        <span *ngIf="!p.invoice_image_url" class="text-zinc-400 text-[10px]">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
            <button
              type="button"
              (click)="compraForm.supplier_id = selectedSupplierForPurchases()!.id; abrirModalNuevaCompra(); selectedSupplierForPurchases.set(null)"
              class="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              + Nueva Compra con este Proveedor
            </button>
            <button
              type="button"
              (click)="selectedSupplierForPurchases.set(null)"
              class="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
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
  spreadsheetSheet = signal<'materials' | 'suppliers' | 'tools' | 'purchases' | 'consumptions' | 'loans'>('materials');
  spreadsheetSearchTerm = signal<string>('');
  spreadsheetWarehouse = signal<string>('all');

  // Modales adicionales para Spreadsheet
  invoicePreview = signal<{ url: string; title: string; subtitle?: string } | null>(null);
  historyModalItem = signal<{ item: Consumable | Tool; type: 'consumable' | 'tool' } | null>(null);
  selectedSupplierForPurchases = signal<Supplier | null>(null);

  get spreadsheetSheetsList() {
    return [
      { id: 'materials' as const, label: 'Materiales y Consumibles', icon: this.PackageIcon, count: this.service.consumables().length },
      { id: 'suppliers' as const, label: 'Ferreterías y Proveedores', icon: this.Building2Icon, count: this.service.suppliers().length },
      { id: 'tools' as const, label: 'Herramientas y Maquinaria', icon: this.WrenchIcon, count: this.service.tools().length },
      { id: 'purchases' as const, label: 'Facturas y Compras', icon: this.ShoppingCartIcon, count: this.service.purchases().length },
      { id: 'consumptions' as const, label: 'Salidas y Consumos', icon: this.PackageOpenIcon, count: this.service.consumptions().length },
      { id: 'loans' as const, label: 'Préstamos Activos', icon: this.ArrowLeftRightIcon, count: this.service.loans().length },
    ];
  }

  setSpreadsheetSheet(sheet: 'materials' | 'suppliers' | 'tools' | 'purchases' | 'consumptions' | 'loans') {
    this.spreadsheetSheet.set(sheet);
    this.spreadsheetSearchTerm.set('');
  }

  getSpreadsheetSearchPlaceholder(): string {
    const s = this.spreadsheetSheet();
    if (s === 'materials') return 'Buscar en materiales, tornillos, remaches, categorías...';
    if (s === 'suppliers') return 'Buscar en ferreterías, proveedores, RUC, teléfono...';
    if (s === 'tools') return 'Buscar en herramientas, marcas, modelos...';
    if (s === 'purchases') return 'Buscar en facturas, proveedor, artículo...';
    if (s === 'consumptions') return 'Buscar en salidas, materiales, responsables, obras...';
    return 'Buscar en préstamos, herramientas, responsables...';
  }

  // Filtered computed getters
  filteredMaterials = computed(() => {
    const term = this.spreadsheetSearchTerm().toLowerCase().trim();
    const wh = this.spreadsheetWarehouse();
    return this.service.consumables().filter(c => {
      const matchSearch = !term ||
        c.name.toLowerCase().includes(term) ||
        (c.barcode && c.barcode.toLowerCase().includes(term)) ||
        c.category.toLowerCase().includes(term) ||
        (c.supplier && c.supplier.toLowerCase().includes(term)) ||
        (c.warehouse_name && c.warehouse_name.toLowerCase().includes(term));
      const matchWh = wh === 'all' || (c.warehouse_id && c.warehouse_id.toString() === wh);
      return matchSearch && matchWh;
    });
  });

  filteredSuppliers = computed(() => {
    const term = this.spreadsheetSearchTerm().toLowerCase().trim();
    return this.service.suppliers().filter(s => {
      return !term ||
        s.name.toLowerCase().includes(term) ||
        (s.tax_id && s.tax_id.toLowerCase().includes(term)) ||
        (s.phone && s.phone.toLowerCase().includes(term)) ||
        (s.address && s.address.toLowerCase().includes(term)) ||
        (s.contact_name && s.contact_name.toLowerCase().includes(term));
    });
  });

  filteredTools = computed(() => {
    const term = this.spreadsheetSearchTerm().toLowerCase().trim();
    const wh = this.spreadsheetWarehouse();
    return this.service.tools().filter(t => {
      const matchSearch = !term ||
        t.name.toLowerCase().includes(term) ||
        (t.barcode && t.barcode.toLowerCase().includes(term)) ||
        (t.brand && t.brand.toLowerCase().includes(term)) ||
        (t.model && t.model.toLowerCase().includes(term)) ||
        t.category.toLowerCase().includes(term) ||
        (t.supplier_name && t.supplier_name.toLowerCase().includes(term)) ||
        (t.warehouse_name && t.warehouse_name.toLowerCase().includes(term));
      const matchWh = wh === 'all' || (t.warehouse_id && t.warehouse_id.toString() === wh);
      return matchSearch && matchWh;
    });
  });

  filteredPurchases = computed(() => {
    const term = this.spreadsheetSearchTerm().toLowerCase().trim();
    const wh = this.spreadsheetWarehouse();
    return this.service.purchases().filter(p => {
      const matchSearch = !term ||
        (p.invoice_number && p.invoice_number.toLowerCase().includes(term)) ||
        p.item_name.toLowerCase().includes(term) ||
        (p.supplier_name && p.supplier_name.toLowerCase().includes(term)) ||
        (p.warehouse_name && p.warehouse_name.toLowerCase().includes(term));
      const matchWh = wh === 'all' || (p.warehouse_id && p.warehouse_id.toString() === wh);
      return matchSearch && matchWh;
    });
  });

  filteredConsumptions = computed(() => {
    const term = this.spreadsheetSearchTerm().toLowerCase().trim();
    const wh = this.spreadsheetWarehouse();
    return this.service.consumptions().filter(c => {
      const matchSearch = !term ||
        c.consumable_name.toLowerCase().includes(term) ||
        (c.contact_name && c.contact_name.toLowerCase().includes(term)) ||
        (c.reason && c.reason.toLowerCase().includes(term)) ||
        (c.warehouse_name && c.warehouse_name.toLowerCase().includes(term));
      const matchWh = wh === 'all' || (c.warehouse_id && c.warehouse_id.toString() === wh);
      return matchSearch && matchWh;
    });
  });

  filteredLoans = computed(() => {
    const term = this.spreadsheetSearchTerm().toLowerCase().trim();
    return this.service.loans().filter(l => {
      return !term ||
        l.tool_name.toLowerCase().includes(term) ||
        (l.contact_name && l.contact_name.toLowerCase().includes(term)) ||
        (l.destination_location && l.destination_location.toLowerCase().includes(term)) ||
        l.status.toLowerCase().includes(term);
    });
  });

  getConsumableMeta(c: Consumable) {
    const allPurchases = this.service.purchases().filter(p => 
      (p.consumable_id && Number(p.consumable_id) === Number(c.id)) ||
      p.item_name.toLowerCase().trim() === c.name.toLowerCase().trim()
    );
    const sorted = [...allPurchases].sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
    const latest = sorted[0];
    const previous = sorted.length > 1 ? sorted[1] : null;

    const supplier = latest?.supplier_name || c.supplier || 'Proveedor General';
    const invoiceNumber = latest?.invoice_number || c.invoice_number || '';
    const purchaseDate = latest?.purchase_date || (c.created_at ? c.created_at.split('T')[0] : '');

    const currentCost = latest?.unit_cost ?? c.unit_cost;
    const previousCost = previous ? previous.unit_cost : null;
    const previousSupplier = previous ? previous.supplier_name : null;
    const priceDiff = previousCost !== null ? Number((currentCost - previousCost).toFixed(2)) : null;

    const uniqueSuppliers = new Set(sorted.map(p => p.supplier_name).filter(Boolean));
    if (supplier) uniqueSuppliers.add(supplier);
    const suppliersCount = uniqueSuppliers.size > 0 ? uniqueSuppliers.size : 1;

    return {
      supplier,
      invoiceNumber,
      purchaseDate,
      currentCost,
      previousCost,
      previousSupplier,
      priceDiff,
      suppliersCount
    };
  }

  getToolMeta(t: Tool) {
    const allPurchases = this.service.purchases().filter(p => 
      (p.tool_id && Number(p.tool_id) === Number(t.id)) ||
      p.item_name.toLowerCase().trim() === t.name.toLowerCase().trim()
    );
    const sorted = [...allPurchases].sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
    const latest = sorted[0];
    const previous = sorted.length > 1 ? sorted[1] : null;

    const supplier = latest?.supplier_name || t.supplier_name || 'Proveedor General';
    const invoiceNumber = latest?.invoice_number || t.invoice_number || '';
    const purchaseDate = latest?.purchase_date || t.purchase_date || (t.created_at ? t.created_at.split('T')[0] : '');

    const currentCost = latest?.unit_cost ?? (t.purchase_price || 0);
    const previousCost = previous ? previous.unit_cost : null;
    const previousSupplier = previous ? previous.supplier_name : null;
    const priceDiff = previousCost !== null ? Number((currentCost - previousCost).toFixed(2)) : null;

    const uniqueSuppliers = new Set(sorted.map(p => p.supplier_name).filter(Boolean));
    if (supplier) uniqueSuppliers.add(supplier);
    const suppliersCount = uniqueSuppliers.size > 0 ? uniqueSuppliers.size : 1;

    return {
      supplier,
      invoiceNumber,
      purchaseDate,
      currentCost,
      previousCost,
      previousSupplier,
      priceDiff,
      suppliersCount
    };
  }

  getSupplierStats(s: Supplier) {
    const purchases = this.service.purchases().filter(p => 
      (p.supplier_id && Number(p.supplier_id) === Number(s.id)) ||
      (p.supplier_name && p.supplier_name.toLowerCase().trim() === s.name.toLowerCase().trim())
    );
    const count = purchases.length > 0 ? purchases.length : (s.purchases_count || 0);
    const total = purchases.reduce((acc, p) => acc + (p.total_cost || 0), 0) || (s.total_purchased || 0);
    return { count, total };
  }

  getItemHistory(item: Consumable | Tool, type: 'consumable' | 'tool') {
    const isConsumable = type === 'consumable';
    const purchases = this.service.purchases().filter(p => 
      isConsumable 
        ? ((p.consumable_id && Number(p.consumable_id) === Number(item.id)) || p.item_name.toLowerCase().trim() === item.name.toLowerCase().trim())
        : ((p.tool_id && Number(p.tool_id) === Number(item.id)) || p.item_name.toLowerCase().trim() === item.name.toLowerCase().trim())
    );
    const sorted = [...purchases].sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
    const latest = sorted[0];
    const previous = sorted.length > 1 ? sorted[1] : null;

    const currentCost = latest ? latest.unit_cost : (isConsumable ? (item as Consumable).unit_cost : (item as Tool).purchase_price || 0);
    const previousCost = previous ? previous.unit_cost : null;
    const priceDiff = previousCost !== null ? Number((currentCost - previousCost).toFixed(2)) : null;
    const currentSupplier = latest?.supplier_name || (isConsumable ? (item as Consumable).supplier : (item as Tool).supplier_name) || 'Proveedor General';
    const previousSupplier = previous ? previous.supplier_name : null;

    const totalSpent = sorted.reduce((acc, p) => acc + (p.total_cost || 0), 0);
    const totalQty = sorted.reduce((acc, p) => acc + (p.quantity || 0), 0);
    const avgCost = totalQty > 0 ? Number((totalSpent / totalQty).toFixed(2)) : currentCost;

    const uniqueSuppliers = Array.from(new Set(sorted.map(p => p.supplier_name).filter(Boolean)));
    if (uniqueSuppliers.length === 0 && currentSupplier) uniqueSuppliers.push(currentSupplier);

    return {
      itemId: item.id,
      itemName: item.name,
      itemType: type,
      unit: isConsumable ? (item as Consumable).unit : 'pz',
      barcode: (item as any).barcode || '',
      currentSupplier,
      currentCost,
      previousSupplier,
      previousCost,
      priceDiff,
      avgCost,
      suppliersCount: uniqueSuppliers.length,
      records: sorted
    };
  }

  getSupplierPurchases(supplier: Supplier) {
    return this.service.purchases().filter(p => 
      (p.supplier_id && Number(p.supplier_id) === Number(supplier.id)) ||
      (p.supplier_name && p.supplier_name.toLowerCase().trim() === supplier.name.toLowerCase().trim())
    );
  }

  getMaterialsUnitsTotal(): number {
    return this.filteredMaterials().reduce((acc, m) => acc + (Number(m.stock_quantity) || 0), 0);
  }

  getMaterialsValueTotal(): number {
    return this.filteredMaterials().reduce((acc, m) => acc + (Number(m.stock_quantity) || 0) * (Number(m.unit_cost) || 0), 0);
  }

  getMaterialsLowStockCount(): number {
    return this.filteredMaterials().filter(m => (Number(m.stock_quantity) || 0) <= (Number(m.min_stock_alert) || 0)).length;
  }

  getSuppliersTotalFacturado(): number {
    return this.filteredSuppliers().reduce((acc, s) => acc + this.getSupplierStats(s).total, 0);
  }

  getSuppliersTotalOperations(): number {
    return this.filteredSuppliers().reduce((acc, s) => acc + this.getSupplierStats(s).count, 0);
  }

  getToolsTotalUnits(): number {
    return this.filteredTools().reduce((acc, t) => acc + (Number(t.total_quantity) || 0), 0);
  }

  getToolsLentUnits(): number {
    return this.filteredTools().reduce((acc, t) => acc + ((Number(t.total_quantity) || 0) - (Number(t.available_quantity) || 0)), 0);
  }

  getToolsTotalValue(): number {
    return this.filteredTools().reduce((acc, t) => acc + (Number(t.total_quantity) || 0) * (Number(t.purchase_price) || 0), 0);
  }

  getPurchasesQuantityTotal(): number {
    return this.filteredPurchases().reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
  }

  getPurchasesSubtotalTotal(): number {
    return this.filteredPurchases().reduce((acc, p) => acc + (Number(p.subtotal_cost) || 0), 0);
  }

  getPurchasesTaxTotal(): number {
    return this.filteredPurchases().reduce((acc, p) => acc + (Number(p.tax_amount) || 0), 0);
  }

  getPurchasesTotalFacturado(): number {
    return this.filteredPurchases().reduce((acc, p) => acc + (Number(p.total_cost) || 0), 0);
  }

  getConsumptionsTotalValue(): number {
    return this.filteredConsumptions().reduce((acc, c) => acc + (Number(c.total_value) || 0), 0);
  }

  getLoansActiveCount(): number {
    return this.filteredLoans().filter(l => l.status === 'active').length;
  }

  getLoansOverdueCount(): number {
    return this.filteredLoans().filter(l => l.status === 'overdue').length;
  }

  getLoansReturnedCount(): number {
    return this.filteredLoans().filter(l => l.status === 'returned').length;
  }

  abrirModalNuevaCompra(item?: { type: 'tool' | 'consumable'; id?: number }) {
    if (item && item.type === 'consumable' && item.id) {
      const c = this.service.consumables().find(m => m.id === item.id);
      if (c) {
        this.compraForm.item_name = c.name;
        this.compraForm.unit_cost = c.unit_cost;
      }
    } else if (item && item.type === 'tool' && item.id) {
      const t = this.service.tools().find(m => m.id === item.id);
      if (t) {
        this.compraForm.item_name = t.name;
        this.compraForm.unit_cost = t.purchase_price || 150;
      }
    }
    this.mostrarModalCompra.set(true);
  }

  abrirVisorFactura(url: string, title: string, subtitle?: string) {
    this.invoicePreview.set({ url, title, subtitle });
  }

  abrirHistorialItem(item: Consumable | Tool, type: 'consumable' | 'tool') {
    this.historyModalItem.set({ item, type });
  }

  abrirDetalleProveedor(supplier: Supplier) {
    this.selectedSupplierForPurchases.set(supplier);
  }

  getWhatsAppUrl(phone?: string): string {
    if (!phone) return '#';
    const clean = phone.replace(/^0/, '').replace(/\s+/g, '');
    return `https://wa.me/593${clean}`;
  }

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
  readonly Building2Icon = Building2;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly PackageOpenIcon = PackageOpen;
  readonly PencilIcon = Pencil;
  readonly HistoryIcon = History;
  readonly TrendingUpIcon = TrendingUp;
  readonly TrendingDownIcon = TrendingDown;
  readonly CalculatorIcon = Calculator;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly BuildingIcon = Building;
  readonly ExternalLinkIcon = ExternalLink;
  readonly ZoomInIcon = ZoomIn;
  readonly ReceiptIcon = Receipt;
  readonly FilterIcon = Filter;

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

  inventarioFilteredTools() {
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

  prestamosFilteredLoans() {
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

  exportCurrentSheetCsv() {
    const sheet = this.spreadsheetSheet();
    let csv = '';
    const dateStr = new Date().toISOString().split('T')[0];
    let filename = `ferrecompara_${sheet}_${dateStr}.csv`;

    const escapeCell = (val: any) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    if (sheet === 'materials') {
      const headers = ['Material / Insumo', 'Código / Barras', 'Proveedor', 'N° Factura', 'Fecha Compra', 'Categoría', 'Almacén', 'Ubicación', 'Stock', 'Unidad', 'Costo Unit.', 'Valor Total', 'Estado'];
      csv = headers.map(escapeCell).join(',') + '\r\n';
      this.filteredMaterials().forEach(m => {
        const meta = this.getConsumableMeta(m);
        const row = [
          m.name,
          m.barcode || '',
          meta.supplier,
          meta.invoiceNumber,
          meta.purchaseDate,
          m.category,
          m.warehouse_name || '',
          m.location_name || '',
          m.stock_quantity,
          m.unit,
          m.unit_cost.toFixed(2),
          (m.stock_quantity * m.unit_cost).toFixed(2),
          m.stock_quantity <= m.min_stock_alert ? 'Bajo Stock' : 'Disponible'
        ];
        csv += row.map(escapeCell).join(',') + '\r\n';
      });
    } else if (sheet === 'suppliers') {
      const headers = ['Ferretería / Proveedor', 'RUC / Identificación', 'Dirección', 'Teléfono', 'Representante', 'Condiciones Pago', 'N° Compras', 'Total Facturado'];
      csv = headers.map(escapeCell).join(',') + '\r\n';
      this.filteredSuppliers().forEach(s => {
        const stats = this.getSupplierStats(s);
        const row = [
          s.name,
          s.tax_id || '',
          s.address || '',
          s.phone || '',
          s.contact_name || '',
          s.payment_terms || 'Contado',
          stats.count,
          stats.total.toFixed(2)
        ];
        csv += row.map(escapeCell).join(',') + '\r\n';
      });
    } else if (sheet === 'tools') {
      const headers = ['Herramienta', 'Código', 'Proveedor', 'N° Factura', 'Fecha Compra', 'Marca', 'Modelo', 'Categoría', 'Almacén', 'Ubicación', 'Total', 'Disponibles', 'Condición', 'Precio Unit.', 'Valor Total'];
      csv = headers.map(escapeCell).join(',') + '\r\n';
      this.filteredTools().forEach(t => {
        const meta = this.getToolMeta(t);
        const row = [
          t.name,
          t.barcode || '',
          meta.supplier,
          meta.invoiceNumber,
          meta.purchaseDate,
          t.brand || '',
          t.model || '',
          t.category,
          t.warehouse_name || '',
          t.location_name || '',
          t.total_quantity,
          t.available_quantity,
          t.condition,
          (t.purchase_price || 0).toFixed(2),
          (t.total_quantity * (t.purchase_price || 0)).toFixed(2)
        ];
        csv += row.map(escapeCell).join(',') + '\r\n';
      });
    } else if (sheet === 'purchases') {
      const headers = ['N° Factura', 'Fecha', 'Proveedor', 'Artículo', 'Almacén', 'Cantidad', 'Costo Unit.', 'Subtotal', 'IVA (%)', 'Monto IVA', 'Total Factura', 'Estado Pago'];
      csv = headers.map(escapeCell).join(',') + '\r\n';
      this.filteredPurchases().forEach(p => {
        const row = [
          p.invoice_number || 'S/N',
          p.purchase_date,
          p.supplier_name || '',
          p.item_name,
          p.warehouse_name || '',
          p.quantity,
          p.unit_cost.toFixed(2),
          p.subtotal_cost.toFixed(2),
          p.tax_rate,
          p.tax_amount.toFixed(2),
          p.total_cost.toFixed(2),
          p.payment_status === 'paid' ? 'Pagado' : 'A Crédito'
        ];
        csv += row.map(escapeCell).join(',') + '\r\n';
      });
    } else if (sheet === 'consumptions') {
      const headers = ['Fecha', 'Material', 'Cantidad', 'Costo Unit.', 'Valor Total', 'Almacén', 'Responsable', 'Motivo / Proyecto'];
      csv = headers.map(escapeCell).join(',') + '\r\n';
      this.filteredConsumptions().forEach(c => {
        const row = [
          c.consumption_date,
          c.consumable_name,
          c.quantity,
          c.unit_cost.toFixed(2),
          c.total_value.toFixed(2),
          c.warehouse_name || '',
          c.contact_name || '',
          c.reason || ''
        ];
        csv += row.map(escapeCell).join(',') + '\r\n';
      });
    } else {
      const headers = ['Herramienta', 'Responsable', 'Cantidad', 'Fecha Préstamo', 'Fecha Límite', 'Estado', 'Destino'];
      csv = headers.map(escapeCell).join(',') + '\r\n';
      this.filteredLoans().forEach(l => {
        const row = [
          l.tool_name,
          l.contact_name,
          l.quantity,
          l.loan_date,
          l.due_date || '',
          l.status,
          l.destination_location || ''
        ];
        csv += row.map(escapeCell).join(',') + '\r\n';
      });
    }

    const csvContent = '\uFEFF' + csv;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  descargarCsvActual() {
    this.exportCurrentSheetCsv();
  }
}
