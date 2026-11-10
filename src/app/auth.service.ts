import { Injectable, signal, inject, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import type { User, Session } from '@supabase/supabase-js';

// ============================================
// TIPOS
// ============================================
export type UserRole = 'cliente' | 'tienda';
export type UserEstado = 'activo' | 'pendiente' | 'aprobado' | 'rechazado';

export interface Profile {
  id: string;
  email: string;
  rol: UserRole;
  estado: UserEstado;
  nombre_completo?: string;
  telefono?: string;
  ciudad?: string;
  nombre_tienda?: string;
  direccion?: string;
  avatar_url?: string;
  tienda_id?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  rol: UserRole;
  nombre_completo?: string;
  telefono?: string;
  ciudad?: string;
  nombre_tienda?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);

  private get client() {
    return this.supabase.getClient();
  }

  // ============================================
  // STATE (Signals) - Inicializado por defecto en Demo Cliente
  // ============================================
  private _user = signal<User | null>({
    id: 'demo-cliente-001',
    email: 'cliente.demo@ferrecompara.com',
    app_metadata: { provider: 'demo' },
    user_metadata: { rol: 'cliente' },
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as any);

  private _profile = signal<Profile | null>({
    id: 'demo-cliente-001',
    email: 'cliente.demo@ferrecompara.com',
    rol: 'cliente',
    nombre: 'Gustavo Vélez (Demo)',
    telefono: '+593 99 123 4567',
    ciudad: 'Quito',
    direccion: 'Av. Amazonas y Naciones Unidas',
    estado: 'aprobado',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
  });

  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Helpers computados
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isDemo = computed(() => this._user()?.id?.startsWith('demo-') ?? false);
  readonly currentRol = computed(() => this._profile()?.rol ?? null);
  readonly currentEstado = computed(() => this._profile()?.estado ?? null);
  readonly esTiendaAprobada = computed(() => 
    this._profile()?.rol === 'tienda' && this._profile()?.estado === 'aprobado'
  );
  readonly esTiendaPendiente = computed(() => 
    this._profile()?.rol === 'tienda' && this._profile()?.estado === 'pendiente'
  );

  constructor() {
    this.inicializar();
  }

  // ============================================
  // MODO DEMO (Cliente y Ferretería)
  // ============================================
  iniciarDemo(rol: UserRole) {
    if (rol === 'cliente') {
      const demoUser: any = {
        id: 'demo-cliente-001',
        email: 'cliente.demo@ferrecompara.com',
        app_metadata: { provider: 'demo' },
        user_metadata: { rol: 'cliente' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };
      const demoProfile: Profile = {
        id: 'demo-cliente-001',
        email: 'cliente.demo@ferrecompara.com',
        rol: 'cliente',
        estado: 'activo',
        nombre_completo: 'Carlos Mendoza (Demo)',
        telefono: '0991234567',
        ciudad: 'Portoviejo',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
      };
      localStorage.setItem('ferrecompara_demo_session', 'cliente');
      this._user.set(demoUser);
      this._profile.set(demoProfile);
    } else {
      const demoUser: any = {
        id: 'demo-tienda-001',
        email: 'ferreteria.demo@ferrecompara.com',
        app_metadata: { provider: 'demo' },
        user_metadata: { rol: 'tienda' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      };
      const demoProfile: Profile = {
        id: 'demo-tienda-001',
        email: 'ferreteria.demo@ferrecompara.com',
        rol: 'tienda',
        estado: 'aprobado',
        nombre_completo: 'Ferretería Zambrano (Demo)',
        nombre_tienda: 'Ferretería Zambrano',
        telefono: '0983195610',
        ciudad: 'Portoviejo',
        direccion: 'Av. Los Álamos y Reales Tamarindos',
        tienda_id: 1,
        avatar_url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=200&auto=format&fit=crop'
      };
      localStorage.setItem('ferrecompara_demo_session', 'tienda');
      this._user.set(demoUser);
      this._profile.set(demoProfile);
    }
  }

  // ============================================
  // INICIALIZAR (recuperar sesión guardada)
  // ============================================
  async inicializar() {
    // 1. Revisar si hay sesión demo guardada
    const demoMode = localStorage.getItem('ferrecompara_demo_session');
    if (demoMode === 'cliente' || demoMode === 'tienda') {
      this.iniciarDemo(demoMode as UserRole);
      return;
    }

    const { data: { session } } = await this.client.auth.getSession();
    if (session?.user) {
      await this.cargarProfile(session.user.id);
      this._user.set(session.user);
      return;
    }

    // Por defecto, inicializar en modo Demo Cliente para ver la interfaz de inmediato
    this.iniciarDemo('cliente');

    this.client.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Event:', event);
      if (session?.user) {
        await this.cargarProfile(session.user.id);
        this._user.set(session.user);
      } else {
        if (!localStorage.getItem('ferrecompara_demo_session')) {
          this._user.set(null);
          this._profile.set(null);
        }
      }
    });
  }

  // ============================================
  // REGISTRO
  // ============================================
  async signUp(data: SignUpData): Promise<{ ok: boolean; mensaje: string }> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const { data: authData, error } = await this.client.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            rol: data.rol,
            nombre_completo: data.nombre_completo,
            telefono: data.telefono,
            ciudad: data.ciudad,
            nombre_tienda: data.nombre_tienda
          }
        }
      });

      if (error) throw error;

      // Mensaje según el rol
      if (data.rol === 'tienda') {
        return {
          ok: true,
          mensaje: 'Registro recibido. Tu ferretería está pendiente de aprobación. Te avisaremos por email.'
        };
      }

      return {
        ok: true,
        mensaje: 'Bienvenido a FerreExpress'
      };

    } catch (err: any) {
      console.error('[Auth] Error al registrar:', err);
      const mensaje = this.traducirError(err.message);
      this._error.set(mensaje);
      return { ok: false, mensaje };
    } finally {
      this._loading.set(false);
    }
  }

  // ============================================
  // LOGIN
  // ============================================
  async signIn(email: string, password: string): Promise<{ ok: boolean; mensaje: string }> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        this._user.set(data.user);
        // Esperamos a que cargue el perfil para saber el rol antes de permitir el acceso
        await this.cargarProfile(data.user.id);
      }

      return { ok: true, mensaje: 'Bienvenido de vuelta' };

    } catch (err: any) {
      console.error('[Auth] Error al iniciar sesión:', err);
      const mensaje = this.traducirError(err.message);
      this._error.set(mensaje);
      return { ok: false, mensaje };
    } finally {
      this._loading.set(false);
    }
  }

  // Método de compatibilidad
  async checkSession() {
    await this.inicializar();
  }

  // ============================================
  // LOGOUT
  // ============================================
  async signOut(): Promise<void> {
    localStorage.removeItem('ferrecompara_demo_session');
    try {
      await this.client.auth.signOut();
    } catch (err) {
      console.error('Error al hacer sign out en Supabase:', err);
    } finally {
      this._user.set(null);
      this._profile.set(null);
    }
  }

  // ============================================
  // CARGAR PROFILE desde Supabase
  // ============================================
  private async cargarProfile(userId: string) {
    try {
      console.log('[Auth] Cargando perfil para:', userId);
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        this._profile.set(data as Profile);
        console.log('[Auth] Profile cargado:', data);
      } else {
        console.warn('[Auth] No se encontró perfil, usando datos básicos');
        const basicProfile: Profile = { id: userId, email: this._user()?.email || '', rol: 'cliente', estado: 'activo' };
        this._profile.set(basicProfile);
      }
    } catch (err: any) {
      console.error('[Auth] Error al cargar profile:', err);
      this._profile.set(null);
    }
  }

  // ============================================
  // TRADUCIR ERRORES (Supabase devuelve en inglés)
  // ============================================
  private traducirError(mensaje: string): string {
    const traducciones: Record<string, string> = {
      'Invalid login credentials': 'Email o contraseña incorrectos',
      'User already registered': 'Este email ya está registrado',
      'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
      'Unable to validate email address: invalid format': 'Formato de email inválido',
      'Email not confirmed': 'Confirma tu email antes de iniciar sesión'
    };
    return traducciones[mensaje] || mensaje;
  }
}
