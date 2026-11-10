import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, type UserRole } from './auth.service';
import { TiendaDashboardView } from './views/tienda-dashboard.view';
import { WelcomeViewComponent } from './views/welcome.view';
import { AuthViewComponent } from './views/auth.view';
import { HomeViewComponent } from './views/home.view';
import { StoresViewComponent } from './views/stores.view';
import { ExpertsViewComponent } from './views/experts.view';
import { DashboardViewComponent } from './views/dashboard.view';
import { ProductDetailViewComponent } from './views/product-detail.view';
import { StoreDetailViewComponent } from './views/store-detail.view';
import { HeaderComponent } from './components/header.component';
import { BottomNavComponent } from './components/bottom-nav.component';
import { CartViewComponent } from './views/cart.view';
import { StoreService } from './store.service';

type AuthScreen = 'welcome' | 'auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    TiendaDashboardView, 
    WelcomeViewComponent, 
    AuthViewComponent, 
    HomeViewComponent,
    StoresViewComponent,
    ExpertsViewComponent,
    DashboardViewComponent,
    ProductDetailViewComponent,
    StoreDetailViewComponent,
    CartViewComponent,
    HeaderComponent,
    BottomNavComponent
  ],
  template: `
    <div *ngIf="globalError()" class="fixed top-0 left-0 w-full z-[9999] bg-red-600 text-white p-4 font-mono text-xs overflow-auto max-h-screen">
      <b>ERROR GLOBAL:</b><br/>
      {{ globalError() }}
      <button (click)="globalError.set(null)" class="mt-2 bg-black/30 px-3 py-1 rounded">Cerrar</button>
    </div>

    <!-- FLOATING DEMO PILL (Discreet Luxury Dock) -->
    <div *ngIf="auth.isLoggedIn() && auth.isDemo()" class="fixed top-3 right-4 z-[150] hidden sm:flex items-center gap-2 bg-[#0c0e14]/90 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full shadow-2xl text-[11px] font-mono">
      <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
      <span class="text-zinc-400">DEMO:</span>
      <button 
        (click)="auth.iniciarDemo(auth.currentRol() === 'tienda' ? 'cliente' : 'tienda')"
        class="text-orange-400 hover:text-orange-300 font-bold underline transition-colors"
      >
        {{ auth.currentRol() === 'tienda' ? 'Ferretería' : 'Cliente' }}
      </button>
      <span class="text-zinc-600">|</span>
      <button 
        (click)="auth.signOut()" 
        class="text-zinc-400 hover:text-white transition-colors"
      >
        Salir
      </button>
    </div>

    <div class="min-h-screen bg-[#07080b] text-zinc-100 selection:bg-orange-500/30 selection:text-orange-200">
      @if (auth.currentRol() === 'tienda') {
        <app-tienda-dashboard></app-tienda-dashboard>
      } @else {
        <!-- VISTA DE CLIENTE (POR DEFECTO PARA CUALQUIER VISITANTE) -->
        @if (store.selectedProduct()) {
          <app-product-detail-view></app-product-detail-view>
        } @else if (store.selectedStore()) {
          <app-store-detail-view></app-store-detail-view>
        } @else {
          <!-- Header visible only on secondary tabs (Stores, Experts, Dashboard, Cart) -->
          @if (store.activeTab() !== 'home') {
            <app-header></app-header>
          }
          <div class="pb-[80px]">
            @if (store.activeTab() === 'home') {
              <app-home-view></app-home-view>
            } @else if (store.activeTab() === 'stores') {
              <app-stores-view></app-stores-view>
            } @else if (store.activeTab() === 'experts') {
              <app-experts-view></app-experts-view>
            } @else if (store.activeTab() === 'profile') {
              <app-dashboard-view></app-dashboard-view>
            } @else if (store.activeTab() === 'cart') {
              <app-cart-view></app-cart-view>
            } @else {
              <app-home-view></app-home-view>
            }
          </div>
          <app-bottom-nav></app-bottom-nav>
        }
      }
    </div>
  `
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);
  store = inject(StoreService);

  authScreen = signal<AuthScreen>('welcome');
  rolSeleccionado = signal<UserRole | null>(null);
  modoAuth = signal<'login' | 'register'>('register');
  globalError = signal<string | null>(null);

  constructor() {
    window.addEventListener('error', (e) => {
      this.globalError.set(e.message + '\n' + e.error?.stack);
    });
    window.addEventListener('unhandledrejection', (e) => {
      this.globalError.set(e.reason?.message + '\n' + e.reason?.stack);
    });
  }

  ngOnInit() {}

  onRolElegido(rol: UserRole) {
    this.rolSeleccionado.set(rol);
    this.modoAuth.set('register');
    this.authScreen.set('auth');
  }

  onIniciarSesion() {
    this.rolSeleccionado.set('cliente');
    this.modoAuth.set('login');
    this.authScreen.set('auth');
  }

  volverAWelcome() {
    this.authScreen.set('welcome');
    this.rolSeleccionado.set(null);
  }

  onEntrarDemo(rol: UserRole) {
    this.auth.iniciarDemo(rol);
    this.onLoginExitoso();
  }

  onLoginExitoso() {
    console.log('[Auth] Login exitoso');
    const userCity = this.auth.profile()?.ciudad;
    if (userCity) {
      this.store.setUserCity(userCity);
    }
  }
}
