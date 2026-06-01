import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ArrowLeft, MapPin, Star, Phone, MessageCircle, Navigation, MessageSquare, Send, X, DollarSign, ShieldCheck, Briefcase, FileText } from 'lucide-angular';
import { StoreService } from '../store.service';
import { ProductCardComponent } from '../components/product-card.component';
import { ChatService } from '../chat.service';
import { AuthService } from '../auth.service';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-store-detail-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ProductCardComponent],
  template: `
    <div *ngIf="storeService.selectedStore() as store" class="bg-white min-h-screen pb-32 animate-in slide-in-from-right duration-500">
      <!-- Sticky Top Bar -->
      <div class="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 h-16 flex items-center justify-between">
        <button (click)="storeService.selectStore(null)" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <lucide-icon [name]="BackIcon" size="24"></lucide-icon>
        </button>
        <span class="text-lg font-black text-gray-900 tracking-tight truncate px-2">{{ store.name }}</span>
        <div class="w-10"></div>
      </div>

      <!-- Store Hero -->
      <div class="relative h-48 w-full bg-gray-100">
        <img [src]="store.image" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div class="absolute bottom-4 left-6 right-6">
          <div class="flex items-end justify-between">
            <div>
              <div [class]="'inline-block px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest text-white mb-2 ' + (store.status === 'open' ? 'bg-green-500' : 'bg-red-500')">
                {{ store.status === 'open' ? 'Abierto Ahora' : 'Cerrado' }}
              </div>
              <h1 class="text-2xl font-black text-white leading-tight">{{ store.name }}</h1>
              <div class="flex items-center gap-1 mt-1 text-white/80">
                <lucide-icon [name]="PinIcon" size="12"></lucide-icon>
                <span class="text-[10px] font-bold tracking-wider">{{ store.distance }} — {{ store.address }}</span>
              </div>
            </div>
            <div class="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1.5 rounded-lg text-white">
              <lucide-icon [name]="StarIcon" size="14" class="fill-current text-yellow-400"></lucide-icon>
              <span class="text-xs font-black">{{ store.rating }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="px-4 py-6 grid grid-cols-4 gap-2 border-b border-gray-100">
        <button (click)="callStore(store.phone)" class="bg-gray-50 text-gray-700 font-bold text-[10px] py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all hover:bg-gray-100">
          <lucide-icon [name]="PhoneIcon" size="18"></lucide-icon>
          Llamar
        </button>
        <button (click)="whatsappStore(store.phone)" class="bg-green-50 text-green-700 font-bold text-[10px] py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all hover:bg-green-100">
          <lucide-icon [name]="WhatsappIcon" size="18"></lucide-icon>
          WhatsApp
        </button>
        <button (click)="abrirChatInterno(store)" class="bg-blue-50 text-blue-700 font-bold text-[10px] py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all hover:bg-blue-100 relative">
          <lucide-icon [name]="ChatIcon" size="18"></lucide-icon>
          Chat
          <span class="absolute top-1.5 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        </button>
        <button (click)="navigateStore(store.address)" class="bg-[#E8541C] text-white font-bold text-[10px] py-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg shadow-orange-100 hover:shadow-orange-200">
          <lucide-icon [name]="NavIcon" size="18"></lucide-icon>
          Llegar
        </button>
      </div>

      <!-- Horarios en Detalle -->
      <div *ngIf="store.horario" class="px-4 py-4 bg-gray-50/50 border-b border-gray-100">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Horario de Atención</span>
        <p class="text-xs font-bold text-gray-700">{{ store.horario }}</p>
      </div>

      <!-- Banner de Crédito -->
      <div class="px-4 py-6">
        <div class="bg-[#1f2937] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div class="inline-flex items-center gap-1.5 bg-[#E8541C] text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mb-4">
            <lucide-icon [name]="ShieldCheckIcon" size="12"></lucide-icon>
            Seguro y Transparente
          </div>
          
          <h2 class="text-2xl font-black mb-3 leading-tight">Compra ahora,<br/>paga después</h2>
          <p class="text-[11px] text-gray-300 mb-6 leading-relaxed">Crédito directo con tu ferretería de confianza. Financia tus herramientas y materiales de construcción sin complicaciones bancarias.</p>
          
          <button (click)="abrirModalCredito(store)" class="w-full bg-[#E8541C] text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-orange-900/50">
            Solicitar Crédito Ahora
          </button>
        </div>

        <h3 class="text-sm font-black text-gray-900 mt-8 mb-4">Requisitos para tu crédito</h3>
        <p class="text-[11px] text-gray-500 mb-4 leading-relaxed">Proceso rápido y sin papeleo excesivo. Solo necesitas:</p>

        <div class="space-y-3">
          <div class="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 shadow-sm">
            <div class="w-10 h-10 bg-orange-50 text-[#E8541C] rounded-xl flex items-center justify-center flex-shrink-0">
              <lucide-icon [name]="FileTextIcon" size="20"></lucide-icon>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900 mb-1">Identificación Válida</h4>
              <p class="text-[10px] text-gray-500 mb-2 leading-relaxed">Cédula de identidad original o pasaporte vigente para validar tu identidad al instante.</p>
              <div class="inline-flex items-center gap-1 text-[9px] font-bold text-[#E8541C] uppercase tracking-widest">
                <lucide-icon [name]="ShieldCheckIcon" size="10"></lucide-icon> Requisito Obligatorio
              </div>
            </div>
          </div>
          
          <div class="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 shadow-sm">
            <div class="w-10 h-10 bg-orange-50 text-[#E8541C] rounded-xl flex items-center justify-center flex-shrink-0">
              <lucide-icon [name]="BriefcaseIcon" size="20"></lucide-icon>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900 mb-1">Prueba de Trabajo</h4>
              <p class="text-[10px] text-gray-500 mb-2 leading-relaxed">Certificado laboral o RUC que demuestre tu actividad económica.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Store Catalog -->
      <div class="px-4 py-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-black text-gray-900">Catálogo Disponible</h2>
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ storeService.storeProducts().length }} Productos</span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div *ngFor="let product of storeService.storeProducts()">
            <app-product-card [product]="product"></app-product-card>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL DE CHAT MODAL / SUPERPUESTO -->
    <div *ngIf="chatAbierto() && storeService.selectedStore() as store" class="fixed inset-0 z-50 flex flex-col bg-gray-100 animate-in slide-in-from-bottom duration-300">
      <!-- Cabecera del Chat -->
      <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-3">
          <img [src]="store.image" class="w-10 h-10 rounded-full object-cover border border-gray-100" />
          <div>
            <h3 class="text-sm font-black text-gray-900 leading-tight">{{ store.name }}</h3>
            <span class="text-[10px] font-bold text-green-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Chat en Vivo
            </span>
          </div>
        </div>
        <button (click)="cerrarChat()" class="p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-50">
          <lucide-icon [name]="CloseIcon" size="18"></lucide-icon>
        </button>
      </div>

      <!-- Historial de Mensajes -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        <div *ngIf="chatService.loading()" class="flex-1 flex items-center justify-center">
          <div class="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div *ngIf="!chatService.loading() && chatService.messages().length === 0" class="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div class="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-3">
            <lucide-icon [name]="ChatIcon" size="24"></lucide-icon>
          </div>
          <p class="text-xs font-bold text-gray-500">Inicia una conversación directa con la ferretería. Pregunta por disponibilidad, precios por mayor o envíos.</p>
        </div>

        <div *ngIf="!chatService.loading() && chatService.messages().length > 0" class="space-y-3">
          <div 
            *ngFor="let msg of chatService.messages()"
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
      </div>

      <!-- Barra de Entrada de Texto -->
      <div class="bg-white border-t border-gray-200 p-3 flex items-center gap-2">
        <input 
          type="text" 
          [(ngModel)]="nuevoMensaje" 
          (keyup.enter)="enviarMensaje()"
          placeholder="Escribe un mensaje a la ferretería..." 
          class="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
        <button 
          (click)="enviarMensaje()" 
          [disabled]="!nuevoMensaje.trim()"
          class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 shadow-md shadow-blue-100"
        >
          <lucide-icon [name]="SendIcon" size="16"></lucide-icon>
        </button>
      </div>
    </div>

    <!-- MODAL SOLICITAR CRÉDITO -->
    <div *ngIf="modalCreditoAbierto()" class="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div class="bg-white w-full max-w-md rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h3 class="font-black text-gray-900 text-sm uppercase">Solicitar Crédito</h3>
          <button (click)="modalCreditoAbierto.set(false)" class="text-gray-400 hover:text-gray-900 transition-colors w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full"><lucide-icon [name]="CloseIcon" size="18"></lucide-icon></button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Monto Solicitado ($)</label>
            <input type="number" [(ngModel)]="solicitudForm.monto" placeholder="Ej: 500" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Plazo de Pago (Meses)</label>
            <select [(ngModel)]="solicitudForm.plazo" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all appearance-none">
              <option [value]="1">1 Mes</option>
              <option [value]="3">3 Meses</option>
              <option [value]="6">6 Meses</option>
              <option [value]="12">12 Meses</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Tus Ingresos Mensuales ($)</label>
            <input type="number" [(ngModel)]="solicitudForm.ingresos" placeholder="Ej: 800" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#E8541C] outline-none transition-all" />
          </div>
          <div class="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
            <p class="text-[10px] font-medium text-orange-800 leading-relaxed text-center">La ferretería se pondrá en contacto contigo para pedirte copias de tu cédula y certificado laboral en caso de pre-aprobar el crédito.</p>
          </div>
        </div>

        <div class="p-4 bg-white border-t border-gray-100">
          <button (click)="enviarSolicitudCredito()" [disabled]="enviandoSolicitud()" class="w-full bg-[#E8541C] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-95 transition-all">
            <span *ngIf="enviandoSolicitud()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Enviar Solicitud
          </button>
        </div>
      </div>
    </div>

  `
})
export class StoreDetailViewComponent {
  protected storeService = inject(StoreService);
  protected chatService = inject(ChatService);
  protected authService = inject(AuthService);
  protected supabaseService = inject(SupabaseService);
  
