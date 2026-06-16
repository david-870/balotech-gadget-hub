const CATALOG_KEY = "balotech-catalog-v2";
const CATALOG_API = "/api/catalog";
const ADMIN_PIN_KEY = "balotech-admin-pin";
const ADMIN_SESSION_KEY = "balotech-admin-session";
const DEFAULT_ADMIN_PIN = "7742329";

const PRODUCT_IMAGES = {
  "iphone x": "WhatsApp Image 2026-05-22 at 2.40.24 AM.jpeg",
  "iphone xr": "WhatsApp Image 2026-05-22 at 2.40.30 AM.jpeg",
  "iphone xs-max": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 11": "WhatsApp Image 2026-05-22 at 2.40.31 AM.jpeg",
  "iphone 11 pro": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 11 pro max": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 12": "WhatsApp Image 2026-05-22 at 2.40.34 AM.jpeg",
  "iphone 12 mini": "WhatsApp Image 2026-05-22 at 2.40.34 AM.jpeg",
  "iphone 12 pro": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 12 pro max": "WhatsApp Image 2026-05-22 at 2.40.31 AM.jpeg",
  "iphone 13": "WhatsApp Image 2026-05-22 at 2.40.24 AM.jpeg",
  "iphone 13 mini": "WhatsApp Image 2026-05-22 at 2.40.24 AM.jpeg",
  "iphone 13 pro": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 13 pro max": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 14": "WhatsApp Image 2026-05-22 at 2.40.30 AM.jpeg",
  "iphone 14 plus": "WhatsApp Image 2026-05-22 at 2.40.30 AM.jpeg",
  "iphone 14 pro": "WhatsApp Image 2026-05-22 at 2.40.32 AM.jpeg",
  "iphone 14 pro max": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 15": "WhatsApp Image 2026-05-22 at 2.40.24 AM.jpeg",
  "iphone 15 plus": "WhatsApp Image 2026-05-22 at 2.40.27 AM.jpeg",
  "iphone 15 pro": "WhatsApp Image 2026-05-22 at 2.40.32 AM.jpeg",
  "iphone 15 pro max": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 16": "WhatsApp Image 2026-05-22 at 2.36.18 AM.jpeg",
  "iphone 16 plus": "WhatsApp Image 2026-05-22 at 2.40.27 AM.jpeg",
  "iphone 16 pro": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 16 pro max": "WhatsApp Image 2026-05-22 at 2.36.18 AM.jpeg",
  "iphone 17": "WhatsApp Image 2026-05-22 at 2.40.27 AM.jpeg",
  "iphone 17 plus": "WhatsApp Image 2026-05-22 at 2.40.27 AM.jpeg",
  "iphone 17 pro": "WhatsApp Image 2026-05-22 at 2.40.23 AM.jpeg",
  "iphone 17 pro max": "WhatsApp Image 2026-05-22 at 2.36.17 AM.jpeg",
  "infinix note 40": "WhatsApp Image 2026-05-22 at 2.40.20 AM.jpeg",
};

const CATEGORIES = [
  { id: "hot-deals", label: "Hot Deals" },
  { id: "iphones", label: "iPhones" },
  { id: "samsung", label: "Samsung" },
  { id: "other-phones", label: "Other Phones" },
  { id: "laptops", label: "Laptops" },
  { id: "watches", label: "Watches" },
  { id: "audio", label: "Audio" },
  { id: "accessories", label: "Accessories" },
  { id: "gaming", label: "Gaming" },
];

function formatPrice(value) {
  return new Intl.NumberFormat("en-NG").format(value);
}

function getBasePath() {
  return window.location.pathname.includes("/pages/") ? "../" : "./";
}

function getImagesBase() {
  return getBasePath() + "Images/";
}

