# SEAPEDIA

Fullstack multi-role marketplace — COMPFEST 18 Software Engineering Academy.

A marketplace platform where users can buy, sell, and deliver products with role-based dashboards, wallet payments, voucher/promo discounts, PPN 12% tax, delivery SLA enforcement, and admin monitoring.

**Repository**: [github.com/dpinlol/seapedia](https://github.com/dpinlol/seapedia) (public)

**Live Demo**: [seapedia-seven.vercel.app](https://seapedia-seven.vercel.app)
**API Docs (live)**: [seapedia-production-269b.up.railway.app/api-docs](https://seapedia-production-269b.up.railway.app/api-docs)

## Checklist

| Requirement | Status |
|-------------|--------|
| **Works on Any Machine** | ✅ Node.js 18+ only. PostgreSQL for production, SQLite for local dev. |
| **Repository Hosting** | ✅ Public on GitHub — [github.com/dpinlol/seapedia](https://github.com/dpinlol/seapedia) |
| **README** | ✅ This file — env vars, admin setup, setup steps, API docs, security, deployment |
| **API Documentation** | ✅ Swagger/OpenAPI 3.0 at `localhost:3001/api-docs` with annotated schemas for all 11 route groups |
| **Security Notes** | ✅ See [Security Measures](#security-measures) section below |
| **Git Commit History** | ✅ 10 step-by-step commits showing backend → auth → APIs → frontend → docs → security progression |
| **Deployment Link** | ✅ [seapedia-seven.vercel.app](https://seapedia-seven.vercel.app) — Railway (backend) + Vercel (frontend) |

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Node.js, Express, TypeScript, Prisma ORM, PostgreSQL / SQLite |
| Frontend | React, Vite, TypeScript, Tailwind CSS v4 |
| Auth | JWT (24h expiry), bcrypt, role-based access control, logout blacklist |
| API Docs | Swagger/OpenAPI (via swagger-jsdoc + swagger-ui-express) |
| Security | Helmet, Zod validation, XSS sanitization, no raw SQL |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+

### 1. Clone and install

```bash
git clone https://github.com/dpinlol/seapedia.git
cd seapedia
```

### 2. Backend setup

> **Note:** The schema defaults to PostgreSQL. For local dev without PostgreSQL, change the provider in `prisma/schema.prisma` from `"postgresql"` back to `"sqlite"` and set `DATABASE_URL="file:./dev.db"` in `.env`.

```bash
cd backend
npm install
npx prisma db push
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

**Local dev:**
1. Register a user via the UI
2. Open the database: `cd backend && npx prisma studio`
3. Find the user and change `roles` from `["BUYER"]` to `["ADMIN"]`

**Production (Railway):** Create a new migration or seed script that grants ADMIN role, or use `prisma db seed -- --admin <user-id>` after adding a custom seed script.

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

Swagger/OpenAPI is available at:
- **Local dev**: `http://localhost:3001/api-docs`
- **Live (production)**: [seapedia-production-269b.up.railway.app/api-docs](https://seapedia-production-269b.up.railway.app/api-docs)

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

## Git History

The project was built incrementally with 10 commits showing the full development progression:

```
3882f96 feat: initial backend setup with Prisma schema, migrations, and seed data
374b0fc feat: backend core — Express app, auth middleware, error handling, swagger config
ee7266f feat: auth — register, login, logout, switch-role, profile with JWT
16c2356 feat: product, store, review, wallet, address, cart APIs
ef4b54d feat: order, delivery, discount, admin APIs with full checkout flow
50ec619 feat: frontend setup — React, Vite, Tailwind, routing, auth store, API client
94f50a0 docs: README with setup, env vars, API docs, security; add .gitignore
18f2295 chore: add tsbuildinfo to gitignore
c20b6bf fix: security hardening — XSS sanitize for address/store, phone validation, delivery RBAC
dc47cbf docs: fix seed script name in README, add favicon
```

## Security Measures <a name="security-measures"></a>

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

### Option 1: Railway (backend) + Vercel (frontend) — recommended

#### Backend → Railway

1. Push the repo to GitHub (already done)
2. Create a [Railway](https://railway.app) account → **New Project** → **Deploy from GitHub repo** → select `seapedia`
3. Set the **Root Directory** to `backend`
4. Add a **PostgreSQL** database plugin — Railway gives you a `DATABASE_URL` connection string
5. Go to **Variables** and set:
   - `DATABASE_URL` — from the PostgreSQL plugin (starts with `postgresql://`)
   - `JWT_SECRET` — a strong random string
   - `JWT_EXPIRES_IN=24h`
   - `PORT=3001`
6. Open `backend/prisma/schema.prisma` and change `provider = "sqlite"` to `provider = "postgresql"`
7. Regenerate the Prisma client: `npx prisma generate`
8. In Railway, set **Start Command** to:

   ```bash
   npx prisma migrate deploy && npx prisma db seed && node dist/index.js
   ```

9. Railway deploys and gives you a `*.railway.app` URL (save this)

> **Note:** SQLite is not suitable for production with concurrent writes. The PostgreSQL switch is required for Railway.

#### Frontend → Vercel

1. Go to [Vercel](https://vercel.com) → **Add New Project** → Import `seapedia`
2. Set **Root Directory** to `frontend`
3. **Framework Preset**: Vite
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Add environment variable:
   - `VITE_API_URL=https://your-backend.railway.app/api`
7. Deploy

The frontend reads `VITE_API_URL` at build time. In dev it falls back to `/api` (Vite proxy).

### Option 2: Single VPS (keeps SQLite)

1. Get a $6/month VPS (DigitalOcean, Linode)
2. Install Node.js 18+
3. Clone repo, build and run backend on port 3001
4. Build frontend, serve with nginx reverse proxy to backend
5. Point your domain to the VPS IP

This is simpler if you want to keep SQLite and avoid the PostgreSQL migration.