  readonly BackIcon = ArrowLeft;
  readonly PinIcon = MapPin;
  readonly StarIcon = Star;
  readonly PhoneIcon = Phone;
  readonly WhatsappIcon = MessageCircle;
  readonly ChatIcon = MessageSquare;
  readonly NavIcon = Navigation;
  readonly CloseIcon = X;
  readonly SendIcon = Send;
  readonly DollarSignIcon = DollarSign;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly BriefcaseIcon = Briefcase;
  readonly FileTextIcon = FileText;

  chatAbierto = signal(false);
  nuevoMensaje = '';
  currentChatId: string | null = null;

  modalCreditoAbierto = signal(false);
  enviandoSolicitud = signal(false);
  solicitudForm = { monto: null, plazo: 6, ingresos: null };
  storeParaCredito: any = null;

  callStore(phone: string) {
    if (!phone) return;
    window.open('tel:' + phone.replace(/[^0-9+]/g, ''), '_self');
  }

  whatsappStore(phone: string) {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open('https://wa.me/' + cleanPhone, '_blank');
  }

  navigateStore(address: string) {
    if (!address) return;
    window.open('https://maps.google.com/?q=' + encodeURIComponent(address), '_blank');
  }

  async abrirChatInterno(store: any) {
    const p = this.authService.profile();
    if (!p || !p.id) {
      alert('🔒 Para chatear en vivo con las ferreterías y que reciban tus mensajes en tiempo real, por favor inicia sesión o regístrate como Cliente.');
      return;
    }

    this.chatAbierto.set(true);

    try {
      const storeIdNum = Number(store.id) || 1;
      this.currentChatId = await this.chatService.getOrCreateChatForClient(storeIdNum);
      
      if (this.currentChatId) {
        await this.chatService.loadMessagesAndSubscribe(this.currentChatId);
      } else {
        alert('❌ No se pudo enlazar el chat con la tienda. Verifica la base de datos.');
        this.chatAbierto.set(false);
      }
    } catch (e) {
      console.error('Error abriendo chat remoto:', e);
      alert('❌ Falló la conexión con Supabase en tiempo real.');
      this.chatAbierto.set(false);
    }
  }

