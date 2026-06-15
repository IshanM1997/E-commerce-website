import { Routes } from '@angular/router';
import { CustomerDashboardComponent } from './components/customer-dashboard.component';
import { ProductListComponent } from './components/product-list.component';
import { ProductDetailComponent } from './components/product-detail.component';
import { CartComponent } from './components/cart.component';
import { OrdersComponent } from './components/orders.component';

export const CUSTOMER_ROUTES: Routes = [
  { path: '', component: CustomerDashboardComponent, children: [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'products', component: ProductListComponent },
    { path: 'products/:id', component: ProductDetailComponent },
    { path: 'cart', component: CartComponent },
    { path: 'orders', component: OrdersComponent }
  ]}
];
