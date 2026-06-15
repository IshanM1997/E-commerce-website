import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="layout">
      <nav class="navbar">
        <div class="nav-brand">🛒 ShopSphere</div>
        <div class="nav-links">
          <a routerLink="products" routerLinkActive="active">Shop</a>
          <a routerLink="cart" routerLinkActive="active">Cart <span class="badge" *ngIf="cartCount > 0">{{cartCount}}</span></a>
          <a routerLink="orders" routerLinkActive="active">Orders</a>
        </div>
        <div class="nav-user">
          <span>👤 {{userName}}</span>
          <button (click)="logout()">Logout</button>
        </div>
      </nav>
      <main class="content"><router-outlet></router-outlet></main>
    </div>
  `,
  styles: [`
    .layout { min-height:100vh; background:#f8f9fa; }
    .navbar { background:#fff; padding:0 32px; height:64px; display:flex; align-items:center; gap:24px; box-shadow:0 2px 8px rgba(0,0,0,.08); position:sticky; top:0; z-index:100; }
    .nav-brand { font-size:20px; font-weight:700; color:#667eea; flex:1; }
    .nav-links { display:flex; gap:8px; }
    .nav-links a { padding:8px 16px; border-radius:8px; text-decoration:none; color:#444; font-weight:500; font-size:14px; position:relative; }
    .nav-links a.active, .nav-links a:hover { background:#f0f0ff; color:#667eea; }
    .badge { background:#e74c3c; color:#fff; border-radius:50%; padding:2px 6px; font-size:11px; position:absolute; top:-4px; right:-4px; }
    .nav-user { display:flex; align-items:center; gap:12px; font-size:14px; color:#666; margin-left:auto; }
    .nav-user button { padding:8px 16px; background:#667eea; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:13px; }
    .content { padding:32px; max-width:1400px; margin:0 auto; }
  `]
})
export class CustomerDashboardComponent {
  constructor(private auth: AuthService, private cart: CartService) {}
  get userName() { return this.auth.currentUser?.fullName || ''; }
  get cartCount() { return this.cart.count; }
  logout() { this.auth.logout(); }
}
