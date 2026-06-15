import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, Product } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="detail-container" *ngIf="product">
      <div class="product-header">
        <img [src]="product.imageUrl" [alt]="product.title" class="product-img">
        <div class="product-info">
          <span class="category-tag">{{product.category | titlecase}}</span>
          <h1>{{product.title}}</h1>
          <div class="rating-row">
            <span>⭐ {{product.rating?.toFixed(1)}} ({{product.ratingCount}} reviews)</span>
            <span class="seller">Sold by: {{product.sellerName}}</span>
          </div>
          <p class="description">{{product.description}}</p>
          <div class="price-row">
            <span class="price">${{product.price | number:'1.2-2'}}</span>
            <span class="stock" [class.low]="product.stock < 10">{{product.stock}} in stock</span>
          </div>
          <div class="qty-row">
            <label>Qty:</label>
            <input type="number" [(ngModel)]="qty" min="1" [max]="product.stock">
          </div>
          <button (click)="addToCart()" [disabled]="product.stock === 0" class="btn-cart">
            🛒 Add to Cart
          </button>
          <div class="added-msg" *ngIf="addedMsg">{{addedMsg}}</div>
        </div>
      </div>

      <div class="reviews-section">
        <h2>Customer Reviews</h2>
        <div class="review-form">
          <h3>Write a Review</h3>
          <form [formGroup]="reviewForm" (ngSubmit)="submitReview()">
            <select formControlName="rating" class="rating-select">
              <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
              <option value="4">⭐⭐⭐⭐ Good</option>
              <option value="3">⭐⭐⭐ Average</option>
              <option value="2">⭐⭐ Poor</option>
              <option value="1">⭐ Terrible</option>
            </select>
            <textarea formControlName="comment" placeholder="Share your experience..." class="review-textarea"></textarea>
            <button type="submit" [disabled]="reviewForm.invalid" class="btn-review">Submit Review</button>
          </form>
          <div class="review-success" *ngIf="reviewSuccess">Review submitted!</div>
          <div class="review-error" *ngIf="reviewError">{{reviewError}}</div>
        </div>
        <div class="reviews-list">
          <div class="review-item" *ngFor="let review of reviews">
            <div class="review-header">
              <strong>{{review.customerName}}</strong>
              <span class="stars">{{'⭐'.repeat(review.rating)}}</span>
              <span class="review-date">{{review.createdAt | date:'mediumDate'}}</span>
            </div>
            <p>{{review.comment}}</p>
          </div>
          <div class="no-reviews" *ngIf="reviews.length === 0">No reviews yet. Be the first!</div>
        </div>
      </div>
    </div>
    <div class="loading" *ngIf="!product">Loading...</div>
  `,
  styles: [`
    .detail-container { max-width:1000px; margin:0 auto; }
    .product-header { display:grid; grid-template-columns:1fr 1fr; gap:48px; background:#fff; border-radius:16px; padding:40px; margin-bottom:32px; box-shadow:0 2px 12px rgba(0,0,0,.06); }
    .product-img { width:100%; max-height:380px; object-fit:contain; border-radius:12px; background:#fafafa; padding:16px; box-sizing:border-box; }
    .category-tag { background:#f0f0ff; color:#667eea; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
    h1 { font-size:22px; color:#1a1a2e; margin:12px 0; line-height:1.4; }
    .rating-row { display:flex; gap:16px; font-size:14px; color:#666; margin-bottom:12px; }
    .description { color:#555; font-size:14px; line-height:1.7; margin-bottom:20px; }
    .price-row { display:flex; align-items:center; gap:20px; margin-bottom:16px; }
    .price { font-size:32px; font-weight:700; color:#1a1a2e; }
    .stock { font-size:14px; color:#27ae60; font-weight:500; }
    .stock.low { color:#e74c3c; }
    .qty-row { display:flex; align-items:center; gap:12px; margin-bottom:16px; font-size:14px; }
    .qty-row input { width:80px; padding:8px; border:2px solid #e8e8e8; border-radius:8px; font-size:14px; text-align:center; }
    .btn-cart { padding:14px 32px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; border:none; border-radius:10px; font-size:16px; font-weight:600; cursor:pointer; width:100%; }
    .btn-cart:disabled { background:#ccc; cursor:not-allowed; }
    .added-msg { margin-top:10px; text-align:center; color:#27ae60; font-weight:500; }
    .reviews-section { background:#fff; border-radius:16px; padding:32px; box-shadow:0 2px 12px rgba(0,0,0,.06); }
    .reviews-section h2 { margin-bottom:24px; color:#1a1a2e; }
    .review-form { background:#f8f9fa; padding:24px; border-radius:12px; margin-bottom:32px; }
    .review-form h3 { margin:0 0 16px; font-size:16px; color:#1a1a2e; }
    .rating-select, .review-textarea { width:100%; padding:10px 14px; border:2px solid #e8e8e8; border-radius:8px; font-size:14px; box-sizing:border-box; margin-bottom:12px; outline:none; }
    .review-textarea { min-height:100px; resize:vertical; font-family:inherit; }
    .btn-review { padding:10px 24px; background:#667eea; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:14px; font-weight:600; }
    .btn-review:disabled { background:#ccc; }
    .review-success { color:#27ae60; margin-top:10px; font-size:14px; }
    .review-error { color:#e74c3c; margin-top:10px; font-size:14px; }
    .review-item { padding:16px 0; border-bottom:1px solid #f0f0f0; }
    .review-header { display:flex; gap:12px; align-items:center; margin-bottom:8px; }
    .review-date { color:#999; font-size:12px; margin-left:auto; }
    .review-item p { color:#555; font-size:14px; margin:0; }
    .no-reviews { color:#999; text-align:center; padding:24px; }
    .loading { text-align:center; padding:60px; color:#999; }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  reviews: any[] = [];
  qty = 1;
  addedMsg = '';
  reviewForm: FormGroup;
  reviewSuccess = false;
  reviewError = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cart: CartService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.reviewForm = this.fb.group({ rating: [5], comment: ['', Validators.required] });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getOne(id).subscribe(p => this.product = p);
    this.productService.getReviews(id).subscribe(r => this.reviews = r);
  }

  addToCart() {
    if (this.product) {
      this.cart.addToCart(this.product, this.qty);
      this.addedMsg = `${this.qty} item(s) added to cart!`;
      setTimeout(() => this.addedMsg = '', 3000);
    }
  }

  submitReview() {
    if (!this.product) return;
    const data = { productId: this.product.id, ...this.reviewForm.value, rating: Number(this.reviewForm.value.rating) };
    this.http.post(`${environment.apiUrl}/customer/reviews`, data).subscribe({
      next: (r: any) => { this.reviews.unshift(r); this.reviewSuccess = true; this.reviewForm.reset({ rating: 5 }); },
      error: err => this.reviewError = err.error || 'Could not submit review'
    });
  }
}
