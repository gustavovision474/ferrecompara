import { Component, signal, computed, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  LucideAngularModule, Search, ScanBarcode, User, Plus, Minus,
  Trash2, ArrowLeft, ShoppingCart, FileText, PauseCircle,
  Truck, Keyboard, RotateCcw, CreditCard, Receipt, Check
} from 'lucide-angular';
import { SupabaseService } from '../supabase.service';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';

interface PosItem {
  id: string;
  nombre: string;
  sku: string;
  precioBase: number;
  cantidad: number;
  descuentoPct: number;
  esMayorista: boolean;
}

interface PosCliente {
  rucCedula: string;
  esCredito: boolean;
  esMayorista: boolean;
}

@Component({
  selector: 'app-pos-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">

      <!-- HEADER -->
      <header class="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <button (click)="volver.emit()" class="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
          <lucide-icon [name]="ArrowLeftIcon" size="20"></lucide-icon>
        </button>
        <div>
          <h1 class="text-sm font-black text-gray-900 leading-none">Punto de Venta</h1>
          <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">POS Express</p>
        </div>
        <div class="ml-auto">
          <span class="text-[10px] font-black text-[#E8541C] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
            {{ items().length }} item(s)
          </span>
        </div>
      </header>

      <!-- BUSCADOR -->
      <div class="px-4 pt-4 pb-2 relative z-10">
        <div class="flex gap-2">
          <div class="relative flex-1">
            <lucide-icon [name]="SearchIcon" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></lucide-icon>
            <input
              type="text"
              [(ngModel)]="busqueda"
              (input)="buscarProducto()"
              placeholder="Buscar por nombre, SKU o escanear codigo..."
              class="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-xs font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all shadow-sm"
            />
          </div>
          <button class="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-gray-800 transition-colors shadow-sm">
            <lucide-icon [name]="ScanIcon" size="20"></lucide-icon>
          </button>
        </div>

        <!-- Resultados de busqueda -->
        <div *ngIf="resultadosBusqueda().length > 0 && busqueda.length > 0"
             class="mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <button
            *ngFor="let prod of resultadosBusqueda()"
            (click)="agregarAlCarrito(prod)"
            class="w-full flex items-center justify-between px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
          >
            <div class="text-left">
              <p class="text-xs font-black text-gray-900">{{ prod.name }}</p>
              <p class="text-[10px] text-gray-400 font-bold">SKU: {{ prod.id | slice:0:8 }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-black text-[#E8541C]">{{ fmt(prod.minPrice) }}</p>
              <p class="text-[9px] text-gray-400">+ agregar</p>
            </div>
          </button>
        </div>
      </div>

      <!-- PANEL CLIENTE -->
      <div class="px-4 pb-3">
        <div class="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              <lucide-icon [name]="UserIcon" size="16" class="text-gray-500"></lucide-icon>
            </div>
            <input
              type="text"
              [(ngModel)]="cliente.rucCedula"
              placeholder="RUC / Cedula / Nombre del Cliente"
              class="flex-1 text-xs font-bold text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
            />
            <button
              (click)="clienteNuevo()"
              class="text-[9px] font-black bg-gray-900 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 shrink-0"
            >
              <lucide-icon [name]="PlusIcon" size="10"></lucide-icon>
              Nuevo
            </button>
          </div>
          <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">

            <!-- Toggle Credito -->
            <button (click)="toggleCredito()"
              [class.text-blue-600]="cliente.esCredito"
              [class.text-gray-400]="!cliente.esCredito"
              class="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide transition-all">
              <div class="w-8 h-4 rounded-full transition-colors relative"
                   [class.bg-blue-600]="cliente.esCredito"
                   [class.bg-gray-200]="!cliente.esCredito">
                <div class="absolute top-0.5 h-3 w-3 bg-white rounded-full shadow transition-all duration-200"
                     [style.left]="cliente.esCredito ? '18px' : '2px'"></div>
              </div>
              Venta a Credito
            </button>

            <!-- Toggle Mayorista -->
            <button (click)="toggleMayorista()"
              [class.text-orange-500]="cliente.esMayorista"
              [class.text-gray-400]="!cliente.esMayorista"
              class="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide transition-all">
              <div class="w-8 h-4 rounded-full transition-colors relative"
                   [class.bg-orange-500]="cliente.esMayorista"
                   [class.bg-gray-200]="!cliente.esMayorista">
                <div class="absolute top-0.5 h-3 w-3 bg-white rounded-full shadow transition-all duration-200"
                     [style.left]="cliente.esMayorista ? '18px' : '2px'"></div>
              </div>
              Precio Maestro
            </button>
          </div>
        </div>
      </div>

      <!-- TABLA -->
      <div class="px-4 flex-1">
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          <!-- Encabezado -->
          <div class="flex px-4 py-2 bg-gray-50 border-b border-gray-100 gap-2">
            <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest flex-1">Producto</span>
            <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest w-24 text-center">Cant.</span>
            <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest w-16 text-right">P. Unit</span>
            <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest w-16 text-right">Total</span>
          </div>

          <!-- Sin items -->
          <div *ngIf="items().length === 0" class="flex flex-col items-center justify-center py-12 text-center px-6">
            <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
              <lucide-icon [name]="CartIcon" size="24" class="text-gray-300"></lucide-icon>
            </div>
            <p class="text-xs font-bold text-gray-400">Busca un producto para comenzar la venta</p>
          </div>

          <!-- Filas -->
          <div *ngFor="let item of items()"
               class="flex items-center px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors gap-2">

            <!-- Nombre + SKU -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <button (click)="quitarItem(item.id)"
                  class="w-5 h-5 bg-red-50 text-red-400 rounded-md flex items-center justify-center hover:bg-red-100 transition-colors shrink-0">
                  <lucide-icon [name]="TrashIcon" size="10"></lucide-icon>
                </button>
                <p class="text-[11px] font-black text-gray-900 truncate">{{ item.nombre }}</p>
              </div>
              <p class="text-[9px] text-gray-400 font-bold ml-6">SKU: {{ item.sku }}</p>
              <span *ngIf="item.descuentoPct > 0"
                class="ml-6 inline-block mt-0.5 text-[9px] font-black text-[#E8541C] bg-orange-50 px-1.5 py-0.5 rounded-md">
                -{{ item.descuentoPct }}% {{ item.esMayorista ? 'M.' : 'Desc.' }}
              </span>
            </div>

            <!-- Cantidad -->
            <div class="flex items-center gap-1 w-24 justify-center">
              <button (click)="decrementar(item.id)"
                class="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all active:scale-90">
                <lucide-icon [name]="MinusIcon" size="12"></lucide-icon>
              </button>
              <input
                type="number"
                [ngModel]="item.cantidad"
                (ngModelChange)="setCantidad(item.id, $event)"
                min="1"
                class="w-9 text-center text-xs font-black text-gray-900 bg-gray-50 border border-gray-200 rounded-lg py-1 outline-none focus:ring-2 focus:ring-[#E8541C]"
              />
              <button (click)="incrementar(item.id)"
                class="w-7 h-7 rounded-lg flex items-center justify-center bg-[#E8541C] text-white hover:bg-orange-600 transition-all active:scale-90">
                <lucide-icon [name]="PlusIcon" size="12"></lucide-icon>
              </button>
            </div>

            <!-- Precio unitario -->
            <div class="text-right w-16">
              <p class="text-xs font-black text-gray-700">{{ fmt(precioFinal(item)) }}</p>
              <p *ngIf="item.descuentoPct > 0" class="text-[9px] text-gray-400 line-through">{{ fmt(item.precioBase) }}</p>
            </div>

            <!-- Total linea -->
            <div class="text-right w-16">
              <p class="text-sm font-black text-[#E8541C]">{{ fmt(totalLinea(item)) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL TOTALES -->
      <div class="px-4 pt-3 pb-6 space-y-3">

        <div class="bg-white border border-gray-200 rounded-2xl px-4 py-4 shadow-sm">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Resumen de Venta</p>

          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-gray-600">Subtotal</span>
            <span class="text-xs font-black text-gray-900">{{ fmt(subtotal()) }}</span>
          </div>

          <div *ngIf="totalDescuento() > 0" class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-gray-500">Descuento {{ cliente.esMayorista ? 'Maestro' : '' }}</span>
            <span class="text-xs font-black text-red-500">-{{ fmt(totalDescuento()) }}</span>
          </div>

          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-gray-600">IVA (15%)</span>
            <span class="text-xs font-black text-gray-900">{{ fmt(iva()) }}</span>
          </div>

          <div class="border-t border-gray-100 pt-2 flex justify-between items-center">
            <span class="text-sm font-black text-gray-900">Total</span>
            <span class="text-2xl font-black text-[#E8541C]">{{ fmt(total()) }}</span>
          </div>

          <div *ngIf="cliente.esCredito"
            class="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <lucide-icon [name]="CreditCardIcon" size="14" class="text-blue-500 shrink-0"></lucide-icon>
            <p class="text-[10px] font-black text-blue-700">Venta registrada a credito</p>
          </div>
        </div>

        <!-- Boton principal -->
        <button
          (click)="finalizarVenta()"
          [disabled]="items().length === 0"
          class="w-full bg-[#E8541C] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-200 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <lucide-icon [name]="ReceiptIcon" size="18"></lucide-icon>
          Finalizar Venta
        </button>

        <!-- Acciones secundarias -->
        <div class="grid grid-cols-2 gap-3">
          <button (click)="generarCotizacion()"
            class="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl py-3.5 text-xs font-black text-gray-700 hover:border-gray-400 transition-all active:scale-95 shadow-sm">
            <lucide-icon [name]="FileTextIcon" size="16" class="text-gray-500"></lucide-icon>
            Generar Cotizacion
          </button>
          <button (click)="pausarVenta()"
            class="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl py-3.5 text-xs font-black text-gray-700 hover:border-gray-400 transition-all active:scale-95 shadow-sm">
            <lucide-icon [name]="PauseIcon" size="16" class="text-gray-500"></lucide-icon>
            Pausar Venta
          </button>
        </div>

        <!-- Atajos -->
        <div class="grid grid-cols-3 gap-2">
          <button class="flex flex-col items-center justify-center gap-1 bg-white border border-gray-200 rounded-2xl py-3 px-2 text-xs font-bold text-gray-600 hover:border-gray-400 transition-all active:scale-95">
            <lucide-icon [name]="TruckIcon" size="18" class="text-gray-500"></lucide-icon>
            Despacho
          </button>
          <button class="flex flex-col items-center justify-center gap-1 bg-white border border-gray-200 rounded-2xl py-3 px-2 text-xs font-bold text-gray-600 hover:border-gray-400 transition-all active:scale-95">
            <lucide-icon [name]="KeyboardIcon" size="18" class="text-gray-500"></lucide-icon>
            Atajos
          </button>
          <button (click)="limpiarVenta()"
            class="flex flex-col items-center justify-center gap-1 bg-red-50 border border-red-100 rounded-2xl py-3 px-2 text-xs font-bold text-red-500 hover:border-red-300 transition-all active:scale-95">
            <lucide-icon [name]="ResetIcon" size="18" class="text-red-400"></lucide-icon>
            Limpiar
          </button>
        </div>
      </div>

      <!-- TOAST -->
      <div *ngIf="toast().show"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
        <lucide-icon [name]="CheckIcon" size="14" class="text-green-400"></lucide-icon>
        <span class="text-xs font-bold">{{ toast().msg }}</span>
      </div>

    </div>
  `
})
export class PosViewComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  readonly SearchIcon = Search;
  readonly ScanIcon = ScanBarcode;
  readonly UserIcon = User;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly TrashIcon = Trash2;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CartIcon = ShoppingCart;
  readonly FileTextIcon = FileText;
  readonly PauseIcon = PauseCircle;
  readonly TruckIcon = Truck;
  readonly KeyboardIcon = Keyboard;
  readonly ResetIcon = RotateCcw;
  readonly CreditCardIcon = CreditCard;
  readonly ReceiptIcon = Receipt;
  readonly CheckIcon = Check;

  @Output() volver = new EventEmitter<void>();

  busqueda = '';
  items = signal<PosItem[]>([]);
  toast = signal<{ show: boolean; msg: string }>({ show: false, msg: '' });
  resultadosBusqueda = signal<any[]>([]);

  cliente: PosCliente = { rucCedula: '', esCredito: false, esMayorista: false };

  subtotal = computed(() =>
    this.items().reduce((acc, item) => acc + this.totalLinea(item), 0)
  );
  totalDescuento = computed(() =>
    this.items().reduce((acc, item) =>
      acc + item.precioBase * (item.descuentoPct / 100) * item.cantidad, 0)
  );
  iva = computed(() => this.subtotal() * 0.15);
  total = computed(() => this.subtotal() + this.iva());

  ngOnInit() {}

  /** Formatea numero como moneda sin usar $ directamente en el template */
  fmt(value: number): string {
    return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  precioFinal(item: PosItem): number {
    return item.precioBase * (1 - item.descuentoPct / 100);
  }

  totalLinea(item: PosItem): number {
    return this.precioFinal(item) * item.cantidad;
  }

  buscarProducto() {
    if (!this.busqueda.trim()) {
      this.resultadosBusqueda.set([]);
      return;
    }
    const q = this.busqueda.toLowerCase();
    const res = this.supabase.productos()
      .filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
      .slice(0, 6);
    this.resultadosBusqueda.set(res);
  }

  agregarAlCarrito(prod: any) {
    this.items.update(prev => {
      const existente = prev.find(i => i.id === prod.id);
      if (existente) {
        return prev.map(i => i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      const nuevo: PosItem = {
        id: prod.id,
        nombre: prod.name,
        sku: String(prod.id).substring(0, 8).toUpperCase(),
        precioBase: prod.minPrice,
        cantidad: 1,
        descuentoPct: this.cliente.esMayorista ? 5 : 0,
        esMayorista: this.cliente.esMayorista
      };
      return [...prev, nuevo];
    });
    this.busqueda = '';
    this.resultadosBusqueda.set([]);
    this.mostrarToast(prod.name + ' agregado');
  }

  quitarItem(id: string) {
    this.items.update(prev => prev.filter(i => i.id !== id));
  }

  incrementar(id: string) {
    this.items.update(prev => prev.map(i => i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i));
  }

  decrementar(id: string) {
    this.items.update(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad - 1) } : i));
  }

  setCantidad(id: string, valor: number) {
    const qty = Math.max(1, Math.floor(valor) || 1);
    this.items.update(prev => prev.map(i => i.id === id ? { ...i, cantidad: qty } : i));
  }

  toggleCredito() {
    this.cliente = { ...this.cliente, esCredito: !this.cliente.esCredito };
  }

  toggleMayorista() {
    const nuevo = !this.cliente.esMayorista;
    this.cliente = { ...this.cliente, esMayorista: nuevo };
    this.items.update(prev => prev.map(i => ({ ...i, descuentoPct: nuevo ? 5 : 0, esMayorista: nuevo })));
  }

  clienteNuevo() {
    this.cliente = { rucCedula: '', esCredito: false, esMayorista: false };
  }

  finalizarVenta() {
    if (this.items().length === 0) return;

    const tiendaId = this.auth.profile()?.tienda_id;
    if (!tiendaId) {
      this.mostrarToast('Error: No se encontró la tienda vinculada al usuario.');
      return;
    }

    const payload = {
      tiendaId: Number(tiendaId),
      tipoVenta: this.cliente.esCredito ? 'credito' : 'contado',
      esMayorista: this.cliente.esMayorista,
      notas: this.cliente.rucCedula ? `Cliente: ${this.cliente.rucCedula}` : 'Venta POS',
      items: this.items().map(i => ({
        productoId: Number(i.id),
        nombreProducto: i.nombre,
        sku: i.sku,
        cantidad: i.cantidad,
        precioUnitario: i.precioBase,
        descuentoPct: i.descuentoPct
      }))
    };

    this.http.post(`${environment.apiUrl}/pedidos`, payload).subscribe({
      next: (res: any) => {
        this.mostrarToast('Venta finalizada · ' + this.fmt(this.total()));
        setTimeout(() => this.limpiarVenta(), 1800);
      },
      error: (err) => {
        console.error('Error al registrar pedido en backend:', err);
        const errorMsg = err?.error?.mensaje || 'Error al registrar venta en el backend';
        this.mostrarToast(errorMsg);
      }
    });
  }

  generarCotizacion() {
    if (this.items().length === 0) { this.mostrarToast('Agrega productos primero'); return; }
    this.mostrarToast('Cotizacion generada exitosamente');
  }

  pausarVenta() { this.mostrarToast('Venta guardada en espera'); }

  limpiarVenta() {
    this.items.set([]);
    this.cliente = { rucCedula: '', esCredito: false, esMayorista: false };
    this.busqueda = '';
    this.resultadosBusqueda.set([]);
  }

  private mostrarToast(msg: string) {
    this.toast.set({ show: true, msg });
    setTimeout(() => this.toast.set({ show: false, msg: '' }), 2500);
  }
}
