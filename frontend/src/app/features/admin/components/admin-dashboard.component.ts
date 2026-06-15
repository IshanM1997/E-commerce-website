import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ProductService, Product } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-layout">
      <nav class="navbar">
        <div class="nav-brand">⚙️ Admin Panel</div>
        <div class="nav-tabs">
          <button [class.active]="tab==='users'" (click)="tab='users'">Users <span class="badge" *ngIf="pendingCount > 0">{{pendingCount}}</span></button>
          <button [class.active]="tab==='products'" (click)="tab='products'; loadProducts()">Products</button>
          <button [class.active]="tab==='orders'" (click)="tab='orders'; loadOrders()">Orders</button>
        </div>
        <button (click)="logout()" class="logout-btn">Logout</button>
      </nav>

      <div class="content">

        <!-- USERS TAB -->
        <div *ngIf="tab === 'users'">
          <h2>User Management</h2>
          <div class="filter-row">
            <button [class.filter-active]="userFilter==='all'" (click)="userFilter='all'">All ({{allUsers.length}})</button>
            <button [class.filter-active]="userFilter==='pending'" (click)="userFilter='pending'">Pending ({{pendingCount}})</button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers">
                  <td>{{user.fullName}}</td>
                  <td>{{user.email}}</td>
                  <td>
                    <select [(ngModel)]="user.role" (change)="changeRole(user)" class="role-select">
                      <option>CUSTOMER</option><option>SELLER</option><option>ADMIN</option>
                    </select>
                  </td>
                  <td><span class="status-pill" [class.approved]="user.approved" [class.pending]="!user.approved">{{user.approved ? 'Active' : 'Pending'}}</span></td>
                  <td>{{user.createdAt | date:'mediumDate'}}</td>
                  <td class="actions-cell">
                    <button *ngIf="!user.approved" (click)="approve(user)" class="btn-approve">✓ Approve</button>
                    <button *ngIf="user.approved" (click)="reject(user)" class="btn-reject">✗ Revoke</button>
                    <button (click)="deleteUser(user)" class="btn-delete">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PRODUCTS TAB -->
        <div *ngIf="tab === 'products'">
          <h2>Product Management</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Image</th><th>Title</th><th>Category</th><th>Price</th><th>Stock</th><th>Seller</th><th>Source</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                <tr *ngFor="let p of products">
                  <td><img [src]="p.imageUrl" style="width:40px;height:40px;object-fit:contain;border-radius:6px;background:#fafafa;padding:4px;"></td>
                  <td class="product-title-cell">{{p.title}}</td>
                  <td>{{p.category | titlecase}}</td>
                  <td>${{p.price | number:'1.2-2'}}</td>
                  <td>{{p.stock}}</td>
                  <td>{{p.sellerName}}</td>
                  <td><span class="source-tag" [class.external]="p.externalProduct">{{p.externalProduct ? 'API' : 'Seller'}}</span></td>
                  <td><span class="status-pill" [class.approved]="p.active" [class.pending]="!p.active">{{p.active ? 'Active' : 'Hidden'}}</span></td>
                  <td><button (click)="toggleProduct(p)" class="btn-toggle">{{p.active ? 'Hide' : 'Show'}}</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ORDERS TAB -->
        <div *ngIf="tab === 'orders'">
          <h2>Order Management</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                <tr *ngFor="let order of orders">
                  <td>#{{order.id}}</td>
                  <td>{{order.customerName}}</td>
                  <td>{{order.orderItems?.length || 0}} item(s)</td>
                  <td>${{order.totalAmount | number:'1.2-2'}}</td>
                  <td>{{order.createdAt | date:'mediumDate'}}</td>
                  <td><span class="status-pill" [class]="'order-' + order.status.toLowerCase()">{{order.status}}</span></td>
                  <td>
                    <select (change)="updateOrderStatus(order, $any($event.target).value)" class="role-select">
                      <option value="">Change Status</option>
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .admin-layout { min-height:100vh; background:#f8f9fa; }
    .navbar { background:#1a1a2e; padding:0 32px; height:64px; display:flex; align-items:center; gap:24px; }
    .nav-brand { font-size:20px; font-weight:700; color:#fff; }
    .nav-tabs { display:flex; gap:4px; flex:1; }
    .nav-tabs button { padding:10px 20px; background:transparent; color:#aaa; border:none; border-radius:8px; cursor:pointer; font-size:14px; font-weight:500; position:relative; }
    .nav-tabs button.active { background:#667eea; color:#fff; }
    .nav-tabs button:hover:not(.active) { background:rgba(255,255,255,.1); color:#fff; }
    .badge { background:#e74c3c; color:#fff; border-radius:50%; padding:2px 6px; font-size:10px; margin-left:6px; }
    .filter-row { display:flex; gap:8px; margin-bottom:16px; }
    .filter-row button { padding:8px 16px; border:2px solid #e8e8e8; background:#fff; border-radius:8px; cursor:pointer; font-size:13px; font-weight:500; }
    .filter-row button.filter-active { border-color:#667eea; color:#667eea; background:#f0f0ff; }
    .logout-btn { padding:8px 16px; background:#e74c3c; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:13px; }
    .content { padding:32px; max-width:1400px; margin:0 auto; }
    h2 { color:#1a1a2e; margin-bottom:20px; }
    .table-wrap { background:#fff; border-radius:16px; box-shadow:0 2px 12px rgba(0,0,0,.06); overflow:auto; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    thead { background:#f8f9fa; }
    th { padding:14px 16px; text-align:left; font-weight:600; color:#444; border-bottom:2px solid #f0f0f0; white-space:nowrap; }
    td { padding:12px 16px; border-bottom:1px solid #f5f5f5; color:#555; vertical-align:middle; }
    tr:hover { background:#fafafa; }
    .product-title-cell { max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .status-pill { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; }
    .approved { background:#d4edda; color:#155724; }
    .pending { background:#f8d7da; color:#721c24; }
    .source-tag { padding:3px 8px; border-radius:12px; font-size:11px; font-weight:600; background:#e9ecef; color:#666; }
    .source-tag.external { background:#d0e8ff; color:#1a6ebf; }
    .order-pending { background:#fff3cd; color:#856404; }
    .order-confirmed { background:#d1ecf1; color:#0c5460; }
    .order-shipped { background:#cce5ff; color:#004085; }
    .order-delivered { background:#d4edda; color:#155724; }
    .order-cancelled { background:#f8d7da; color:#721c24; }
    .actions-cell { display:flex; gap:6px; }
    .btn-approve { padding:6px 12px; background:#27ae60; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; }
    .btn-reject { padding:6px 12px; background:#e67e22; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; }
    .btn-delete { padding:6px 12px; background:#e74c3c; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; }
    .btn-toggle { padding:6px 12px; background:#667eea; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; }
    .role-select { padding:6px 10px; border:1px solid #e8e8e8; border-radius:6px; font-size:12px; outline:none; cursor:pointer; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  tab = 'users';
  allUsers: any[] = [];
  products: Product[] = [];
  orders: any[] = [];
  userFilter = 'all';

  constructor(
    private adminService: AdminService,
    private productService: ProductService,
    private orderService: OrderService,
    private auth: AuthService
  ) {}

  get pendingCount() { return this.allUsers.filter(u => !u.approved).length; }
  get filteredUsers() { return this.userFilter === 'pending' ? this.allUsers.filter(u => !u.approved) : this.allUsers; }
  logout() { this.auth.logout(); }

  ngOnInit() { this.loadUsers(); }

  loadUsers() { this.adminService.getAllUsers().subscribe(u => this.allUsers = u); }
  loadProducts() { this.productService.getAllAdmin().subscribe(p => this.products = p); }
  loadOrders() { this.orderService.getAllOrders().subscribe(o => this.orders = o); }

  approve(user: any) { this.adminService.approveUser(user.id).subscribe(u => { Object.assign(user, u); }); }
  reject(user: any) { this.adminService.rejectUser(user.id).subscribe(u => { Object.assign(user, u); }); }
  changeRole(user: any) { this.adminService.changeRole(user.id, user.role).subscribe(); }
  deleteUser(user: any) {
    if (confirm('Delete this user?')) {
      this.adminService.deleteUser(user.id).subscribe(() => this.allUsers = this.allUsers.filter(u => u.id !== user.id));
    }
  }
  toggleProduct(p: Product) { this.productService.toggleProduct(p.id).subscribe(updated => Object.assign(p, updated)); }
  updateOrderStatus(order: any, status: string) {
    if (!status) return;
    this.orderService.updateOrderStatus(order.id, status).subscribe(o => order.status = o.status);
  }
}
