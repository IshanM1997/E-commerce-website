import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="cart-container">
      <h1>Your Cart</h1>
      <div class="cart-layout" *ngIf="items.length > 0">
        <div class="cart-items">
          <div class="cart-item" *ngFor="let item of items">
            <img [src]="item.product.imageUrl" [alt]="item.product.title" class="item-img">
            <div class="item-info">
              <h3>{{item.product.title}}</h3>
              <p class="item-price">${{item.product.price | number:'1.2-2'}}</p>
            </div>
            <div class="item-qty">
              <button (click)="updateQty(item, item.quantity - 1)">−</button>
              <span>{{item.quantity}}</span>
              <button (click)="updateQty(item, item.quantity + 1)">+</button>
            </div>
            <p class="item-total">${{(item.product.price * item.quantity) | number:'1.2-2'}}</p>
            <button class="remove-btn" (click)="remove(item.product.id)">✕</button>
          </div>
        </div>
        <div class="cart-summary">
          <h2>Order Summary</h2>
          <div class="summary-row"><span>Items ({{cartCount}})</span><span>${{total | number:'1.2-2'}}</span></div>
          <div class="summary-row"><span>Shipping</span><span>Free</span></div>
          <div class="summary-row total-row"><span>Total</span><span>${{total | number:'1.2-2'}}</span></div>
          <div class="field">
            <label>Shipping Address</label>
            <textarea [(ngModel)]="address" placeholder="Enter your full address..." class="address-input"></textarea>
          </div>
          <button (click)="checkout()" [disabled]="!address.trim() || loading" class="checkout-btn">
            {{loading ? 'Placing Order...' : 'Place Order'}}
          </button>
          <div class="success-msg" *ngIf="successMsg">{{successMsg}}</div>
          <div class="error-msg" *ngIf="errorMsg">{{errorMsg}}</div>
        </div>
      </div>
      <div class="empty-cart" *ngIf="items.length === 0">
        <span>🛒</span>
        <h2>Your cart is empty</h2>
        <a routerLink="/customer/products" class="shop-btn">Start Shopping</a>
      </div>
    </div>
  `,
  styles: [`
    .cart-container { max-width:1100px; margin:0 auto; }
    h1 { color:#1a1a2e; margin-bottom:24px; }
    .cart-layout { display:grid; grid-template-columns:1fr 360px; gap:32px; }
    .cart-items { display:flex; flex-direction:column; gap:16px; }
    .cart-item { display:flex; align-items:center; gap:16px; background:#fff; padding:20px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,.06); }
    .item-img { width:80px; height:80px; object-fit:contain; border-radius:8px; background:#fafafa; padding:8px; }
    .item-info { flex:1; }
    .item-info h3 { margin:0 0 4px; font-size:14px; color:#1a1a2e; }
    .item-price { margin:0; font-size:14px; color:#666; }
    .item-qty { display:flex; align-items:center; gap:12px; }
    .item-qty button { width:32px; height:32px; border:2px solid #e8e8e8; background:#fff; border-radius:8px; cursor:pointer; font-size:16px; }
    .item-qty span { font-weight:600; min-width:24px; text-align:center; }
    .item-total { font-size:16px; font-weight:700; color:#1a1a2e; min-width:80px; text-align:right; }
    .remove-btn { background:none; border:none; color:#e74c3c; cursor:pointer; font-size:18px; padding:4px; }
    .cart-summary { background:#fff; border-radius:16px; padding:28px; box-shadow:0 2px 12px rgba(0,0,0,.06); height:fit-content; }
    .cart-summary h2 { margin:0 0 20px; color:#1a1a2e; }
    .summary-row { display:flex; justify-content:space-between; padding:10px 0; font-size:15px; color:#555; border-bottom:1px solid #f5f5f5; }
    .total-row { font-weight:700; font-size:18px; color:#1a1a2e; border-bottom:none; }
    .field { margin:20px 0 16px; }
    .field label { display:block; font-size:13px; font-weight:600; color:#444; margin-bottom:8px; }
    .address-input { width:100%; padding:10px 14px; border:2px solid #e8e8e8; border-radius:8px; font-size:14px; box-sizing:border-box; min-height:80px; resize:vertical; font-family:inherit; outline:none; }
    .checkout-btn { width:100%; padding:14px; background:linear-gradient(135deg,#27ae60,#2ecc71); color:#fff; border:none; border-radius:10px; font-size:16px; font-weight:600; cursor:pointer; }
    .checkout-btn:disabled { background:#ccc; cursor:not-allowed; }
    .success-msg { margin-top:12px; color:#27ae60; text-align:center; font-size:14px; font-weight:500; }
    .error-msg { margin-top:12px; color:#e74c3c; text-align:center; font-size:14px; }
    .empty-cart { text-align:center; padding:80px; background:#fff; border-radius:16px; }
    .empty-cart span { font-size:64px; }
    .empty-cart h2 { color:#999; margin:16px 0 24px; }
    .shop-btn { padding:14px 32px; background:#667eea; color:#fff; border-radius:10px; text-decoration:none; font-weight:600; }
  `]
})
export class CartComponent {
  address = '';
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(private cart: CartService, private orderService: OrderService, private auth: AuthService) {}

  get items() { return this.cart.items; }
  get total() { return this.cart.total; }
  get cartCount() { return this.cart.count; }

  updateQty(item: CartItem, qty: number) {
    if (qty <= 0) this.cart.removeItem(item.product.id);
    else this.cart.updateQty(item.product.id, Math.min(qty, item.product.stock));
  }

  remove(id: number) { this.cart.removeItem(id); }

  checkout() {
    this.loading = true;
    const payload = {
      items: this.items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      shippingAddress: this.address
    };
    this.orderService.placeOrder(payload).subscribe({
      next: () => {
        this.cart.clear();
        this.loading = false;
        this.successMsg = '🎉 Order placed successfully! Check your orders page.';
      },
      error: err => { this.loading = false; this.errorMsg = err.error || 'Failed to place order'; }
    });
  }
}