  cerrarChat() {
    this.chatAbierto.set(false);
    this.chatService.closeChat();
    this.currentChatId = null;
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.currentChatId) return;
    
    const msg = this.nuevoMensaje;
    this.nuevoMensaje = '';
    
    try {
      await this.chatService.sendMessage(this.currentChatId, msg);
    } catch (e) {
      console.error('Error enviando mensaje:', e);
    }
  }

  isMyMessage(senderId: string): boolean {
    const currentUserId = this.authService.profile()?.id;
    return currentUserId ? senderId === currentUserId : true;
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

  abrirModalCredito(store: any) {
    const user = this.authService.user();
    if (!user || !user.id) {
      alert('Para solicitar crédito necesitas estar registrado y haber iniciado sesión como Cliente.');
      return;
    }
    this.storeParaCredito = store;
    this.modalCreditoAbierto.set(true);
  }

  async enviarSolicitudCredito() {
    if (!this.solicitudForm.monto || !this.solicitudForm.ingresos) {
      alert('Por favor, llena los montos solicitados y tus ingresos.');
      return;
    }
    this.enviandoSolicitud.set(true);
    try {
      const tiendaId = Number(this.storeParaCredito.id) || 1;
      await this.supabaseService.solicitarCredito(tiendaId, this.solicitudForm.monto, this.solicitudForm.plazo, this.solicitudForm.ingresos);
      alert('✅ Tu solicitud de crédito ha sido enviada a la ferretería. Se pondrán en contacto contigo.');
      this.modalCreditoAbierto.set(false);
    } catch (e) {
      console.error(e);
      alert('Error enviando la solicitud. Intenta nuevamente.');
    } finally {
      this.enviandoSolicitud.set(false);
    }
  }

}
