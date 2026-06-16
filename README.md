# BaloTech Gadget Hub

A full-stack React + Node.js e-commerce storefront for a physical gadget store in Nigeria. Customers browse products on a **Hot Deals homepage**, add to cart, and checkout via WhatsApp. The owner manages the catalogue from a **mobile-friendly admin panel** backed by a real API.

**Repository:** [github.com/david-870/balotech-gadget-hub](https://github.com/david-870/balotech-gadget-hub)

---

## Features

### Shop (customers)

- **Homepage with Hot Deals** — `/` and `/hot-deals` show today’s best offers first
- **Category pages** — iPhones, Samsung, laptops, watches, audio, accessories, gaming, and more
- **Compact product galleries** — centered cover photo + thumbnail strip (tap for fullscreen lightbox)
- **Multi-photo products** — multiple angles per item
- **Cart + WhatsApp checkout** — orders saved to the API before WhatsApp opens
- **Mobile-first layout** — 2-column product grid on phones

### Admin (owner, iPhone-friendly)

- **Secret gateway URL** — admin is not linked from the shop; `/admin` returns 404
- **PIN login** with JWT session
- **Category tabs** — manage products by section, not endless scroll
- **Stock toggle** — mark items in/out of stock from the product list
- **Multi-photo editor** — take photos or pick from gallery, set cover image, up to 8 photos per product
- **Order history** — view checkout records and update status (Pending → Confirmed → Completed / Cancelled)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express 5 |
| Database | JSON file store (lowdb) |
| Auth | JWT + bcrypt PIN + gateway secret |
| Images | Multer uploads + legacy static images |
| Deploy | Render (Node web service) |

---

## Project Structure

```
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # Header, ProductCard, Cart, AdminImageGallery, etc.
│       ├── pages/          # Home, CategoryPage, Admin
│       ├── context/        # Cart, Toast
│       └── api/            # API client
├── server/                 # Express API
│   ├── src/
│   │   ├── routes/         # products, auth, orders
│   │   ├── db.js           # Database layer
│   │   └── seed.js         # Import from products.json
│   ├── data/               # db.json (generated)
│   └── uploads/            # Uploaded product images
├── scripts/
│   └── prepare-render-build.js  # Syncs admin gateway secret into client build
├── Images/                 # Legacy product photos
├── products.json           # Seed data source (106 products)
└── render.yaml             # Render deployment blueprint
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

On Windows PowerShell, if `npm` is blocked, use `npm.cmd` instead.

### 2. Configure environment

**Server** — copy `server/.env.example` to `server/.env`:

```
PORT=3001
JWT_SECRET=balotech-change-me-in-production
ADMIN_PIN=7742329
ADMIN_GATEWAY_PATH=balotech-vault-x9k2
ADMIN_GATEWAY_SECRET=bt-gate-7f3a91c4
CLIENT_URL=http://localhost:5173
```

**Client** — copy `client/.env.example` to `client/.env`:

```
VITE_ADMIN_GATEWAY_PATH=balotech-vault-x9k2
VITE_ADMIN_GATEWAY_SECRET=bt-gate-7f3a91c4
```

`VITE_ADMIN_GATEWAY_SECRET` must match `ADMIN_GATEWAY_SECRET`.

### 3. Seed the database

```bash
npm run seed
```

### 4. Run development

```bash
npm run dev
```

- **Shop (Home + Hot Deals):** http://localhost:5173
- **API:** http://localhost:3001
- **Admin (secret):** http://localhost:5173/balotech-vault-x9k2

**Default admin PIN:** `7742329`

---

## Secret Admin Gateway

The admin panel is **not linked** from the shop. Only you know the URL.

| Setting | Default | Where |
|---------|---------|-------|
| Gateway path | `balotech-vault-x9k2` | `ADMIN_GATEWAY_PATH` / `VITE_ADMIN_GATEWAY_PATH` |
| Gateway secret | `bt-gate-7f3a91c4` | `ADMIN_GATEWAY_SECRET` / `VITE_ADMIN_GATEWAY_SECRET` |
| Admin PIN | `7742329` | `ADMIN_PIN` |

Bookmark `http://localhost:5173/balotech-vault-x9k2` on your phone. Visiting `/admin` shows a 404 page. Change the gateway path, secret, and PIN before going live.

---

## Order History

When a customer taps **Checkout on WhatsApp**, the order is saved to the database first, then WhatsApp opens. In admin, open the **Order History** tab to view all orders and update status.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | — | Health check (Render) |
| GET | `/api/products` | — | List all products |
| GET | `/api/products?category=iphones` | — | Filter by category |
| GET | `/api/products/:id` | — | Get one product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/orders` | — | Create order (on checkout) |
| GET | `/api/orders` | Admin | List order history |
| PATCH | `/api/orders/:id` | Admin | Update order status |
| POST | `/api/auth/login` | Gateway key | Login with PIN → JWT |
| POST | `/api/auth/change-pin` | Admin | Change admin PIN |
| POST | `/api/auth/upload` | Admin | Upload product image |
| GET | `/api/categories` | — | List categories |

---

## Production Build

```bash
npm run build    # Builds React app to client/dist (installs client dev deps for Vite)
npm start        # Starts server (serves API + React build)
```

The Express server automatically serves `client/dist` when it exists.

---

## Deploy on Render

Connect the GitHub repo and use these settings:

| Setting | Value |
|---------|--------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check** | `/api/health` |

### Environment variables

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Long random string (use Generate in Render) |
| `ADMIN_PIN` | Your admin PIN (e.g. `7742329`) |
| `ADMIN_GATEWAY_PATH` | `balotech-vault-x9k2` |
| `ADMIN_GATEWAY_SECRET` | Long random secret (use Generate in Render) |

Do **not** set `VITE_*` variables on Render — `scripts/prepare-render-build.js` copies the gateway secret into the client build automatically during deploy.

**Live URLs after deploy:**

- Shop: `https://YOUR-APP.onrender.com/`
- Admin: `https://YOUR-APP.onrender.com/balotech-vault-x9k2`

**Note:** On Render’s free plan, `server/data/` and `server/uploads/` are ephemeral — product edits and uploaded photos may reset on redeploy. For production persistence, add a Render persistent disk or move to a hosted database.

---

## Admin (Mobile)

Open your **secret admin URL** on your phone (not `/admin`):

- Edit name, price, condition, stock, and images
- Take photos or pick from gallery (uploaded to server)
- Set cover photo and add up to 8 angles per product
- Add new products and delete sold items
- Browse products by category tab
- View **order history** and update order status
- Changes save to the database immediately — all customers see updates

---

## Legacy Static Site

The original HTML/CSS/JS files (`index.html`, `pages/`, `script.js`, etc.) are still in the repo but are **no longer the primary app**. The React + API stack replaces them.

---

## Author

Built by **David** for **BaloTech Gadget Hub**
