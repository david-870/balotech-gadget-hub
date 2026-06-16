# BaloTech Gadget Hub

A full-stack React + Node.js e-commerce storefront for a physical gadget store in Nigeria. Customers browse products, add to cart, and checkout via WhatsApp. The admin manages the catalogue from a mobile-friendly panel backed by a real API.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express 5 |
| Database | JSON file store (lowdb) |
| Auth | JWT + bcrypt PIN |
| Images | Multer uploads + legacy static images |

---

## Project Structure

```
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── components/     # Header, ProductCard, Cart, etc.
│       ├── pages/          # Home, CategoryPage, Admin
│       ├── context/        # Cart, Toast
│       └── api/            # API client
├── server/                 # Express API
│   ├── src/
│   │   ├── routes/         # products, auth
│   │   ├── db.js           # Database layer
│   │   └── seed.js         # Import from products.json
│   ├── data/               # db.json (generated)
│   └── uploads/            # Uploaded product images
├── Images/                 # Legacy product photos
└── products.json           # Seed data source
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Configure server

Copy `server/.env.example` to `server/.env` (or use the included `.env`):

```
PORT=3001
JWT_SECRET=balotech-change-me-in-production
ADMIN_PIN=7742329
CLIENT_URL=http://localhost:5173
```

### 3. Seed the database

```bash
npm run seed
```

### 4. Run development

```bash
npm run dev
```

- **Shop:** http://localhost:5173
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

Bookmark `http://localhost:5173/balotech-vault-x9k2` on your phone. Visiting `/admin` shows a 404 page. Change the gateway path and secret in `.env` before going live.

---

## Order History

When a customer taps **Checkout on WhatsApp**, the order is saved to the database first, then WhatsApp opens. In admin, open the **Order History** tab to view all orders and update status (Pending → Confirmed → Completed / Cancelled).

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
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
npm run build    # Builds React app to client/dist
npm start        # Starts server (serves API + React build)
```

The Express server automatically serves `client/dist` when it exists.

---

## Admin (Mobile)

Open your **secret admin URL** on your phone (not `/admin`):

- Edit name, price, condition, stock, and images
- Take photos or pick from gallery (uploaded to server)
- Add new products
- Delete sold products
- View **order history** and update order status
- Changes are saved to the database immediately — all customers see updates

---

## Legacy Static Site

The original HTML/CSS/JS files (`index.html`, `pages/`, `script.js`, etc.) are still in the repo but are **no longer the primary app**. The React + API stack replaces them.

---

## Author

Built by **David** for **BaloTech Gadget Hub**
