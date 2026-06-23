# SEAPEDIA

Fullstack multi-role marketplace — COMPFEST 18 Software Engineering Academy.

A marketplace platform where users can buy, sell, and deliver products with role-based dashboards, wallet payments, voucher/promo discounts, PPN 12% tax, delivery SLA enforcement, and admin monitoring.

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js, Express, TypeScript, Prisma ORM, SQLite |
| Frontend | React, Vite, TypeScript, Tailwind CSS v4 |
| Auth | JWT (24h expiry), bcrypt, role-based access control, logout blacklist |
| API Docs | Swagger/OpenAPI (via swagger-jsdoc + swagger-ui-express) |
| Security | Helmet, Zod validation, XSS sanitization, no raw SQL |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+

### 1. Clone and install

```bash
git clone <repo-url>
cd seapedia
```

### 2. Backend setup

```bash
cd backend
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
# → http://localhost:3001
```

### 3. Frontend setup (separate terminal)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 4. Open the app

Visit **http://localhost:5173** and log in with one of the demo accounts below.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite database file path |
| `JWT_SECRET` | `seapedia-jwt-secret-change-in-production` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | `24h` | Token expiry duration |
| `PORT` | `3001` | Backend server port |

The `.env` file is pre-configured for local development. For production, change `JWT_SECRET` to a strong random value.

### Frontend

No environment variables needed. The Vite dev server proxies `/api/*` requests to `http://localhost:3001` (configured in `vite.config.ts`).

## Demo Accounts

All accounts use password: `password123`

| Username | Roles | Active Role |
|----------|-------|-------------|
| `admin` | ADMIN | ADMIN |
| `seller` | SELLER + BUYER | SELLER |
| `buyer` | BUYER | BUYER |
| `driver` | DRIVER | DRIVER |

Seed data includes:
- 5 products in "Toko Serba Ada" (Kaos Polos, Celana Jeans, Topi Baseball, Tas Ransel, Sepatu Sneakers)
- 3 application reviews
- Voucher `DISKON10` (10% off, min Rp 50,000)
- Promo `MERDEKA` (Rp 20,000 off, min Rp 100,000)
- 3 demo orders in different statuses

### Creating an admin account

Admin accounts cannot be created via the public registration form (which only allows BUYER, SELLER, DRIVER roles). To create an admin:

1. Register a user via the UI
2. Open the database: `cd backend && npx prisma studio`
3. Find the user and change `roles` from `["BUYER"]` to `["ADMIN"]`
4. Alternatively, modify the seed file (`prisma/seed.ts`) and run `npm run db:seed`

## Demo Flow

1. **Admin** → login as `admin` → dashboard → create a voucher → Overdue → simulate 5 days → process overdue orders
2. **Seller** → login as `seller` → manage store/products → view orders → process an order (`SEDANG_DIKEMAS → MENUNGGU_PENGIRIM`)
3. **Buyer** → login as `buyer` → top up wallet → browse products → add to cart → checkout with discount code `DISKON10`
4. **Driver** → login as `driver` → Find Jobs → take a delivery → complete it → check earnings
5. **Admin** → view all platform stats, vouchers, promos, overdue management

## Multi-Role Flow

Users with multiple roles (e.g. `seller` has SELLER + BUYER) select an active role after login. The JWT stores the active role; the `requireRole` middleware validates it per route.

### Switching roles

1. Login → if multiple roles, you're redirected to `/role-select`
2. Pick a role → you're taken to that role's dashboard
3. Use the role switcher in the top navbar (dashboard only) to change without logging out

## API Documentation

Swagger/OpenAPI is available at **http://localhost:3001/api-docs** after starting the backend.

| Route Group | Methods | Auth | Description |
|-------------|---------|------|-------------|
| `/api/auth/*` | POST | — | register, login, logout, switch-role, profile |
| `/api/products/*` | GET/POST/PUT/DELETE | SELLER | product CRUD, public listing with search |
| `/api/stores/*` | GET/POST/PUT | SELLER | store management |
| `/api/reviews/*` | GET/POST | — | application reviews |
| `/api/wallet/*` | GET/POST | BUYER | top-up, balance, transactions |
| `/api/addresses/*` | GET/POST/PUT/DELETE | BUYER | shipping address management |
| `/api/cart/*` | GET/POST/PUT/DELETE | BUYER | cart with single-store enforcement |
| `/api/orders/*` | GET/POST | BUYER/SELLER | checkout, order lists, detail with timeline |
| `/api/discounts/*` | GET/POST | ADMIN | vouchers and promos CRUD |
| `/api/delivery/*` | GET/POST | DRIVER | find jobs, take, complete, earnings |
| `/api/admin/*` | GET/POST | ADMIN | monitoring, users, overdue, time simulation |

## Cart & Checkout

### Single-Store Rule

The cart enforces that all items belong to the **same store**. If you try to add a product from a different store, the API returns a `400` error: `"Cart already contains products from another store. Clear cart first."`

This is visible in the cart UI — the store name is displayed at the top with a "single-store checkout" badge.

### Checkout Flow

1. Add items to cart (all must be from the same store)
2. Go to cart → "Proceed to Checkout"
3. Select delivery method:
   - **Instant** (Rp 25,000) — estimated 1-3 hours
   - **Next Day** (Rp 10,000) — delivered next day
   - **Regular** (Rp 5,000) — 3-5 days
4. (Optional) Enter voucher and promo codes
5. Review the checkout summary (subtotal, delivery fee, PPN 12%, discounts)
6. Confirm → wallet is charged, stock is reduced, order is created

