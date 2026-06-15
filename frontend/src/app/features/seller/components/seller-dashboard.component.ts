import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, Product } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="seller-layout">
      <nav class="navbar">
        <div class="nav-brand">🏪 Seller Portal</div>
        <span class="seller-name">👤 {{userName}}</span>
        <button (click)="logout()" class="logout-btn">Logout</button>
      </nav>
      <div class="content">
        <div class="dashboard-grid">
          <!-- Add Product Form -->
          <div class="card form-card">
            <h2>{{editingId ? 'Edit Product' : 'List New Product'}}</h2>
            <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
              <div class="field"><label>Title</label><input formControlName="title" placeholder="Product name"></div>
              <div class="field"><label>Description</label><textarea formControlName="description" placeholder="Product description..."></textarea></div>
              <div class="field-row">
                <div class="field"><label>Price ($)</label><input type="number" formControlName="price" placeholder="0.00"></div>
                <div class="field"><label>Stock</label><input type="number" formControlName="stock" placeholder="0"></div>
              </div>
              <div class="field"><label>Category</label><input formControlName="category" placeholder="e.g. electronics"></div>
              <div class="field"><label>Image URL</label><input formControlName="imageUrl" placeholder="https://..."></div>
              <div class="form-actions">
                <button type="submit" [disabled]="productForm.invalid || loading" class="btn-submit">
                  {{loading ? 'Saving...' : (editingId ? 'Update Product' : 'List Product')}}
                </button>
                <button type="button" *ngIf="editingId" (click)="cancelEdit()" class="btn-cancel">Cancel</button>
              </div>
              <div class="success-msg" *ngIf="successMsg">{{successMsg}}</div>
            </form>
          </div>

          <!-- My Products -->
          <div class="card products-card">
            <h2>My Products ({{myProducts.length}})</h2>
            <div class="products-list">
              <div class="product-item" *ngFor="let product of myProducts">
                <img [src]="product.imageUrl" [alt]="product.title" class="thumb">
                <div class="product-meta">
                  <h4>{{product.title}}</h4>
                  <span class="cat">{{product.category | titlecase}}</span>
                  <div class="stats">
                    <span class="price">${{product.price}}</span>
                    <span class="stock-badge" [class.low]="product.stock < 10">Stock: {{product.stock}}</span>
                  </div>
                </div>
                <button (click)="editProduct(product)" class="btn-edit">Edit</button>
              </div>
              <div class="empty" *ngIf="myProducts.length === 0">No products listed yet.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seller-layout { min-height:100vh; background:#f8f9fa; }
    .navbar { background:#fff; padding:0 32px; height:64px; display:flex; align-items:center; gap:16px; box-shadow:0 2px 8px rgba(0,0,0,.08); }
    .nav-brand { font-size:20px; font-weight:700; color:#667eea; flex:1; }
    .seller-name { color:#666; font-size:14px; }
    .logout-btn { padding:8px 16px; background:#667eea; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:13px; }
    .content { padding:32px; max-width:1300px; margin:0 auto; }
    .dashboard-grid { display:grid; grid-template-columns:1fr 1fr; gap:28px; }
    .card { background:#fff; border-radius:16px; padding:28px; box-shadow:0 2px 12px rgba(0,0,0,.06); }
    h2 { margin:0 0 24px; color:#1a1a2e; font-size:20px; }
    .field { margin-bottom:16px; }
    .field label { display:block; font-size:13px; font-weight:600; color:#444; margin-bottom:6px; }
    .field input, .field textarea { width:100%; padding:10px 14px; border:2px solid #e8e8e8; border-radius:8px; font-size:14px; box-sizing:border-box; outline:none; font-family:inherit; }
    .field textarea { min-height:90px; resize:vertical; }
    .field input:focus, .field textarea:focus { border-color:#667eea; }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .form-actions { display:flex; gap:12px; margin-top:8px; }
    .btn-submit { flex:1; padding:12px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; }
    .btn-cancel { padding:12px 20px; border:2px solid #e8e8e8; background:#fff; border-radius:8px; cursor:pointer; font-size:14px; }
    .btn-submit:disabled { background:#ccc; cursor:not-allowed; }
    .success-msg { margin-top:12px; color:#27ae60; font-size:14px; text-align:center; }
    .products-list { display:flex; flex-direction:column; gap:12px; max-height:550px; overflow-y:auto; }
    .product-item { display:flex; align-items:center; gap:12px; padding:12px; background:#f8f9fa; border-radius:10px; }
    .thumb { width:56px; height:56px; object-fit:contain; border-radius:8px; background:#fff; padding:6px; }
    .product-meta { flex:1; }
    .product-meta h4 { margin:0 0 4px; font-size:13px; color:#1a1a2e; }
    .cat { font-size:11px; color:#999; text-transform:uppercase; }
    .stats { display:flex; gap:10px; margin-top:4px; }
    .price { font-weight:700; color:#1a1a2e; font-size:14px; }
    .stock-badge { font-size:12px; color:#27ae60; }
    .stock-badge.low { color:#e74c3c; }
    .btn-edit { padding:6px 14px; background:#667eea; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600; }
    .empty { text-align:center; color:#999; padding:32px; }
  `]
})
export class SellerDashboardComponent implements OnInit {
  productForm: FormGroup;
  myProducts: Product[] = [];
  loading = false;
  successMsg = '';
  editingId: number | null = null;

  constructor(private fb: FormBuilder, private productService: ProductService, private auth: AuthService) {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      imageUrl: ['']
    });
  }

  get userName() { return this.auth.currentUser?.fullName || ''; }
  logout() { this.auth.logout(); }

  ngOnInit() { this.loadMyProducts(); }

  loadMyProducts() {
    this.productService.getMyProducts().subscribe(p => this.myProducts = p);
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    this.loading = true;
    const obs = this.editingId
      ? this.productService.updateProduct(this.editingId, this.productForm.value)
      : this.productService.listProduct(this.productForm.value);
    obs.subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = this.editingId ? 'Product updated!' : 'Product listed successfully!';
        this.productForm.reset();
        this.editingId = null;
        this.loadMyProducts();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => this.loading = false
    });
  }

  editProduct(p: Product) {
    this.editingId = p.id;
    this.productForm.patchValue({ title: p.title, description: p.description, price: p.price, stock: p.stock, category: p.category, imageUrl: p.imageUrl });
  }

  cancelEdit() { this.editingId = null; this.productForm.reset(); }
}
