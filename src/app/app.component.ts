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
    <div class="min-h-screen bg-white">
      @if (auth.isLoggedIn()) {
        @if (auth.currentRol() === 'tienda') {
          <app-tienda-dashboard></app-tienda-dashboard>
        } @else {
          <!-- VISTA DE CLIENTE -->
          @if (store.selectedProduct()) {
            <!-- Vista de detalle de producto -->
            <app-product-detail-view></app-product-detail-view>
          } @else if (store.selectedStore()) {
            <!-- Vista de detalle de tienda -->
            <app-store-detail-view></app-store-detail-view>
          } @else {
            <app-header></app-header>
            <div class="pt-[64px] pb-[80px]">
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
                <!-- Fallback for favorites/search -->
                <app-home-view></app-home-view>
              }
            </div>
            <app-bottom-nav></app-bottom-nav>
          }
        }
      } @else {
        @if (authScreen() === 'welcome') {
          <app-welcome-view
            (rolElegido)="onRolElegido($event)"
            (iniciarSesion)="onIniciarSesion()"
          ></app-welcome-view>
        } @else {
          <app-auth-view
            [rol]="rolSeleccionado()!"
            [modoInicial]="modoAuth()"
            (atras)="volverAWelcome()"
            (exitoso)="onLoginExitoso()"
          ></app-auth-view>
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

  onLoginExitoso() {
    console.log('✅ Login exitoso');
  }
}
