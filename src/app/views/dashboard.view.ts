import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, User, Settings, Package, CreditCard, Bell, Shield, LogOut, ChevronRight, MapPin, ArrowLeft, Construction, Lock, Save, CheckCircle, Camera } from 'lucide-angular';
import { AuthService } from '../auth.service';
import { StoreService } from '../store.service';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="pb-24 bg-gray-50 min-h-screen relative">
      @if (activeView() === 'main') {
        <div class="animate-in slide-in-from-bottom duration-500">
          <!-- Profile Header -->
          <section class="px-6 pt-10 pb-8 bg-white border-b border-gray-100 shadow-sm">
            <div class="flex items-center gap-5">
              <div class="relative">
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
              <div>
                <h1 class="text-2xl font-black text-gray-900 leading-tight">
                  {{ auth.profile()?.nombre_completo || 'Usuario' }}
                </h1>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Cliente Gold</p>
                <div class="flex items-center gap-1.5 mt-2 text-emerald-600">
                  <lucide-icon [name]="PinIcon" size="12"></lucide-icon>
                  <span class="text-[10px] font-bold uppercase">Guayaquil, Ecuador</span>
                </div>
              </div>
            </div>
          </section>

          <!-- User Stats -->
          <section class="px-6 -mt-6 grid grid-cols-3 gap-3 relative z-10">
            <div class="bg-white border border-gray-100 rounded-2xl p-3 shadow-md text-center">
              <p class="text-lg font-black text-gray-900 leading-none">12</p>
              <p class="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Órdenes</p>
            </div>
            <div class="bg-white border border-gray-100 rounded-2xl p-3 shadow-md text-center">
              <p class="text-lg font-black text-gray-900 leading-none">5</p>
              <p class="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Favoritos</p>
            </div>
            <div class="bg-white border border-gray-100 rounded-2xl p-3 shadow-md text-center">
              <p class="text-lg font-black text-gray-900 leading-none">$45</p>
              <p class="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Ahorrado</p>
            </div>
          </section>

          <!-- Menu Options -->
          <section class="px-6 mt-8 space-y-2">
            <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">Configuración de Cuenta</h2>
            
            @for (item of menuItems; track item.label) {
              <button 
                (click)="activeView.set(item.label)"
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
export class DashboardViewComponent {
  protected auth = inject(AuthService);
  private store = inject(StoreService);
  private supabase = inject(SupabaseService);

  activeView = signal<string>('main');
  guardando = signal<boolean>(false);
  guardadoExitoso = signal<boolean>(false);

  avatarPreview = '';
  selectedAvatarFile: File | null = null;

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

  readonly menuItems = [
    { label: 'Editar Perfil', desc: 'Cambia tu nombre, teléfono y ciudad', icon: User, color: 'text-[#E8541C]', bg: 'bg-orange-50' },
    { label: 'Mis Pedidos', desc: 'Sigue tus compras y envíos', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Direcciones', desc: 'Gestiona tus puntos de entrega', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Métodos de Pago', desc: 'Tarjetas guardadas y facturación', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Notificaciones', desc: 'Alertas de precios y ofertas', icon: Bell, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Seguridad', desc: 'Contraseña y verificación', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

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
