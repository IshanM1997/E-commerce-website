[README.md](https://github.com/user-attachments/files/28943902/README.md)
# 🛒 ShopSphere — Full-Stack E-Commerce Platform

A production-ready e-commerce application with **Angular 17** frontend, **Spring Boot 3** backend, and **MySQL** database. Integrates the free [FakeStoreAPI](https://fakestoreapi.com) to auto-populate products.

---

## 📁 Project Structure

```
ecommerce/
├── backend/               ← Spring Boot (Java 17)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/ecommerce/
│       │   ├── config/          SecurityConfig, AppStartupRunner
│       │   ├── controller/      AuthController, ProductController,
│       │   │                    OrderController, ReviewController, AdminController
│       │   ├── dto/             All request/response DTOs
│       │   ├── entity/          User, Product, Order, OrderItem, Review
│       │   ├── enums/           Role, OrderStatus
│       │   ├── repository/      JPA repositories
│       │   ├── security/        JWT filter, JwtUtil, CustomUserDetailsService
│       │   └── service/         AuthService, ProductService, OrderService,
│       │                        ReviewService, AdminService, ExternalProductSyncService
│       └── resources/
│           └── application.properties
│
└── frontend/              ← Angular 17 (Standalone components)
    └── src/app/
        ├── core/
        │   ├── guards/          AuthGuard (role-based)
        │   ├── interceptors/    AuthInterceptor (JWT injection)
        │   └── services/        AuthService, ProductService, OrderService,
        │                        AdminService, CartService
        └── features/
            ├── auth/            Login, Register
            ├── admin/           Admin Dashboard (Users, Products, Orders)
            ├── seller/          Seller Dashboard (List & Manage Products)
            └── customer/        Shop, Product Detail, Cart, Orders
```

---

## 🚀 Prerequisites

| Tool | Version |
|------|---------|
| Java JDK | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| Angular CLI | `npm install -g @angular/cli` |
| MySQL | 8.0+ |

---

## ⚙️ Setup & Run

### 1. MySQL Setup

```sql
-- Login to MySQL
mysql -u root -p

-- Create database (Spring Boot will create tables automatically)
CREATE DATABASE ecommerce_db;
EXIT;
```

### 2. Configure Backend

Edit `backend/src/main/resources/application.properties`:

```properties
# Update MySQL password
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 3. Start Spring Boot Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on → **http://localhost:8080**

**On startup, it automatically:**
- Creates a default **Admin** account
- Fetches **20 products** from FakeStoreAPI and saves them to MySQL
- Re-syncs products every 24 hours (midnight cron job)

> **Default Admin credentials:**
> - Email: `admin@ecommerce.com`
> - Password: `Admin@123`

### 4. Start Angular Frontend

```bash
cd frontend
npm install
ng serve
```

Frontend runs on → **http://localhost:4200**

---

## 👥 User Roles & Workflow

```
                    ┌─────────────────────────────┐
                    │         REGISTRATION         │
                    │  Customer / Seller registers  │
                    │  → Status: PENDING            │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │       ADMIN APPROVAL         │
                    │  Admin reviews pending users  │
                    │  → Approve or Reject          │
                    └──────────────┬──────────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           ▼                       ▼                       ▼
    ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
    │    ADMIN    │        │   SELLER    │        │  CUSTOMER   │
    ├─────────────┤        ├─────────────┤        ├─────────────┤
    │ Manage users│        │ List prods  │        │ Browse shop │
    │ Approve     │        │ Edit prods  │        │ Search/filt │
    │ Change roles│        │ Set stock   │        │ Add to cart │
    │ All products│        │             │        │ Place orders│
    │ All orders  │        │             │        │ Reviews     │
    │ Update order│        │             │        │ My orders   │
    └─────────────┘        └─────────────┘        └─────────────┘
```

---

## 🌐 API Endpoints

### Auth (Public)
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | Register as Customer or Seller |
| POST | `/api/auth/login` | Login (returns JWT token) |

### Products (Public - no auth needed)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/products/public/all` | All active products |
| GET | `/api/products/public/{id}` | Single product |
| GET | `/api/products/public/search?q=keyword` | Search |
| GET | `/api/products/public/categories` | All categories |
| GET | `/api/products/public/category/{cat}` | Filter by category |
| GET | `/api/products/public/{id}/reviews` | Product reviews |

### Customer (ROLE_CUSTOMER)
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/customer/orders` | Place an order |
| GET | `/api/customer/orders` | My orders |
| POST | `/api/customer/reviews` | Add a review |

### Seller (ROLE_SELLER)
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/seller/products` | List a product |
| GET | `/api/seller/products` | My products |
| PUT | `/api/seller/products/{id}` | Update product |

### Admin (ROLE_ADMIN)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/users/pending` | Pending approvals |
| PATCH | `/api/admin/users/{id}/approve` | Approve user |
| PATCH | `/api/admin/users/{id}/reject` | Revoke access |
| PATCH | `/api/admin/users/{id}/role` | Change role |
| DELETE | `/api/admin/users/{id}` | Delete user |
| GET | `/api/admin/products` | All products |
| PATCH | `/api/admin/products/{id}/toggle` | Show/hide product |
| GET | `/api/admin/orders` | All orders |
| PATCH | `/api/admin/orders/{id}/status` | Update order status |

---

## 🔄 External API Integration (FakeStoreAPI)

Products are automatically fetched from **https://fakestoreapi.com/products** (free, no API key).

- **On startup:** All 20 FakeStore products are saved to MySQL (no duplicates via `externalId` check)
- **Every 24 hours:** Cron job runs at midnight to sync new products
- Products fetched include: title, description, price, category, image URL, rating
- External products are marked with `externalProduct = true` in the database

---

## 🗄️ Database Schema (Auto-created by Hibernate)

```
users           → id, email, password, fullName, phone, role, enabled, approved
products        → id, title, description, price, category, imageUrl, rating,
                  ratingCount, stock, externalProduct, externalId, seller_id, active
orders          → id, customer_id, status, totalAmount, shippingAddress
order_items     → id, order_id, product_id, quantity, priceAtPurchase
reviews         → id, product_id, customer_id, comment, rating
```

---

## 🔐 Security

- **JWT Authentication** with `HS256` algorithm
- Tokens expire after **24 hours**
- Passwords hashed with **BCrypt**
- **Role-based access control** on every endpoint:
  - `@PreAuthorize` / `hasRole()` in Security config
  - Angular `AuthGuard` with route-level role checks
- New users start **disabled** until Admin approves them

---

## 🎨 Frontend Features

- **Login / Register** with role selection
- **Customer portal:** browse, search, filter by category, cart, checkout, orders, star reviews
- **Seller portal:** list products, edit, track stock
- **Admin panel:** approve/reject users, change roles, show/hide products, update order status
- Responsive design, gradient UI, real-time cart badge

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17 (Standalone Components) |
| Backend | Spring Boot 3.2, Spring Security, Spring Data JPA |
| Database | MySQL 8 |
| Auth | JWT (jjwt 0.11) |
| External API | FakeStoreAPI (free, no key) |
| Build | Maven (backend), Angular CLI (frontend) |
