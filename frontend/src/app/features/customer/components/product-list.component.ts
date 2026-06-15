import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div>
      <div class="toolbar">
        <input [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" placeholder="🔍 Search products..." class="search-input">
        <select [(ngModel)]="selectedCategory" (ngModelChange)="onCategoryChange()" class="cat-select">
          <option value="">All Categories</option>
          <option *ngFor="let cat of categories" [value]="cat">{{cat | titlecase}}</option>
        </select>
      </div>
      <div class="product-grid">
        <div class="product-card" *ngFor="let product of products">
          <img [src]="product.imageUrl" [alt]="product.title" class="product-img">
          <div class="product-info">
            <span class="category-tag">{{product.category | titlecase}}</span>
            <h3 class="product-title">{{product.title}}</h3>
            <div class="product-meta">
              <span class="rating">⭐ {{product.rating?.toFixed(1) || 'N/A'}}</span>
              <span class="stock" [class.low]="product.stock < 10">{{product.stock > 0 ? product.stock + ' left' : 'Out of stock'}}</span>
            </div>
            <div class="product-footer">
              <span class="price">${{product.price | number:'1.2-2'}}</span>
              <div class="actions">
                <a [routerLink]="['/customer/products', product.id]" class="btn-outline">View</a>
                <button (click)="addToCart(product)" [disabled]="product.stock === 0" class="btn-add">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="empty" *ngIf="products.length === 0 && !loading">No products found.</div>
      <div class="loading" *ngIf="loading">Loading products...</div>
    </div>
  `,
  styles: [`
    .toolbar { display:flex; gap:12px; margin-bottom:24px; }
    .search-input { flex:1; padding:12px 16px; border:2px solid #e8e8e8; border-radius:10px; font-size:14px; outline:none; }
    .search-input:focus { border-color:#667eea; }
    .cat-select { padding:12px 16px; border:2px solid #e8e8e8; border-radius:10px; font-size:14px; outline:none; cursor:pointer; }
    .product-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:24px; }
    .product-card { background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.06); transition:.2s; }
    .product-card:hover { transform:translateY(-4px); box-shadow:0 8px 24px rgba(0,0,0,.12); }
    .product-img { width:100%; height:200px; object-fit:contain; padding:16px; box-sizing:border-box; background:#fafafa; }
    .product-info { padding:16px; }
    .category-tag { background:#f0f0ff; color:#667eea; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; text-transform:uppercase; }
    .product-title { margin:10px 0 8px; font-size:14px; color:#1a1a2e; font-weight:600; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .product-meta { display:flex; justify-content:space-between; margin-bottom:12px; font-size:12px; }
    .rating { color:#f39c12; }
    .stock { color:#27ae60; font-weight:500; }
    .stock.low { color:#e74c3c; }
    .product-footer { display:flex; justify-content:space-between; align-items:center; }
    .price { font-size:20px; font-weight:700; color:#1a1a2e; }
    .actions { display:flex; gap:6px; }
    .btn-outline { padding:7px 12px; border:2px solid #667eea; color:#667eea; border-radius:8px; text-decoration:none; font-size:12px; font-weight:600; }
    .btn-add { padding:7px 12px; background:#667eea; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:12px; font-weight:600; }
    .btn-add:disabled { background:#ccc; cursor:not-allowed; }
    .empty, .loading { text-align:center; padding:60px; color:#999; font-size:16px; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  searchQuery = '';
  selectedCategory = '';
  loading = false;
  private searchTimer: any;

  constructor(private productService: ProductService, private cart: CartService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAll().subscribe({ next: p => { this.products = p; this.loading = false; }, error: () => this.loading = false });
  }

  loadCategories() {
    this.productService.getCategories().subscribe(c => this.categories = c);
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      if (this.searchQuery.trim().length > 1) {
        this.productService.search(this.searchQuery).subscribe(p => this.products = p);
      } else {
        this.loadProducts();
      }
    }, 400);
  }

  onCategoryChange() {
    if (this.selectedCategory) {
      this.productService.getByCategory(this.selectedCategory).subscribe(p => this.products = p);
    } else {
      this.loadProducts();
    }
  }

  addToCart(product: Product) {
    this.cart.addToCart(product);
  }
}