### PPN 12% Calculation

PPN (Pajak Pertambahan Nilai) is calculated as **12% of the discounted subtotal**:

```
PPN = (subtotal - discountAmount) × 0.12
```

The tax base is `subtotal - discountAmount`, not the raw subtotal. If no discount is applied, PPN = `subtotal × 0.12`.

### Order Lifecycle

```
SEDANG_DIKEMAS       — order created, awaiting seller action
    ↓ (seller: Process Order)
MENUNGGU_PENGIRIM    — packaged, awaiting driver
    ↓ (driver: Take Job)
SEDANG_DIKIRIM       — in transit
    ↓ (driver: Complete Job)
PESANAN_SELESAI      — delivered to buyer
    ↓ (admin: Process Overdue, optional)
DIKEMBALIKAN         — refunded (overdue SLA)
```

### Overdue SLA

| Delivery Method | SLA (days) |
|----------------|------------|
| Instant | 1 day |
| Next Day | 2 days |
| Regular | 5 days |

Admin can simulate time with `/api/admin/simulate-day` to test overdue processing.

## Architecture

### Roles

- **Admin** — platform monitoring, manage vouchers/promos, process overdue orders, time simulation
- **Buyer** — browse products, manage cart, checkout with wallet, track orders, spending reports
- **Seller** — manage store/products, process orders, income reports
- **Driver** — find available deliveries, take jobs, complete deliveries, earnings history

### User Flow

```
Visitor
  ├── / → Landing page (search, categories, reviews)
  ├── /products → Browse catalog (filter, sort)
  ├── /products/:id → Product detail
  ├── /reviews → Leave a review
  └── /register → Create account
          │
          ▼
        Login ───────────────── Multi-role?
          │                          │
          │ No                        │ Yes
          ▼                          ▼
    /{role}/dashboard         /role-select → Pick role
          │                          │
          │                          ▼
          │                   /{role}/dashboard
          │
          ├── BUYER ── /cart → /checkout → /orders → /wallet
          ├── SELLER ─ /store → /products → /orders → /income
          ├── DRIVER ─ /jobs → /history
          └── ADMIN ── /dashboard → /vouchers → /promos → /overdue
```

## Security Measures

- **SQL Injection**: prevented by Prisma ORM parameterized queries (no raw SQL anywhere in the codebase)
- **XSS**: React JSX auto-escapes user content; backend sanitizes user text input (review comments, product names/descriptions, store names) via `sanitize.ts` using a whitelist approach
- **Input Validation**: Zod schemas validate all API inputs — email format, phone numbers, rating bounds, price/stock ranges, delivery method enum, discount amounts
- **CSRF**: Stateless JWT auth (no cookie-based sessions); tokens are sent via `Authorization: Bearer` header
- **Token Revocation**: `POST /api/auth/logout` blacklists the JWT server-side in-memory; the blacklist is checked on every authenticated request via `authenticate` middleware
- **RBAC**: Backend `requireRole` middleware enforces permissions per route (ADMIN/SELLER/BUYER/DRIVER); frontend route guards are cosmetic only — all sensitive operations are protected server-side
- **HTTP Security**: Helmet middleware sets secure HTTP headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)
- **Audit Logging**: Morgan HTTP request logging in dev mode
- **Password Storage**: bcrypt with salt rounds (no plaintext passwords)

## Project Structure

```
seapedia/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # 15 models
│   │   ├── migrations/         # SQLite migrations
│   │   └── seed.ts             # Demo data
│   ├── src/
│   │   ├── config/             # DB + env config
│   │   ├── controllers/        # Route handlers by domain
│   │   ├── middleware/         # authenticate, optionalAuth, requireRole, errorHandler
│   │   ├── routes/             # Express routers with OpenAPI annotations
│   │   ├── utils/              # sanitize.ts, custom error classes
│   │   ├── index.ts            # App entry
│   │   └── swagger.ts          # OpenAPI config
│   └── .env                    # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Reusable (Button, Card, Input, Badge, Modal, etc.)
│   │   │   └── layout/        # Navbar, Footer, DashboardLayout
│   │   ├── pages/
│   │   │   ├── admin/          # Dashboard, Vouchers, Promos, Overdue
│   │   │   ├── buyer/          # Cart, Checkout, Orders, Wallet, Addresses
│   │   │   ├── seller/         # Dashboard, Products, Orders, Reports
│   │   │   └── driver/         # Dashboard, FindJobs, History
│   │   ├── services/           # Axios API client
│   │   ├── store/              # Auth token/user helpers
│   │   └── App.tsx             # All routes
│   └── vite.config.ts          # Dev proxy to backend
├── .gitignore
└── README.md
```

## Deployment

### Building for production

```bash
# Backend
cd backend
npm run build          # compiles to dist/
npm start              # runs dist/index.js

# Frontend
cd frontend
npm run build          # outputs to dist/
# Serve dist/ with any static file server (nginx, etc.)
```

### Deploying to a cloud platform

1. Set the backend `JWT_SECRET` to a strong random value
2. Update `vite.config.ts` proxy target (or serve built frontend assets from the same origin)
3. Ensure the SQLite database file (`backend/prisma/dev.db`) is writable, or switch to PostgreSQL
4. Run migrations and seed on deploy

> **Note:** SQLite is not recommended for production with concurrent writes. For production, switch to PostgreSQL by changing `provider` in `schema.prisma` from `"sqlite"` to `"postgresql"` and updating `DATABASE_URL`.
