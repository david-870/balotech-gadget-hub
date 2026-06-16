const API_BASE = import.meta.env.VITE_API_URL || "";
const GATEWAY_SECRET = import.meta.env.VITE_ADMIN_GATEWAY_SECRET || "";

function getToken() {
  return localStorage.getItem("balotech-admin-token");
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  getProducts: (category) =>
    request(category ? `/api/products?category=${category}` : "/api/products"),
  getProduct: (id) => request(`/api/products/${id}`),
  createProduct: (body) =>
    request("/api/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id, body) =>
    request(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE" }),
  login: (pin) =>
    request("/api/auth/login", {
      method: "POST",
      headers: { "x-gateway-key": GATEWAY_SECRET },
      body: JSON.stringify({ pin }),
    }),
  changePin: (currentPin, newPin) =>
    request("/api/auth/change-pin", {
      method: "POST",
      body: JSON.stringify({ currentPin, newPin }),
    }),
  uploadImage: (file) => {
    const form = new FormData();
    form.append("image", file);
    return request("/api/auth/upload", { method: "POST", body: form });
  },
  getCategories: () => request("/api/categories"),
  createOrder: (body) =>
    request("/api/orders", { method: "POST", body: JSON.stringify(body) }),
  getOrders: () => request("/api/orders"),
  updateOrderStatus: (id, status) =>
    request(`/api/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export function imageSrc(url) {
  if (!url) return "https://via.placeholder.com/300x300?text=No+Image";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return url;
}

export function formatPrice(value) {
  return new Intl.NumberFormat("en-NG").format(value);
}

export function formatDate(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}
