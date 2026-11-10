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
    <div class="min-h-screen bg-[#07080b] text-zinc-100 flex flex-col justify-center px-6 py-12 lg:px-8 relative overflow-hidden">
      <!-- Back button -->
      <button
        type="button"
        (click)="atras.emit()"
        class="absolute top-6 left-6 z-50 flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
      >
        <lucide-icon [name]="ArrowLeftIcon" size="16"></lucide-icon>
        Volver
      </button>

      <!-- Ambient glow lights -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-sm relative z-10">
        <!-- Logo -->
        <div class="flex justify-center mb-4 mt-8">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center bg-orange-500/15 border border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.25)]">
            <lucide-icon [name]="WrenchIcon" size="26" class="text-orange-400"></lucide-icon>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-center text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
          {{ tituloPrincipal() }}
        </h2>
        <p class="mt-1 text-center text-xs font-mono text-zinc-400">
          {{ subtitulo() }}
        </p>

      </div>

      <!-- ESTADO: PENDIENTE -->
      @if (mostrandoPendiente()) {
        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-sm relative z-10 animate-in fade-in zoom-in duration-500">
          <div class="bg-[#0e1118]/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/10 text-center">
            <div class="w-14 h-14 bg-amber-500/15 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <lucide-icon [name]="ClockIcon" size="28" class="text-amber-400"></lucide-icon>
            </div>
            <h3 class="text-base font-bold text-white uppercase tracking-tight">Solicitud recibida</h3>
            <p class="mt-2 text-xs text-zinc-400 font-medium leading-relaxed">
              {{ mensajeExito() }}
            </p>
            <button
              type="button"
              (click)="atras.emit()"
              class="mt-6 w-full bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 px-6 py-3 rounded-xl font-mono text-xs uppercase tracking-widest active:scale-[0.98] transition-all"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      } @else {

        <!-- FORMULARIO -->
        <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-sm relative z-10 bg-[#0e1118]/85 backdrop-blur-2xl p-6 sm:p-7 rounded-3xl border border-white/10 shadow-2xl">

          <!-- Error message -->
          @if (errorMensaje()) {
            <div class="mb-4 bg-red-950/40 border border-red-500/30 rounded-xl p-3 animate-in fade-in slide-in-from-top-2">
              <p class="text-xs text-red-400 font-mono">{{ errorMensaje() }}</p>
            </div>
          }

          <form class="space-y-3.5" (ngSubmit)="onSubmit()">

            <!-- Nombre tienda -->
            @if (mode() === 'register' && rol() === 'tienda') {
              <div>
                <label class="block text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">Nombre de la Ferretería</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <lucide-icon [name]="MapPinIcon" size="16" class="text-zinc-500"></lucide-icon>
                  </div>
                  <input
                    [(ngModel)]="nombreTienda"
                    name="nombreTienda"
                    type="text"
                    required
                    class="block w-full rounded-xl bg-zinc-950/80 border border-white/10 py-3 pl-10 pr-4 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all"
                    placeholder="Ferretería El Cóndor"
                  />
                </div>
              </div>
            }

            <!-- Nombre completo -->
            @if (mode() === 'register') {
              <div>
                <label class="block text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">{{ rol() === 'tienda' ? 'Nombre del Responsable' : 'Tu Nombre' }}</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <lucide-icon [name]="UserIcon" size="16" class="text-zinc-500"></lucide-icon>
                  </div>
                  <input
                    [(ngModel)]="nombreCompleto"
                    name="nombreCompleto"
                    type="text"
                    required
                    class="block w-full rounded-xl bg-zinc-950/80 border border-white/10 py-3 pl-10 pr-4 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all"
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">Teléfono</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <lucide-icon [name]="PhoneIcon" size="16" class="text-zinc-500"></lucide-icon>
                  </div>
                  <input
                    [(ngModel)]="telefono"
                    name="telefono"
                    type="tel"
                    required
                    class="block w-full rounded-xl bg-zinc-950/80 border border-white/10 py-3 pl-10 pr-4 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all"
                    placeholder="0991234567"
                  />
                </div>
              </div>
            }

            <!-- Email -->
            <div>
              <label class="block text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">Correo Electrónico</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <lucide-icon [name]="MailIcon" size="16" class="text-zinc-500"></lucide-icon>
                </div>
                <input
                  [(ngModel)]="email"
                  name="email"
                  type="email"
                  required
                  class="block w-full rounded-xl bg-zinc-950/80 border border-white/10 py-3 pl-10 pr-4 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">Contraseña</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <lucide-icon [name]="LockIcon" size="16" class="text-zinc-500"></lucide-icon>
                </div>
                <input
                  [(ngModel)]="password"
                  name="password"
                  type="password"
                  required
                  minlength="6"
                  class="block w-full rounded-xl bg-zinc-950/80 border border-white/10 py-3 pl-10 pr-4 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              [disabled]="auth.loading()"
              class="group relative flex w-full justify-center items-center rounded-xl px-3 py-3.5 text-xs font-mono font-bold uppercase tracking-widest text-white bg-orange-500 hover:bg-orange-600 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              @if (auth.loading()) {
                <span>Procesando...</span>
              } @else {
                <span>{{ mode() === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta' }}</span>
                <lucide-icon [name]="ArrowRightIcon" size="16" class="absolute right-4 top-1/2 -translate-y-1/2 group-hover:translate-x-1 transition-transform"></lucide-icon>
              }
            </button>

          </form>

          <!-- DEMO ACCESS BUTTONS -->
          <div class="mt-6 pt-5 border-t border-white/[0.08]">
            <p class="text-center text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2.5">
              O entra en modo demostración
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                (click)="entrarDemo('cliente')"
                class="py-2.5 px-3 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                <span>Demo Cliente</span>
              </button>
              <button
                type="button"
                (click)="entrarDemo('tienda')"
                class="py-2.5 px-3 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                <span>Demo Ferretería</span>
              </button>
            </div>
          </div>

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

  entrarDemo(rol: UserRole) {
    this.auth.iniciarDemo(rol);
    this.exitoso.emit();
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
