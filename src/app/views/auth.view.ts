import { Component, signal, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock, ArrowRight, ArrowLeft, User, Phone, MapPin, Wrench, CheckCircle2, Clock } from 'lucide-angular';
import { AuthService, type UserRole } from '../auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-12 lg:px-8 relative overflow-hidden">
      <!-- Back button (Global top-left) -->
      <button
        type="button"
        (click)="atras.emit()"
        class="absolute top-6 left-6 z-50 flex items-center gap-2 text-xs font-black text-gray-500 hover:text-gray-900 uppercase tracking-wide transition-colors"
      >
        <lucide-icon [name]="ArrowLeftIcon" size="16"></lucide-icon>
        Volver
      </button>

      <!-- Decorative blobs -->
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-sm relative z-10">
        <!-- Logo -->
        <div class="flex justify-center mb-6 mt-8">
          <div [class]="'w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg rotate-3 ' + (rol() === 'cliente' ? 'bg-[#E8541C] shadow-orange-200' : 'bg-gray-900 shadow-gray-300')">
            <lucide-icon [name]="WrenchIcon" size="32" class="text-white -rotate-3"></lucide-icon>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-center text-2xl font-black tracking-tight text-gray-900 uppercase">
          {{ tituloPrincipal() }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-500 font-medium">
          {{ subtitulo() }}
        </p>

      </div>

      <!-- ESTADO: PENDIENTE (después de registro de tienda) -->
      @if (mostrandoPendiente()) {
        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm relative z-10 animate-in fade-in zoom-in duration-500">
          <div class="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 text-center">
            <div class="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <lucide-icon [name]="ClockIcon" size="32" class="text-amber-500"></lucide-icon>
            </div>
            <h3 class="text-base font-black text-gray-900 uppercase tracking-tight">Solicitud recibida</h3>
            <p class="mt-3 text-sm text-gray-600 font-medium leading-relaxed">
              {{ mensajeExito() }}
            </p>
            <button
              type="button"
              (click)="atras.emit()"
              class="mt-6 w-full bg-[#E8541C] text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      } @else {

        <!-- FORMULARIO -->
        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm relative z-10">

          <!-- Error message -->
          @if (errorMensaje()) {
            <div class="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
              <p class="text-xs text-red-700 font-bold">{{ errorMensaje() }}</p>
            </div>
          }

          <form class="space-y-4" (ngSubmit)="onSubmit()">

            <!-- Nombre tienda (solo si rol = tienda Y modo = register) -->
            @if (mode() === 'register' && rol() === 'tienda') {
              <div>
                <label class="block text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Nombre de la Ferretería</label>
                <div class="mt-1 relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon [name]="MapPinIcon" size="18" class="text-gray-400"></lucide-icon>
                  </div>
                  <input
                    [(ngModel)]="nombreTienda"
                    name="nombreTienda"
                    type="text"
                    required
                    class="block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm transition-all bg-white"
                    placeholder="Ferretería El Cóndor"
                  />
                </div>
              </div>
            }

            <!-- Nombre completo (solo en register) -->
            @if (mode() === 'register') {
              <div>
                <label class="block text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">{{ rol() === 'tienda' ? 'Nombre del Responsable' : 'Tu Nombre' }}</label>
                <div class="mt-1 relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon [name]="UserIcon" size="18" class="text-gray-400"></lucide-icon>
                  </div>
                  <input
                    [(ngModel)]="nombreCompleto"
                    name="nombreCompleto"
                    type="text"
                    required
                    [class]="'block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm transition-all bg-white ' + (rol() === 'cliente' ? 'focus:ring-[#E8541C]' : 'focus:ring-gray-900')"
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Teléfono</label>
                <div class="mt-1 relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <lucide-icon [name]="PhoneIcon" size="18" class="text-gray-400"></lucide-icon>
                  </div>
                  <input
                    [(ngModel)]="telefono"
                    name="telefono"
                    type="tel"
                    required
                    [class]="'block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm transition-all bg-white ' + (rol() === 'cliente' ? 'focus:ring-[#E8541C]' : 'focus:ring-gray-900')"
                    placeholder="0991234567"
                  />
                </div>
              </div>
            }

            <!-- Email -->
            <div>
              <label class="block text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Correo Electrónico</label>
              <div class="mt-1 relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <lucide-icon [name]="MailIcon" size="18" class="text-gray-400"></lucide-icon>
                </div>
                <input
                  [(ngModel)]="email"
                  name="email"
                  type="email"
                  required
                  [class]="'block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm transition-all bg-white ' + (rol() === 'cliente' ? 'focus:ring-[#E8541C]' : 'focus:ring-gray-900')"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-bold text-gray-900 uppercase tracking-wide ml-1">Contraseña</label>
              <div class="mt-1 relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <lucide-icon [name]="LockIcon" size="18" class="text-gray-400"></lucide-icon>
                </div>
                <input
                  [(ngModel)]="password"
                  name="password"
                  type="password"
                  required
                  minlength="6"
                  [class]="'block w-full rounded-xl border-0 py-3.5 pl-11 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm transition-all bg-white ' + (rol() === 'cliente' ? 'focus:ring-[#E8541C]' : 'focus:ring-gray-900')"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              [disabled]="auth.loading()"
              [class]="'group relative flex w-full justify-center items-center rounded-xl px-3 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ' + (rol() === 'cliente' ? 'bg-[#E8541C] hover:bg-orange-600 shadow-orange-200' : 'bg-gray-900 hover:bg-black shadow-gray-200')"
            >
              @if (auth.loading()) {
                <span>Procesando...</span>
              } @else {
                <span>{{ mode() === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta' }}</span>
                <lucide-icon [name]="ArrowRightIcon" size="18" class="absolute right-4 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform flex items-center"></lucide-icon>
              }
            </button>

          </form>

          <!-- Toggle mode -->
          <p class="mt-8 text-center text-sm text-gray-500">
            {{ mode() === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?' }}
            <button
              (click)="toggleMode()"
              [class]="'font-black hover:opacity-70 transition-colors ml-1 uppercase tracking-wide text-xs ' + (rol() === 'cliente' ? 'text-[#E8541C]' : 'text-gray-900')"
            >
              {{ mode() === 'login' ? 'Regístrate aquí' : 'Inicia Sesión' }}
            </button>
          </p>

        </div>
      }

    </div>
  `
})
export class AuthViewComponent {
  // Icons
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly UserIcon = User;
  readonly PhoneIcon = Phone;
  readonly MapPinIcon = MapPin;
  readonly WrenchIcon = Wrench;
  readonly ArrowRightIcon = ArrowRight;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly ClockIcon = Clock;

  // Inputs / Outputs
  rol = input.required<UserRole>();
  modoInicial = input<AuthMode>('register');
  atras = output<void>();
  exitoso = output<void>();

  protected auth = inject(AuthService);

  // State
  mode = signal<AuthMode>('register');
  email = signal('');
  password = signal('');
  nombreCompleto = signal('');
  telefono = signal('');
  nombreTienda = signal('');
  errorMensaje = signal<string | null>(null);
  mostrandoPendiente = signal(false);
  mensajeExito = signal('');

  ngOnInit() {
    this.mode.set(this.modoInicial());
  }

  tituloPrincipal = computed(() => {
    if (this.mode() === 'login') return 'Iniciar Sesión';
    return this.rol() === 'cliente' ? 'Crea tu cuenta' : 'Registra tu Ferretería';
  });

  subtitulo = computed(() => {
    if (this.mode() === 'login') return 'Bienvenido de vuelta';
    return this.rol() === 'cliente'
      ? 'Encuentra los mejores precios al instante'
      : 'Únete a la red ferretera más grande';
  });

  toggleMode() {
    this.errorMensaje.set(null);
    this.mode.update(m => m === 'login' ? 'register' : 'login');
  }

  async onSubmit() {
    this.errorMensaje.set(null);

    if (this.mode() === 'login') {
      const resultado = await this.auth.signIn(this.email(), this.password());
      if (!resultado.ok) {
        this.errorMensaje.set(resultado.mensaje);
        return;
      }
      // Si la tienda está pendiente, mostramos pantalla de espera
      if (resultado.mensaje.includes('pendiente')) {
        this.mensajeExito.set(resultado.mensaje);
        this.mostrandoPendiente.set(true);
        return;
      }
      this.exitoso.emit();
    } else {
      const resultado = await this.auth.signUp({
        email: this.email(),
        password: this.password(),
        rol: this.rol(),
        nombre_completo: this.nombreCompleto(),
        telefono: this.telefono(),
        nombre_tienda: this.rol() === 'tienda' ? this.nombreTienda() : undefined
      });

      if (!resultado.ok) {
        this.errorMensaje.set(resultado.mensaje);
        return;
      }

      // Si es tienda, queda pendiente y mostramos pantalla
      if (this.rol() === 'tienda') {
        this.mensajeExito.set(resultado.mensaje);
        this.mostrandoPendiente.set(true);
        return;
      }

      // Si es cliente, ya entra directo
      this.exitoso.emit();
    }
  }
}
