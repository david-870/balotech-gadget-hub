import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "db.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const defaultData = {
  products: [],
  orders: [],
  settings: {},
  nextId: 1,
  nextOrderId: 1,
};

const db = await JSONFilePreset(dbPath, defaultData);

export function rowToProduct(row) {
  if (!row) return null;
  let images = row.images;
  if (!Array.isArray(images)) {
    images = images ? [images] : [];
  }
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    condition: row.condition || "",
    category: row.category,
    stock: row.stock || "in",
    image: row.image || "",
    images,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getAllProducts(category) {
  await db.read();
  let products = db.data.products;
  if (category) {
    products = products.filter((p) => p.category === category);
  }
  return products.map(rowToProduct).sort((a, b) => a.id - b.id);
}

export async function getProductById(id) {
  await db.read();
  const row = db.data.products.find((p) => p.id === Number(id));
  return rowToProduct(row);
}

export async function createProduct(data) {
  await db.read();
  const now = new Date().toISOString();
  const product = {
    id: db.data.nextId++,
    name: data.name,
    price: data.price,
    condition: data.condition || "",
    category: data.category,
    stock: data.stock || "in",
    image: data.image || "",
    images: data.images || [],
    createdAt: now,
    updatedAt: now,
  };
  db.data.products.push(product);
  await db.write();
  return rowToProduct(product);
}

export async function updateProduct(id, data) {
  await db.read();
  const index = db.data.products.findIndex((p) => p.id === Number(id));
  if (index === -1) return null;

  const existing = db.data.products[index];
  const updated = {
    ...existing,
    name: data.name ?? existing.name,
    price: data.price ?? existing.price,
    condition: data.condition ?? existing.condition,
    category: data.category ?? existing.category,
    stock: data.stock ?? existing.stock,
    image: data.image ?? existing.image,
    images: data.images ?? existing.images,
    updatedAt: new Date().toISOString(),
  };
  db.data.products[index] = updated;
  await db.write();
  return rowToProduct(updated);
}

export async function deleteProduct(id) {
  await db.read();
  const before = db.data.products.length;
  db.data.products = db.data.products.filter((p) => p.id !== Number(id));
  if (db.data.products.length === before) return false;
  await db.write();
  return true;
}

export async function getSetting(key) {
  await db.read();
  return db.data.settings[key] ?? null;
}

export async function setSetting(key, value) {
  await db.read();
  db.data.settings[key] = value;
  await db.write();
}

export async function productCount() {
  await db.read();
  return db.data.products.length;
}

export function rowToOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    items: row.items || [],
    total: row.total,
    status: row.status || "pending",
    customerName: row.customerName || "",
    customerPhone: row.customerPhone || "",
    notes: row.notes || "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createOrder(data) {
  await db.read();
  if (!db.data.orders) db.data.orders = [];
  if (!db.data.nextOrderId) db.data.nextOrderId = 1;

  const now = new Date().toISOString();
  const order = {
    id: db.data.nextOrderId++,
    items: data.items,
    total: data.total,
    status: "pending",
    customerName: data.customerName || "",
    customerPhone: data.customerPhone || "",
    notes: data.notes || "",
    createdAt: now,
    updatedAt: now,
  };
  db.data.orders.push(order);
  await db.write();
  return rowToOrder(order);
}

export async function getAllOrders() {
  await db.read();
  const orders = db.data.orders || [];
  return orders.map(rowToOrder).sort((a, b) => b.id - a.id);
}

export async function getOrderById(id) {
  await db.read();
  const row = (db.data.orders || []).find((o) => o.id === Number(id));
  return rowToOrder(row);
}

export async function updateOrderStatus(id, status) {
  await db.read();
  const index = (db.data.orders || []).findIndex((o) => o.id === Number(id));
  if (index === -1) return null;

  const updated = {
    ...db.data.orders[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  db.data.orders[index] = updated;
  await db.write();
  return rowToOrder(updated);
}

export default db;
