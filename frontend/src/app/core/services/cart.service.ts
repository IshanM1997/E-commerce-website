import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './product.service';

export interface CartItem { product: Product; quantity: number; }

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  get items(): CartItem[] { return this.cartSubject.value; }
  get count(): number { return this.items.reduce((s, i) => s + i.quantity, 0); }
  get total(): number { return this.items.reduce((s, i) => s + i.product.price * i.quantity, 0); }

  addToCart(product: Product, qty = 1): void {
    const items = [...this.items];
    const idx = items.findIndex(i => i.product.id === product.id);
    if (idx > -1) items[idx].quantity += qty;
    else items.push({ product, quantity: qty });
    this.cartSubject.next(items);
  }

  removeItem(productId: number): void {
    this.cartSubject.next(this.items.filter(i => i.product.id !== productId));
  }

  updateQty(productId: number, qty: number): void {
    const items = this.items.map(i => i.product.id === productId ? {...i, quantity: qty} : i);
    this.cartSubject.next(items.filter(i => i.quantity > 0));
  }

  clear(): void { this.cartSubject.next([]); }
}
