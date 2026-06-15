import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1>My Orders</h1>
      <div class="orders-list">
        <div class="order-card" *ngFor="let order of orders">
          <div class="order-header">
            <div>
              <span class="order-id">Order #{{order.id}}</span>
              <span class="order-date">{{order.createdAt | date:'medium'}}</span>
            </div>
            <span class="status-badge" [class]="'status-' + order.status.toLowerCase()">{{order.status}}</span>
          </div>
          <div class="order-items">
            <div class="order-item" *ngFor="let item of order.orderItems">
              <img [src]="item.productImage" [alt]="item.productTitle" class="item-img">
              <span class="item-name">{{item.productTitle}}</span>
              <span>x{{item.quantity}}</span>
              <span class="item-price">${{(item.priceAtPurchase * item.quantity) | number:'1.2-2'}}</span>
            </div>
          </div>
          <div class="order-footer">
            <span class="address">📍 {{order.shippingAddress}}</span>
            <span class="total">Total: <strong>${{order.totalAmount | number:'1.2-2'}}</strong></span>
          </div>
        </div>
      </div>
      <div class="empty" *ngIf="orders.length === 0 && !loading">No orders yet.</div>
    </div>
  `,
  styles: [`
    h1 { color:#1a1a2e; margin-bottom:24px; }
    .orders-list { display:flex; flex-direction:column; gap:20px; }
    .order-card { background:#fff; border-radius:16px; padding:24px; box-shadow:0 2px 10px rgba(0,0,0,.06); }
    .order-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
    .order-id { font-weight:700; font-size:16px; color:#1a1a2e; display:block; }
    .order-date { font-size:12px; color:#999; }
    .status-badge { padding:6px 14px; border-radius:20px; font-size:12px; font-weight:600; text-transform:uppercase; }
    .status-pending { background:#fff3cd; color:#856404; }
    .status-confirmed { background:#d1ecf1; color:#0c5460; }
    .status-shipped { background:#cce5ff; color:#004085; }
    .status-delivered { background:#d4edda; color:#155724; }
    .status-cancelled { background:#f8d7da; color:#721c24; }
    .order-items { border-top:1px solid #f5f5f5; padding-top:16px; display:flex; flex-direction:column; gap:10px; }
    .order-item { display:flex; align-items:center; gap:12px; font-size:14px; color:#444; }
    .item-img { width:40px; height:40px; object-fit:contain; border-radius:6px; background:#fafafa; padding:4px; }
    .item-name { flex:1; }
    .item-price { font-weight:600; color:#1a1a2e; }
    .order-footer { display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:16px; border-top:1px solid #f5f5f5; font-size:13px; }
    .address { color:#666; }
    .total { font-size:16px; color:#1a1a2e; }
    .empty { text-align:center; padding:60px; color:#999; }
  `]
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  loading = false;
  constructor(private orderService: OrderService) {}
  ngOnInit() { this.loading = true; this.orderService.getMyOrders().subscribe({ next: o => { this.orders = o; this.loading = false; }, error: () => this.loading = false }); }
}