function resolveImageUrl(image, name) {
  if (!image) {
    const filename = PRODUCT_IMAGES[(name || "").toLowerCase()];
    if (filename) return getImagesBase() + encodeURIComponent(filename);
    return "https://via.placeholder.com/150";
  }
  if (image.startsWith("data:") || image.startsWith("http")) return image;
  if (image.startsWith("./") || image.startsWith("../")) {
    const base = getBasePath();
    return image.replace(/^\.\//, base).replace(/^\.\.\//, "../");
  }
  return getImagesBase() + encodeURIComponent(image);
}

function loadLocalCatalog() {
  try {
    const saved = localStorage.getItem(CATALOG_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveLocalCatalog(data) {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(data));
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
}

async function loadCatalog(options = {}) {
  const preferLocal = options.preferLocal === true;

  if (preferLocal) {
    const local = loadLocalCatalog();
    if (local?.products?.length) return local;
  }

  const apiData = await fetchJson(CATALOG_API);
  if (apiData?.products?.length) {
    if (!preferLocal) saveLocalCatalog(apiData);
    return apiData;
  }

  const local = loadLocalCatalog();
  if (local?.products?.length) return local;

  const jsonPath = getBasePath() + "products.json";
  const fileData = await fetchJson(jsonPath);
  if (fileData?.products?.length) return fileData;

  return { products: [], version: 1 };
}

async function publishCatalog(data, pin) {
  try {
    const response = await fetch(CATALOG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": pin,
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      saveLocalCatalog(data);
      return { ok: true, method: "api" };
    }
  } catch {
    /* fall through to local save */
  }

  saveLocalCatalog(data);
  return { ok: true, method: "local" };
}

function generateId(products) {
  const nums = products
    .map((p) => parseInt(String(p.id).replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `p${next}`;
}

function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product";
  card.dataset.id = product.id;
  card.dataset.name = product.name;
  card.dataset.price = String(product.price);
  card.dataset.stock = product.stock || "in";
  if (product.condition) card.dataset.condition = product.condition;

  const images = product.images?.length ? product.images : [product.image];
  const mainSrc = resolveImageUrl(images[0], product.name);
  const hasGallery = images.length > 1;

  let imageHtml = `<img class="${hasGallery ? "main-image" : ""}" src="${mainSrc}" alt="${product.name}" loading="lazy" />`;
  if (hasGallery) {
    const thumbs = images
      .map((img, i) => {
        const src = resolveImageUrl(img, product.name);
        return `<img src="${src}" alt="${product.name} view ${i + 1}" class="${i === 0 ? "active" : ""}" />`;
      })
      .join("");
    imageHtml += `<div class="thumbnails">${thumbs}</div>`;
  }

  const conditionHtml = product.condition
    ? `<p class="condition">${escapeHtml(product.condition)}</p>`
    : "";
  const stock = product.stock === "out" ? "out" : "in";

  card.innerHTML = `
    ${imageHtml}
    <h3>${escapeHtml(product.name)}</h3>
    <p>₦${formatPrice(product.price)}</p>
    ${conditionHtml}
    <span class="status ${stock}">${stock === "out" ? "Out of Stock" : "In Stock"}</span>
    <button class="add-to-cart" type="button">Add to Cart</button>
  `;

  return card;
}

function renderProducts(container, products, category) {
  if (!container) return;
  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;
  container.innerHTML = "";
  filtered.forEach((product) => {
    container.appendChild(createProductCard(product));
  });
}

function getAdminPin() {
  return localStorage.getItem(ADMIN_PIN_KEY) || DEFAULT_ADMIN_PIN;
}

function setAdminPin(pin) {
  localStorage.setItem(ADMIN_PIN_KEY, pin);
}

function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function loginAdmin(pin) {
  if (pin !== getAdminPin()) return false;
  sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
  return true;
}

function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

function exportCatalogFile(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "products.json";
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file, maxWidth = 800) {
  const dataUrl = await readImageFile(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

window.BaloCatalog = {
  CATALOG_KEY,
  CATALOG_API,
  ADMIN_PIN_KEY,
  DEFAULT_ADMIN_PIN,
  CATEGORIES,
  PRODUCT_IMAGES,
  formatPrice,
  getBasePath,
  getImagesBase,
  resolveImageUrl,
  loadCatalog,
  saveLocalCatalog,
  publishCatalog,
  generateId,
  createProductCard,
  renderProducts,
  getAdminPin,
  setAdminPin,
  isAdminLoggedIn,
  loginAdmin,
  logoutAdmin,
  exportCatalogFile,
  readImageFile,
  compressImage,
  escapeHtml,
};
